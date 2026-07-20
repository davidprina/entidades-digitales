import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "NotFound", message: `Ruta no encontrada: ${req.path}` });
  });

  app.use(errorHandler);

  return app;
}
