import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { createRouter } from "./routes";
import { logger } from "./lib/logger";
import fs from "fs";
import path from "path";
const rawAllowedOrigins = process.env["CORS_ALLOWED_ORIGINS"] ?? "";
const configuredAllowedOrigins = rawAllowedOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
const allowedOrigins =
  configuredAllowedOrigins.length > 0
    ? configuredAllowedOrigins
    : process.env["NODE_ENV"] === "production"
      ? []
      : defaultDevOrigins;

function resolveFrontendPublicDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "artifacts", "tropicolors", "public"),
    path.resolve(process.cwd(), "..", "tropicolors", "public"),
  ];

  const match = candidates.find((candidate) => fs.existsSync(candidate));

  return match ?? candidates[0];
}

export async function createApp(): Promise<Express> {
  const app: Express = express();
  const router = await createRouter();
  const frontendPublicDir = resolveFrontendPublicDir();

  app.disable("x-powered-by");

  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use((_, res, next) => {
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );

    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.use(
    "/data",
    express.static(path.join(frontendPublicDir, "data"), {
      maxAge: "1h",
      setHeaders(res) {
        res.setHeader("Cache-Control", "public, max-age=3600");
      },
    }),
  );

  app.use(
    "/images",
    express.static(frontendPublicDir, {
      maxAge: "7d",
      setHeaders(res, filePath) {
        if (/\.(png|jpg|jpeg|webp|svg)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=604800");
        }
      },
    }),
  );

  app.use("/api", router);

  return app;
}
