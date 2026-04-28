const express = require("express");
const { body } = require("express-validator");

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { generateTest, submitTest, getTestHistory } = require("../controllers/testController");

const router = express.Router();

router.use(auth);

router.post(
  "/generate",
  [
    body("phase").optional().isIn(["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME", "FINAL"]),
    body("limit").optional().isInt({ min: 1, max: 120 }),
    body("adaptive").optional().isBoolean(),
    body("retakeQuestionIds").optional().isArray(),
    body("retakeQuestionIds.*").optional().isMongoId().withMessage("retakeQuestionIds must contain valid IDs"),
  ],
  validate,
  generateTest
);

router.post(
  "/submit",
  [
    body("phase").optional().isIn(["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME", "FINAL"]),
    body("questionIds").isArray({ min: 1 }),
    body("questionIds.*").isMongoId().withMessage("questionIds must contain valid IDs"),
    body("answers").isArray({ min: 1 }),
    body("answers.*.questionId").isMongoId().withMessage("answers.questionId must be a valid ID"),
    body("answers.*.selectedAnswer").isString().trim().notEmpty().withMessage("selectedAnswer is required"),
  ],
  validate,
  submitTest
);

router.get("/history", getTestHistory);

module.exports = router;
