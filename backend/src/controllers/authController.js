import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const signupUser = async (req, res) => {
  console.log("--- DEBUG: Signup Started ---");
  console.log("Body:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("DEBUG: Validation failed (missing fields)");
      return res.status(400).json({ 
        success: false,
        message: "Name, email and password are required" 
      });
    }

    console.log("DEBUG: Checking if user exists...");
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log("DEBUG: User already exists");
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    console.log("DEBUG: Attempting to create user in DB...");
    // This line triggers the Model's .pre("save") hook
    const user = await User.create({ name, email, password });
    
    console.log("DEBUG: User created successfully!");

    res.status(201).json({
      success: true,
      message: "Signup successful",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        totalPoints: user.points || 0,
        streak: user.streak || 0
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("--- DEBUG: SIGNUP CRASHED ---");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    res.status(500).json({
      success: false,
      message: "Signup failed",
      error: error.message
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        points: user.points || 0,
        streak: user.streak || 0,
        totalPoints: user.points || 0,
        totalRevisions: user.totalRevisions || 0,
        totalQuizzes: user.totalQuizzes || 0,
        averageScore: user.averageScore || 0
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      points: req.user.points || 0,
      totalPoints: req.user.points || 0,
      streak: req.user.streak || 0,
      totalRevisions: req.user.totalRevisions || 0,
      totalQuizzes: req.user.totalQuizzes || 0,
      averageScore: req.user.averageScore || 0
    }
  });
};