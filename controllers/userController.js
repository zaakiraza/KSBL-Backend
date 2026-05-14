import User from "../models/user.js";
import bcrypt from "bcrypt";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      return successResponse(res, users, "Users fetched successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  addStudent: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password)
        return errorResponse(res, "Name, email and password are required.", 400);

      const existing = await User.findOne({ email });
      if (existing) return errorResponse(res, "Email already in use.", 409);

      const hashed = await bcrypt.hash(password, 10);
      const student = await User.create({
        name,
        email,
        password: hashed,
        role: "student",
        teacherId: req.user.id,
      });

      return successResponse(
        res,
        { id: student._id, name: student.name, email: student.email, role: student.role },
        "Student added successfully"
      );
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  getMyStudents: async (req, res) => {
    try {
      const students = await User.find({ teacherId: req.user.id, role: "student" }).select("-password");
      return successResponse(res, students, "Students fetched successfully");
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },
};
