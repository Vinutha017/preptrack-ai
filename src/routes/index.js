const express = require("express");

const authRoutes = require("./authRoutes");
const progressRoutes = require("./progressRoutes");
const testRoutes = require("./testRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const studyRoutes = require("./studyRoutes");
const adminRoutes = require("./adminRoutes");
const resumeRoutes = require("./resumeRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/progress", progressRoutes);
router.use("/tests", testRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/study", studyRoutes);
router.use("/admin", adminRoutes);
router.use("/resume", resumeRoutes);

module.exports = router;
