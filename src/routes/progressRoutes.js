const express = require("express");
const { body, param } = require("express-validator");

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getProgress,
  toggleProgressItem,
  addCustomChecklistItem,
  removeCustomChecklistItem,
  getOverallProgress,
  markDailyChecklistUpdate,
  resetProgress,
} = require("../controllers/progressController");

const router = express.Router();

router.use(auth);

router.get("/", getProgress);
router.get("/overall", getOverallProgress);
router.post("/daily-checkin", markDailyChecklistUpdate);
router.post("/reset", resetProgress);

router.patch(
  "/:phase/item",
  [
    param("phase").isIn(["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS"]),
    body("itemId").notEmpty().withMessage("itemId is required"),
    body("completed").isBoolean().withMessage("completed must be true/false"),
  ],
  validate,
  toggleProgressItem
);

router.post(
  "/:phase/custom-item",
  [
    param("phase").isIn(["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS"]),
    body("label")
      .isString()
      .trim()
      .isLength({ min: 2, max: 120 })
      .withMessage("label must be between 2 and 120 characters"),
  ],
  validate,
  addCustomChecklistItem
);

router.delete(
  "/:phase/custom-item/:itemId",
  [
    param("phase").isIn(["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS"]),
    param("itemId").isString().trim().notEmpty().withMessage("itemId is required"),
  ],
  validate,
  removeCustomChecklistItem
);

module.exports = router;
