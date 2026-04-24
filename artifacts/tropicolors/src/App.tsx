import React, { Suspense, lazy, useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { isFirestorePermissionDenied } from "@/lib/firebase-errors";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import HeroLanding from "@/components/HeroLanding";
import { useIsMobile } from "@/hooks/use-mobile";

import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

const Admin = lazy(() => import("@/pages/Admin"));
const Inventario = lazy(() => import("@/pages/Inventario"));
const CartDrawer = lazy(() =>
  import("@/components/CartDrawer").then((module) => ({
    default: module.CartDrawer,
  })),
);
const CartAddNotice = lazy(() =>
  import("@/components/CartAddNotice").then((module) => ({
    default: module.CartAddNotice,
  })),
);
const FloatingWhatsApp = lazy(() =>
  import("@/components/FloatingWhatsApp").then((module) => ({
    default: module.FloatingWhatsApp,
  })),
);
const FlyToCart = lazy(() =>
  import("@/components/FlyToCart").then((module) => ({
    default: module.FlyToCart,
  })),
);

const queryClient = new QueryClient();

function scheduleDeferredUi(callback: () => void) {
  const browserWindow = window as Window & {
    requestIdleCallback?: (
      handler: () => void,
      options?: { timeout: number },
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof browserWindow.requestIdleCallback === "function") {
    const idleHandle = browserWindow.requestIdleCallback(callback, {
      timeout: 1200,
    });

    return () => {
      browserWindow.cancelIdleCallback?.(idleHandle);
    };
  }

  const timeoutId = window.setTimeout(callback, 350);
  return () => window.clearTimeout(timeoutId);
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdminPage = location === "/login" || location === "/inventario";
  const [deferredUiReady, setDeferredUiReady] = useState(false);
  const isMobile = useIsMobile();

  const isHomePage = location === "/";

  useEffect(() => {
    const cancelDeferredUi = scheduleDeferredUi(() => {
      setDeferredUiReady(true);
    });

    return cancelDeferredUi;
  }, []);
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen font-sans selection:bg-accent selection:text-primary"
      style={{ scrollSnapType: isMobile ? "none" : "y proximity" }}
    >
      <Navbar />
      {isHomePage ? <HeroLanding /> : null}
      <main>{children}</main>
      <Footer />
      {deferredUiReady ? (
        <Suspense fallback={null}>
          <CartDrawer />
          <CartAddNotice />
          <FloatingWhatsApp />
          <FlyToCart />
        </Suspense>
      ) : null}
    </div>
  );
}

function Router() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-slate-500">
          Cargando...
        </div>
      }
    >
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Admin} />
        <Route path="/inventario" component={Inventario} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    let permissionToastShown = false;

    const showPermissionToast = () => {
      if (permissionToastShown) {
        return;
      }

      permissionToastShown = true;
      toast({
        title: "Algunas secciones no pudieron cargarse",
        description:
          "Firebase está rechazando parte de la información por permisos. El panel seguirá en modo seguro.",
        variant: "destructive",
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isFirestorePermissionDenied(event.reason)) {
        return;
      }

      console.warn(
        "[App] Rechazo no controlado de Firestore por permisos insuficientes.",
        event.reason,
      );
      event.preventDefault();
      showPermissionToast();
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (!isFirestorePermissionDenied(event.error)) {
        return;
      }

      console.warn(
        "[App] Error global de Firestore por permisos insuficientes.",
        event.error,
      );
      event.preventDefault();
      showPermissionToast();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
    };
  }, []);

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
