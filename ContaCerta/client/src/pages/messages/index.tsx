import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/layout/navbar";
import { MessageThread } from "@/components/ui/message-thread";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MessageCircleIcon,
  SearchIcon,
  UserIcon,
  PlusIcon
} from "lucide-react";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Get conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
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

  const filteredConversations = conversations.filter((conv: any) => {
    // Filter by search query (you would need to get partner names from another query)
    return true; // Simplified for now
  });

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (date: string | Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Agora";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      return messageDate.toLocaleDateString("pt-BR");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-messages-title">
              Mensagens
            </h1>
            <p className="text-muted-foreground" data-testid="text-messages-subtitle">
              Converse com consultores e empreendedores
            </p>
          </div>
          
          <Button data-testid="button-new-message">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </div>

        <Card className="h-[600px]" data-testid="card-messages-container">
          <div className="grid lg:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="lg:col-span-1 border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-conversations"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-80px)]">
                {conversationsLoading ? (
                  <div className="space-y-4 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation: any, index: number) => (
                      <div
                        key={conversation.partnerId}
                        className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                          selectedConversation?.partnerId === conversation.partnerId ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                        data-testid={`conversation-item-${index}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" alt="Partner" />
                              <AvatarFallback>
                                <UserIcon className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <Badge 
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                data-testid={`unread-count-${index}`}
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-medium text-foreground text-sm truncate" data-testid={`conversation-partner-${index}`}>
                                Consultor {index + 1}
                              </p>
                              <span className="text-xs text-muted-foreground" data-testid={`conversation-time-${index}`}>
                                {formatDate(conversation.lastMessage.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate" data-testid={`conversation-preview-${index}`}>
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.projectId && (
                              <p className="text-xs text-primary mt-1" data-testid={`conversation-project-${index}`}>
                                Projeto em andamento
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground" data-testid="text-no-conversations">
                      {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <MessageThread 
                  conversation={selectedConversation} 
                  currentUser={user}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircleIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-select-conversation">
                      Selecione uma conversa
                    </h3>
                    <p className="text-muted-foreground" data-testid="text-select-conversation-description">
                      Escolha uma conversa da lista para começar a trocar mensagens
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
