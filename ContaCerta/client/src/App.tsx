import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import UserTypeSelection from "@/pages/onboarding/user-type";
import EntrepreneurOnboarding from "@/pages/onboarding/entrepreneur";
import ConsultantOnboarding from "@/pages/onboarding/consultant";
import EntrepreneurDashboard from "@/pages/dashboard/entrepreneur";
import ConsultantDashboard from "@/pages/dashboard/consultant";
import CreateProject from "@/pages/projects/create";
import ProjectList from "@/pages/projects/list";
import ProjectDetail from "@/pages/projects/detail";
import ConsultantList from "@/pages/consultants/list";
import ConsultantProfile from "@/pages/consultants/profile";
import Messages from "@/pages/messages/index";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : !user?.role ? (
        <Route path="/" component={UserTypeSelection} />
      ) : !user?.profile ? (
        <>
          <Route path="/" component={user.role === "ENTREPRENEUR" ? EntrepreneurOnboarding : ConsultantOnboarding} />
          <Route path="/onboarding/entrepreneur" component={EntrepreneurOnboarding} />
          <Route path="/onboarding/consultant" component={ConsultantOnboarding} />
        </>
      ) : (
        <>
          <Route path="/" component={user.role === "ENTREPRENEUR" ? EntrepreneurDashboard : ConsultantDashboard} />
          <Route path="/dashboard" component={user.role === "ENTREPRENEUR" ? EntrepreneurDashboard : ConsultantDashboard} />
          <Route path="/projects/create" component={CreateProject} />
          <Route path="/projects" component={ProjectList} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/consultants" component={ConsultantList} />
          <Route path="/consultants/:userId" component={ConsultantProfile} />
          <Route path="/messages" component={Messages} />
          <Route path="/onboarding/entrepreneur" component={EntrepreneurOnboarding} />
          <Route path="/onboarding/consultant" component={ConsultantOnboarding} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
