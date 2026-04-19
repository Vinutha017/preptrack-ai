const express = require("express");

const authRoutes = require("./authRoutes");
const progressRoutes = require("./progressRoutes");
const testRoutes = require("./testRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const studyRoutes = require("./studyRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/progress", progressRoutes);
router.use("/tests", testRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/study", studyRoutes);

module.exports = router;
