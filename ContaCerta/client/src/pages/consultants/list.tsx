import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { ConsultantCard } from "@/components/ui/consultant-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SearchIcon, FilterIcon, UserIcon } from "lucide-react";

export default function ConsultantList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
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

  // Get consultants
  const { data: consultants = [], isLoading: consultantsLoading } = useQuery({
    queryKey: ["/api/consultants", { 
      search: searchQuery || undefined,
      specialization: specializationFilter !== "all" ? specializationFilter : undefined 
    }],
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

  const specializations = [
    "all",
    "Marketing",
    "Finanças", 
    "Estratégia",
    "Vendas",
    "RH",
    "Tecnologia",
    "Legal",
    "Operações"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-consultants-title">
            Consultores Especializados
          </h1>
          <p className="text-muted-foreground" data-testid="text-consultants-subtitle">
            Encontre o profissional ideal para seu projeto
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8" data-testid="card-search-filters">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar consultores, especialidades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-consultants"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger className="w-48" data-testid="select-specialization-filter">
                    <SelectValue placeholder="Todas as especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as especialidades</SelectItem>
                    {specializations.slice(1).map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" data-testid="button-advanced-filters">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultants Grid */}
        {consultantsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-muted rounded w-20"></div>
                      <div className="h-8 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : consultants.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.map((consultant: any, index: number) => (
              <ConsultantCard
                key={consultant.id}
                consultant={consultant}
                onView={() => setLocation(`/consultants/${consultant.userId}`)}
                onFavorite={() => {
                  // TODO: Implement favorite functionality
                  toast({
                    title: "Funcionalidade em desenvolvimento",
                    description: "A funcionalidade de favoritos será implementada em breve.",
                  });
                }}
                onHire={() => setLocation(`/consultants/${consultant.userId}`)}
                testId={`consultant-card-${index}`}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-consultants">
                {searchQuery || specializationFilter !== "all" 
                  ? "Nenhum consultor encontrado" 
                  : "Nenhum consultor disponível"}
              </h3>
              <p className="text-muted-foreground" data-testid="text-no-consultants-description">
                {searchQuery || specializationFilter !== "all" 
                  ? "Tente ajustar os filtros de busca para encontrar consultores."
                  : "Novos consultores estão se cadastrando na plataforma. Volte em breve."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
