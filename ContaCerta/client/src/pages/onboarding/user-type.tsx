import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RocketIcon, Bus, HandshakeIcon, CheckIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function UserTypeSelection() {
  const [, setLocation] = useLocation();

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

      <section className="py-16 bg-muted min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-selection-title">Como você quer usar o ConsultBR?</h2>
            <p className="text-muted-foreground text-lg" data-testid="text-selection-subtitle">Escolha sua jornada e comece agora mesmo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Entrepreneur Card */}
            <Card className="card-hover cursor-pointer" onClick={() => setLocation("/onboarding/entrepreneur")} data-testid="card-entrepreneur">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RocketIcon className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3" data-testid="text-entrepreneur-title">Empreendedor</h3>
                  <p className="text-muted-foreground mb-6" data-testid="text-entrepreneur-description">
                    Encontre consultores especializados para impulsionar seu negócio
                  </p>
                  
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Publique projetos gratuitamente
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Receba propostas de consultores
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Gerencie projetos em andamento
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Sistema de pagamento seguro
                    </li>
                  </ul>

                  <Button className="w-full" data-testid="button-start-entrepreneur">
                    Começar como Empreendedor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Consultant Card */}
            <Card className="card-hover cursor-pointer" onClick={() => setLocation("/onboarding/consultant")} data-testid="card-consultant">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bus className="text-secondary h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3" data-testid="text-consultant-title">Consultor</h3>
                  <p className="text-muted-foreground mb-6" data-testid="text-consultant-description">
                    Ofereça seus serviços e encontre projetos incríveis
                  </p>
                  
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Crie seu perfil profissional
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Encontre projetos relevantes
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Construa seu portfólio
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <CheckIcon className="text-accent mr-2 h-4 w-4" />
                      Receba pagamentos protegidos
                    </li>
                  </ul>

                  <Button className="w-full bg-secondary hover:bg-secondary/90" data-testid="button-start-consultant">
                    Começar como Consultor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
