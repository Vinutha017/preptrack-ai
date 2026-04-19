const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");

const env = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { authLimiter, apiLimiter } = require("./middleware/rateLimit");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "PrepTrack AI Backend" });
});

app.use("/api", routes);

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const shouldServeFrontend = env.nodeEnv === "production" && fs.existsSync(frontendDistPath);

if (shouldServeFrontend) {
  app.use(express.static(frontendDistPath));

  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;
