import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import rentalRequestsRouter from "./rentalRequests";
import favoritesRouter from "./favorites";
import visitsRouter from "./visits";
import messagesRouter from "./messages";
import dashboardRouter from "./dashboard";
import managersRouter from "./managers";
import subscriptionsRouter from "./subscriptions";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(rentalRequestsRouter);
router.use(favoritesRouter);
router.use(visitsRouter);
router.use(messagesRouter);
router.use(dashboardRouter);
router.use(managersRouter);
router.use(subscriptionsRouter);
router.use(profileRouter);

export default router;
