require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lewkfd5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection failed:', err));

// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Settings Model
const settingsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  theme: { type: String, default: 'light' },
  notifications: { type: Boolean, default: true },
  language: { type: String, default: 'en' },
  updatedAt: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', settingsSchema);

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: "Server is working!" });
});

// REGISTER endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required"
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name
    });

    // Create default settings for new user
    await Settings.create({
      userId: newUser._id.toString()
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: err.message
    });
  }
});

// SIGNUP endpoint (alias for register)
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required"
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name
    });

    // Create default settings for new user
    await Settings.create({
      userId: newUser._id.toString()
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: err.message
    });
  }
});

// LOGIN endpoint
app.post('/api/login', async (req, res) => {
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
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message
    });
  }
});

// GET user settings
app.get('/api/settings/:userId', async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.params.userId });
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user settings
app.put('/api/settings/:userId', async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.params.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Employee routes
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

// Chat routes
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
// Default to 3001 to avoid conflict with React dev server (3000)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});