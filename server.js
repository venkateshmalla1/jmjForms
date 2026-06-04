require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// Schema
const studentSchema = new mongoose.Schema({
  name: String,
  class: String,
  fatherName: String,
  phone: String,
  extraActivity: { type: String, default: "" }
});
const Student = mongoose.model("studentsData", studentSchema, "studentsData");


// Routes
app.get("/api/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post("/api/register", async (req, res) => {
  try {
    const { id, extraActivity } = req.body;
    const student = await Student.findByIdAndUpdate(id, { extraActivity }, { new: true });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Dashboard statistics
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: { class: "$class", activity: "$extraActivity" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.class": 1, "_id.activity": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/", (req, res) => {
  res.send("JMJ Activity Form backend is running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
