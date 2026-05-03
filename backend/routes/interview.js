const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

const DEFAULT_QUESTIONS = [
  {
    question: "What is the difference between a process and a thread?",
    answer: "A process is an independent program execution with its own memory space. A thread is a subset of a process that shares the same memory space but executes independently. Processes are heavier and safer; threads are lighter and faster for communication.",
    category: "Linux",
    difficulty: "Medium",
    tags: ["os", "fundamentals"]
  },
  {
    question: "How do you check memory usage in Linux?",
    answer: "You can use 'free -m' for a quick summary, 'top' or 'htop' for real-time monitoring, and 'vmstat' for virtual memory statistics.",
    category: "Linux",
    difficulty: "Easy",
    tags: ["monitoring", "cli"]
  },
  {
    question: "What is the purpose of the '/' (root) directory in Linux?",
    answer: "The '/' directory is the top-level directory in the Linux filesystem hierarchy. All other directories and files are children of root, including mounted drives.",
    category: "Linux",
    difficulty: "Easy",
    tags: ["filesystem"]
  },
  {
    question: "What is the difference between an Image and a Container?",
    answer: "An Image is a read-only template with instructions for creating a Docker container. A Container is a runnable instance of an image. Think of an image as a Class and a container as an Instance of that class.",
    category: "Docker",
    difficulty: "Easy",
    tags: ["basics"]
  },
  {
    question: "How do you reduce the size of a Docker image?",
    answer: "Use multi-stage builds, choose smaller base images (like Alpine), minimize the number of layers (combine RUN commands), and use .dockerignore to exclude unnecessary files.",
    category: "Docker",
    difficulty: "Medium",
    tags: ["optimization", "best-practices"]
  },
  {
    question: "What is a Pod in Kubernetes?",
    answer: "A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster and can contain one or more containers that share network and storage.",
    category: "Kubernetes",
    difficulty: "Easy",
    tags: ["basics"]
  },
  {
    question: "What is the difference between 'git fetch' and 'git pull'?",
    answer: "'git fetch' only downloads the latest changes from the remote repository but doesn't merge them. 'git pull' does a 'git fetch' followed immediately by a 'git merge' into your current branch.",
    category: "Git",
    difficulty: "Easy",
    tags: ["basics"]
  },
  {
    question: "What is Continuous Integration (CI)?",
    answer: "CI is the practice of automating the integration of code changes from multiple contributors into a single software project. It involves frequent commits and automated testing to catch bugs early.",
    category: "CI/CD",
    difficulty: "Easy",
    tags: ["concepts"]
  }
];

// GET /api/interview/seed - Prepopulate with common questions
router.get('/seed', async (req, res) => {
  try {
    const existing = await Question.countDocuments();
    if (existing > 0) {
      return res.json({ success: true, message: 'Question bank already seeded', count: existing });
    }
    const seeded = await Question.insertMany(DEFAULT_QUESTIONS);
    res.json({ success: true, data: seeded, count: seeded.length });
  } catch (error) {
    console.error('Seed Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/interview/questions - List all questions
router.get('/questions', async (req, res) => {
  try {
    const { category, difficulty, search, favorite } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (favorite === 'true') filter.isFavorite = true;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const questions = await Question.find(filter).sort({ category: 1, difficulty: 1 });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/interview/random - Get a random set of questions for mock interview
router.get('/random', async (req, res) => {
  try {
    const { count = 5, category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } },
    ]);

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/interview/questions - Add a new question
router.post('/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    const saved = await question.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/interview/questions/:id/favorite - Toggle favorite
router.patch('/questions/:id/favorite', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    question.isFavorite = !question.isFavorite;
    await question.save();
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/interview/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
