import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import connectDB from "./utils/DB.js";
import { startCronJob } from "./utils/cronJob.js";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import quizRouter from "./routes/quizRoute.js";
import attemptRouter from "./routes/attemptRoute.js";

dotenv.config();
const app = express();

// Security middlewares
app.use(helmet());

// express-mongo-sanitize is incompatible with Express v5 (req.query is read-only)
// app.use(mongoSanitize());

// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Start cron job
// startCronJob();

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/attempts", attemptRouter);

app.get("/", (req, res) => {
  res.send("Hello, World! Your server is running 🎉");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});


const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

// test