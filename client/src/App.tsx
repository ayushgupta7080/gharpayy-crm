import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";

// Pages
import Dashboard from "@/pages/dashboard";
import LeadsList from "@/pages/leads";
import LeadDetails from "@/pages/lead-details";
import NewLead from "@/pages/new-lead";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/leads" component={LeadsList}/>
        <Route path="/leads/:id" component={LeadDetails}/>
        <Route path="/new-lead" component={NewLead}/>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
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
