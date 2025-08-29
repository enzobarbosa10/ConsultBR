import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RocketIcon, Bus, HandshakeIcon, CheckIcon, SearchIcon, HeartIcon, DollarSignIcon, ClockIcon, MapPinIcon, StarIcon } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <HandshakeIcon className="text-primary-foreground h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-foreground">ConsultBR</span>
              </div>
              
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">Como Funciona</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-consultants">Consultores</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-projects">Projetos</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">Sobre</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = "/api/login"} data-testid="button-login">
                Entrar
              </Button>
              <Button onClick={() => window.location.href = "/api/login"} data-testid="button-signup">
                Cadastrar-se
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
                Conecte-se com os melhores 
                <span className="text-yellow-300"> consultores</span> do Brasil
              </h1>
              <p className="text-xl mb-8 text-blue-100" data-testid="text-hero-subtitle">
                A plataforma que une empreendedores com consultores especializados 
                para impulsionar seu negócio ao próximo nível.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-50"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-entrepreneur"
                >
                  <Bus className="mr-2 h-4 w-4" />
                  Sou Empreendedor
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-consultant"
                >
                  <RocketIcon className="mr-2 h-4 w-4" />
                  Sou Consultor
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-blue-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white" data-testid="text-stat-consultants">5,000+</div>
                  <div className="text-sm">Consultores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white" data-testid="text-stat-projects">12,000+</div>
                  <div className="text-sm">Projetos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white" data-testid="text-stat-rating">4.8★</div>
                  <div className="text-sm">Avaliação</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Business meeting with professionals" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-hero"
              />
              
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <CheckIcon className="text-accent-foreground h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground" data-testid="text-project-completed">Projeto Concluído</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-project-type">Marketing Digital</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-selection-title">Como você quer usar o ConsultBR?</h2>
            <p className="text-muted-foreground text-lg" data-testid="text-selection-subtitle">Escolha sua jornada e comece agora mesmo</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Entrepreneur Card */}
            <Card className="card-hover cursor-pointer" onClick={() => window.location.href = "/api/login"} data-testid="card-entrepreneur">
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
            <Card className="card-hover cursor-pointer" onClick={() => window.location.href = "/api/login"} data-testid="card-consultant">
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

      {/* Consultant Showcase */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-consultants-title">Consultores Especializados</h2>
            <p className="text-muted-foreground text-lg" data-testid="text-consultants-subtitle">Encontre o profissional ideal para seu projeto</p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8" data-testid="card-search-filters">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input 
                      type="text" 
                      placeholder="Buscar consultores, especialidades..." 
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      data-testid="input-search-consultants"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent" data-testid="select-specialties">
                    <option>Todas as especialidades</option>
                    <option>Marketing</option>
                    <option>Finanças</option>
                    <option>Estratégia</option>
                    <option>Vendas</option>
                    <option>RH</option>
                  </select>
                  <Button data-testid="button-filters">
                    Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultant Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Ana Costa",
                title: "Especialista em Marketing Digital",
                rating: 4.9,
                reviews: 23,
                description: "Ajudo empresas a aumentar suas vendas através de estratégias de marketing digital eficazes e mensuráveis.",
                skills: ["Marketing", "E-commerce", "Social Media"],
                responseTime: "2h",
                location: "São Paulo, SP",
                hourlyRate: 150,
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
              },
              {
                name: "Roberto Silva",
                title: "Consultor Financeiro Senior",
                rating: 5.0,
                reviews: 41,
                description: "15 anos ajudando empresas a reestruturar suas finanças e encontrar caminhos para o crescimento sustentável.",
                skills: ["Finanças", "Planejamento", "Investimentos"],
                responseTime: "1h",
                location: "Rio de Janeiro, RJ",
                hourlyRate: 200,
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
              },
              {
                name: "Luciana Santos",
                title: "Estrategista de Negócios",
                rating: 4.8,
                reviews: 36,
                description: "Especializada em transformação digital e desenvolvimento de estratégias para empresas em crescimento.",
                skills: ["Estratégia", "Transformação Digital", "Inovação"],
                responseTime: "3h",
                location: "Belo Horizonte, MG",
                hourlyRate: 180,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
              }
            ].map((consultant, index) => (
              <Card key={index} className="card-hover" data-testid={`card-consultant-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img 
                      src={consultant.image} 
                      alt={consultant.name} 
                      className="w-16 h-16 rounded-full object-cover"
                      data-testid={`img-consultant-${index}`}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1" data-testid={`text-consultant-name-${index}`}>{consultant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`text-consultant-title-${index}`}>{consultant.title}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground" data-testid={`text-consultant-rating-${index}`}>{consultant.rating} ({consultant.reviews})</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid={`button-favorite-${index}`}>
                      <HeartIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4" data-testid={`text-consultant-description-${index}`}>
                    {consultant.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {consultant.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" data-testid={`badge-skill-${index}-${skillIndex}`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <span data-testid={`text-response-time-${index}`}>
                      <ClockIcon className="inline mr-1 h-3 w-3" />
                      Responde em {consultant.responseTime}
                    </span>
                    <span data-testid={`text-location-${index}`}>
                      <MapPinIcon className="inline mr-1 h-3 w-3" />
                      {consultant.location}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-bold text-foreground" data-testid={`text-hourly-rate-${index}`}>R$ {consultant.hourlyRate}</span>
                      <span className="text-sm text-muted-foreground">/hora</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-profile-${index}`}>
                        Ver Perfil
                      </Button>
                      <Button size="sm" data-testid={`button-hire-${index}`}>
                        Contratar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" data-testid="button-view-more-consultants">
              Ver Mais Consultores
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <HandshakeIcon className="text-primary-foreground h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-foreground" data-testid="text-footer-logo">ConsultBR</span>
              </div>
              <p className="text-muted-foreground mb-4" data-testid="text-footer-description">
                Conectando empreendedores com os melhores consultores do Brasil.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4" data-testid="text-footer-entrepreneurs">Para Empreendedores</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-how-it-works-footer">Como Funciona</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-find-consultants">Encontrar Consultores</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-publish-project">Publicar Projeto</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-help-center">Central de Ajuda</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4" data-testid="text-footer-consultants">Para Consultores</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-get-started">Começar</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-search-projects">Buscar Projetos</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-create-profile">Criar Perfil</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-success">Sucesso</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4" data-testid="text-footer-company">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-about-us">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-terms">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-privacy">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-contact">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p data-testid="text-copyright">&copy; 2024 ConsultBR. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
