import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, refresh, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.post("/refresh", authRateLimit, refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
