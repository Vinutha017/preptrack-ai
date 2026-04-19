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

const frontendDistCandidates = [
  path.resolve(process.cwd(), "frontend/dist"),
  path.resolve(process.cwd(), "dist"),
  path.resolve(__dirname, "../frontend/dist"),
  path.resolve(__dirname, "../dist"),
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../../dist"),
];

const frontendDistPath = frontendDistCandidates.find((candidate) => fs.existsSync(candidate));
const shouldServeFrontend = Boolean(frontendDistPath);

if (shouldServeFrontend) {
  console.log(`Serving frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;
