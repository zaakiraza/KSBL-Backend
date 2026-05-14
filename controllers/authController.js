import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const authController = {
  registerUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password)
        return errorResponse(res, "Name, email and password are required.", 400);

      const existing = await User.findOne({ email });
      if (existing) return errorResponse(res, "Email already in use.", 409);

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, role: "teacher" });

      return successResponse(
        res,
        { id: user._id, name: user.name, email: user.email, role: user.role },
        "Registration successful"
      );
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return errorResponse(res, "User not found", 404);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return errorResponse(res, "Invalid credentials", 400);

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return successResponse(res, { token }, "Login successful");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },
};
