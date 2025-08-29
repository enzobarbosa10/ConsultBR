import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PhoneIcon, 
  VideoIcon, 
  MoreVerticalIcon, 
  SendIcon, 
  PaperclipIcon,
  DownloadIcon,
  FileIcon,
  UserIcon
} from "lucide-react";

interface MessageThreadProps {
  conversation: {
    partnerId: string;
    projectId?: string;
    lastMessage: any;
  };
  currentUser: any;
}

export function MessageThread({ conversation, currentUser }: MessageThreadProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get messages between users
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", conversation.partnerId, conversation.projectId],
    enabled: !!conversation.partnerId,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/messages", conversation.partnerId, conversation.projectId] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageInput("");
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
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    sendMessageMutation.mutate({
      receiverId: conversation.partnerId,
      content: messageInput.trim(),
      projectId: conversation.projectId || null,
      attachments: [],
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border" data-testid="chat-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="Partner" />
              <AvatarFallback>
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-foreground" data-testid="chat-partner-name">
                Consultor
              </h4>
              <p className="text-sm text-muted-foreground" data-testid="chat-partner-status">
                {conversation.projectId ? "Projeto em andamento" : "Disponível"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" data-testid="button-call">
              <PhoneIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-video">
              <VideoIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-more">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-container">
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="bg-muted rounded-lg p-3 max-w-xs">
                    <div className="h-4 bg-muted-foreground rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message: any, index: number) => {
              const isCurrentUser = message.senderId === currentUser.id;
              const isConsecutive = index > 0 && messages[index - 1].senderId === message.senderId;

              return (
                <div 
                  key={message.id} 
                  className={`flex items-start space-x-2 ${isCurrentUser ? "justify-end" : ""}`}
                  data-testid={`message-${index}`}
                >
                  {!isCurrentUser && !isConsecutive && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" alt="Partner" />
                      <AvatarFallback className="text-xs">
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!isCurrentUser && isConsecutive && (
                    <div className="w-8 h-8"></div>
                  )}

                  <div className="space-y-1 max-w-xs lg:max-w-md">
                    <div 
                      className={`rounded-lg p-3 ${
                        isCurrentUser 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm" data-testid={`message-content-${index}`}>
                        {message.content}
                      </p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment: string, attachIndex: number) => (
                            <div 
                              key={attachIndex} 
                              className="flex items-center space-x-2 p-2 bg-background/10 rounded"
                            >
                              <FileIcon className="h-4 w-4" />
                              <span className="text-xs flex-1 truncate">
                                {attachment.split('/').pop()}
                              </span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <DownloadIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <span 
                      className={`text-xs text-muted-foreground block ${
                        isCurrentUser ? "text-right" : "text-left"
                      }`}
                      data-testid={`message-time-${index}`}
                    >
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground" data-testid="text-no-messages">
                Nenhuma mensagem ainda
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Envie uma mensagem para começar a conversa
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border" data-testid="message-input-container">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" data-testid="button-attach">
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Digite sua mensagem..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            data-testid="input-message"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            data-testid="button-send-message"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
