import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SaveIcon, EyeIcon, UploadIcon, XIcon } from "lucide-react";

const formSchema = insertProjectSchema.extend({
  deliverables: insertProjectSchema.shape.deliverables.default([]),
  attachments: insertProjectSchema.shape.attachments.default([]),
});

export default function CreateProject() {
  const [deliverableInput, setDeliverableInput] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      deliverables: [],
      budget: 0,
      estimatedHours: 0,
      status: "DRAFT" as const,
      startDate: undefined,
      endDate: undefined,
      attachments: [],
    },
  });

  // Redirect if not authenticated or not entrepreneur
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ENTREPRENEUR")) {
      toast({
        title: "Acesso negado",
        description: "Apenas empreendedores podem criar projetos.",
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

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: (response) => {
      const project = response.data || response;
      toast({
        title: "Projeto criado com sucesso!",
        description: "Seu projeto foi salvo e você pode publicá-lo quando quiser.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-projects"] });
      setLocation(`/projects/${project.id}`);
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
        title: "Erro ao criar projeto",
        description: "Ocorreu um erro ao criar o projeto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "ENTREPRENEUR") {
    return null;
  }

  const onSubmit = (data: any) => {
    createProjectMutation.mutate(data);
  };

  const onSubmitAndPublish = (data: any) => {
    createProjectMutation.mutate({ ...data, status: "PUBLISHED" });
  };

  const addDeliverable = () => {
    if (deliverableInput.trim()) {
      const currentDeliverables = form.getValues("deliverables") || [];
      form.setValue("deliverables", [...currentDeliverables, deliverableInput.trim()]);
      setDeliverableInput("");
    }
  };

  const removeDeliverable = (index: number) => {
    const currentDeliverables = form.getValues("deliverables") || [];
    form.setValue("deliverables", currentDeliverables.filter((_, i) => i !== index));
  };

  const budgetRanges = [
    { value: "1000", label: "R$ 1.000 - R$ 5.000" },
    { value: "5000", label: "R$ 5.000 - R$ 10.000" },
    { value: "10000", label: "R$ 10.000 - R$ 25.000" },
    { value: "25000", label: "R$ 25.000 - R$ 50.000" },
    { value: "50000", label: "R$ 50.000+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-create-project-title">
            Criar Novo Projeto
          </h1>
          <p className="text-muted-foreground" data-testid="text-create-project-subtitle">
            Descreva seu projeto em detalhes para atrair os melhores consultores
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-8">
            <Card data-testid="card-project-basic-info">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Projeto *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Consultoria em Marketing Digital para E-commerce"
                          {...field}
                          data-testid="input-project-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva em detalhes o que você precisa, objetivos, desafios atuais e resultados esperados..."
                          className="resize-none"
                          rows={6}
                          {...field}
                          data-testid="textarea-project-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos Específicos</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mencione requisitos específicos, experiência necessária, ferramentas que devem ser utilizadas..."
                          className="resize-none"
                          rows={4}
                          {...field}
                          data-testid="textarea-project-requirements"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card data-testid="card-project-deliverables">
              <CardHeader>
                <CardTitle>Entregáveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel>Lista de Entregáveis</FormLabel>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="Ex: Relatório de análise de mercado"
                      value={deliverableInput}
                      onChange={(e) => setDeliverableInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDeliverable())}
                      data-testid="input-deliverable"
                    />
                    <Button 
                      type="button" 
                      onClick={addDeliverable}
                      disabled={!deliverableInput.trim()}
                      data-testid="button-add-deliverable"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(form.watch("deliverables") || []).map((deliverable, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {deliverable}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeDeliverable(index)}
                        data-testid={`button-remove-deliverable-${index}`}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-project-budget-timeline">
              <CardHeader>
                <CardTitle>Orçamento e Cronograma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orçamento (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="15000"
                            min="0"
                            step="100"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-project-budget"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas Estimadas</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="40"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-project-hours"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-project-start-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Entrega</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            data-testid="input-project-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-project-attachments">
              <CardHeader>
                <CardTitle>Anexos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2" data-testid="text-upload-instruction">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-upload-restrictions">
                    PDF, DOC, DOCX até 10MB
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-4"
                    data-testid="button-select-files"
                  >
                    Selecionar Arquivos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              
              <div className="flex space-x-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={createProjectMutation.isPending}
                  data-testid="button-save-draft"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {createProjectMutation.isPending ? "Salvando..." : "Salvar Rascunho"}
                </Button>
                
                <Button 
                  type="button"
                  onClick={form.handleSubmit(onSubmitAndPublish)}
                  disabled={createProjectMutation.isPending}
                  data-testid="button-publish"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {createProjectMutation.isPending ? "Publicando..." : "Publicar Projeto"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
