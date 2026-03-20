import React, { useState } from "react";
import { useGetAdminStats, useUpdateOrderStatus, OrderStatus, UpdateOrderStatusRequestStatus } from "@workspace/api-client-react";
import { Lock, TrendingUp, Package, Clock, CheckCircle, Search, LayoutDashboard } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-border text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Acceso Administrador</h1>
          <p className="text-muted-foreground mb-8">Ingresa la contraseña para acceder al panel de control.</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === "tropicolors2024") setIsAuthenticated(true);
            else alert("Contraseña incorrecta");
          }}>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña..."
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all mb-4 text-center"
            />
            <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data: stats, isLoading, isError } = useGetAdminStats();
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const { toast } = useToast();

  const handleStatusChange = (orderId: string, newStatus: UpdateOrderStatusRequestStatus) => {
    updateStatus({ id: orderId, data: { status: newStatus } }, {
      onSuccess: () => toast({ title: "Estado actualizado" }),
      onError: () => toast({ title: "Error al actualizar", variant: "destructive" })
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 px-6 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Provide defensive fallback data if backend is not seeded/running properly
  const safeStats = stats || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    monthlySales: [
      { month: "Ene", revenue: 0, orders: 0 },
      { month: "Feb", revenue: 0, orders: 0 }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="text-primary" size={32} />
          <h1 className="text-3xl font-display font-bold text-foreground">Panel de Control</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Ingresos Totales" value={`$${safeStats.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-50" />
          <StatCard title="Pedidos Totales" value={safeStats.totalOrders} icon={Package} color="text-primary" bg="bg-primary/10" />
          <StatCard title="Pendientes" value={safeStats.pendingOrders} icon={Clock} color="text-accent" bg="bg-accent/20" />
          <StatCard title="Completados" value={safeStats.completedOrders} icon={CheckCircle} color="text-secondary" bg="bg-secondary/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-border">
            <h2 className="text-xl font-bold mb-6">Ventas Mensuales</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safeStats.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value}`, 'Ingresos']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#003F91" strokeWidth={4} dot={{r: 4, fill: '#003F91', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold">Pedidos Recientes</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              {safeStats.recentOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No hay pedidos recientes</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {safeStats.recentOrders.map((order) => (
                    <li key={order.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-foreground">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <span className="font-bold text-primary">${order.amount}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as UpdateOrderStatusRequestStatus)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer
                            ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                              order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                              'bg-blue-100 text-blue-700'}`}
                        >
                          {Object.values(OrderStatus).map(status => (
                            <option key={status} value={status}>{status.toUpperCase()}</option>
                          ))}
                        </select>
                        <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
