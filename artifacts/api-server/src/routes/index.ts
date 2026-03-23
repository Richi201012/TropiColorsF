import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import contactRouter from "./contact";
import ordersRouter from "./orders";
import invoicesRouter from "./invoices";
import adminRouter from "./admin";
import postalCodesRouter from "./postal-codes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(contactRouter);
router.use(ordersRouter);
router.use(invoicesRouter);
router.use(adminRouter);
router.use(postalCodesRouter);

export default router;
