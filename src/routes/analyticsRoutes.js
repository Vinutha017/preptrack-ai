const express = require("express");

const auth = require("../middleware/auth");
const { overview, weakTopics, recommendations } = require("../controllers/analyticsController");

const router = express.Router();

router.use(auth);

router.get("/overview", overview);
router.get("/weak-topics", weakTopics);
router.get("/recommendations", recommendations);

module.exports = router;
