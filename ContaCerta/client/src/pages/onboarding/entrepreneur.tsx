import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertEntrepreneurProfileSchema } from "@shared/schema";
import { HandshakeIcon, CheckIcon } from "lucide-react";

const formSchema = insertEntrepreneurProfileSchema.extend({
  consultationAreas: insertEntrepreneurProfileSchema.shape.consultationAreas.default([]),
});

export default function EntrepreneurOnboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyDescription: "",
      industry: "",
      businessStage: "",
      state: "",
      city: "",
      consultationAreas: [],
      isRemote: false,
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/profiles/entrepreneur", data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil criado com sucesso!",
        description: "Bem-vindo ao ConsultBR! Você já pode começar a usar a plataforma.",
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
    "Outros",
  ];

  const businessStages = [
    { value: "idea", label: "Ideia" },
    { value: "prototype", label: "Protótipo" },
    { value: "launch", label: "Lançamento" },
    { value: "growth", label: "Crescimento" },
  ];

  const consultationAreas = [
    "Marketing",
    "Vendas",
    "Finanças",
    "Estratégia",
    "Operações",
    "RH",
    "Tecnologia",
    "Legal",
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
            Cadastro - Empreendedor
          </h1>
          <p className="text-muted-foreground" data-testid="text-onboarding-subtitle">
            Vamos configurar seu perfil para encontrar os melhores consultores
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
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  data-testid={`step-indicator-${stepNumber}`}
                >
                  {step > stepNumber ? <CheckIcon className="h-4 w-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? "bg-primary" : "bg-muted"
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
                      <h2 className="text-xl font-semibold text-foreground mb-2">Informações da Empresa</h2>
                      <p className="text-muted-foreground">Conte-nos sobre sua empresa</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da sua empresa" {...field} data-testid="input-company-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Empresa</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva sua empresa e o que ela faz"
                              className="resize-none"
                              {...field}
                              data-testid="textarea-company-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setor da Empresa *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-industry">
                                <SelectValue placeholder="Selecione o setor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">Estágio do Negócio</h2>
                      <p className="text-muted-foreground">Em que estágio sua empresa se encontra?</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="businessStage"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Selecione o estágio atual</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-3">
                              {businessStages.map((stage) => (
                                <div
                                  key={stage.value}
                                  className={`p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                                    field.value === stage.value ? "border-primary bg-primary/5" : ""
                                  }`}
                                  onClick={() => field.onChange(stage.value)}
                                  data-testid={`option-business-stage-${stage.value}`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="radio"
                                      name="businessStage"
                                      value={stage.value}
                                      checked={field.value === stage.value}
                                      onChange={() => field.onChange(stage.value)}
                                      className="text-primary"
                                    />
                                    <span className="text-sm font-medium">{stage.label}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">Áreas de Consultoria</h2>
                      <p className="text-muted-foreground">Em quais áreas você precisa de ajuda?</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="consultationAreas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione as áreas de interesse</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-3">
                              {consultationAreas.map((area) => (
                                <div
                                  key={area}
                                  className={`p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                                    field.value?.includes(area) ? "border-primary bg-primary/5" : ""
                                  }`}
                                  onClick={() => {
                                    const current = field.value || [];
                                    const updated = current.includes(area)
                                      ? current.filter((item: string) => item !== area)
                                      : [...current, area];
                                    field.onChange(updated);
                                  }}
                                  data-testid={`option-consultation-area-${area.toLowerCase()}`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={field.value?.includes(area) || false}
                                      onChange={() => {}}
                                      className="text-primary"
                                    />
                                    <span className="text-sm">{area}</span>
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
