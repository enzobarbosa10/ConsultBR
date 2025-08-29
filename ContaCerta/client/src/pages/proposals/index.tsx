import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { ProposalCard } from "@/components/ui/proposal-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendIcon, MailIcon } from "lucide-react";

export default function Proposals() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  // Redirect if not authenticated or not consultant
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "CONSULTANT")) {
      toast({
        title: "Acesso negado",
        description: "Apenas consultores podem acessar esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        if (!user) {
          window.location.href = "/api/login";
        } else {
          setLocation("/dashboard");
        }
      }, 2000);
    }
  }, [isLoading, user, toast, setLocation]);

  // Get sent proposals
  const { data: sentProposals = [], isLoading: sentLoading } = useQuery({
    queryKey: ["/api/my-proposals/sent"],
    enabled: !!user && user.role === "CONSULTANT",
    retry: false,
  });

  // Get received proposals (for entrepreneurs who might access this)
  const { data: receivedProposals = [], isLoading: receivedLoading } = useQuery({
    queryKey: ["/api/my-proposals/received"],
    enabled: !!user && user.role === "ENTREPRENEUR",
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-proposals-title">
              Minhas Propostas
            </h1>
            <p className="text-muted-foreground" data-testid="text-proposals-subtitle">
              Acompanhe o status das suas propostas enviadas
            </p>
          </div>
          
          <Button 
            onClick={() => setLocation("/projects")}
            data-testid="button-find-projects"
          >
            <SendIcon className="h-4 w-4 mr-2" />
            Buscar Projetos
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Enviadas", value: sentProposals.length, status: "all" },
            { label: "Aceitas", value: sentProposals.filter((p: any) => p.status === "ACCEPTED").length, status: "ACCEPTED" },
            { label: "Pendentes", value: sentProposals.filter((p: any) => ["SENT", "VIEWED"].includes(p.status)).length, status: "pending" },
            { label: "Em Negociação", value: sentProposals.filter((p: any) => p.status === "COUNTER_OFFERED").length, status: "COUNTER_OFFERED" },
          ].map((stat, index) => (
            <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-foreground mb-2" data-testid={`stat-${stat.status}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Proposals List */}
        <Tabs defaultValue="sent" className="w-full">
          <TabsList>
            <TabsTrigger value="sent" data-testid="tab-sent">
              Propostas Enviadas ({sentProposals.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sent" className="space-y-6">
            {sentLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
                      <div className="flex space-x-4 mb-4">
                        <div className="h-3 bg-muted rounded w-20"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                      </div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sentProposals.length > 0 ? (
              <div className="space-y-4">
                {sentProposals.map((proposal: any, index: number) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onView={() => setLocation(`/projects/${proposal.projectId}`)}
                    testId={`proposal-card-${index}`}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MailIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-proposals">
                    Nenhuma proposta enviada ainda
                  </h3>
                  <p className="text-muted-foreground mb-6" data-testid="text-no-proposals-description">
                    Explore projetos disponíveis e envie suas primeiras propostas para começar a trabalhar.
                  </p>
                  <Button onClick={() => setLocation("/projects")} data-testid="button-find-first-projects">
                    <SendIcon className="h-4 w-4 mr-2" />
                    Buscar Projetos
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
