import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { HandshakeIcon, PlusIcon, SearchIcon, MessageCircleIcon, BellIcon, UserIcon, LogOutIcon, SettingsIcon } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const navigation = user?.role === "ENTREPRENEUR" 
    ? [
        { name: "Dashboard", href: "/dashboard", testId: "nav-dashboard" },
        { name: "Projetos", href: "/projects", testId: "nav-projects" },
        { name: "Consultores", href: "/consultants", testId: "nav-consultants" },
        { name: "Mensagens", href: "/messages", testId: "nav-messages" },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", testId: "nav-dashboard" },
        { name: "Oportunidades", href: "/projects", testId: "nav-opportunities" },
        { name: "Mensagens", href: "/messages", testId: "nav-messages" },
        { name: "Propostas", href: "/proposals", testId: "nav-proposals" },
      ];

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => setLocation("/dashboard")}
              data-testid="logo-link"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <HandshakeIcon className="text-primary-foreground h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-foreground">ConsultBR</span>
            </div>
            
            <div className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <button
                  key={item.href}
                  onClick={() => setLocation(item.href)}
                  className={`text-sm font-medium transition-colors ${
                    location === item.href 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={item.testId}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user?.role === "ENTREPRENEUR" && (
              <Button 
                onClick={() => setLocation("/projects/create")}
                size="sm"
                data-testid="button-create-project"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/consultants")}
              data-testid="button-search"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/messages")}
              data-testid="button-messages"
            >
              <MessageCircleIcon className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-notifications"
            >
              <BellIcon className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                    <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="menu-logout"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
