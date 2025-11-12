import React, { useState, useEffect } from 'react';
import '../styles/TaskManagement.css';

function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
  const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!newTask.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);

    try {
  const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTask,
          userId: user.id
        })
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([task, ...tasks]);
        setNewTask({
          title: '',
          description: '',
          dueDate: '',
          assignedTo: '',
          status: 'pending'
        });
      } else {
        setError('Failed to add task');
      }
    } catch (err) {
      setError('Error adding task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (id, updatedTask) => {
    try {
  const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
      });

      if (response.ok) {
        setTasks(tasks.map(task => task._id === id ? { ...task, ...updatedTask } : task));
      } else {
        setError('Failed to update task');
      }
    } catch (err) {
      setError('Error updating task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
  const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== id));
      } else {
        setError('Failed to delete task');
      }
    } catch (err) {
      setError('Error deleting task');
      console.error(err);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const task = tasks.find(t => t._id === id);
    handleUpdateTask(id, { ...task, status: newStatus });
  };

  return (
    <div className="task-management-container">
      <div className="task-header">
        <h1>Task Management</h1>
        <p>Organize and track your tasks</p>
      </div>

      <div className="add-task-section">
        <h2>Add New Task</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleAddTask}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder="Enter task description"
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignedTo">Assigned To</label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={newTask.assignedTo}
                onChange={handleInputChange}
                placeholder="Person name or team"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      <div className="tasks-section">
        <h2>All Tasks ({tasks.length})</h2>

        {loading && <p>Loading tasks...</p>}

        {tasks.length === 0 && !loading && (
          <p className="no-tasks">No tasks yet. Create one to get started!</p>
        )}

        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task._id} className={`task-card status-${task.status}`}>
              <div className="task-header-card">
                <h3>{task.title}</h3>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                {task.dueDate && (
                  <span className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
                {task.assignedTo && (
                  <span className="assigned-to">👤 {task.assignedTo}</span>
                )}
              </div>

              <div className="task-actions">
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TaskManagement;