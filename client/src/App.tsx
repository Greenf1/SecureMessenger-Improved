import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CalculatorLogin from "@/pages/calculator-login";
import MainDashboard from "@/pages/main-dashboard";
import NotFound from "@/pages/not-found";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {isLoggedIn ? (
          <MainDashboard onLogout={handleLogout} />
        ) : (
          <CalculatorLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
