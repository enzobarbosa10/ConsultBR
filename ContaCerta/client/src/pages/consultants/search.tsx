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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  SearchIcon, 
  FilterIcon, 
  UserIcon, 
  MapPinIcon,
  DollarSignIcon,
  StarIcon,
  ClockIcon,
  XIcon
} from "lucide-react";

interface FilterState {
  search: string;
  specialization: string;
  location: string;
  minRate: number;
  maxRate: number;
  minRating: number;
  experience: string;
  availability: string;
  isRemote: boolean;
}

export default function ConsultantSearch() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    specialization: "all",
    location: "all",
    minRate: 0,
    maxRate: 1000,
    minRating: 0,
    experience: "all",
    availability: "all",
    isRemote: false,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
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

  // Get consultants with filters
  const { data: consultants = [], isLoading: consultantsLoading } = useQuery({
    queryKey: ["/api/consultants", { 
      search: filters.search || undefined,
      specialization: filters.specialization !== "all" ? filters.specialization : undefined,
      location: filters.location !== "all" ? filters.location : undefined,
      minRate: filters.minRate > 0 ? filters.minRate : undefined,
      maxRate: filters.maxRate < 1000 ? filters.maxRate : undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      experience: filters.experience !== "all" ? filters.experience : undefined,
      isRemote: filters.isRemote || undefined,
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

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const activeFilters: string[] = [];
    
    if (filters.search) activeFilters.push(`Busca: ${filters.search}`);
    if (filters.specialization !== "all") activeFilters.push(`Área: ${filters.specialization}`);
    if (filters.location !== "all") activeFilters.push(`Local: ${filters.location}`);
    if (filters.minRate > 0 || filters.maxRate < 1000) {
      activeFilters.push(`Preço: R$${filters.minRate} - R$${filters.maxRate}`);
    }
    if (filters.minRating > 0) activeFilters.push(`Avaliação: ${filters.minRating}+ estrelas`);
    if (filters.experience !== "all") activeFilters.push(`Experiência: ${filters.experience}`);
    if (filters.isRemote) activeFilters.push("Trabalho remoto");
    
    setAppliedFilters(activeFilters);
    setShowAdvancedFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      specialization: "all",
      location: "all",
      minRate: 0,
      maxRate: 1000,
      minRating: 0,
      experience: "all",
      availability: "all",
      isRemote: false,
    });
    setAppliedFilters([]);
  };

  const removeFilter = (filterToRemove: string) => {
    const updatedFilters = appliedFilters.filter(filter => filter !== filterToRemove);
    setAppliedFilters(updatedFilters);
    
    // Reset corresponding filter state
    if (filterToRemove.startsWith("Busca:")) {
      setFilters(prev => ({ ...prev, search: "" }));
    } else if (filterToRemove.startsWith("Área:")) {
      setFilters(prev => ({ ...prev, specialization: "all" }));
    } else if (filterToRemove.startsWith("Local:")) {
      setFilters(prev => ({ ...prev, location: "all" }));
    } else if (filterToRemove.startsWith("Preço:")) {
      setFilters(prev => ({ ...prev, minRate: 0, maxRate: 1000 }));
    } else if (filterToRemove.startsWith("Avaliação:")) {
      setFilters(prev => ({ ...prev, minRating: 0 }));
    } else if (filterToRemove.startsWith("Experiência:")) {
      setFilters(prev => ({ ...prev, experience: "all" }));
    } else if (filterToRemove === "Trabalho remoto") {
      setFilters(prev => ({ ...prev, isRemote: false }));
    }
  };

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

  const locations = [
    "all",
    "São Paulo, SP",
    "Rio de Janeiro, RJ",
    "Belo Horizonte, MG",
    "Brasília, DF",
    "Salvador, BA",
    "Fortaleza, CE",
    "Curitiba, PR",
    "Recife, PE",
    "Porto Alegre, RS"
  ];

  const experienceOptions = [
    { value: "all", label: "Qualquer experiência" },
    { value: "junior", label: "1-3 anos" },
    { value: "pleno", label: "4-7 anos" },
    { value: "senior", label: "8-15 anos" },
    { value: "expert", label: "15+ anos" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-search-title">
            Buscar Consultores
          </h1>
          <p className="text-muted-foreground" data-testid="text-search-subtitle">
            Use os filtros para encontrar o consultor perfeito para seu projeto
          </p>
        </div>

        {/* Search and Basic Filters */}
        <Card className="mb-6" data-testid="card-search-filters">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar consultores, especialidades, empresas..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                    data-testid="input-search-consultants"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={filters.specialization} onValueChange={(value) => handleFilterChange("specialization", value)}>
                  <SelectTrigger className="w-48" data-testid="select-specialization">
                    <SelectValue placeholder="Área de atuação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {specializations.slice(1).map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  data-testid="button-advanced-filters"
                >
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filtros Avançados
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t border-border pt-6 space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <MapPinIcon className="inline h-4 w-4 mr-1" />
                      Localização
                    </label>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                      <SelectTrigger data-testid="select-location">
                        <SelectValue placeholder="Qualquer local" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Qualquer local</SelectItem>
                        {locations.slice(1).map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <ClockIcon className="inline h-4 w-4 mr-1" />
                      Experiência
                    </label>
                    <Select value={filters.experience} onValueChange={(value) => handleFilterChange("experience", value)}>
                      <SelectTrigger data-testid="select-experience">
                        <SelectValue placeholder="Qualquer experiência" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remote Work Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote-work"
                      checked={filters.isRemote}
                      onCheckedChange={(checked) => handleFilterChange("isRemote", !!checked)}
                      data-testid="checkbox-remote-work"
                    />
                    <label htmlFor="remote-work" className="text-sm font-medium text-foreground">
                      Aceita trabalho remoto
                    </label>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    <DollarSignIcon className="inline h-4 w-4 mr-1" />
                    Faixa de Preço (R$/hora): R${filters.minRate} - R${filters.maxRate}
                  </label>
                  <div className="px-3">
                    <Slider
                      value={[filters.minRate, filters.maxRate]}
                      onValueChange={(value) => {
                        handleFilterChange("minRate", value[0]);
                        handleFilterChange("maxRate", value[1]);
                      }}
                      max={1000}
                      min={0}
                      step={50}
                      className="w-full"
                      data-testid="slider-price-range"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    <StarIcon className="inline h-4 w-4 mr-1" />
                    Av# thoughts

I need to create a comprehensive marketplace platform that connects entrepreneurs with business consultants. Looking at the provided Prisma schema and user flow, this is a complex application with multiple user types, project management, proposals, messaging, and payment functionality.

The key components I need to implement:

1. **Database Setup**: Use the provided Prisma schema with PostgreSQL and implement the database storage layer
2. **Authentication**: Integrate Replit Auth for user authentication with role-based access
3. **User Onboarding**: Separate flows for entrepreneurs and consultants with profile creation
4. **Dashboards**: Role-specific dashboards showing relevant metrics and actions
5. **Project Management**: Create, publish, and manage projects (entrepreneurs) and browse opportunities (consultants)
6. **Proposal System**: Submit, review, and manage proposals between consultants and entrepreneurs
7. **Messaging System**: Real-time communication between users
8. **Search & Discovery**: Find consultants and projects with filtering capabilities

From the design reference, I can see the visual requirements include:
- Professional blue and orange color scheme
- Modern card-based layouts
- Clean typography with Inter font family
- Responsive design with proper spacing
- Interactive elements with hover effects

The existing codebase already has most of the core pages implemented, but I need to ensure the database integration works properly and add any missing functionality.

# useful_guidelines_from_blueprints

From the database blueprint:
- Add the necessary Drizzle models and relations to `shared/schema.ts`
- Always explicitly model relations using the `relations` operator from `drizzle-orm`
- Update `server/storage.ts` to replace MemStorage with DatabaseStorage
- Execute `npm run db:push` to push schema changes

From the authentication blueprint:
- Use `isAuthenticated` in the server to protect routes that require log in
- Use `useAuth` React Hook in the client to see if the user is logged in
- Navigate to '/api/login' to begin the log in flow and '/api/logout' to log out
- Handle unauthorized errors at both page and endpoint levels
- SESSION_SECRET will be available in development and production
- Always use DatabaseStorage for session storage

# directory_structure

```json
[
    {"path": "shared/schema.ts", "status": "overwritten"},
    {"path": "server/storage.ts", "status": "overwritten"},
    {"path": "server/routes.ts", "status": "overwritten"},
    {"path": "server/db.ts", "status": "new", "blueprint_source": "javascript_database"},
    {"path": "server/replitAuth.ts", "status": "new", "blueprint_source": "javascript_log_in_with_replit"},
    {"path": "client/src/hooks/useAuth.ts", "status": "new", "blueprint_source": "javascript_log_in_with_replit"},
    {"path": "client/src/lib/authUtils.ts", "status": "new", "blueprint_source": "javascript_log_in_with_replit"}
]
