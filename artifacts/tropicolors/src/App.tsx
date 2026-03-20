import React, { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { FlyToCart } from "@/components/FlyToCart";
import HeroLanding from "@/components/HeroLanding";

import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdminPage = location === "/login";
  const [showHero, setShowHero] = useState(true);
  const [heroKey, setHeroKey] = useState(0);

  const isHomePage = location === "/";

  useEffect(() => {
    if (isHomePage) {
      setShowHero(true);
      setHeroKey(prev => prev + 1);
    }
  }, [location, isHomePage]);

  const handleHeroComplete = () => {
    // Hero se maneja internamente ahora - puede reaparecer al hacer scroll hacia arriba
  };

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen font-sans selection:bg-accent selection:text-primary"
      style={{ scrollSnapType: "y proximity" }}
    >
      <Navbar />
      {isHomePage && showHero && (
        <HeroLanding key={heroKey} onComplete={handleHeroComplete} />
      )}
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
      <FlyToCart />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout>
              <Router />
            </AppLayout>
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
