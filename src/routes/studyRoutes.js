const express = require("express");
const { body, param, query } = require("express-validator");

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { listStudyItems, saveStudyItem, deleteStudyItem } = require("../controllers/studyController");

const router = express.Router();

router.use(auth);

router.get(
	"/",
	[
		query("phase").optional().isIn(["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME", "FINAL"]),
		query("questionIds").optional().isString(),
	],
	validate,
	listStudyItems
);

router.post(
	"/",
	[
		body("questionId").isMongoId().withMessage("questionId must be a valid ID"),
		body("phase").isIn(["DSA", "DBMS", "OS", "CN", "VOCAB", "OOPS", "RESUME", "FINAL"]),
		body("topic").isString().trim().notEmpty().withMessage("topic is required"),
		body("bookmarked").optional().isBoolean(),
		body("note").optional().isString().isLength({ max: 1000 }).withMessage("note must be at most 1000 characters"),
	],
	validate,
	saveStudyItem
);

router.delete(
	"/:questionId",
	[param("questionId").isMongoId().withMessage("questionId must be a valid ID")],
	validate,
	deleteStudyItem
);

module.exports = router;