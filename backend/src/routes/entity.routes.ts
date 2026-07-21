import { Router } from "express";
import {
  claimEntity,
  createEntity,
  deleteEntity,
  getMyEntity,
  listMyEntities,
  resolveEntity,
  updateEntity,
} from "../controllers/entityController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { optionalAuth } from "../middleware/optionalAuth";

const router = Router();

router.get("/mine", requireAuth, asyncHandler(listMyEntities));
router.get("/resolve/:slug", optionalAuth, asyncHandler(resolveEntity));
router.post("/claim", requireAuth, asyncHandler(claimEntity));
router.post("/", requireAuth, asyncHandler(createEntity));
router.get("/:id", requireAuth, asyncHandler(getMyEntity));
router.patch("/:id", requireAuth, asyncHandler(updateEntity));
router.delete("/:id", requireAuth, asyncHandler(deleteEntity));

export default router;
