import "dotenv/config";
import express from "express";
import path from "path";
import routes from "./routes";
import { logger } from "./utils/logger";

const app = express();
const publicPath = path.resolve(__dirname, "../public");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicPath));
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const port = Number(process.env.PORT ?? 3001);
if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}

export default app;
