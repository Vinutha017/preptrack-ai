const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const updateStreak = async (user) => {
  const today = normalizeDate(new Date());
  const last = user.lastActiveDate ? normalizeDate(new Date(user.lastActiveDate)) : null;

  if (!last) {
    user.streak = 1;
  } else {
    const dayDiff = Math.round((today - last) / (1000 * 60 * 60 * 24));
    if (dayDiff === 0) {
      user.streak = user.streak || 1;
    } else if (dayDiff === 1) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }
  }

  user.lastActiveDate = today;
  await user.save();
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await updateStreak(user);
    const token = signToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  me,
};
