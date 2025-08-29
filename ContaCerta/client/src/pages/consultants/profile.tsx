import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  StarIcon,
  HeartIcon,
  MessageCircleIcon,
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  AwardIcon,
  ArrowLeftIcon,
  DollarSignIcon,
  UserIcon,
  FolderIcon
} from "lucide-react";

export default function ConsultantProfile() {
  const { userId } = useParams();
  const [isFavorited, setIsFavorited] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
      return;
    }
  }, [isLoading, user, toast]);

  // Get consultant profile
  const { data: consultant, isLoading: consultantLoading } = useQuery({
    queryKey: ["/api/consultants", userId],
    enabled: !!userId && !!user,
    retry: false,
  });

  // Get consultant portfolio
  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ["/api/portfolio", consultant?.id],
    enabled: !!consultant?.id && !!user,
    retry: false,
  });

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/favorites", {
        targetId: consultant.id,
        targetType: "consultant",
      });
    },
    onSuccess: () => {
      setIsFavorited(true);
      toast({
        title: "Consultor adicionado aos favoritos",
        description: "Você pode encontrá-lo na sua lista de favoritos.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão expirada",
          description: "Você será redirecionado para fazer login novamente.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
        return;
      }
      toast({
        title: "Erro ao adicionar favorito",
        description: "Não foi possível adicionar aos favoritos. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || consultantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !consultant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-consultant-not-found">
                Consultor não encontrado
              </h3>
              <p className="text-muted-foreground" data-testid="text-consultant-not-found-description">
                O consultor que você está procurando não existe ou foi removido.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
        />
      );
    }
    return stars;
  };

  const isEntrepreneur = user.role === "ENTREPRENEUR";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/consultants")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar aos Consultores
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card data-testid="card-consultant-header">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={consultant.profileImageUrl} alt={`${consultant.firstName} ${consultant.lastName}`} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(consultant.firstName, consultant.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-consultant-name">
                      {consultant.firstName} {consultant.lastName}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-3" data-testid="text-consultant-title">
                      {consultant.title}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      {consultant.averageRating && (
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {renderStars(Math.round(Number(consultant.averageRating)))}
                          </div>
                          <span className="text-sm text-muted-foreground" data-testid="text-consultant-rating">
                            {Number(consultant.averageRating).toFixed(1)} ({consultant.totalProjects} projetos)
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span data-testid="text-consultant-location">
                          {consultant.city}, {consultant.state}
                        </span>
                      </div>
                      
                      {consultant.responseTime && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span data-testid="text-consultant-response-time">
                            Responde em {consultant.responseTime}h
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {consultant.industries?.slice(0, 5).map((industry: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {industry}
                        </Badge>
                      ))}
                      {consultant.industries?.length > 5 && (
                        <Badge variant="secondary">
                          +{consultant.industries.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about" data-testid="tab-about">Sobre</TabsTrigger>
                <TabsTrigger value="portfolio" data-testid="tab-portfolio">Portfólio</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Avaliações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6">
                <Card data-testid="card-about">
                  <CardHeader>
                    <CardTitle>Sobre o Consultor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-foreground whitespace-pre-wrap" data-testid="text-consultant-bio">
                        {consultant.bio}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-experience">
                  <CardHeader>
                    <CardTitle>Experiência Profissional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-4">
                      <BriefcaseIcon className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground" data-testid="text-experience-years">
                          {consultant.experience} anos de experiência
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Especialista em consultoria empresarial
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {consultant.education && consultant.education.length > 0 && (
                  <Card data-testid="card-education">
                    <CardHeader>
                      <CardTitle>Formação Acadêmica</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {consultant.education.map((edu: any, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <GraduationCapIcon className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <p className="font-medium text-foreground" data-testid={`text-education-degree-${index}`}>
                                {edu.degree}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-education-institution-${index}`}>
                                {edu.institution} • {edu.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {consultant.certifications && consultant.certifications.length > 0 && (
                  <Card data-testid="card-certifications">
                    <CardHeader>
                      <CardTitle>Certificações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {consultant.certifications.map((cert: any, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <AwardIcon className="h-5 w-5 text-secondary mt-1" />
                            <div>
                              <p className="font-medium text-foreground" data-testid={`text-cert-name-${index}`}>
                                {cert.name}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-cert-issuer-${index}`}>
                                {cert.issuer} • {cert.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="portfolio" className="space-y-6">
                {portfolioLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-32 bg-muted rounded mb-4"></div>
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : portfolio.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {portfolio.map((item: any, index: number) => (
                      <Card key={item.id} className="card-hover">
                        <CardContent className="p-6">
                          {item.imageUrl && (
                            <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h3 className="font-semibold text-foreground mb-2" data-testid={`text-portfolio-title-${index}`}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3" data-testid={`text-portfolio-description-${index}`}>
                            {item.description}
                          </p>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FolderIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-portfolio">
                        Nenhum item no portfólio
                      </h3>
                      <p className="text-muted-foreground" data-testid="text-no-portfolio-description">
                        Este consultor ainda não adicionou casos de sucesso ao seu portfólio.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardContent className="p-12 text-center">
                    <StarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-reviews">
                      Nenhuma avaliação ainda
                    </h3>
                    <p className="text-muted-foreground" data-testid="text-no-reviews-description">
                      Este consultor ainda não possui avaliações de clientes.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            {consultant.hourlyRate && (
              <Card data-testid="card-pricing">
                <CardHeader>
                  <CardTitle>Valores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1" data-testid="text-hourly-rate">
                      {formatCurrency(consultant.hourlyRate)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">por hora</p>
                    
                    {consultant.projectRate && (
                      <>
                        <Separator className="mb-4" />
                        <div className="text-xl font-semibold text-foreground mb-1" data-testid="text-project-rate">
                          {formatCurrency(consultant.projectRate)}
                        </div>
                        <p className="text-sm text-muted-foreground">por projeto</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {isEntrepreneur && (
              <Card data-testid="card-actions">
                <CardContent className="p-6 space-y-3">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Funcionalidade em desenvolvimento",
                        description: "A contratação direta será implementada em breve.",
                      });
                    }}
                    data-testid="button-hire-consultant"
                  >
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
                    Contratar Consultor
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Funcionalidade em desenvolvimento",
                        description: "O sistema de mensagens será implementado em breve.",
                      });
                    }}
                    data-testid="button-message-consultant"
                  >
                    <MessageCircleIcon className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => addFavoriteMutation.mutate()}
                    disabled={isFavorited || addFavoriteMutation.isPending}
                    data-testid="button-favorite-consultant"
                  >
                    <HeartIcon className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current text-red-500" : ""}`} />
                    {isFavorited ? "Favoritado" : "Adicionar aos Favoritos"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card data-testid="card-stats">
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Projetos Concluídos</span>
                  <span className="font-semibold" data-testid="text-stat-projects">
                    {consultant.totalProjects}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Anos de Experiência</span>
                  <span className="font-semibold" data-testid="text-stat-experience">
                    {consultant.experience}
                  </span>
                </div>
                
                {consultant.responseTime && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tempo de Resposta</span>
                      <span className="font-semibold" data-testid="text-stat-response">
                        {consultant.responseTime}h
                      </span>
                    </div>
                  </>
                )}
                
                {consultant.acceptingClients !== undefined && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge 
                        variant={consultant.acceptingClients ? "default" : "secondary"}
                        data-testid="badge-accepting-clients"
                      >
                        {consultant.acceptingClients ? "Aceitando Clientes" : "Indisponível"}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
