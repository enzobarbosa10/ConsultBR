import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { ProjectCard } from "@/components/ui/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, FilterIcon, PlusIcon, ChartGantt } from "lucide-react";

export default function ProjectList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  // Get projects based on user role
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: user?.role === "ENTREPRENEUR" ? ["/api/my-projects"] : ["/api/projects"],
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

  if (!user) {
    return null;
  }

  const isEntrepreneur = user.role === "ENTREPRENEUR";

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "Todos os Status" },
    { value: "DRAFT", label: "Rascunho" },
    { value: "PUBLISHED", label: "Publicado" },
    { value: "IN_PROGRESS", label: "Em Progresso" },
    { value: "COMPLETED", label: "Concluído" },
    { value: "CANCELLED", label: "Cancelado" },
  ];

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-projects-title">
              {isEntrepreneur ? "Meus Projetos" : "Oportunidades de Projetos"}
            </h1>
            <p className="text-muted-foreground" data-testid="text-projects-subtitle">
              {isEntrepreneur 
                ? "Gerencie seus projetos e acompanhe o progresso" 
                : "Encontre projetos que combinam com seu perfil"}
            </p>
          </div>
          {isEntrepreneur && (
            <Button 
              onClick={() => setLocation("/projects/create")}
              data-testid="button-create-project"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="mb-8" data-testid="card-search-filters">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar projetos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-projects"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48" data-testid="select-status-filter">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" data-testid="button-advanced-filters">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Mais Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Stats */}
        {isEntrepreneur && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {statusOptions.slice(1).map((status) => {
              const count = projects.filter((p: any) => p.status === status.value).length;
              return (
                <Card key={status.value} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground mb-1" data-testid={`stat-${status.value}`}>
                      {count}
                    </div>
                    <div className="text-sm text-muted-foreground">{status.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any, index: number) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => setLocation(`/projects/${project.id}`)}
                onEdit={isEntrepreneur ? () => setLocation(`/projects/${project.id}/edit`) : undefined}
                showActions={true}
                testId={`project-card-${index}`}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ChartGantt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-projects">
                {searchQuery || statusFilter !== "all" 
                  ? "Nenhum projeto encontrado" 
                  : isEntrepreneur 
                    ? "Nenhum projeto criado ainda"
                    : "Nenhuma oportunidade disponível"}
              </h3>
              <p className="text-muted-foreground mb-6" data-testid="text-no-projects-description">
                {searchQuery || statusFilter !== "all" 
                  ? "Tente ajustar os filtros de busca para encontrar o que procura."
                  : isEntrepreneur 
                    ? "Crie seu primeiro projeto e comece a receber propostas de consultores especializados."
                    : "Complete seu perfil para receber recomendações personalizadas de projetos."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button 
                  onClick={() => setLocation(isEntrepreneur ? "/projects/create" : "/profile/edit")}
                  data-testid="button-main-action"
                >
                  {isEntrepreneur ? (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
                    </>
                  ) : (
                    "Completar Perfil"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
