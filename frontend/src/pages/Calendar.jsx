import React, { useState, useEffect } from 'react';
import '../styles/Calendar.css';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
  const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTasksForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => task.dueDate && task.dueDate.startsWith(dateStr));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Calendar</h1>
        <p>Track your tasks by date</p>
      </div>

      <div className="calendar">
        <div className="calendar-navigation">
          <button onClick={handlePrevMonth}>&lt; Previous</button>
          <h2>{monthName}</h2>
          <button onClick={handleNextMonth}>Next &gt;</button>
        </div>

        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="calendar-days">
          {days.map((day, index) => {
            const tasksForDay = day ? getTasksForDate(day) : [];
            return (
              <div
                key={index}
                className={`calendar-day ${day ? 'active' : 'empty'} ${tasksForDay.length > 0 ? 'has-tasks' : ''}`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day}</div>
                    {tasksForDay.length > 0 && (
                      <div className="task-indicator">
                        <span className="task-count">{tasksForDay.length}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="date-tasks">
          <h3>Tasks for {selectedDate} {monthName.split(' ')[0]}</h3>
          {getTasksForDate(selectedDate).length > 0 ? (
            <ul>
              {getTasksForDate(selectedDate).map(task => (
                <li key={task._id} className={`task-item status-${task.status}`}>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                  <small>Status: {task.status}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks for this date</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Calendar;
