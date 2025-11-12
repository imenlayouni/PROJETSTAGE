const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Task Model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  assignedTo: String,
  dueDate: String,
  status: { type: String, default: 'pending' },
  userId: String,
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
router.post('/', async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, userId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTask = new Task({
      title,
      description,
      assignedTo,
      dueDate,
      userId,
      status: 'pending'
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;