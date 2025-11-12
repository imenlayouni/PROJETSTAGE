import React from 'react';
import ReactDOM from 'react-dom/frontend';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
Mayssa
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: String,
  dueDate: String,
  status: String
});

module.exports = mongoose.model('Task', taskSchema);