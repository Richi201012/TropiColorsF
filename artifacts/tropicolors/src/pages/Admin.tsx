import React, { useState } from "react";
import { Lock, TrendingUp, Package, Clock, CheckCircle, LayoutDashboard, ShoppingBag, FileText } from "lucide-react";

const ADMIN_PASSWORD = "tropicolors2024";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Contraseña incorrecta. Inténtalo de nuevo.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003F91] to-[#00A8B5] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#003F91]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={36} className="text-[#003F91]" />
          </div>
          <img
            src={`${import.meta.env.BASE_URL}logo-tropicolors.png`}
            alt="TropicColors"
            className="h-12 w-auto object-contain mx-auto mb-6"
          />
          <h1 className="text-2xl font-extrabold text-[#003F91] mb-1">Panel Administrativo</h1>
          <p className="text-muted-foreground text-sm mb-8">Ingresa la contraseña de administrador para continuar.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña..."
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none transition-all text-center text-sm"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#003F91] text-white rounded-xl font-bold hover:bg-[#002d6e] transition-colors shadow-lg text-sm"
            >
              Ingresar al Panel
            </button>
          </form>

          <a href="/" className="mt-6 inline-block text-xs text-muted-foreground hover:text-[#003F91] transition-colors">
            ← Volver al sitio
          </a>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "invoices">("overview");

  const stats = [
    { icon: TrendingUp, label: "Ingresos Totales", value: "$0.00 MXN", color: "text-[#003F91]", bg: "bg-[#003F91]/10" },
    { icon: ShoppingBag, label: "Pedidos Totales", value: "0", color: "text-[#00A8B5]", bg: "bg-[#00A8B5]/10" },
    { icon: Clock, label: "Pendientes", value: "0", color: "text-[#FFCD00]", bg: "bg-[#FFCD00]/20" },
    { icon: CheckCircle, label: "Entregados", value: "0", color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} alt="TropicColors" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-extrabold text-[#003F91]">Panel Administrativo</h1>
              <p className="text-xs text-muted-foreground">TropicColors · Colorantes para Alimentos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-muted-foreground hover:text-[#003F91] transition-colors">Ver sitio →</a>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-bold text-[#003F91] border border-[#003F91]/30 rounded-xl hover:bg-[#003F91]/5 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-border/50 shadow-sm mb-8 w-fit">
          {([
            { key: "overview", label: "Resumen", icon: LayoutDashboard },
            { key: "orders", label: "Pedidos", icon: Package },
            { key: "invoices", label: "Facturas", icon: FileText },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key ? "bg-[#003F91] text-white shadow" : "text-muted-foreground hover:text-[#003F91]"}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                <s.icon size={22} className={s.color} />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-8">
          {activeTab === "overview" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#003F91]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <LayoutDashboard size={36} className="text-[#003F91]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#003F91] mb-3">Panel listo para conectar</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                El panel administrativo está configurado y listo. Una vez que se conecte el backend, aquí aparecerán las estadísticas de ventas, pedidos recientes y gráficas de rendimiento.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {["Estadísticas de ventas", "Gestión de pedidos", "Generación de facturas"].map((f, i) => (
                  <div key={i} className="bg-slate-50 border border-border/50 rounded-xl px-4 py-3 text-xs font-semibold text-muted-foreground">
                    ✓ {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#00A8B5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={36} className="text-[#00A8B5]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#003F91] mb-3">Gestión de Pedidos</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Aquí podrás ver todos los pedidos, actualizar su estado (pendiente → pagado → enviado → entregado) y agregar números de rastreo.
              </p>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#FFCD00]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={36} className="text-[#003F91]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#003F91] mb-3">Facturas</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Aquí podrás crear, gestionar y enviar facturas a tus clientes en PDF directamente por correo electrónico.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
