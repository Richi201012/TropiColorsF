import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

void createApp()
  .then((app) => {
    app.listen(port, () => {
      logger.info({ port }, "Server listening");
    });
  })
  .catch((error) => {
    logger.error(error, "Failed to initialize app");
    process.exit(1);
  });
