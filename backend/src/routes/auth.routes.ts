import { Router } from "express";
import { login, me, register } from "../controllers/authController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { authRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/register", authRateLimiter, asyncHandler(register));
router.post("/login", authRateLimiter, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
