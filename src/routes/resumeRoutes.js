const express = require('express');
const { body } = require('express-validator');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { atsCheck } = require('../controllers/resumeController');

const router = express.Router();

router.use(auth);

router.post(
  '/ats-check',
  [body('resumeText').isString().trim().notEmpty().withMessage('resumeText is required')],
  validate,
  atsCheck
);

module.exports = router;
