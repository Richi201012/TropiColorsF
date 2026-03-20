import React, { useState, useEffect, createContext, useContext } from "react";
import { 
  Lock, 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle, 
  LayoutDashboard, 
  ShoppingBag, 
  FileText,
  Eye,
  EyeOff,
  LogOut,
  ArrowRight,
  Loader2,
  User,
  Mail,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Users,
  Star,
  Activity
} from "lucide-react";
import { useLocation } from "wouter";

// Auth Context for session management
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Auth provider - replace with real backend integration
const useAuthProvider = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tropic_admin_auth') === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call - replace with real backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo: accept any non-empty credentials
    if (email && password) {
      localStorage.setItem('tropic_admin_auth', 'true');
      localStorage.setItem('tropic_admin_email', email);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async (): Promise<void> => {
    setIsLoggingOut(true);
    // Simulate API call - replace with real backend logout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear session data
    localStorage.removeItem('tropic_admin_auth');
    localStorage.removeItem('tropic_admin_email');
    sessionStorage.clear();
    
    setIsAuthenticated(false);
    setIsLoggingOut(false);
  };

  return { isAuthenticated, login, logout, isLoading, isLoggingOut };
};

// Premium Input Component
function PremiumInput({ 
  icon: Icon, 
  type, 
  placeholder, 
  value, 
  onChange, 
  error,
  showToggle,
  onToggle,
  disabled 
}: { 
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform -translate-y-0.5' : ''}`}>
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full pl-12 pr-12 py-4 bg-white border-2 rounded-2xl outline-none transition-all duration-200
            input-premium font-medium text-sm
            ${error 
              ? 'border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10' 
              : isFocused 
                ? 'border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10' 
                : 'border-border/60 focus:border-primary/30'
            }
            ${disabled ? 'bg-muted/30 cursor-not-allowed' : 'bg-white'}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive flex items-center gap-1 animate-slide-in-right">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// Premium Button Component
function PremiumButton({ 
  children, 
  onClick, 
  isLoading, 
  disabled,
  variant = 'primary',
  type = 'button'
}: { 
  children: React.ReactNode;
  onClick?: (e?: React.FormEvent) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  type?: 'button' | 'submit' | 'reset';
}) {
  const baseClasses = `
    w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200
    btn-premium flex items-center justify-center gap-2
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-primary to-primary/90 text-primary-foreground
      hover:from-primary/90 hover:to-primary/80 hover:shadow-lg hover:shadow-primary/25
      active:scale-[0.98]
    `,
    secondary: `
      bg-secondary text-secondary-foreground
      hover:bg-secondary/90
    `,
    outline: `
      border-2 border-border text-foreground
      hover:border-primary/30 hover:bg-primary/5
    `
  };

  return (
    <button
      type={type}
      onClick={(e) => onClick?.(e)}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Iniciando sesión...
        </>
      ) : children}
    </button>
  );
}

// Particle Component for background effect
function Particle({ 
  size, 
  color, 
  position, 
  delay, 
  duration 
}: { 
  size: number;
  color: string;
  position: { x: string; y: string };
  delay: number;
  duration: number;
}) {
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  useEffect(() => {
    // Random movement direction
    const xMove = (Math.random() - 0.5) * 200;
    const yMove = (Math.random() - 0.5) * 150;
    setTx(xMove);
    setTy(yMove);
  }, []);

  return (
    <div
      className="absolute rounded-full animate-particle pointer-events-none"
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y,
        backgroundColor: color,
        '--tx': `${tx}px`,
        '--ty': `${ty}px`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
      } as React.CSSProperties}
    />
  );
}

// Login Page Component
function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const { login } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }
    
    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    
    if (success) {
      onLoginSuccess();
    } else {
      setError("Credenciales inválidas. Intenta de nuevo.");
    }
    setIsLoading(false);
  };

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    color: ['#003F91', '#00A8B5', '#FFCD00', '#FFFFFF'][Math.floor(Math.random() * 4)],
    position: {
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
    },
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,#163b73_0%,#0b1d3d_38%,#07142a_100%)] animate-gradient">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,205,0,0.1)_0%,rgba(255,46,99,0.08)_32%,rgba(0,168,181,0.12)_68%,rgba(0,63,145,0.22)_100%)]" />

        {/* Powder clouds */}
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-[#FFCD00]/26 blur-[90px] mix-blend-screen animate-powder-drift" />
        <div
          className="absolute top-[10%] right-[-8%] h-[500px] w-[500px] rounded-full bg-[#FF2E63]/22 blur-[110px] mix-blend-screen animate-powder-drift"
          style={{ animationDelay: "2.5s" }}
        />
        <div
          className="absolute bottom-[-12%] left-[6%] h-[560px] w-[560px] rounded-full bg-[#00A8B5]/20 blur-[120px] mix-blend-screen animate-powder-drift"
          style={{ animationDelay: "5s" }}
        />
        <div
          className="absolute bottom-[2%] right-[10%] h-[420px] w-[420px] rounded-full bg-[#003F91]/30 blur-[100px] mix-blend-screen animate-powder-drift"
          style={{ animationDelay: "1.2s" }}
        />

        {/* Swirling powder veil */}
        <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,205,0,0.14),rgba(255,46,99,0.2),rgba(0,168,181,0.18),rgba(0,63,145,0.12),rgba(255,205,0,0.14))] blur-[130px] opacity-80 animate-powder-swirl" />
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.05)_38%,transparent_72%)] blur-[30px]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Particles */}
        {particles.map((particle) => (
          <Particle key={particle.id} {...particle} />
        ))}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(4,12,26,0.28)_100%)]" />
      </div>

      {/* Login Container */}
      <div className={`
        relative min-h-screen flex items-center justify-center p-4
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        <div className="w-full max-w-md">
          {/* Logo Section with Glow */}
          <div className="text-center mb-8">
            {/* Glow effect behind logo */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 scale-125 bg-gradient-to-r from-primary via-secondary to-primary blur-2xl opacity-55 animate-glow-pulse rounded-3xl" />
              
              {/* Logo container */}
              <div 
                className="relative animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}logo-tropicolors.png`}
                  alt="TropicColors"
                  className="h-28 sm:h-32 w-auto object-contain mx-auto drop-shadow-2xl"
                />
              </div>
            </div>
            
            <h1 
              className="text-2xl font-display font-bold text-white mb-2 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              Panel de Administración
            </h1>
            <p 
              className="text-white/50 text-sm font-medium animate-fade-in-up"
              style={{ animationDelay: '0.25s' }}
            >
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form Card with Premium Glass Effect */}
          <div 
            className="
            relative bg-white/90 backdrop-blur-2xl rounded-2xl 
            border border-white/20 shadow-2xl shadow-black/20
            p-6 animate-fade-in-scale
          " 
            style={{ animationDelay: '0.3s' }}
          >
            {/* Subtle shine effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>

            <div className="relative">
              <h2 className="text-xl font-display font-bold text-foreground mb-1">
                Bienvenido de nuevo
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Accede a tu cuenta
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                  <PremiumInput
                    icon={Mail}
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error && !email ? error : undefined}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <PremiumInput
                    icon={Lock}
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={error && !password ? error : undefined}
                    disabled={isLoading}
                  />
                </div>

                {error && email && password && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl animate-slide-in-right">
                    <AlertCircle size={16} className="text-destructive" />
                    <p className="text-xs text-destructive font-medium">{error}</p>
                  </div>
                )}

                <PremiumButton 
                  onClick={handleSubmit} 
                  isLoading={isLoading}
                  type="submit"
                >
                  {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                  {!isLoading && <ArrowRight size={18} />}
                </PremiumButton>
              </form>

              <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <a 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Volver al sitio web
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/30 text-xs mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            Â© 2024 TropicColors. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color,
  bgColor,
  delay 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color: string;
  bgColor: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        bg-white rounded-xl p-4 border border-border/50 shadow-sm card-premium
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={color} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground mb-0.5">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  features,
  color,
  bgColor,
  delay
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        text-center py-16 px-8 transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="relative inline-flex mb-6">
        <div className={`w-24 h-24 ${bgColor} rounded-3xl flex items-center justify-center`}>
          <Icon size={40} className={color} strokeWidth={1.5} />
        </div>
        <div className={`absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white`} />
      </div>
      
      <h2 className="text-2xl font-display font-bold text-foreground mb-3">
        {title}
      </h2>
      <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-8">
        {description}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
        {features.map((feature, i) => (
          <div 
            key={i} 
            className="bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 rounded-2xl px-4 py-3 text-xs font-semibold text-foreground flex items-center justify-center gap-2"
          >
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ onLogout }: { onLogout: () => Promise<void> }) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "invoices">("overview");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHeaderElevated, setIsHeaderElevated] = useState(false);
  const [, setLocation] = useLocation();

  // Mock stats - will be replaced with real data
  const stats = [
    { icon: DollarSign, label: "Ingresos Totales", value: "$24,580", trend: { value: 12.5, isPositive: true }, color: "text-primary", bgColor: "bg-primary/10" },
    { icon: ShoppingBag, label: "Pedidos Totales", value: "156", trend: { value: 8.2, isPositive: true }, color: "text-secondary", bgColor: "bg-secondary/10" },
    { icon: Clock, label: "Pendientes", value: "12", trend: { value: 3.1, isPositive: false }, color: "text-amber-600", bgColor: "bg-amber-50" },
    { icon: Users, label: "Clientes Nuevos", value: "28", trend: { value: 15.3, isPositive: true }, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const handleTabChange = (tab: typeof activeTab) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      // Smooth transition to login
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderElevated(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header
        className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          isHeaderElevated
            ? "border-border/70 bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
            : "border-border/50 bg-white/82 backdrop-blur-xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20 ring-1 ring-primary/10">
                <Lock size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Admin
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sesión activa
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg font-display font-bold tracking-tight text-slate-950">Panel Administrativo</h1>
                <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">Supervisa pedidos, facturación y operaciones desde una interfaz clara y moderna.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:flex-none">
              <a 
                href="/" 
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-border/70 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/5 hover:text-primary hover:shadow-md active:translate-y-0"
              >
                Ver sitio
              </a>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`
                  group inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-bold transition-all duration-200
                  ${isLoggingOut 
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' 
                    : 'border-slate-300 bg-slate-950 text-white shadow-sm hover:-translate-y-0.5 hover:border-slate-950 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/15 active:translate-y-0'
                  }
                `}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cerrando...
                  </>
                ) : (
                  <>
                    <LogOut size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Cerrar sesión
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-border/30 shadow-sm mb-4 w-fit">
          {([
            { key: "overview", label: "Resumen", icon: LayoutDashboard },
            { key: "orders", label: "Pedidos", icon: Package },
            { key: "invoices", label: "Facturas", icon: FileText },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300
                ${activeTab === tab.key 
                  ? 'text-white' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {activeTab === tab.key && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg shadow-primary/20 tab-indicator" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={16} />
                {tab.label}
              </span>
              {activeTab === tab.key && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl tab-indicator" />
              )}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {stats.map((stat, i) => (
            <MetricCard
              key={i}
              {...stat}
              delay={i * 100 + 200}
            />
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className={`
            transition-all duration-300
            ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}>
            {activeTab === "overview" && (
              <EmptyState
                icon={Activity}
                title="Panel listo para conectar"
                description="El panel administrativo estÃ¡ configurado y listo. Una vez que conectes el backend, aquÃ­ aparecerÃ¡n las estadÃ­sticas de ventas, pedidos recientes y grÃ¡ficas de rendimiento en tiempo real."
                features={["EstadÃ­sticas de ventas", "GestiÃ³n de pedidos", "AnÃ¡lisis de clientes"]}
                color="text-primary"
                bgColor="bg-primary/10"
                delay={500}
              />
            )}

            {activeTab === "orders" && (
              <EmptyState
                icon={Package}
                title="GestiÃ³n de Pedidos"
                description="AquÃ­ podrÃ¡s ver todos los pedidos, actualizar su estado (pendiente â†’ pagado â†’ enviado â†’ entregado) y agregar nÃºmeros de rastreo para que tus clientes sigan sus envÃ­os."
                features={["Estados automÃ¡ticos", "Notificaciones", "Historial completo"]}
                color="text-secondary"
                bgColor="bg-secondary/10"
                delay={500}
              />
            )}

            {activeTab === "invoices" && (
              <EmptyState
                icon={FileText}
                title="Facturación Electrónica"
                description="Crea, gestiona y envía facturas a tus clientes en PDF directamente por correo electrónico. Cumple con los requisitos fiscales de manera automática."
                features={["PDF automático", "Envío por email", "Historial fiscal"]}
                color="text-amber-600"
                bgColor="bg-amber-50"
                delay={500}
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Package, label: "Nuevo Pedido", color: "from-blue-500 to-blue-600" },
            { icon: FileText, label: "Crear Factura", color: "from-amber-500 to-amber-600" },
            { icon: Users, label: "Agregar Cliente", color: "from-purple-500 to-purple-600" },
          ].map((action, i) => (
            <button
              key={i}
              className={`
                p-4 rounded-2xl bg-gradient-to-br ${action.color} 
                text-white font-bold text-sm flex items-center justify-center gap-2
                hover:shadow-xl hover:scale-[1.02] transition-all duration-200
                animate-fade-in-up
              `}
              style={{ animationDelay: `${i * 100 + 600}ms` }}
            >
              <action.icon size={18} />
              {action.label}
              <ChevronRight size={16} className="opacity-60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Admin Component with Auth
export default function Admin() {
  const { isAuthenticated, login, logout, isLoading, isLoggingOut } = useAuthProvider();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Delay for smooth transition
      const timer = setTimeout(() => setShowDashboard(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowDashboard(false);
    }
    return undefined;
  }, [isAuthenticated]);

  // Redirect if already authenticated
  if (isAuthenticated && !showDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, isLoggingOut }}>
        <LoginPage onLoginSuccess={() => setShowDashboard(true)} />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, isLoggingOut }}>
      <div className={`
        transition-all duration-500
        ${showDashboard ? 'opacity-100' : 'opacity-0'}
      `}>
        <Dashboard onLogout={logout} />
      </div>
    </AuthContext.Provider>
  );
}


