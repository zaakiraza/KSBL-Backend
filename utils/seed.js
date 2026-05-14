import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "./DB.js";
import User from "../models/user.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  const email = "superadmin@ksbl.edu";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("⚠️  Super admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash("Admin@12345", 10);
  await User.create({
    name: "Super Admin",
    email,
    password: hashed,
    role: "admin",
  });

  console.log("✅ Super admin created");
  console.log("   Email   :", email);
  console.log("   Password: Admin@12345");
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
