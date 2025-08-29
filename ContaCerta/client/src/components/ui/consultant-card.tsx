import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon, HeartIcon, ClockIcon, MapPinIcon, DollarSignIcon } from "lucide-react";

interface ConsultantCardProps {
  consultant: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    title: string;
    bio: string;
    experience: number;
    hourlyRate?: number;
    averageRating?: number;
    totalProjects: number;
    city: string;
    state: string;
    industries?: string[];
    responseTime?: number;
  };
  onView?: () => void;
  onFavorite?: () => void;
  onHire?: () => void;
  isFavorited?: boolean;
  testId?: string;
}

export function ConsultantCard({ 
  consultant, 
  onView, 
  onFavorite, 
  onHire, 
  isFavorited = false,
  testId 
}: ConsultantCardProps) {
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
          className={`h-3 w-3 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
        />
      );
    }
    return stars;
  };

  return (
    <Card className="card-hover" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={consultant.profileImageUrl} alt={`${consultant.firstName} ${consultant.lastName}`} />
            <AvatarFallback>{getInitials(consultant.firstName, consultant.lastName)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1" data-testid={`${testId}-name`}>
              {consultant.firstName} {consultant.lastName}
            </h3>
            <p className="text-sm text-muted-foreground mb-2" data-testid={`${testId}-title`}>
              {consultant.title}
            </p>
            {consultant.averageRating && (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(Math.round(consultant.averageRating))}
                </div>
                <span className="text-sm text-muted-foreground" data-testid={`${testId}-rating`}>
                  {consultant.averageRating.toFixed(1)} ({consultant.totalProjects})
                </span>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onFavorite}
            className={isFavorited ? "text-red-500" : "text-muted-foreground"}
            data-testid={`${testId}-favorite`}
          >
            <HeartIcon className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`${testId}-bio`}>
          {consultant.bio}
        </p>

        {consultant.industries && consultant.industries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {consultant.industries.slice(0, 3).map((industry, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {industry}
              </Badge>
            ))}
            {consultant.industries.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{consultant.industries.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          {consultant.responseTime && (
            <span data-testid={`${testId}-response-time`}>
              <ClockIcon className="inline h-3 w-3 mr-1" />
              Responde em {consultant.responseTime}h
            </span>
          )}
          <span data-testid={`${testId}-location`}>
            <MapPinIcon className="inline h-3 w-3 mr-1" />
            {consultant.city}, {consultant.state}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            {consultant.hourlyRate && (
              <>
                <span className="text-lg font-bold text-foreground" data-testid={`${testId}-rate`}>
                  {formatCurrency(consultant.hourlyRate)}
                </span>
                <span className="text-sm text-muted-foreground">/hora</span>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onView}
              data-testid={`${testId}-view`}
            >
              Ver Perfil
            </Button>
            <Button 
              size="sm" 
              onClick={onHire}
              data-testid={`${testId}-hire`}
            >
              Contratar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
