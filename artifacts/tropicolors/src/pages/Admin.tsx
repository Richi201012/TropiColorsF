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
  Activity,
  Receipt,
  UserPlus,
  Search,
  BarChart3,
  X,
  MapPin,
  ClipboardList,
  Settings,
  Phone,
  Shield
} from "lucide-react";
import jsPDF from "jspdf";
import { Invoice } from "@/components/Invoice";
import type { InvoiceData } from "@/types/invoice";
import { useInvoicePDF } from "@/hooks/useInvoicePDF";
import type { User as FirebaseUser } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Auth Context for session management
interface AuthContextType {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  userProfile: {
    name: string;
    email: string;
    phone: string;
  };
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveUserProfile: (input: { name: string; email: string; phone: string }) => Promise<void>;
  changeUserPassword: (newPassword: string) => Promise<void>;
  isLoading: boolean;
  isLoggingOut: boolean;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const useAuthProvider = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setUserProfile({ name: "", email: "", phone: "" });
        setAuthReady(true);
        return;
      }

      const userRef = doc(db, "users", nextUser.uid);
      const userSnapshot = await getDoc(userRef);
      const firestoreData = userSnapshot.exists() ? userSnapshot.data() : {};

      setUserProfile({
        name: String(firestoreData?.name || nextUser.displayName || ""),
        email: String(firestoreData?.email || nextUser.email || ""),
        phone: String(firestoreData?.phone || ""),
      });
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error as { code?: string };
      if (authError.code === "auth/user-not-found" || authError.code === "auth/invalid-credential") {
        throw new Error("Usuario no encontrado.");
      }
      if (authError.code === "auth/wrong-password") {
        throw new Error("Contraseña incorrecta.");
      }
      if (authError.code === "auth/invalid-email") {
        throw new Error("Correo electrónico inválido.");
      }
      throw new Error("No se pudo iniciar sesión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoggingOut(true);

    try {
      await signOut(auth);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const saveUserProfile = async (input: { name: string; email: string; phone: string }) => {
    if (!auth.currentUser) {
      throw new Error("No hay una sesión activa.");
    }

    const currentUser = auth.currentUser;

    if (input.name !== (currentUser.displayName || "")) {
      await updateProfile(currentUser, { displayName: input.name });
    }

    if (input.email !== (currentUser.email || "")) {
      await updateEmail(currentUser, input.email);
    }

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        uid: currentUser.uid,
        name: input.name,
        email: input.email,
        phone: input.phone,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    setUserProfile(input);
  };

  const changeUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error("No hay una sesión activa.");
    }

    await updatePassword(auth.currentUser, newPassword);
  };

  return {
    isAuthenticated: Boolean(user),
    user,
    userProfile,
    login,
    logout,
    saveUserProfile,
    changeUserPassword,
    isLoading,
    isLoggingOut,
    authReady,
  };
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    if (password.trim().length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      onLoginSuccess();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
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
            © 2024 TropicColors. Todos los derechos reservados.
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

type DashboardView = "resumen" | "pedidos" | "facturas" | "clientes" | "estadisticas" | "configuracion";
type OrderStatus = "pendiente" | "pagado" | "enviado" | "entregado";
type ModalActivo = null | "detallePedido" | "crearFactura" | "verFactura" | "nuevoPedido" | "cliente";

type OrderProduct = {
  name: string;
  quantity: number;
  price: number;
};

type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  address: string;
  total: number;
  status: OrderStatus;
  items: OrderProduct[];
};

type AdminInvoice = {
  id: string;
  orderId: string;
  customer: string;
  total: number;
  status: "pagada" | "pendiente";
  items: OrderProduct[];
  createdAt: string;
};

type AdminClient = {
  id: string;
  name: string;
  email: string;
  orders: number;
};

function statusLabel(status: OrderStatus) {
  return {
    pendiente: "Pendiente",
    pagado: "Pagado",
    enviado: "Enviado",
    entregado: "Entregado",
  }[status];
}

function orderStatusClasses(status: OrderStatus) {
  return {
    pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    pagado: "bg-sky-50 text-sky-700 border-sky-200",
    enviado: "bg-blue-50 text-blue-700 border-blue-200",
    entregado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[status];
}

function invoiceStatusClasses(status: "pagada" | "pendiente") {
  return status === "pagada"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-amber-50 text-amber-700";
}

function ModalShell({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl shadow-slate-900/20 animate-fade-in-scale"
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/50 px-6 py-5">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-white text-slate-600 transition hover:bg-muted/30 hover:text-slate-950"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function SummaryView({
  onSelectView,
  orders,
}: {
  onSelectView: (view: DashboardView) => void;
  orders: AdminOrder[];
}) {
  const recentOrders = orders.slice(0, 3);

  const shortcuts = [
    { label: "Estadísticas de ventas", description: "Ventas por día y rendimiento", icon: TrendingUp, view: "estadisticas" as DashboardView, color: "text-primary", bg: "bg-primary/10" },
    { label: "Gestión de pedidos", description: "Revisar y actualizar estados", icon: Package, view: "pedidos" as DashboardView, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Análisis de clientes", description: "Segmentación y seguimiento", icon: Users, view: "clientes" as DashboardView, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <DashboardSection
      title="Resumen general"
      subtitle="Monitorea el estado del negocio y entra a cada módulo sin salir del dashboard."
    >
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Panel listo</p>
              <h3 className="mt-1 text-xl font-display font-bold">Operación centralizada</h3>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70">
            Desde aquí puedes revisar pedidos, facturas, clientes y métricas clave sin navegar a otras rutas.
            Todo se mantiene en la misma pantalla con cambios suaves de vista.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => onSelectView(shortcut.view)}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-lg"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${shortcut.bg} ${shortcut.color}`}>
                  <shortcut.icon size={18} />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{shortcut.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{shortcut.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-950">Pedidos recientes</h3>
              <p className="mt-1 text-sm text-muted-foreground">Últimas compras registradas.</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectView("pedidos")}
              className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Ver todos
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{order.customer}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{order.id}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-950">${order.total.toLocaleString("es-MX")}</span>
                </div>
                <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${orderStatusClasses(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}

function OrdersView({
  orders,
  onViewDetail,
  onStatusChange,
  onCreateOrder,
}: {
  orders: AdminOrder[];
  onViewDetail: (orderId: string) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onCreateOrder: () => void;
}) {
  return (
    <DashboardSection
      title="Pedidos"
      subtitle="Consulta pedidos, ajusta su estado y accede al detalle desde la misma vista."
      action={
        <button
          type="button"
          onClick={onCreateOrder}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Package size={16} />
          Nuevo pedido
        </button>
      }
    >
      <div className="overflow-hidden rounded-3xl border border-border/50">
        <div className="grid grid-cols-[1.15fr_1.2fr_0.8fr_0.95fr_0.7fr] gap-4 bg-slate-950 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
          <span>ID</span>
          <span>Cliente</span>
          <span>Total</span>
          <span>Estado</span>
          <span>Acción</span>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-[1.15fr_1.2fr_0.8fr_0.95fr_0.7fr] items-center gap-4 border-t border-border/40 bg-white px-5 py-4 text-sm transition-colors hover:bg-muted/20">
            <span className="font-semibold text-slate-950">{order.id}</span>
            <span className="text-slate-600">{order.customer}</span>
            <span className="font-semibold text-slate-950">${order.total.toLocaleString("es-MX")}</span>
            <select
              value={order.status}
              onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 ${orderStatusClasses(order.status)}`}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
            </select>
            <button
              type="button"
              onClick={() => onViewDetail(order.id)}
              className="inline-flex items-center justify-center rounded-xl border border-border/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
            >
              Ver detalle
            </button>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

function InvoicesView({
  invoices,
  onCreateInvoice,
  onPreviewInvoice,
  onDownloadInvoice,
}: {
  invoices: AdminInvoice[];
  onCreateInvoice: () => void;
  onPreviewInvoice: (invoiceId: string) => void;
  onDownloadInvoice: (invoiceId: string) => void;
}) {
  return (
    <DashboardSection
      title="Facturas"
      subtitle="Administra documentos fiscales y consulta su estado sin salir del panel."
      action={
        <button
          type="button"
          onClick={onCreateInvoice}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Receipt size={16} />
          Crear factura
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{invoice.id}</p>
                <h3 className="mt-2 text-lg font-display font-bold text-slate-950">{invoice.customer}</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${invoiceStatusClasses(invoice.status)}`}>
                {invoice.status === "pagada" ? "Pagada" : "Pendiente"}
              </span>
            </div>
            <p className="mt-4 text-3xl font-display font-bold text-slate-950">${invoice.total.toLocaleString("es-MX")}</p>
            <div className="mt-5 flex items-center justify-between">
              <button type="button" onClick={() => onPreviewInvoice(invoice.id)} className="text-sm font-semibold text-primary transition-colors hover:text-primary/80">
                Ver factura
              </button>
              <button type="button" onClick={() => onDownloadInvoice(invoice.id)} className="rounded-xl border border-border/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:bg-primary/5">
                Descargar PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

function ClientsView({
  clients,
  onAddClient,
}: {
  clients: AdminClient[];
  onAddClient: () => void;
}) {
  const [search, setSearch] = useState("");
  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardSection
      title="Clientes"
      subtitle="Busca clientes, revisa actividad y crea nuevos registros desde esta misma sección."
      action={
        <button
          type="button"
          onClick={onAddClient}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <UserPlus size={16} />
          Agregar cliente
        </button>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border/60 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar cliente por nombre o correo"
          className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filteredClients.map((client) => (
          <div key={client.id} className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{client.id}</p>
                <h3 className="mt-2 text-lg font-display font-bold text-slate-950">{client.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{client.email}</p>
              </div>
              <div className="rounded-2xl bg-purple-50 px-3 py-2 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple-700">Pedidos</p>
                <p className="mt-1 text-xl font-bold text-purple-700">{client.orders}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

function StatisticsView({ orders }: { orders: AdminOrder[] }) {
  const salesByDay = [
    { day: "Lun", value: 35 },
    { day: "Mar", value: 52 },
    { day: "Mié", value: 46 },
    { day: "Jue", value: 67 },
    { day: "Vie", value: 84 },
    { day: "Sáb", value: 58 },
    { day: "Dom", value: 41 },
  ];

  const orderStatus = [
    { label: "Pendiente", value: orders.filter((order) => order.status === "pendiente").length, tone: "bg-amber-400" },
    { label: "Pagado", value: orders.filter((order) => order.status === "pagado").length, tone: "bg-sky-500" },
    { label: "Enviado", value: orders.filter((order) => order.status === "enviado").length, tone: "bg-emerald-500" },
    { label: "Entregado", value: orders.filter((order) => order.status === "entregado").length, tone: "bg-violet-500" },
  ];

  const maxValue = Math.max(...salesByDay.map((entry) => entry.value));

  return (
    <DashboardSection
      title="Estadísticas"
      subtitle="Visualiza el rendimiento comercial con métricas rápidas y gráficas mock del negocio."
    >
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-slate-950">Ventas por día</h3>
              <p className="mt-1 text-sm text-muted-foreground">Simulación de comportamiento semanal.</p>
            </div>
          </div>
          <div className="mt-8 flex h-72 items-end gap-3">
            {salesByDay.map((entry) => (
              <div key={entry.day} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-60 w-full items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-primary to-secondary transition-all duration-300 hover:opacity-90"
                    style={{ height: `${(entry.value / maxValue) * 100}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">{entry.value}</p>
                  <p className="text-xs text-muted-foreground">{entry.day}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-display font-bold text-slate-950">Pedidos por estado</h3>
          <p className="mt-1 text-sm text-muted-foreground">Distribución actual del flujo operativo.</p>
          <div className="mt-6 space-y-4">
            {orderStatus.map((status) => {
              const percentage = Math.max(10, Math.min(100, status.value));
              return (
                <div key={status.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{status.label}</span>
                    <span className="text-muted-foreground">{status.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted/60">
                    <div className={`h-3 rounded-full ${status.tone}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}

function SettingsView({ onLogout }: { onLogout: () => Promise<void> }) {
  const { userProfile, saveUserProfile, changeUserPassword, isLoggingOut } = useAuth();
  const [profileForm, setProfileForm] = useState(userProfile);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [profileMessage, setProfileMessage] = useState<string>("");
  const [securityMessage, setSecurityMessage] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setProfileForm(userProfile);
  }, [userProfile]);

  const handleSaveProfile = async () => {
    setProfileMessage("");

    if (!profileForm.name.trim()) {
      setProfileMessage("El nombre es obligatorio.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      setProfileMessage("Ingresa un correo electrónico válido.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await saveUserProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });
      setProfileMessage("Cambios guardados correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el perfil.";
      setProfileMessage(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setSecurityMessage("");

    if (passwordForm.password.length < 6) {
      setSecurityMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setSecurityMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changeUserPassword(passwordForm.password);
      setSecurityMessage("Contraseña actualizada correctamente.");
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cambiar la contraseña.";
      setSecurityMessage(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <DashboardSection
      title="Configuración"
      subtitle="Administra tus datos de acceso, seguridad y sesión desde el mismo dashboard."
      action={
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          <LogOut size={16} />
          {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
        </button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-slate-950">Datos del usuario</h3>
              <p className="mt-1 text-sm text-muted-foreground">Actualiza tu información base del panel.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <PremiumInput
              icon={User}
              type="text"
              placeholder="Nombre completo"
              value={profileForm.name}
              onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
              disabled={isSavingProfile}
            />
            <PremiumInput
              icon={Mail}
              type="email"
              placeholder="Correo electrónico"
              value={profileForm.email}
              onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
              disabled={isSavingProfile}
            />
            <PremiumInput
              icon={Phone}
              type="text"
              placeholder="Teléfono (opcional)"
              value={profileForm.phone}
              onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
              disabled={isSavingProfile}
            />
          </div>

          {profileMessage ? (
            <p className={`mt-4 text-sm ${profileMessage.includes("correctamente") ? "text-emerald-600" : "text-destructive"}`}>
              {profileMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
          >
            {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
            Guardar cambios
          </button>
        </div>

        <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-slate-950">Seguridad</h3>
              <p className="mt-1 text-sm text-muted-foreground">Cambia tu contraseña para reforzar el acceso.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <PremiumInput
              icon={Lock}
              type="password"
              placeholder="Nueva contraseña"
              value={passwordForm.password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
              disabled={isSavingPassword}
            />
            <PremiumInput
              icon={Lock}
              type="password"
              placeholder="Confirmar contraseña"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              disabled={isSavingPassword}
            />
          </div>

          {securityMessage ? (
            <p className={`mt-4 text-sm ${securityMessage.includes("correctamente") ? "text-emerald-600" : "text-destructive"}`}>
              {securityMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isSavingPassword}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            Guardar nueva contraseña
          </button>
        </div>
      </div>
    </DashboardSection>
  );
}

// Dashboard Component
function Dashboard({ onLogout }: { onLogout: () => Promise<void> }) {
  const [vistaActiva, setVistaActiva] = useState<DashboardView>("resumen");
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHeaderElevated, setIsHeaderElevated] = useState(false);
  const [pedidos, setPedidos] = useState<AdminOrder[]>([
    {
      id: "ORD-8F4A91C2",
      customer: "María López",
      email: "maria@cliente.com",
      address: "Av. Reforma 120, Col. Juárez, Cuauhtémoc, CDMX",
      total: 1250,
      status: "pagado",
      items: [
        { name: "Colorante Azul 125g", quantity: 2, price: 320 },
        { name: "Colorante Rojo 250g", quantity: 1, price: 610 },
      ],
    },
    {
      id: "ORD-7A21D1B4",
      customer: "Carlos Ruiz",
      email: "carlos@cliente.com",
      address: "Calle Hidalgo 45, Centro, Guadalajara, Jalisco",
      total: 890,
      status: "pendiente",
      items: [
        { name: "Colorante Verde 125g", quantity: 1, price: 290 },
        { name: "Colorante Amarillo 125g", quantity: 2, price: 300 },
      ],
    },
    {
      id: "ORD-4F2C98AB",
      customer: "Ana Torres",
      email: "ana@cliente.com",
      address: "Blvd. Díaz Ordaz 580, Monterrey, Nuevo León",
      total: 2430,
      status: "enviado",
      items: [
        { name: "Colorante Industrial Negro 1kg", quantity: 1, price: 1430 },
        { name: "Colorante Naranja 250g", quantity: 2, price: 500 },
      ],
    },
    {
      id: "ORD-93B1DD72",
      customer: "Sofía Jiménez",
      email: "sofia@cliente.com",
      address: "Av. Las Torres 890, Puebla, Puebla",
      total: 640,
      status: "entregado",
      items: [{ name: "Colorante Rosa 125g", quantity: 2, price: 320 }],
    },
  ]);
  const [facturas, setFacturas] = useState<AdminInvoice[]>([
    {
      id: "FAC-00124",
      orderId: "ORD-8F4A91C2",
      customer: "María López",
      total: 1250,
      status: "pagada",
      items: [
        { name: "Colorante Azul 125g", quantity: 2, price: 320 },
        { name: "Colorante Rojo 250g", quantity: 1, price: 610 },
      ],
      createdAt: "2026-03-23",
    },
    {
      id: "FAC-00125",
      orderId: "ORD-7A21D1B4",
      customer: "Carlos Ruiz",
      total: 890,
      status: "pendiente",
      items: [
        { name: "Colorante Verde 125g", quantity: 1, price: 290 },
        { name: "Colorante Amarillo 125g", quantity: 2, price: 300 },
      ],
      createdAt: "2026-03-23",
    },
  ]);
  const [clientes, setClientes] = useState<AdminClient[]>([
    { id: "CL-001", name: "María López", email: "maria@cliente.com", orders: 12 },
    { id: "CL-002", name: "Carlos Ruiz", email: "carlos@cliente.com", orders: 5 },
    { id: "CL-003", name: "Ana Torres", email: "ana@cliente.com", orders: 8 },
    { id: "CL-004", name: "Sofía Jiménez", email: "sofia@cliente.com", orders: 3 },
  ]);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState("");
  const [newOrderForm, setNewOrderForm] = useState({
    customer: "",
    email: "",
    address: "",
    products: "",
    total: "",
  });
  const [newClientForm, setNewClientForm] = useState({ name: "", email: "" });

  const stats = [
    { icon: DollarSign, label: "Ingresos Totales", value: `$${pedidos.reduce((sum, order) => sum + order.total, 0).toLocaleString("es-MX")}`, trend: { value: 12.5, isPositive: true }, color: "text-primary", bgColor: "bg-primary/10" },
    { icon: ShoppingBag, label: "Pedidos Totales", value: String(pedidos.length), trend: { value: 8.2, isPositive: true }, color: "text-secondary", bgColor: "bg-secondary/10" },
    { icon: Clock, label: "Pendientes", value: String(pedidos.filter((order) => order.status === "pendiente").length), trend: { value: 3.1, isPositive: false }, color: "text-amber-600", bgColor: "bg-amber-50" },
    { icon: Users, label: "Clientes Nuevos", value: String(clientes.length), trend: { value: 15.3, isPositive: true }, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const selectedOrder = pedidos.find((order) => order.id === selectedOrderId) ?? null;
  const selectedInvoice = facturas.find((invoice) => invoice.id === selectedInvoiceId) ?? null;
  const selectedInvoiceOrder = pedidos.find((order) => order.id === selectedInvoiceOrderId) ?? null;

  const handleViewChange = (view: DashboardView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setVistaActiva(view);
      setIsTransitioning(false);
    }, 150);
  };

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalActivo("detallePedido");
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setPedidos((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  const openCreateInvoiceModal = () => {
    setSelectedInvoiceOrderId(pedidos[0]?.id ?? "");
    setModalActivo("crearFactura");
    setVistaActiva("facturas");
  };

  const generateInvoice = () => {
    if (!selectedInvoiceOrder) return;

    const nextInvoice: AdminInvoice = {
      id: `FAC-${String(facturas.length + 124).padStart(5, "0")}`,
      orderId: selectedInvoiceOrder.id,
      customer: selectedInvoiceOrder.customer,
      total: selectedInvoiceOrder.total,
      status: "pendiente",
      items: selectedInvoiceOrder.items,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setFacturas((current) => [nextInvoice, ...current]);
    setSelectedInvoiceId(nextInvoice.id);
    setModalActivo("verFactura");
  };

  // Hook para generar PDF de facturas
  const { downloadPDF: generateInvoicePDF } = useInvoicePDF();

  // Datos de la empresa centralizados
  const empresa = {
    nombre: 'Tropicolors',
    direccion: 'Ecatepec, Edo. Mex.',
    telefono: '+52 55 5114 6856',
    email: 'm_tropicolors1@hotmail.com',
    rfc: 'TCO20240315ABC',
  };

  const downloadInvoicePdf = async (invoiceId: string) => {
    const invoice = facturas.find((entry) => entry.id === invoiceId);
    if (!invoice) return;

    // El PDF se genera capturando el DOM visible - no necesita datos aquí
    // Solo pasamos el nombre del archivo
    try {
      await generateInvoicePDF({
        invoiceNumber: invoice.id,
        invoiceNumberFormatted: invoice.id,
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Intenta de nuevo.');
    }
  };

  const createOrderFromModal = () => {
    if (!newOrderForm.customer.trim() || !newOrderForm.products.trim() || !newOrderForm.total.trim()) return;

    const total = Number(newOrderForm.total);
    if (Number.isNaN(total)) return;

    const productNames = newOrderForm.products.split(",").map((item) => item.trim()).filter(Boolean);
    const averagePrice = Math.round(total / Math.max(1, productNames.length));

    const nextOrder: AdminOrder = {
      id: `ORD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      customer: newOrderForm.customer.trim(),
      email: newOrderForm.email.trim() || "sin-correo@cliente.com",
      address: newOrderForm.address.trim() || "Dirección pendiente de captura",
      total,
      status: "pendiente",
      items: productNames.map((name) => ({ name, quantity: 1, price: averagePrice })),
    };

    setPedidos((current) => [nextOrder, ...current]);
    setNewOrderForm({ customer: "", email: "", address: "", products: "", total: "" });
    setVistaActiva("pedidos");
    setModalActivo(null);
  };

  const createClientFromModal = () => {
    if (!newClientForm.name.trim() || !newClientForm.email.trim()) return;

    const nextClient: AdminClient = {
      id: `CL-${String(clientes.length + 1).padStart(3, "0")}`,
      name: newClientForm.name.trim(),
      email: newClientForm.email.trim(),
      orders: 0,
    };

    setClientes((current) => [nextClient, ...current]);
    setNewClientForm({ name: "", email: "" });
    setVistaActiva("clientes");
    setModalActivo(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    if (modalActivo) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
    } else {
      const lockedScrollY = body.style.top ? Math.abs(parseInt(body.style.top, 10)) : 0;
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      if (lockedScrollY) {
        window.scrollTo(0, lockedScrollY);
      }
    }

    return () => {
      const lockedScrollY = body.style.top ? Math.abs(parseInt(body.style.top, 10)) : 0;
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      if (lockedScrollY) {
        window.scrollTo(0, lockedScrollY);
      }
    };
  }, [modalActivo]);

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
            { key: "resumen", label: "Resumen", icon: LayoutDashboard },
            { key: "pedidos", label: "Pedidos", icon: Package },
            { key: "facturas", label: "Facturas", icon: FileText },
            { key: "configuracion", label: "Configuración", icon: Settings },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleViewChange(tab.key)}
              className={`
                relative isolate flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300
                ${vistaActiva === tab.key 
                  ? 'bg-slate-950 text-white shadow-sm hover:bg-slate-900' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={16} />
                {tab.label}
              </span>
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
            {vistaActiva === "resumen" && <SummaryView onSelectView={handleViewChange} orders={pedidos} />}
            {vistaActiva === "pedidos" && (
              <OrdersView
                orders={pedidos}
                onViewDetail={openOrderDetail}
                onStatusChange={updateOrderStatus}
                onCreateOrder={() => {
                  setVistaActiva("pedidos");
                  setModalActivo("nuevoPedido");
                }}
              />
            )}
            {vistaActiva === "facturas" && (
              <InvoicesView
                invoices={facturas}
                onCreateInvoice={openCreateInvoiceModal}
                onPreviewInvoice={(invoiceId) => {
                  setSelectedInvoiceId(invoiceId);
                  setModalActivo("verFactura");
                }}
                onDownloadInvoice={(invoiceId) => {
                  // Abrir modal primero para renderizar el componente Invoice
                  setSelectedInvoiceId(invoiceId);
                  setModalActivo("verFactura");
                }}
              />
            )}
            {vistaActiva === "clientes" && (
              <ClientsView
                clients={clientes}
                onAddClient={() => {
                  setVistaActiva("clientes");
                  setModalActivo("cliente");
                }}
              />
            )}
            {vistaActiva === "estadisticas" && <StatisticsView orders={pedidos} />}
            {vistaActiva === "configuracion" && <SettingsView onLogout={handleLogout} />}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Package, label: "Nuevo Pedido", color: "from-blue-500 to-blue-600", view: "pedidos" as DashboardView },
            { icon: FileText, label: "Crear Factura", color: "from-amber-500 to-amber-600", view: "facturas" as DashboardView },
            { icon: Users, label: "Agregar Cliente", color: "from-purple-500 to-purple-600", view: "clientes" as DashboardView },
          ].map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (action.view === "pedidos") {
                  setVistaActiva("pedidos");
                  setModalActivo("nuevoPedido");
                  return;
                }
                if (action.view === "facturas") {
                  openCreateInvoiceModal();
                  return;
                }
                if (action.view === "clientes") {
                  setVistaActiva("clientes");
                  setModalActivo("cliente");
                  return;
                }
                handleViewChange(action.view);
              }}
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

      <ModalShell
        open={modalActivo === "detallePedido" && Boolean(selectedOrder)}
        title="Detalle del pedido"
        subtitle="Consulta la información completa y ajusta el estado si es necesario."
        onClose={() => setModalActivo(null)}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">ID del pedido</p>
                <p className="mt-2 text-lg font-display font-bold text-slate-950">{selectedOrder.id}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Estado actual</p>
                <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${orderStatusClasses(selectedOrder.status)}`}>
                  {statusLabel(selectedOrder.status)}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950">
                  <User size={16} />
                  <p className="font-semibold">{selectedOrder.customer}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{selectedOrder.email}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950">
                  <MapPin size={16} />
                  <p className="font-semibold">Dirección completa</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selectedOrder.address}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-950">
                <ClipboardList size={16} />
                <p className="font-semibold">Productos</p>
              </div>
              <div className="mt-4 space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-950">${item.price.toLocaleString("es-MX")}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-display font-bold text-slate-950">${selectedOrder.total.toLocaleString("es-MX")}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={selectedOrder.status}
                  onChange={(event) => updateOrderStatus(selectedOrder.id, event.target.value as OrderStatus)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 ${orderStatusClasses(selectedOrder.status)}`}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                </select>
                <button
                  type="button"
                  onClick={() => setModalActivo(null)}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Actualizar status
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalShell>

      <ModalShell
        open={modalActivo === "crearFactura"}
        title="Crear factura"
        subtitle="Selecciona un pedido existente y genera una factura dentro del mismo panel."
        onClose={() => setModalActivo(null)}
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Pedido</label>
            <select
              value={selectedInvoiceOrderId}
              onChange={(event) => setSelectedInvoiceOrderId(event.target.value)}
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              {pedidos.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} · {order.customer}
                </option>
              ))}
            </select>
          </div>

          {selectedInvoiceOrder && (
            <div className="rounded-3xl border border-border/50 bg-muted/20 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Cliente</p>
                  <p className="mt-2 text-lg font-display font-bold text-slate-950">{selectedInvoiceOrder.customer}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Total</p>
                  <p className="mt-2 text-lg font-display font-bold text-slate-950">${selectedInvoiceOrder.total.toLocaleString("es-MX")}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {selectedInvoiceOrder.items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-2xl border border-border/40 bg-white px-4 py-3">
                    <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                    <span className="text-sm text-slate-600">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={generateInvoice}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Generar factura
            </button>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={modalActivo === "verFactura" && Boolean(selectedInvoice)}
        title="Vista previa de factura"
        subtitle="Revisa la factura generada y descarga el PDF cuando lo necesites."
        onClose={() => setModalActivo(null)}
      >
        {selectedInvoice && (
          <div className="max-h-[80vh] overflow-y-auto">
            <Invoice 
              data={{
                invoiceNumber: selectedInvoice.id,
                invoiceNumberFormatted: selectedInvoice.id,
                issueDate: selectedInvoice.createdAt,
                paymentMethod: 'transferencia',
                status: selectedInvoice.status === 'pagada' ? 'paid' : 'pending',
                company: {
                  name: empresa.nombre,
                  address: empresa.direccion,
                  phone: empresa.telefono,
                  email: empresa.email,
                  rfc: empresa.rfc,
                },
                customer: {
                  name: selectedInvoice.customer,
                  email: '',
                },
                items: selectedInvoice.items.map((item, index) => ({
                  id: `item-${index}`,
                  name: item.name,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  subtotal: item.price * item.quantity,
                })),
                subtotal: selectedInvoice.total / 1.16,
                taxRate: 0.16,
                taxAmount: selectedInvoice.total - (selectedInvoice.total / 1.16),
                total: selectedInvoice.total,
                orderId: selectedInvoice.orderId,
              }}
              showActions={true}
              onDownloadPDF={undefined}
            />
          </div>
        )}
      </ModalShell>

      <ModalShell
        open={modalActivo === "nuevoPedido"}
        title="Nuevo pedido"
        subtitle="Crea un pedido rápido y agrégalo a la lista de pedidos del panel."
        onClose={() => setModalActivo(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Cliente</label>
            <input
              value={newOrderForm.customer}
              onChange={(event) => setNewOrderForm((current) => ({ ...current, customer: event.target.value }))}
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Nombre del cliente"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Correo</label>
            <input
              value={newOrderForm.email}
              onChange={(event) => setNewOrderForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="correo@cliente.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-900">Dirección</label>
            <input
              value={newOrderForm.address}
              onChange={(event) => setNewOrderForm((current) => ({ ...current, address: event.target.value }))}
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Dirección completa"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-900">Productos</label>
            <textarea
              value={newOrderForm.products}
              onChange={(event) => setNewOrderForm((current) => ({ ...current, products: event.target.value }))}
              className="min-h-[110px] w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Escribe los productos separados por coma"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Total</label>
            <input
              value={newOrderForm.total}
              onChange={(event) => setNewOrderForm((current) => ({ ...current, total: event.target.value }))}
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="0"
              inputMode="numeric"
            />
          </div>
          <div className="flex items-end justify-end sm:col-span-1">
            <button
              type="button"
              onClick={createOrderFromModal}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              Guardar pedido
            </button>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={modalActivo === "cliente"}
        title="Agregar cliente"
        subtitle="Captura un nuevo cliente y agrégalo inmediatamente al panel."
        onClose={() => setModalActivo(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Nombre</label>
            <input
              value={newClientForm.name}
              onChange={(event) => setNewClientForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Correo</label>
            <input
              value={newClientForm.email}
              onChange={(event) => setNewClientForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="correo@cliente.com"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={createClientFromModal}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Guardar cliente
            </button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}

// Main Admin Component with Auth
export default function Admin() {
  const authState = useAuthProvider();
  const { isAuthenticated, login, logout, isLoading, isLoggingOut, authReady } = authState;
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

  if (!authReady || (isAuthenticated && !showDashboard)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">{authReady ? "Cargando dashboard..." : "Verificando sesión..."}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthContext.Provider value={authState}>
        <LoginPage onLoginSuccess={() => setShowDashboard(true)} />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authState}>
      <div className={`
        transition-all duration-500
        ${showDashboard ? 'opacity-100' : 'opacity-0'}
      `}>
        <Dashboard onLogout={logout} />
      </div>
    </AuthContext.Provider>
  );
}


