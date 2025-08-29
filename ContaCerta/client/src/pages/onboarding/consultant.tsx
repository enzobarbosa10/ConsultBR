import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertConsultantProfileSchema } from "@shared/schema";
import { HandshakeIcon, CheckIcon } from "lucide-react";

const formSchema = insertConsultantProfileSchema.extend({
  industries: insertConsultantProfileSchema.shape.industries.default([]),
});

export default function ConsultantOnboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      bio: "",
      experience: 0,
      hourlyRate: 0,
      state: "",
      city: "",
      industries: [],
      isRemote: true,
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/profiles/consultant", data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil criado com sucesso!",
        description: "Bem-vindo ao ConsultBR! Você já pode começar a buscar projetos.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
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
        title: "Erro ao criar perfil",
        description: "Ocorreu um erro ao criar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

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
    }
  }, [isLoading, user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const onSubmit = (data: any) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      createProfileMutation.mutate(data);
    }
  };

  const industries = [
    "Tecnologia",
    "E-commerce", 
    "Serviços",
    "Manufatura",
    "Saúde",
    "Educação",
    "Finanças",
    "Varejo",
    "Marketing",
    "Vendas",
    "Outros",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <HandshakeIcon className="text-primary-foreground h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-foreground" data-testid="text-logo">ConsultBR</span>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-onboarding-title">
            Cadastro - Consultor
          </h1>
          <p className="text-muted-foreground" data-testid="text-onboarding-subtitle">
            Vamos criar seu perfil profissional para atrair os melhores projetos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-indicator-${stepNumber}`}
                >
                  {step > stepNumber ? <CheckIcon className="h-4 w-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? "bg-secondary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card data-testid="card-onboarding-form">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">Informações Profissionais</h2>
                      <p className="text-muted-foreground">Conte-nos sobre sua experiência</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Profissional *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Consultor em Marketing Digital" {...field} data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografia Profissional *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva sua experiência, especialidades e como você pode ajudar empresas"
                              className="resize-none"
                              rows={4}
                              {...field}
                              data-testid="textarea-bio"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anos de Experiência *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5"
                              min="0"
                              max="50"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-experience"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">Localização e Preços</h2>
                      <p className="text-muted-foreground">Defina onde você atua e seus valores</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo" {...field} data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo" {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isRemote"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-remote"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Trabalho remotamente
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Posso atender clientes de qualquer lugar do Brasil
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa por Hora (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="150"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-hourly-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">Especialidades</h2>
                      <p className="text-muted-foreground">Em quais setores você tem experiência?</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="industries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione os setores de atuação</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-3">
                              {industries.map((industry) => (
                                <div
                                  key={industry}
                                  className={`p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                                    field.value?.includes(industry) ? "border-secondary bg-secondary/5" : ""
                                  }`}
                                  onClick={() => {
                                    const current = field.value || [];
                                    const updated = current.includes(industry)
                                      ? current.filter((item: string) => item !== industry)
                                      : [...current, industry];
                                    field.onChange(updated);
                                  }}
                                  data-testid={`option-industry-${industry.toLowerCase()}`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={field.value?.includes(industry) || false}
                                      onChange={() => {}}
                                      className="text-secondary"
                                    />
                                    <span className="text-sm">{industry}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => step > 1 ? setStep(step - 1) : setLocation("/")}
                    data-testid="button-back"
                  >
                    {step > 1 ? "Voltar" : "Cancelar"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProfileMutation.isPending}
                    className="bg-secondary hover:bg-secondary/90"
                    data-testid="button-continue"
                  >
                    {createProfileMutation.isPending
                      ? "Criando perfil..."
                      : step < 3
                      ? "Continuar"
                      : "Finalizar Cadastro"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
