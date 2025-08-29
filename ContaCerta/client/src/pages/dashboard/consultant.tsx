import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BriefcaseIcon, 
  SendIcon, 
  EyeIcon, 
  DollarSignIcon,
  SearchIcon,
  FolderIcon,
  BarChart3Icon,
  StarIcon,
  CalendarIcon,
  ClockIcon
} from "lucide-react";

export default function ConsultantDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

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

  // Get dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
    retry: false,
  });

  // Get published projects (opportunities)
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ["/api/projects", { limit: "6" }],
    enabled: !!user,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "CONSULTANT") {
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return "A combinar";
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          className={`h-3 w-3 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || ""} />
              <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-consultant-name">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-muted-foreground mb-1" data-testid="text-consultant-title">
                {user.profile?.title || "Consultor"}
              </p>
              {user.profile?.averageRating && (
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(Math.round(Number(user.profile.averageRating)))}
                  </div>
                  <span className="text-sm text-muted-foreground" data-testid="text-consultant-rating">
                    {Number(user.profile.averageRating).toFixed(1)} ({user.profile.totalProjects} projetos)
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={() => setLocation("/profile/edit")}
            variant="outline"
            data-testid="button-edit-profile"
          >
            Editar Perfil
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Projetos Ativos"
            value={stats?.activeProjects || 0}
            icon={BriefcaseIcon}
            iconColor="text-primary"
            testId="stats-active-projects"
          />
          <StatsCard
            title="Propostas Enviadas"
            value={stats?.sentProposals || 0}
            icon={SendIcon}
            iconColor="text-secondary"
            testId="stats-sent-proposals"
          />
          <StatsCard
            title="Visualizações do Perfil"
            value={user.profile?.profileViews || 0}
            icon={EyeIcon}
            iconColor="text-accent"
            testId="stats-profile-views"
          />
          <StatsCard
            title="Ganhos Total"
            value={user.profile?.totalEarnings ? `R$ ${Number(user.profile.totalEarnings).toLocaleString()}` : "R$ 0"}
            icon={DollarSignIcon}
            iconColor="text-green-500"
            testId="stats-total-earnings"
          />
        </div>

        {/* Opportunities */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-opportunities">
              Oportunidades Recomendadas
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/projects")}
              data-testid="button-view-all-opportunities"
            >
              Ver Todas
            </Button>
          </div>
          
          {opportunitiesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                    <div className="flex space-x-4 mb-4">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-20"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.slice(0, 3).map((opportunity, index) => (
                <Card key={opportunity.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2" data-testid={`opportunity-title-${index}`}>
                          {opportunity.title}
                        </h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2" data-testid={`opportunity-description-${index}`}>
                          {opportunity.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span data-testid={`opportunity-created-${index}`}>
                            <CalendarIcon className="inline h-3 w-3 mr-1" />
                            Publicado há {Math.floor((Date.now() - new Date(opportunity.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias
                          </span>
                          <span data-testid={`opportunity-budget-${index}`}>
                            <DollarSignIcon className="inline h-3 w-3 mr-1" />
                            {formatCurrency(opportunity.budget)}
                          </span>
                          {opportunity.estimatedHours && (
                            <span data-testid={`opportunity-hours-${index}`}>
                              <ClockIcon className="inline h-3 w-3 mr-1" />
                              {opportunity.estimatedHours}h
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {/* Add to favorites */}}
                          data-testid={`opportunity-favorite-${index}`}
                        >
                          <StarIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setLocation(`/projects/${opportunity.id}`)}
                          data-testid={`opportunity-proposal-${index}`}
                        >
                          Enviar Proposta
                        </Button>
                      </div>
                    </div>
                    {opportunity.deliverables && opportunity.deliverables.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {opportunity.deliverables.slice(0, 3).map((deliverable, deliverableIndex) => (
                          <Badge key={deliverableIndex} variant="outline" className="text-xs">
                            {deliverable}
                          </Badge>
                        ))}
                        {opportunity.deliverables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{opportunity.deliverables.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-opportunities">
                  Nenhuma oportunidade encontrada
                </h3>
                <p className="text-muted-foreground mb-6" data-testid="text-no-opportunities-description">
                  Complete seu perfil para receber recomendações personalizadas de projetos.
                </p>
                <Button onClick={() => setLocation("/profile/edit")} data-testid="button-complete-profile">
                  Completar Perfil
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-hover cursor-pointer" onClick={() => setLocation("/projects")}>
            <CardContent className="p-6">
              <SearchIcon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2" data-testid="text-action-search">
                Buscar Projetos
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-action-search-description">
                Encontre novas oportunidades
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => setLocation("/portfolio")}>
            <CardContent className="p-6">
              <FolderIcon className="h-8 w-8 text-secondary mb-3" />
              <h3 className="font-semibold text-foreground mb-2" data-testid="text-action-portfolio">
                Meu Portfólio
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-action-portfolio-description">
                Gerencie seus cases
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => setLocation("/analytics")}>
            <CardContent className="p-6">
              <BarChart3Icon className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2" data-testid="text-action-analytics">
                Relatórios
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-action-analytics-description">
                Analise suas métricas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
