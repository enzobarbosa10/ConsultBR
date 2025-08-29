import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSignIcon, ClockIcon, Eye } from "lucide-react";
import { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  testId?: string;
}

export function ProjectCard({ 
  project, 
  onView, 
  onEdit, 
  onDelete, 
  showActions = true,
  testId 
}: ProjectCardProps) {
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

  return (
    <Card className="card-hover" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2" data-testid={`${testId}-title`}>
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`${testId}-description`}>
              {project.description}
            </p>
          </div>
          <Badge 
            className={getStatusColor(project.status)}
            data-testid={`${testId}-status`}
          >
            {getStatusLabel(project.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <DollarSignIcon className="h-4 w-4 mr-2" />
            <span data-testid={`${testId}-budget`}>{formatCurrency(project.budget)}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span data-testid={`${testId}-hours`}>
              {project.estimatedHours ? `${project.estimatedHours}h` : "Não definido"}
            </span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span data-testid={`${testId}-created`}>
              Criado em {formatDate(project.createdAt)}
            </span>
          </div>
          {project.endDate && (
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span data-testid={`${testId}-deadline`}>
                Prazo: {formatDate(project.endDate)}
              </span>
            </div>
          )}
        </div>

        {project.deliverables && project.deliverables.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-2">Entregáveis:</p>
            <div className="flex flex-wrap gap-1">
              {project.deliverables.slice(0, 3).map((deliverable, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {deliverable}
                </Badge>
              ))}
              {project.deliverables.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.deliverables.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onView}
              data-testid={`${testId}-view`}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEdit}
                data-testid={`${testId}-edit`}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
                data-testid={`${testId}-delete`}
              >
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
