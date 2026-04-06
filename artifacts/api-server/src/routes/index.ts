import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

export async function createRouter(): Promise<IRouter> {
  const router: IRouter = Router();

  const [
    { default: healthRouter },
    { default: productsRouter },
    { default: ordersRouter },
    { default: postalCodesRouter },
    { default: emailRouter },
  ] = await Promise.all([
    import("./health"),
    import("./products"),
    import("./orders"),
    import("./postal-codes"),
    import("./email"),
  ]);

  router.use(healthRouter);
  router.use(productsRouter);
  router.use(ordersRouter);
  router.use(postalCodesRouter);
  router.use(emailRouter);

  if (process.env.DATABASE_URL) {
    const [
      { default: contactRouter },
      { default: invoicesRouter },
      { default: adminRouter },
    ] = await Promise.all([
      import("./contact"),
      import("./invoices"),
      import("./admin"),
    ]);

    router.use(contactRouter);
    router.use(invoicesRouter);
    router.use(adminRouter);
  } else {
    logger.warn(
      "DATABASE_URL no configurada; las rutas /api/contact, /api/invoices y /api/admin/stats quedan deshabilitadas.",
    );
  }

  return router;
}
