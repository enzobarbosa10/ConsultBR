import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, DollarSignIcon, ClockIcon, EyeIcon, MessageCircleIcon, UserIcon } from "lucide-react";

interface ProposalCardProps {
  proposal: {
    id: string;
    projectId: string;
    message: string;
    proposedRate: string | number;
    estimatedHours?: number;
    deliveryDate?: string;
    status: string;
    createdAt: string;
    viewedAt?: string;
    respondedAt?: string;
  };
  onView?: () => void;
  onMessage?: () => void;
  testId?: string;
}

export function ProposalCard({ proposal, onView, onMessage, testId }: ProposalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "VIEWED":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      case "COUNTER_OFFERED":
        return "bg-orange-100 text-orange-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SENT: "Enviada",
      VIEWED: "Visualizada",
      ACCEPTED: "Aceita",
      DECLINED: "Recusada",
      COUNTER_OFFERED: "Contra-proposta",
      EXPIRED: "Expirada",
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  return (
    <Card className="card-hover" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="Project" />
              <AvatarFallback>
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground" data-testid={`${testId}-project`}>
                Projeto
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`${testId}-date`}>
                Enviada em {formatDate(proposal.createdAt)}
              </p>
            </div>
          </div>
          <Badge 
            className={getStatusColor(proposal.status)}
            data-testid={`${testId}-status`}
          >
            {getStatusLabel(proposal.status)}
          </Badge>
        </div>

        <div className="mb-4">
          <p className="text-foreground line-clamp-3" data-testid={`${testId}-message`}>
            {proposal.message}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Valor proposto:</span>
            <div className="font-medium text-foreground" data-testid={`${testId}-rate`}>
              {formatCurrency(proposal.proposedRate)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Prazo:</span>
            <div className="font-medium text-foreground" data-testid={`${testId}-hours`}>
              {proposal.estimatedHours ? `${proposal.estimatedHours}h` : "Não definido"}
            </div>
          </div>
        </div>

        {proposal.deliveryDate && (
          <div className="mb-4 text-sm">
            <span className="text-muted-foreground">Data de entrega:</span>
            <span className="font-medium text-foreground ml-2" data-testid={`${testId}-delivery`}>
              {formatDate(proposal.deliveryDate)}
            </span>
          </div>
        )}

        {(proposal.viewedAt || proposal.respondedAt) && (
          <div className="mb-4 text-xs text-muted-foreground space-y-1">
            {proposal.viewedAt && (
              <div data-testid={`${testId}-viewed`}>
                <EyeIcon className="inline h-3 w-3 mr-1" />
                Visualizada em {formatDateTime(proposal.viewedAt)}
              </div>
            )}
            {proposal.respondedAt && (
              <div data-testid={`${testId}-responded`}>
                <MessageCircleIcon className="inline h-3 w-3 mr-1" />
                Respondida em {formatDateTime(proposal.respondedAt)}
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onView}
            data-testid={`${testId}-view`}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Ver Projeto
          </Button>
          {onMessage && proposal.status !== "DECLINED" && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onMessage}
              data-testid={`${testId}-message`}
            >
              <MessageCircleIcon className="h-4 w-4 mr-1" />
              Mensagem
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
