const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// In-memory storage
let quizAttempts = [];

let topics = [
  { id: 1, name: "HTML Basics", difficulty: "Beginner" },
  { id: 2, name: "JavaScript Functions", difficulty: "Intermediate" },
  { id: 3, name: "React Hooks", difficulty: "Advanced" }
];

// Health check
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// Save Quiz Attempt
app.post("/api/quiz/attempt", (req, res) => {
  const { userId, topicId, score, totalQuestions } = req.body;

  if (!userId || !score || !totalQuestions) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const percentage = (score / totalQuestions) * 100;

  quizAttempts.push({
    userId,
    topicId,
    score,
    totalQuestions,
    percentage
  });

  res.json({
    message: "Attempt saved",
    percentage
  });
});

// Dashboard API
app.get("/api/dashboard/:userId", (req, res) => {
  const { userId } = req.params;

  const attempts = quizAttempts.filter(a => a.userId === userId);

  if (attempts.length === 0) {
    return res.json({ message: "No attempts yet" });
  }

  const avgScore =
    attempts.reduce((sum, a) => sum + a.percentage, 0) /
    attempts.length;

  let level;
  let difficultyAdjustment;

  if (avgScore < 50) {
    level = "Beginner";
    difficultyAdjustment = "Decrease";
  } else if (avgScore < 75) {
    level = "Intermediate";
    difficultyAdjustment = "Maintain";
  } else {
    level = "Advanced";
    difficultyAdjustment = "Increase";
  }

  const recommendedTopic = topics.find(t => t.difficulty === level);

  res.json({
    student_id: userId,
    current_level: level,
    average_score: avgScore.toFixed(2),
    recommended_topic: recommendedTopic?.name,
    difficulty_adjustment: difficultyAdjustment
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});