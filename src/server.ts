import express from "express";
import routes from "./routes";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const port = Number(process.env.PORT ?? 3000);

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
