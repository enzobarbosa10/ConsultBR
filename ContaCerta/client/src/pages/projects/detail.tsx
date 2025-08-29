import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertProposalSchema } from "@shared/schema";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  DollarSignIcon, 
  ClockIcon, 
  MapPinIcon,
  StarIcon,
  SendIcon,
  FileTextIcon,
  ArrowLeftIcon,
  MessageCircleIcon,
  UserIcon
} from "lucide-react";

const proposalSchema = insertProposalSchema.omit({
  projectId: true,
});

export default function ProjectDetail() {
  const { id } = useParams();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      message: "",
      proposedRate: 0,
      estimatedHours: 0,
      deliveryDate: undefined,
    },
  });

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

  // Get project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["/api/projects", id],
    enabled: !!id && !!user,
    retry: false,
  });

  // Get project proposals
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ["/api/proposals/project", id],
    enabled: !!id && !!user,
    retry: false,
  });

  // Submit proposal mutation
  const submitProposalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/proposals", {
        ...data,
        projectId: id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Proposta enviada com sucesso!",
        description: "O empreendedor será notificado sobre sua proposta.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals/project", id] });
      setShowProposalForm(false);
      form.reset();
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
        title: "Erro ao enviar proposta",
        description: "Ocorreu um erro ao enviar sua proposta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <FileTextIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-project-not-found">
                Projeto não encontrado
              </h3>
              <p className="text-muted-foreground" data-testid="text-project-not-found-description">
                O projeto que você está procurando não existe ou foi removido.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isEntrepreneur = user.role === "ENTREPRENEUR";
  const isConsultant = user.role === "CONSULTANT";
  const canSubmitProposal = isConsultant && project.status === "PUBLISHED";

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return "A combinar";
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Não definido";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PUBLISHED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "DISPUTED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "Rascunho",
      PUBLISHED: "Publicado",
      IN_PROGRESS: "Em Progresso",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
      DISPUTED: "Disputado",
    };
    return labels[status] || status;
  };

  const onSubmitProposal = (data: any) => {
    submitProposalMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/projects")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar aos Projetos
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-project-header">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-project-title">
                      {project.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span data-testid="text-project-created">
                        <CalendarIcon className="inline h-3 w-3 mr-1" />
                        Publicado em {formatDate(project.createdAt)}
                      </span>
                      {project.endDate && (
                        <span data-testid="text-project-deadline">
                          <CalendarIcon className="inline h-3 w-3 mr-1" />
                          Prazo: {formatDate(project.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    className={getStatusColor(project.status)}
                    data-testid="badge-project-status"
                  >
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <DollarSignIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">Orçamento</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground" data-testid="text-project-budget">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">Horas Estimadas</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground" data-testid="text-project-hours">
                      {project.estimatedHours ? `${project.estimatedHours}h` : "Não definido"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <SendIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">Propostas</span>
                    </div>
                    <p className="text-xl font-semibold text-foreground" data-testid="text-project-proposals">
                      {proposals.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-project-description">
              <CardHeader>
                <CardTitle>Descrição do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-foreground whitespace-pre-wrap" data-testid="text-project-description">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {project.requirements && (
              <Card data-testid="card-project-requirements">
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap" data-testid="text-project-requirements">
                    {project.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {project.deliverables && project.deliverables.length > 0 && (
              <Card data-testid="card-project-deliverables">
                <CardHeader>
                  <CardTitle>Entregáveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.deliverables.map((deliverable: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-foreground" data-testid={`text-deliverable-${index}`}>
                          {deliverable}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proposals Section */}
            {(isEntrepreneur || proposals.length > 0) && (
              <Card data-testid="card-project-proposals">
                <CardHeader>
                  <CardTitle>
                    Propostas Recebidas ({proposals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposals.length > 0 ? (
                    <div className="space-y-4">
                      {proposals.map((proposal: any, index: number) => (
                        <div key={proposal.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src="" alt="Consultor" />
                                <AvatarFallback>
                                  <UserIcon className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground" data-testid={`text-proposal-sender-${index}`}>
                                  Consultor
                                </p>
                                <p className="text-sm text-muted-foreground" data-testid={`text-proposal-date-${index}`}>
                                  {formatDate(proposal.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={proposal.status === "SENT" ? "default" : "secondary"}
                              data-testid={`badge-proposal-status-${index}`}
                            >
                              {proposal.status}
                            </Badge>
                          </div>
                          
                          <p className="text-foreground mb-3" data-testid={`text-proposal-message-${index}`}>
                            {proposal.message}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Valor proposto:</span>
                              <span className="font-medium ml-2" data-testid={`text-proposal-rate-${index}`}>
                                {formatCurrency(proposal.proposedRate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Prazo:</span>
                              <span className="font-medium ml-2" data-testid={`text-proposal-hours-${index}`}>
                                {proposal.estimatedHours ? `${proposal.estimatedHours}h` : "Não definido"}
                              </span>
                            </div>
                          </div>

                          {isEntrepreneur && proposal.status === "SENT" && (
                            <div className="flex space-x-2 mt-4">
                              <Button size="sm" data-testid={`button-accept-proposal-${index}`}>
                                Aceitar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`button-counter-proposal-${index}`}
                              >
                                Contra-propor
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-message-${index}`}
                              >
                                <MessageCircleIcon className="h-4 w-4 mr-1" />
                                Mensagem
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <SendIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground" data-testid="text-no-proposals">
                        Nenhuma proposta recebida ainda
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit Proposal Card */}
            {canSubmitProposal && (
              <Card data-testid="card-submit-proposal">
                <CardHeader>
                  <CardTitle>Enviar Proposta</CardTitle>
                </CardHeader>
                <CardContent>
                  {!showProposalForm ? (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4" data-testid="text-proposal-intro">
                        Interessado neste projeto? Envie uma proposta personalizada.
                      </p>
                      <Button 
                        onClick={() => setShowProposalForm(true)}
                        className="w-full"
                        data-testid="button-show-proposal-form"
                      >
                        <SendIcon className="h-4 w-4 mr-2" />
                        Criar Proposta
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitProposal)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mensagem *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Explique como você pode ajudar neste projeto..."
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                  data-testid="textarea-proposal-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="proposedRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor Proposto (R$) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="15000"
                                  min="0"
                                  step="100"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-proposal-rate"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="estimatedHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horas Estimadas</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="40"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-proposal-hours"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Entrega</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field}
                                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                  data-testid="input-proposal-delivery"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowProposalForm(false)}
                            className="flex-1"
                            data-testid="button-cancel-proposal"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={submitProposalMutation.isPending}
                            className="flex-1"
                            data-testid="button-submit-proposal"
                          >
                            {submitProposalMutation.isPending ? "Enviando..." : "Enviar"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Project Info Card */}
            <Card data-testid="card-project-info">
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Criação</p>
                  <p className="text-sm font-medium" data-testid="text-info-created">
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                
                {project.startDate && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data de Início</p>
                      <p className="text-sm font-medium" data-testid="text-info-start">
                        {formatDate(project.startDate)}
                      </p>
                    </div>
                  </>
                )}
                
                {project.endDate && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Prazo de Entrega</p>
                      <p className="text-sm font-medium" data-testid="text-info-deadline">
                        {formatDate(project.endDate)}
                      </p>
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
