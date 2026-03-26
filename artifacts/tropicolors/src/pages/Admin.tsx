import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  useCallback,
} from "react";
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
  Shield,
  ArrowLeft,
  Bell,
  Download,
  Filter,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  useOrders,
  type OrderStatus,
  type AdminOrder,
} from "@/hooks/useOrders";
import {
  useClientesFromOrders,
  filtrarClientes,
} from "@/hooks/useClientesFromOrders";
import { useFacturasFromOrders } from "@/hooks/useFacturasFromOrders";
import { updateOrderStatus as updateOrderStatusDB } from "@/services/order-service";
import { enviarCorreoEstadoPedido } from "@/lib/email-service";
import {
  createNotification,
  markAllNotificationsAsRead,
} from "@/services/notification-service";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/NotificationItem";
import { NotificationBell } from "@/components/NotificationBell";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { toast } from "@/hooks/use-toast";

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
  saveUserProfile: (input: {
    name: string;
    email: string;
    phone: string;
  }) => Promise<void>;
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
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
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
      if (
        authError.code === "auth/user-not-found" ||
        authError.code === "auth/invalid-credential"
      ) {
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

  const saveUserProfile = async (input: {
    name: string;
    email: string;
    phone: string;
  }) => {
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
  disabled,
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
      <div
        className={`relative transition-all duration-200 ${isFocused ? "transform -translate-y-0.5" : ""}`}
      >
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? "text-primary" : "text-muted-foreground"}`}
        >
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
            ${
              error
                ? "border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                : isFocused
                  ? "border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  : "border-border/60 focus:border-primary/30"
            }
            ${disabled ? "bg-muted/30 cursor-not-allowed" : "bg-white"}
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
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: (e?: React.FormEvent) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  type?: "button" | "submit" | "reset";
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
    `,
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
      ) : (
        children
      )}
    </button>
  );
}

// Particle Component for background effect
function Particle({
  size,
  color,
  position,
  delay,
  duration,
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
      style={
        {
          width: size,
          height: size,
          left: position.x,
          top: position.y,
          backgroundColor: color,
          "--tx": `${tx}px`,
          "--ty": `${ty}px`,
          "--duration": `${duration}s`,
          "--delay": `${delay}s`,
        } as React.CSSProperties
      }
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
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión.",
      );
    }
    setIsLoading(false);
  };

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    color: ["#003F91", "#00A8B5", "#FFCD00", "#FFFFFF"][
      Math.floor(Math.random() * 4)
    ],
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
      <div
        className={`
        relative min-h-screen flex items-center justify-center p-4
        transition-all duration-700
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      >
        <div className="w-full max-w-md">
          {/* Logo Section with Glow */}
          <div className="text-center mb-8">
            {/* Glow effect behind logo */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 scale-125 bg-gradient-to-r from-primary via-secondary to-primary blur-2xl opacity-55 animate-glow-pulse rounded-3xl" />

              {/* Logo container */}
              <div
                className="relative animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
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
              style={{ animationDelay: "0.2s" }}
            >
              Panel de Administración
            </h1>
            <p
              className="text-white/50 text-sm font-medium animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
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
            style={{ animationDelay: "0.3s" }}
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
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.35s" }}
                >
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

                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
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
                    <p className="text-xs text-destructive font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <PremiumButton
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  type="submit"
                >
                  {isLoading ? "Iniciando..." : "Iniciar sesión"}
                  {!isLoading && <ArrowRight size={18} />}
                </PremiumButton>
              </form>

              <div
                className="mt-6 text-center animate-fade-in-up"
                style={{ animationDelay: "0.5s" }}
              >
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
          <p
            className="text-center text-white/30 text-xs mt-8 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
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
  delay,
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
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}
        >
          <Icon size={20} className={color} strokeWidth={1.5} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? "text-green-600" : "text-red-500"}`}
          >
            {trend.isPositive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingUp size={12} className="rotate-180" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground mb-0.5">
        {value}
      </p>
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
  delay,
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
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <div className="relative inline-flex mb-6">
        <div
          className={`w-24 h-24 ${bgColor} rounded-3xl flex items-center justify-center`}
        >
          <Icon size={40} className={color} strokeWidth={1.5} />
        </div>
        <div
          className={`absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white`}
        />
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

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-5 gap-4 bg-slate-950 px-5 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 bg-white/20 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-4 border-t border-border/40 px-5 py-4"
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="h-4 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-border/50 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-5 bg-slate-100 rounded w-40" />
        </div>
        <div className="h-6 bg-slate-100 rounded-full w-20" />
      </div>
      <div className="mt-4 h-8 bg-slate-100 rounded w-32" />
    </div>
  );
}

type DashboardView =
  | "resumen"
  | "pedidos"
  | "facturas"
  | "clientes"
  | "estadisticas"
  | "configuracion"
  | "notificaciones";
type ModalActivo =
  | null
  | "detallePedido"
  | "crearFactura"
  | "verFactura"
  | "nuevoPedido"
  | "cliente";

type OrderProduct = {
  name: string;
  quantity: number;
  price: number;
};

type AdminInvoice = {
  id: string;
  orderId: string;
  customer:
    | string
    | { name?: string; email?: string; phone?: string; address?: string };
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

function formatDateShort(dateString?: string): string {
  if (!dateString) return "Sin fecha";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
}

function formatDateOnly(dateString?: string): string {
  if (!dateString) return "Sin fecha";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimeOnly(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function exportOrdersToCSV(orders: AdminOrder[]) {
  const headers = [
    "ID",
    "Cliente",
    "Email",
    "Teléfono",
    "Dirección",
    "Total",
    "Estado",
    "Método de Pago",
    "Fecha",
    "Productos",
  ];

  const rows = orders.map((order) => [
    order.id,
    order.customer,
    order.email,
    order.phone || "",
    order.address,
    order.total,
    order.status,
    order.paymentMethod || "N/A",
    formatDateShort(order.createdAt),
    order.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pedidos_tropicolors_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
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
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl shadow-slate-900/20 animate-fade-in-scale"
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/50 px-6 py-5">
          <div>
            <h3 className="text-xl font-display font-bold text-slate-950">
              {title}
            </h3>
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
          <h2 className="text-2xl font-display font-bold text-slate-950">
            {title}
          </h2>
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
  clientes,
}: {
  onSelectView: (view: DashboardView) => void;
  orders: AdminOrder[];
  clientes: AdminClient[];
}) {
  const recentOrders = orders.slice(0, 5);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pendiente").length;
  const paidCount = orders.filter((o) => o.status === "pagado").length;
  const shippedCount = orders.filter((o) => o.status === "enviado").length;
  const deliveredCount = orders.filter((o) => o.status === "entregado").length;

  const orderStatusData = [
    { name: "Pendiente", value: pendingCount, color: "#f59e0b" },
    { name: "Pagado", value: paidCount, color: "#0ea5e9" },
    { name: "Enviado", value: shippedCount, color: "#3b82f6" },
    { name: "Entregado", value: deliveredCount, color: "#10b981" },
  ].filter((item) => item.value > 0);

  const salesByDay = (() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const totals = days.map((day) => ({ day, ventas: 0, pedidos: 0 }));
    orders.forEach((order) => {
      const ts = (order as any).createdAt;
      if (!ts) return;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return;
      const idx = d.getDay();
      totals[idx].ventas += order.total;
      totals[idx].pedidos += 1;
    });
    return totals;
  })();

  const maxSale = Math.max(...salesByDay.map((d) => d.ventas), 1);

  return (
    <DashboardSection
      title="Resumen general"
      subtitle="Monitorea el estado del negocio con métricas y gráficas en tiempo real."
    >
      {/* Charts Row */}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr] mb-4">
        {/* Sales Bar Chart */}
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-slate-950">
                Ventas por día de la semana
              </h3>
              <p className="text-xs text-muted-foreground">
                Basado en pedidos registrados
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickFormatter={(v: number) => `$${v.toLocaleString("es-MX")}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString("es-MX")}`,
                  "Ventas",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              <Bar
                dataKey="ventas"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d1340" />
                  <stop offset="100%" stopColor="#1a237e" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Pie Chart */}
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <h3 className="text-base font-display font-bold text-slate-950 mb-1">
            Pedidos por estado
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Distribución actual del flujo operativo
          </p>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }: { name: string; value: number }) =>
                    `${name}: ${value}`
                  }
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "Pedidos"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
              No hay pedidos registrados aún
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-display font-bold text-slate-950">
              Pedidos recientes
            </h3>
            <p className="text-xs text-muted-foreground">
              Últimas compras registradas
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectView("pedidos")}
            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Ver todos
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border/50 bg-muted/20 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950 truncate">
                    {order.customer}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {order.id}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-950 shrink-0">
                  ${order.total.toLocaleString("es-MX")}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${orderStatusClasses(order.status)}`}
                >
                  {statusLabel(order.status)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDateShort(order.createdAt)}
                </span>
              </div>
            </div>
          ))}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardSection
      title="Pedidos"
      subtitle="Consulta pedidos, ajusta su estado y accede al detalle desde la misma vista."
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportOrdersToCSV(orders)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:text-primary hover:shadow-md"
            title="Exportar pedidos a CSV"
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={onCreateOrder}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Package size={16} />
            Nuevo pedido
          </button>
        </div>
      }
    >
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white px-4 py-2.5 shadow-sm flex-1">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, ID o correo..."
            className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-slate-900 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-border/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/50">
        <div className="grid grid-cols-[0.9fr_1.2fr_1fr_0.8fr_0.95fr_0.7fr] gap-4 bg-slate-950 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
          <span>ID</span>
          <span>Cliente</span>
          <span>Fecha</span>
          <span>Total</span>
          <span>Estado</span>
          <span>Acción</span>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            {searchTerm || statusFilter !== "todos"
              ? "No se encontraron pedidos con los filtros aplicados."
              : "No hay pedidos registrados."}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-[0.9fr_1.2fr_1fr_0.8fr_0.95fr_0.7fr] items-center gap-4 border-t border-border/40 bg-white px-5 py-4 text-sm transition-colors hover:bg-muted/20"
            >
              <span className="font-semibold text-slate-950 truncate">
                {order.id.slice(0, 10)}
              </span>
              <span className="text-slate-600 truncate">{order.customer}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateShort(order.createdAt)}
              </span>
              <span className="font-semibold text-slate-950">
                ${order.total.toLocaleString("es-MX")}
              </span>
              <select
                value={order.status}
                onChange={(event) =>
                  onStatusChange(order.id, event.target.value as OrderStatus)
                }
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
          ))
        )}
      </div>
      {filteredOrders.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Mostrando {filteredOrders.length} de {orders.length} pedidos
        </p>
      )}
    </DashboardSection>
  );
}

function InvoicesView({
  invoices,
  onCreateInvoice,
  onPreviewInvoice,
  onDownloadInvoice,
}: {
  invoices: InvoiceData[];
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
          <div
            key={invoice.invoiceNumber}
            className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {invoice.invoiceNumber}
                </p>
                <h3 className="mt-2 text-lg font-display font-bold text-slate-950">
                  {typeof invoice.customer === "object"
                    ? invoice.customer?.name
                    : invoice.customer || "Cliente sin nombre"}
                </h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${invoiceStatusClasses(invoice.status === "paid" ? "pagada" : "pendiente")}`}
              >
                {invoice.status === "paid" ? "Pagada" : "Pendiente"}
              </span>
            </div>
            <p className="mt-4 text-3xl font-display font-bold text-slate-950">
              ${Number(invoice.total || 0).toLocaleString("es-MX")}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onPreviewInvoice(invoice.invoiceNumber)}
                className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Ver factura
              </button>
              <button
                type="button"
                onClick={() => onDownloadInvoice(invoice.invoiceNumber)}
                className="rounded-xl border border-border/60 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:bg-primary/5"
              >
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
    `${client.name} ${client.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
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
          <div
            key={client.id}
            className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {client.id}
                </p>
                <h3 className="mt-2 text-lg font-display font-bold text-slate-950">
                  {client.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{client.email}</p>
              </div>
              <div className="rounded-2xl bg-purple-50 px-3 py-2 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple-700">
                  Pedidos
                </p>
                <p className="mt-1 text-xl font-bold text-purple-700">
                  {client.orders}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}

function StatisticsView({
  orders,
  onBack,
}: {
  orders: AdminOrder[];
  onBack: () => void;
}) {
  const salesByDay = (() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const totals = days.map((day) => ({ day, ventas: 0, pedidos: 0 }));
    orders.forEach((order) => {
      const ts = (order as any).createdAt;
      if (!ts) return;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return;
      const idx = d.getDay();
      totals[idx].ventas += order.total;
      totals[idx].pedidos += 1;
    });
    return totals;
  })();

  const orderStatusData = [
    {
      name: "Pendiente",
      value: orders.filter((o) => o.status === "pendiente").length,
      color: "#f59e0b",
    },
    {
      name: "Pagado",
      value: orders.filter((o) => o.status === "pagado").length,
      color: "#0ea5e9",
    },
    {
      name: "Enviado",
      value: orders.filter((o) => o.status === "enviado").length,
      color: "#3b82f6",
    },
    {
      name: "Entregado",
      value: orders.filter((o) => o.status === "entregado").length,
      color: "#10b981",
    },
  ].filter((item) => item.value > 0);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <DashboardSection
      title="Estadísticas"
      subtitle="Visualiza el rendimiento comercial con métricas y gráficas del negocio."
      action={
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
        >
          <ArrowLeft size={16} />
          Volver al resumen
        </button>
      }
    >
      {/* Summary Metrics */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Ingresos totales
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-950">
            ${totalRevenue.toLocaleString("es-MX")}
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Pedidos totales
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-950">
            {orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Ticket promedio
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-950">
            ${avgOrder.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        {/* Bar Chart */}
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-slate-950">
                Ventas por día
              </h3>
              <p className="text-sm text-muted-foreground">
                Monto acumulado por día de la semana
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickFormatter={(v: number) => `$${v.toLocaleString("es-MX")}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString("es-MX")}`,
                  "Ventas",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              <Bar
                dataKey="ventas"
                fill="url(#statsBarGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient
                  id="statsBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#0d1340" />
                  <stop offset="100%" stopColor="#1a237e" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for Order Status */}
        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-display font-bold text-slate-950">
            Pedidos por estado
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Distribución actual del flujo operativo
          </p>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }: { name: string; value: number }) =>
                    `${name}: ${value}`
                  }
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "Pedidos"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              No hay pedidos registrados aún
            </div>
          )}
        </div>
      </div>
    </DashboardSection>
  );
}

function SettingsView({ onLogout }: { onLogout: () => Promise<void> }) {
  const { userProfile, saveUserProfile, changeUserPassword, isLoggingOut } =
    useAuth();
  const [profileForm, setProfileForm] = useState(userProfile);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
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
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el perfil.";
      setProfileMessage(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setSecurityMessage("");

    if (passwordForm.password.length < 6) {
      setSecurityMessage(
        "La nueva contraseña debe tener al menos 6 caracteres.",
      );
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
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la contraseña.";
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
              <h3 className="text-lg font-display font-bold text-slate-950">
                Datos del usuario
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Actualiza tu información base del panel.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <PremiumInput
              icon={User}
              type="text"
              placeholder="Nombre completo"
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              disabled={isSavingProfile}
            />
            <PremiumInput
              icon={Mail}
              type="email"
              placeholder="Correo electrónico"
              value={profileForm.email}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              disabled={isSavingProfile}
            />
            <PremiumInput
              icon={Phone}
              type="text"
              placeholder="Teléfono (opcional)"
              value={profileForm.phone}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              disabled={isSavingProfile}
            />
          </div>

          {profileMessage ? (
            <p
              className={`mt-4 text-sm ${profileMessage.includes("correctamente") ? "text-emerald-600" : "text-destructive"}`}
            >
              {profileMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
          >
            {isSavingProfile ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Settings size={16} />
            )}
            Guardar cambios
          </button>
        </div>

        <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-slate-950">
                Seguridad
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cambia tu contraseña para reforzar el acceso.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <PremiumInput
              icon={Lock}
              type="password"
              placeholder="Nueva contraseña"
              value={passwordForm.password}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              disabled={isSavingPassword}
            />
            <PremiumInput
              icon={Lock}
              type="password"
              placeholder="Confirmar contraseña"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              disabled={isSavingPassword}
            />
          </div>

          {securityMessage ? (
            <p
              className={`mt-4 text-sm ${securityMessage.includes("correctamente") ? "text-emerald-600" : "text-destructive"}`}
            >
              {securityMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isSavingPassword}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSavingPassword ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Shield size={16} />
            )}
            Guardar nueva contraseña
          </button>
        </div>
      </div>
    </DashboardSection>
  );
}

function NotificationsView({
  notifications,
  onMarkAllRead,
  onViewOrder,
}: {
  notifications: ReturnType<typeof useNotifications>["notifications"];
  onMarkAllRead: () => Promise<void>;
  onViewOrder: (orderId: string) => void;
}) {
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [filterMode, setFilterMode] = useState<"todas" | "no_leidas">("todas");

  const handleMarkAll = async () => {
    setIsMarkingAll(true);
    try {
      await onMarkAllRead();
    } catch (error) {
      console.error("[NotificationsView] Error:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (n) => n.estado === "no_leida",
  ).length;

  const filteredNotifications =
    filterMode === "no_leidas"
      ? notifications.filter((n) => n.estado === "no_leida")
      : notifications;

  return (
    <DashboardSection
      title="Notificaciones"
      subtitle="Mantente al tanto de cada nuevo pedido que llega a tu tienda."
      action={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isMarkingAll}
            className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
          >
            {isMarkingAll ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Marcar todas como leídas
          </button>
        ) : undefined
      }
    >
      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilterMode("todas")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            filterMode === "todas"
              ? "bg-slate-950 text-white shadow-sm"
              : "bg-white text-muted-foreground border border-border/60 hover:text-foreground"
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterMode("no_leidas")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            filterMode === "no_leidas"
              ? "bg-slate-950 text-white shadow-sm"
              : "bg-white text-muted-foreground border border-border/60 hover:text-foreground"
          }`}
        >
          No leídas ({unreadCount})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sin notificaciones"
          description="Cuando lleguen nuevos pedidos, aparecerán aquí como notificaciones en tiempo real."
          features={["Tiempo real", "Filtrado", "Historial"]}
          color="text-primary"
          bgColor="bg-primary/10"
          delay={200}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onViewOrder={onViewOrder}
            />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

// Dashboard Component
// Inactivity timeout constants (in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const INACTIVITY_WARNING = 14 * 60 * 1000; // Show warning at 14 minutes

function Dashboard({ onLogout }: { onLogout: () => Promise<void> }) {
  const [vistaActiva, setVistaActiva] = useState<DashboardView>("resumen");
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHeaderElevated, setIsHeaderElevated] = useState(false);

  // Estado para modal de detalle de pedido desde notificaciones
  const [notificationOrderId, setNotificationOrderId] = useState<string | null>(
    null,
  );

  // Inactivity logout state
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearInactivityTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimers();
    setShowInactivityWarning(false);
    setRemainingSeconds(60);

    inactivityTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
      setRemainingSeconds(60);

      warningTimerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInactivityTimers();
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_WARNING);
  }, [clearInactivityTimers]);

  const handleContinueSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Activity event listeners for inactivity tracking
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const onActivity = () => {
      if (!showInactivityWarning) {
        resetInactivityTimer();
      }
    };

    events.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true }),
    );
    resetInactivityTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      clearInactivityTimers();
    };
  }, [resetInactivityTimer, clearInactivityTimers, showInactivityWarning]);

  // Hook para obtener pedidos desde Firestore en tiempo real (colección: orders)
  const {
    orders,
    setOrders,
    isLoading: isLoadingOrders,
    error: errorOrders,
  } = useOrders();

  // Hook para notificaciones en tiempo real
  const { notifications, unreadCount, newNotification, clearNewNotification } =
    useNotifications();

  // Toast y sonido cuando llega una nueva notificación
  useEffect(() => {
    if (!newNotification) return;

    toast({
      title: "Nuevo pedido recibido",
      description: `${newNotification.customerName} realizó un pedido de $${newNotification.total.toLocaleString("es-MX")}`,
    });

    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6djXdoYWNxg5acnJOGdGFbXnOFmZ6cloh1YVpdcoOYnZyVh3RgWl1ygpidnJWHdGBaXXKDl52blYh0YFpdcYKXnZuViHRgWl1xgpedm5WIdGBaXXGCl52blYh0YFpdcYKXnZuViA==",
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}

    clearNewNotification();
  }, [newNotification, clearNewNotification]);

  // Hook para obtener facturas generadas automáticamente desde pedidos
  const { facturas: facturasData, isLoading: loadingFacturas } =
    useFacturasFromOrders();
  const [facturas, setFacturas] = useState<InvoiceData[]>(facturasData);

  // Sincronizar cuando lleguen los datos del hook
  useEffect(() => {
    if (!loadingFacturas && facturasData.length > 0) {
      setFacturas(facturasData);
    }
  }, [facturasData, loadingFacturas]);
  // Hook para obtener clientes dinámicamente desde Firestore (agrupados por email desde orders)
  const { clientes: clientesRaw, isLoading: loadingClientes } =
    useClientesFromOrders();

  // Mapear ClienteAgrupado a AdminClient para compatibilidad con el componente
  const clientesDesdePedidos: AdminClient[] = clientesRaw.map((c) => ({
    id: c.id,
    name: c.nombre,
    email: c.email,
    orders: c.pedidos,
  }));

  const [clientes, setClientes] = useState<AdminClient[]>(clientesDesdePedidos);

  // Sincronizar cuando lleguen los datos del hook
  useEffect(() => {
    if (!loadingClientes && clientesRaw.length > 0) {
      setClientes(
        clientesRaw.map((c) => ({
          id: c.id,
          name: c.nombre,
          email: c.email,
          orders: c.pedidos,
        })),
      );
    }
  }, [clientesRaw, loadingClientes]);
  const [selectedInvoiceOrderId, setSelectedInvoiceOrderId] = useState("");
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    orderId: string;
    newStatus: OrderStatus;
  } | null>(null);
  const [shippingForm, setShippingForm] = useState({
    paqueteria: "",
    tipoEnvio: "",
    guia: "",
  });

  // Cerrar modales con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showStatusConfirm) {
          setShowStatusConfirm(false);
          setPendingStatusUpdate(null);
          setShippingForm({ paqueteria: "", tipoEnvio: "", guia: "" });
        } else if (modalActivo) {
          setModalActivo(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showStatusConfirm, modalActivo]);

  const [newOrderForm, setNewOrderForm] = useState({
    customer: "",
    email: "",
    phone: "",
    address: "",
    products: "",
    total: "",
    metodoPago: "efectivo", // Nuevo campo para método de pago
  });
  const [newClientForm, setNewClientForm] = useState({ name: "", email: "" });

  const stats = [
    {
      icon: DollarSign,
      label: "Ingresos Totales",
      value: `${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString("es-MX")}`,
      trend: { value: 12.5, isPositive: true },
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: ShoppingBag,
      label: "Pedidos Totales",
      value: String(orders.length),
      trend: { value: 8.2, isPositive: true },
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Clock,
      label: "Pendientes",
      value: String(
        orders.filter((order) => order.status === "pendiente").length,
      ),
      trend: { value: 3.1, isPositive: false },
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      icon: Users,
      label: "Clientes Nuevos",
      value: String(clientes.length),
      trend: { value: 15.3, isPositive: true },
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;
  // Buscar la factura seleccionada usando invoiceNumber como id
  const selectedInvoice =
    facturas.find((invoice) => invoice.invoiceNumber === selectedInvoiceId) ??
    null;
  const selectedInvoiceOrder =
    orders.find((order) => order.id === selectedInvoiceOrderId) ?? null;

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

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // Si el nuevo estado es "enviado", mostrar formulario de envío
    if (newStatus === "enviado") {
      setPendingStatusUpdate({ orderId, newStatus });
      setShippingForm({ paqueteria: "", tipoEnvio: "", guia: "" });
      setShowStatusConfirm(true);
    } else {
      // Para otros estados, mostrar confirmación simple
      setPendingStatusUpdate({ orderId, newStatus });
      setShowStatusConfirm(true);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;

    const { orderId, newStatus } = pendingStatusUpdate;
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Construir dirección completa
    const direccionCompleta = order.address
      ? `${order.address}${order.neighborhood ? `, ${order.neighborhood}` : ""}${order.municipality ? `, ${order.municipality}` : ""}${order.state ? `, ${order.state}` : ""}`
      : "Dirección no disponible";

    // Mapear el estado para el correo (primera letra mayúscula)
    const estadoMap: Record<OrderStatus, string> = {
      pendiente: "Pendiente",
      pagado: "Pagado",
      enviado: "Enviado",
      entregado: "Entregado",
    };

    // Preparar datos de envío si es necesario
    const shippingData =
      newStatus === "enviado"
        ? {
            paqueteria: shippingForm.paqueteria,
            tipoEnvio: shippingForm.tipoEnvio,
            guia: shippingForm.guia,
          }
        : undefined;

    // Actualizar en Firebase
    try {
      await updateOrderStatusDB(orderId, newStatus, shippingData);
      console.log("[Admin] Estado actualizado en Firebase:", newStatus);
    } catch (error) {
      console.error("[Admin] Error al actualizar estado en Firebase:", error);
    }

    // Actualizar estado local
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );

    // Enviar correo de estado (no bloquante)
    try {
      const customerName = order.customer;
      const customerEmail = order.email;

      await enviarCorreoEstadoPedido({
        nombre: customerName,
        email: customerEmail,
        estado: estadoMap[newStatus],
        productos: order.items.map((item) => ({
          nombre: item.name,
          cantidad: item.quantity,
          precio: item.price,
        })),
        total: order.total,
        direccion: direccionCompleta,
        paqueteria: shippingData?.paqueteria,
        tipoEnvio: shippingData?.tipoEnvio,
        guia: shippingData?.guia,
        numeroPedido: order.id,
      });
      console.log("[Admin] Correo de estado enviado:", newStatus);
    } catch (emailError) {
      console.error("[Admin] Error al enviar correo de estado:", emailError);
    }

    // Cerrar modales
    setShowStatusConfirm(false);
    setPendingStatusUpdate(null);
    setShippingForm({ paqueteria: "", tipoEnvio: "", guia: "" });
    setModalActivo(null);
  };

  const cancelStatusUpdate = () => {
    setShowStatusConfirm(false);
    setPendingStatusUpdate(null);
    setShippingForm({ paqueteria: "", tipoEnvio: "", guia: "" });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    // Esta función ahora solo llama a handleStatusChange
    handleStatusChange(orderId, status);
  };

  const openCreateInvoiceModal = () => {
    setSelectedInvoiceOrderId(orders[0]?.id ?? "");
    setModalActivo("crearFactura");
    setVistaActiva("facturas");
  };

  const generateInvoice = () => {
    if (!selectedInvoiceOrder) return;

    // Mapear correctamente los datos del pedido al formato InvoiceData
    const customerData = {
      name: selectedInvoiceOrder.customer,
      email: selectedInvoiceOrder.email,
      phone: selectedInvoiceOrder.phone,
      address: selectedInvoiceOrder.address,
    };

    const invoiceNumber = `FAC-${String(facturas.length + 124).padStart(5, "0")}`;
    const orderTotal = Number(selectedInvoiceOrder.total) || 0;

    // Calcular subtotal e IVA
    const subtotal = orderTotal / 1.16;
    const taxAmount = orderTotal - subtotal;

    // Mapear items con validación para evitar NaN
    const mappedItems = selectedInvoiceOrder.items.map((item, index) => {
      const unitPrice = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return {
        id: `item-${index}`,
        name: item.name || "Producto sin nombre",
        quantity: quantity,
        unitPrice: unitPrice,
        subtotal: unitPrice * quantity,
      };
    });

    const nextInvoice: InvoiceData = {
      invoiceNumber: invoiceNumber,
      invoiceNumberFormatted: invoiceNumber,
      issueDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "transferencia",
      status: "pending",
      company: {
        name: empresa.nombre,
        address: empresa.direccion,
        phone: empresa.telefono,
        email: empresa.email,
        rfc: empresa.rfc,
      },
      customer: {
        name:
          customerData.name ||
          selectedInvoiceOrder.customer ||
          "Cliente sin nombre",
        email: selectedInvoiceOrder.email || "",
        phone: selectedInvoiceOrder.phone || "",
        address: selectedInvoiceOrder.address || "",
      },
      items: mappedItems,
      subtotal: subtotal,
      taxRate: 0.16,
      taxAmount: taxAmount,
      total: orderTotal,
      orderId: selectedInvoiceOrder.id,
    };

    console.log(
      "[generateInvoice] 📄 Generando factura para pedido:",
      selectedInvoiceOrder.id,
    );
    console.log("[generateInvoice] 👤 Cliente:", nextInvoice.customer);
    console.log("[generateInvoice] 💰 Total:", nextInvoice.total);
    console.log("[generateInvoice] 📦 Items:", nextInvoice.items);

    setFacturas((current) => [nextInvoice, ...current]);
    setSelectedInvoiceId(nextInvoice.invoiceNumber);
    setModalActivo("verFactura");
  };

  // Hook para generar PDF de facturas
  const { downloadPDF } = useInvoicePDF();

  // Datos de la empresa centralizados
  const empresa = {
    nombre: "Tropicolors",
    direccion: "Ecatepec, Edo. Mex.",
    telefono: "+52 55 5114 6856",
    email: "m_tropicolors1@hotmail.com",
    rfc: "TCO20240315ABC",
  };

  const createOrderFromModal = async () => {
    if (
      !newOrderForm.customer.trim() ||
      !newOrderForm.products.trim() ||
      !newOrderForm.total.trim()
    )
      return;

    const total = Number(newOrderForm.total);
    if (Number.isNaN(total)) return;

    const productNames = newOrderForm.products
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const averagePrice = Math.round(total / Math.max(1, productNames.length));

    try {
      // Guardar el pedido en Firestore con el método de pago
      const orderData = {
        customerName: newOrderForm.customer.trim(),
        customerEmail: newOrderForm.email.trim() || "sin-correo@cliente.com",
        customerPhone: newOrderForm.phone?.trim() || "",
        customerAddress:
          newOrderForm.address.trim() || "Dirección pendiente de captura",
        total,
        status: "pendiente",
        metodoPago: newOrderForm.metodoPago || "efectivo",
        items: productNames.map((name) => ({
          name,
          quantity: 1,
          price: averagePrice,
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderDocRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Pedido guardado en Firestore:", orderData);

      // Crear notificación del pedido
      try {
        await createNotification({
          orderId: orderDocRef.id,
          customerName: newOrderForm.customer.trim(),
          total,
        });
      } catch (notifError) {
        console.error("Error al crear notificación:", notifError);
      }

      // También actualizar el estado local
      const nextOrder: AdminOrder = {
        id: orderDocRef.id,
        customer: newOrderForm.customer.trim(),
        email: newOrderForm.email.trim() || "sin-correo@cliente.com",
        address:
          newOrderForm.address.trim() || "Dirección pendiente de captura",
        total,
        status: "pendiente",
        items: productNames.map((name) => ({
          name,
          quantity: 1,
          price: averagePrice,
        })),
        phone: newOrderForm.phone?.trim() || "",
        paymentMethod: newOrderForm.metodoPago || "efectivo",
        createdAt: new Date().toISOString(),
      };

      setOrders((current) => [nextOrder, ...current]);
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      alert("Error al guardar el pedido. Intenta de nuevo.");
      return;
    }

    setNewOrderForm({
      customer: "",
      email: "",
      phone: "",
      address: "",
      products: "",
      total: "",
      metodoPago: "efectivo",
    });
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
      console.error("Logout error:", error);
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
      const lockedScrollY = body.style.top
        ? Math.abs(parseInt(body.style.top, 10))
        : 0;
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
      const lockedScrollY = body.style.top
        ? Math.abs(parseInt(body.style.top, 10))
        : 0;
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
                <h1 className="mt-1.5 text-lg font-display font-bold tracking-tight text-slate-950">
                  Panel Administrativo
                </h1>
                <p className="mt-0.5 max-w-xl text-xs text-muted-foreground">
                  Supervisa pedidos, facturación y operaciones desde una
                  interfaz clara y moderna.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:flex-none">
              <NotificationBell
                count={unreadCount}
                onClick={() => handleViewChange("notificaciones")}
              />
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
                  ${
                    isLoggingOut
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-300 bg-slate-950 text-white shadow-sm hover:-translate-y-0.5 hover:border-slate-950 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/15 active:translate-y-0"
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
                    <LogOut
                      size={14}
                      className="transition-transform duration-200 group-hover:-translate-x-0.5"
                    />
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
          {(
            [
              { key: "resumen", label: "Resumen", icon: LayoutDashboard },
              { key: "pedidos", label: "Pedidos", icon: Package },
              { key: "facturas", label: "Facturas", icon: FileText },
              { key: "notificaciones", label: "Notificaciones", icon: Bell },
              { key: "configuracion", label: "Configuración", icon: Settings },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleViewChange(tab.key)}
              className={`
                relative isolate flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300
                ${
                  vistaActiva === tab.key
                    ? "bg-slate-950 text-white shadow-sm hover:bg-slate-900"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
            <MetricCard key={i} {...stat} delay={i * 100 + 200} />
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div
            className={`
            transition-all duration-300
            ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}
          `}
          >
            {vistaActiva === "resumen" && (
              <SummaryView
                onSelectView={handleViewChange}
                orders={orders}
                clientes={clientes}
              />
            )}
            {vistaActiva === "pedidos" && (
              <OrdersView
                orders={orders}
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
            {vistaActiva === "estadisticas" && (
              <StatisticsView
                orders={orders}
                onBack={() => handleViewChange("resumen")}
              />
            )}
            {vistaActiva === "notificaciones" && (
              <NotificationsView
                notifications={notifications}
                onMarkAllRead={markAllNotificationsAsRead}
                onViewOrder={(orderId) => setNotificationOrderId(orderId)}
              />
            )}
            {vistaActiva === "configuracion" && (
              <SettingsView onLogout={handleLogout} />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: Package,
              label: "Nuevo Pedido",
              color: "from-blue-500 to-blue-600",
              view: "pedidos" as DashboardView,
            },
            {
              icon: FileText,
              label: "Crear Factura",
              color: "from-amber-500 to-amber-600",
              view: "facturas" as DashboardView,
            },
            {
              icon: Users,
              label: "Agregar Cliente",
              color: "from-purple-500 to-purple-600",
              view: "clientes" as DashboardView,
            },
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  ID del pedido
                </p>
                <p className="mt-2 text-lg font-display font-bold text-slate-950">
                  {selectedOrder.id.slice(0, 12)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Fecha
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {formatDateOnly(selectedOrder.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeOnly(selectedOrder.createdAt) || "Sin hora"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Estado actual
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${orderStatusClasses(selectedOrder.status)}`}
                >
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
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedOrder.email}
                </p>
                {selectedOrder.phone && (
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.phone}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950">
                  <MapPin size={16} />
                  <p className="font-semibold">Dirección completa</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {selectedOrder.address}
                </p>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-950">
                <CreditCard size={16} />
                <p className="font-semibold">Método de pago</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground capitalize">
                {selectedOrder.paymentMethod ||
                  selectedOrder.metodoPago ||
                  "No especificado"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-950">
                <ClipboardList size={16} />
                <p className="font-semibold">Productos</p>
              </div>
              <div className="mt-4 space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-border/40 bg-muted/20 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-950">
                      ${item.price.toLocaleString("es-MX")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial Timeline */}
            {selectedOrder.historial && selectedOrder.historial.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950 mb-4">
                  <Clock size={16} />
                  <p className="font-semibold">Historial de estados</p>
                </div>
                <div className="space-y-0">
                  {selectedOrder.historial.map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${
                            index === (selectedOrder.historial?.length || 0) - 1
                              ? "bg-primary ring-4 ring-primary/20"
                              : "bg-slate-300"
                          }`}
                        />
                        {index < (selectedOrder.historial?.length || 0) - 1 && (
                          <div className="w-0.5 h-8 bg-slate-200" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-slate-950 capitalize">
                          {statusLabel(entry.estado as OrderStatus) ||
                            entry.estado}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(entry.fecha)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-display font-bold text-slate-950">
                  ${selectedOrder.total.toLocaleString("es-MX")}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={selectedOrder.status}
                  onChange={(event) =>
                    updateOrderStatus(
                      selectedOrder.id,
                      event.target.value as OrderStatus,
                    )
                  }
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
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Pedido
            </label>
            <select
              value={selectedInvoiceOrderId}
              onChange={(event) =>
                setSelectedInvoiceOrderId(event.target.value)
              }
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              {orders.map((order) => (
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
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Cliente
                  </p>
                  <p className="mt-2 text-lg font-display font-bold text-slate-950">
                    {selectedInvoiceOrder.customer}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Total
                  </p>
                  <p className="mt-2 text-lg font-display font-bold text-slate-950">
                    ${selectedInvoiceOrder.total.toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {selectedInvoiceOrder.items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-border/40 bg-white px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {item.name}
                    </span>
                    <span className="text-sm text-slate-600">
                      x{item.quantity}
                    </span>
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
          <Invoice
            data={{
              invoiceNumber: selectedInvoice.invoiceNumber,
              invoiceNumberFormatted: selectedInvoice.invoiceNumberFormatted,
              issueDate: selectedInvoice.issueDate,
              paymentMethod: selectedInvoice.paymentMethod,
              status: selectedInvoice.status,
              company: selectedInvoice.company,
              customer: selectedInvoice.customer,
              // Mapear items con validación para evitar NaN
              items: selectedInvoice.items.map((item, index) => {
                const unitPrice = Number(item.unitPrice) || 0;
                const quantity = Number(item.quantity) || 1;
                return {
                  id: item.id || `item-${index}`,
                  name: item.name || "Producto sin nombre",
                  quantity: quantity,
                  unitPrice: unitPrice,
                  subtotal: item.subtotal || unitPrice * quantity,
                };
              }),
              subtotal: Number(selectedInvoice.subtotal) || 0,
              taxRate: Number(selectedInvoice.taxRate) || 0,
              taxAmount: Number(selectedInvoice.taxAmount) || 0,
              total: Number(selectedInvoice.total) || 0,
              orderId: selectedInvoice.orderId,
            }}
            showActions={true}
          />
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
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Cliente
            </label>
            <input
              value={newOrderForm.customer}
              onChange={(event) =>
                setNewOrderForm((current) => ({
                  ...current,
                  customer: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Nombre del cliente"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Correo
            </label>
            <input
              value={newOrderForm.email}
              onChange={(event) =>
                setNewOrderForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="correo@cliente.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Dirección
            </label>
            <input
              value={newOrderForm.address}
              onChange={(event) =>
                setNewOrderForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Dirección completa"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Productos
            </label>
            <textarea
              value={newOrderForm.products}
              onChange={(event) =>
                setNewOrderForm((current) => ({
                  ...current,
                  products: event.target.value,
                }))
              }
              className="min-h-[110px] w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Escribe los productos separados por coma"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Total
            </label>
            <input
              value={newOrderForm.total}
              onChange={(event) =>
                setNewOrderForm((current) => ({
                  ...current,
                  total: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="0"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Método de Pago
            </label>
            <select
              value={newOrderForm.metodoPago}
              onChange={(event) =>
                setNewOrderForm((current) => ({
                  ...current,
                  metodoPago: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="mercadopago">MercadoPago</option>
              <option value="oxxo">OXXO</option>
            </select>
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
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Nombre
            </label>
            <input
              value={newClientForm.name}
              onChange={(event) =>
                setNewClientForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Correo
            </label>
            <input
              value={newClientForm.email}
              onChange={(event) =>
                setNewClientForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
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

      {/* Modal de confirmación de cambio de estado */}
      <ModalShell
        open={showStatusConfirm}
        title="Confirmar cambio de estado"
        subtitle={
          pendingStatusUpdate?.newStatus === "enviado"
            ? "Ingresa los datos del envío para notificar al cliente"
            : "¿Estás seguro de que deseas cambiar el estado de este pedido?"
        }
        onClose={cancelStatusUpdate}
      >
        <div className="space-y-5">
          {pendingStatusUpdate?.newStatus === "enviado" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Paquetería
                </label>
                <select
                  value={shippingForm.paqueteria}
                  onChange={(e) =>
                    setShippingForm((f) => ({
                      ...f,
                      paqueteria: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">Selecciona una paquetería</option>
                  <option value="DHL">DHL</option>
                  <option value="FedEx">FedEx</option>
                  <option value="Estafeta">Estafeta</option>
                  <option value="UPS">UPS</option>
                  <option value="Correos de México">Correos de México</option>
                  <option value="Paquetería Local">Paquetería Local</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Tipo de envío
                </label>
                <select
                  value={shippingForm.tipoEnvio}
                  onChange={(e) =>
                    setShippingForm((f) => ({
                      ...f,
                      tipoEnvio: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">Selecciona tipo de envío</option>
                  <option value="Express">Express (1-2 días)</option>
                  <option value="Estándar">Estándar (3-5 días)</option>
                  <option value="Económico">Económico (5-10 días)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Número de guía
                </label>
                <input
                  value={shippingForm.guia}
                  onChange={(e) =>
                    setShippingForm((f) => ({ ...f, guia: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Ingresa el número de guía"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cancelStatusUpdate}
              className="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmStatusUpdate}
              disabled={
                pendingStatusUpdate?.newStatus === "enviado" &&
                (!shippingForm.paqueteria ||
                  !shippingForm.tipoEnvio ||
                  !shippingForm.guia)
              }
              className="rounded-2xl bg-[#0d1340] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a237e] disabled:opacity-50"
            >
              Confirmar y enviar correo
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Inactivity Warning Modal */}
      <ModalShell
        open={showInactivityWarning}
        title="Sesión por expirar"
        subtitle="Tu sesión se cerrará automáticamente por inactividad"
        onClose={handleContinueSession}
      >
        <div className="flex flex-col items-center gap-6 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <Clock size={40} className="text-amber-600" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-950">
              Tu sesión se cerrará en{" "}
              <span className="text-amber-600">{remainingSeconds}</span>{" "}
              segundos
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Has estado inactivo durante un tiempo. Haz clic en "Continuar"
              para mantener tu sesión activa.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleContinueSession}
              className="rounded-2xl bg-[#0d1340] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a237e]"
            >
              Continuar sesión
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Order Detail Modal from Notifications */}
      {notificationOrderId && (
        <OrderDetailModal
          orderId={notificationOrderId}
          onClose={() => setNotificationOrderId(null)}
        />
      )}
    </div>
  );
}

// Main Admin Component with Auth
export default function Admin() {
  const authState = useAuthProvider();
  const { isAuthenticated, login, logout, isLoading, isLoggingOut, authReady } =
    authState;
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
          <p className="text-muted-foreground text-sm">
            {authReady ? "Cargando dashboard..." : "Verificando sesión..."}
          </p>
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
      <div
        className={`
        transition-all duration-500
        ${showDashboard ? "opacity-100" : "opacity-0"}
      `}
      >
        <Dashboard onLogout={logout} />
      </div>
    </AuthContext.Provider>
  );
}
