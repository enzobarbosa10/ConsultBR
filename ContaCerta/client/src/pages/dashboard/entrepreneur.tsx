import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { StatsCard } from "@/components/ui/stats-card";
import { ProjectCard } from "@/components/ui/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartGantt, 
  MailIcon, 
  HeartIcon, 
  DollarSignIcon,
  SearchIcon,
  MessageCircleIcon,
  StarIcon,
  PlusIcon
} from "lucide-react";

export default function EntrepreneurDashboard() {
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

  // Get recent projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/my-projects"],
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

  if (!user || user.role !== "ENTREPRENEUR") {
    return null;
  }

  const recentProjects = projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome-title">
              {user.profile?.companyName || "Minha Empresa"}
            </h1>
            <p className="text-muted-foreground" data-testid="text-welcome-subtitle">
              Bem-vindo de volta, {user.firstName}!
            </p>
          </div>
          <Button 
            onClick={() => setLocation("/projects/create")}
            data-testid="button-create-project"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Projetos Ativos"
            value={stats?.activeProjects || 0}
            icon={ChartGantt}
            iconColor="text-primary"
            testId="stats-active-projects"
          />
          <StatsCard
            title="Propostas Recebidas"
            value={stats?.totalProposals || 0}
            icon={MailIcon}
            iconColor="text-secondary"
            testId="stats-proposals"
          />
          <StatsCard
            title="Consultores Favoritos"
            value={stats?.favoriteConsultants || 0}
            icon={HeartIcon}
            iconColor="text-red-500"
            testId="stats-favorites"
          />
          <StatsCard
            title="Investido Total"
            value={user.profile?.totalSpent ? `R$ ${Number(user.profile.totalSpent).toLocaleString()}` : "R$ 0"}
            icon={DollarSignIcon}
            iconColor="text-green-500"
            testId="stats-total-spent"
          />
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-recent-projects">
              Projetos Recentes
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/projects")}
              data-testid="button-view-all-projects"
            >
              Ver Todos
            </Button>
          </div>
          
          {projectsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-muted rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={() => setLocation(`/projects/${project.id}`)}
                  onEdit={() => setLocation(`/projects/${project.id}/edit`)}
                  testId={`project-card-${index}`}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ChartGantt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-projects">
                  Nenhum projeto criado ainda
                </h3>
                <p className="text-muted-foreground mb-6" data-testid="text-no-projects-description">
                  Crie seu primeiro projeto e comece a receber propostas de consultores especializados.
                </p>
                <Button onClick={() => setLocation("/projects/create")} data-testid="button-create-first-project">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Criar Primeiro Projeto
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-hover cursor-pointer" onClick={() => setLocation("/consultants")}>
            <CardContent className="p-6">
              <SearchIcon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2" data-testid="text-action-search">
                Buscar Consultores
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-action-search-description">
                Encontre especialistas para seu projeto
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => setLocation("/messages")}>
            <CardContent className="p-6">
              <MessageCircleIcon className="h-8 w-8 text-secondary mb-3" />
              <h3 className="font-semibold text-foreground mb-2" data-testid="text-action-messages">
                Mensagens
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-action-messages-description">
                Converse com consultores
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => setLocation("/favorites")}>
            <CardContent className="p-6">
              <StarIcon className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2" data-testid="text-action-favorites">
                Favoritos
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-action-favorites-description">
                Seus consultores salvos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
