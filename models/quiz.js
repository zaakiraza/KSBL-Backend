import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    marks: { type: Number, default: null },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: String, required: true },
    topicName: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    questionCount: { type: Number, required: true },
    marksType: { type: String, enum: ["equal", "different"], required: true },
    equalMarksPerQuestion: { type: Number, default: null },
    complexityLevel: { type: String, enum: ["easy", "medium", "hard"], required: true },
    maxAttempts: { type: Number, default: 1 },
    status: { type: String, enum: ["draft", "published", "expired"], default: "draft" },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
