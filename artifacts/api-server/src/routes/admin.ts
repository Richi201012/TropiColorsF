import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, desc, sum } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const allOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

    const totalRevenue = allOrders
      .filter((o) => o.status === "paid" || o.status === "sent" || o.status === "delivered")
      .reduce((acc, o) => acc + o.amount / 100, 0);

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
    const completedOrders = allOrders.filter((o) => o.status === "delivered").length;

    const recentOrders = allOrders.slice(0, 10).map((o) => ({
      ...o,
      amount: o.amount / 100,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));

    const monthlySalesMap: Record<string, { revenue: number; orders: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
      monthlySalesMap[key] = { revenue: 0, orders: 0 };
    }

    allOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
      if (monthlySalesMap[key]) {
        monthlySalesMap[key].orders += 1;
        if (order.status === "paid" || order.status === "sent" || order.status === "delivered") {
          monthlySalesMap[key].revenue += order.amount / 100;
        }
      }
    });

    const monthlySales = Object.entries(monthlySalesMap).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }));

    res.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      recentOrders,
      monthlySales,
    });
  } catch (error) {
    req.log.error(error, "Error fetching admin stats");
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

export default router;
