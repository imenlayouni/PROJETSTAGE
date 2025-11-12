import React, { useState, useEffect } from 'react';

function DonutChart({ completed = 0, pending = 0 }) {
  const total = completed + pending;
  const completedPercentage = total === 0 ? 0 : (completed / total) * 100;
  const pendingPercentage = total === 0 ? 0 : (pending / total) * 100;

  return (
    <div style={{ width: '100%', margin: '20px auto' }}>
      {total === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#9ca3af' }}>
          No data
        </div>
      ) : (
        <svg width="100%" height="300" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <mask id="halfMask">
              <rect x="0" y="0" width="400" height="300" fill="white"/>
            </mask>
          </defs>
          
          {/* Pending (light blue) - left half */}
          <path
            d="M 200,300 A 150,150 0 0,1 200,0 L 200,150 Z"
            fill="#7dd3fc"
          />
          
          {/* Completed (green) - right half */}
          <path
            d="M 200,0 A 150,150 0 0,1 200,300 L 200,150 Z"
            fill="#10b981"
          />
        </svg>
      )}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });

  const [user, setUser] = useState({ name: '' });

  // load user from localStorage (saved at login)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        // support different shapes: { name } or { fullName } or { username }
        const name = parsed.name || parsed.fullName || parsed.username || '';
        setUser({ name });
      }
    } catch (err) {
      // ignore parse errors
      console.error('Error reading user from localStorage', err);
    }
  }, []);

  // fetch tasks and compute stats
  useEffect(() => {
    let mounted = true;
    async function loadTasks() {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) {
          console.error('Failed to fetch tasks', res.status);
          return;
        }
        const tasks = await res.json();
        if (!mounted) return;

        const total = Array.isArray(tasks) ? tasks.length : 0;
        const completed = tasks.filter(t => ((t.status || '') + '').toLowerCase() === 'completed').length;
        const overdue = tasks.filter(t => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          const now = new Date();
          return due < now && ((t.status || '') + '').toLowerCase() !== 'completed';
        }).length;
        const pending = Math.max(0, total - completed);

        setStats({ totalTasks: total, pendingTasks: pending, completedTasks: completed, overdueTasks: overdue });
      } catch (err) {
        console.error('Error loading tasks', err);
      }
    }

    loadTasks();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#e5e7eb',
      minHeight: '100vh',
      padding: '2.5rem 3rem'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#003d82',
          marginBottom: '2.5rem',
          letterSpacing: '-0.02em'
        }}>
          Welcome, {user.name} !
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem', fontWeight: '500' }}>
              Total Tasks
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.totalTasks}
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem', fontWeight: '500' }}>
              Completed
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {stats.completedTasks}
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem', fontWeight: '500' }}>
              Pending
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.pendingTasks}
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.75rem', fontWeight: '500' }}>
              Overdue
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>
              {stats.overdueTasks}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '45% 55%',
          gap: '1.5rem'
        }}>
          {/* Donut Chart */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1rem',
              marginTop: 0
            }}>
              Task Distribution
            </h3>
            <DonutChart completed={stats.completedTasks} pending={stats.pendingTasks} />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2.5rem',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  backgroundColor: '#10b981',
                  borderRadius: '2px'
                }}></div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  backgroundColor: '#7dd3fc',
                  borderRadius: '2px'
                }}></div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</span>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                margin: 0
              }}>
                Task Completion Rate
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                <div style={{ width: '40px', height: '3px', backgroundColor: '#3b82f6', borderRadius: '1px' }}></div>
                Tasks Completed
              </div>
            </div>
            <svg width="100%" height="340" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              <line x1="50" y1="30" x2="50" y2="280" stroke="#e5e7eb" strokeWidth="2" />
              <line x1="50" y1="280" x2="580" y2="280" stroke="#e5e7eb" strokeWidth="2" />
              
              {/* Horizontal grid lines */}
              <line x1="50" y1="217" x2="580" y2="217" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="50" y1="155" x2="580" y2="155" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="50" y1="92" x2="580" y2="92" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="50" y1="30" x2="580" y2="30" stroke="#f3f4f6" strokeWidth="1" />
              
              {/* Y-axis labels */}
              <text x="35" y="285" fontSize="12" fill="#9ca3af" textAnchor="end">0</text>
              <text x="35" y="222" fontSize="12" fill="#9ca3af" textAnchor="end">1.0</text>
              <text x="35" y="160" fontSize="12" fill="#9ca3af" textAnchor="end">2.0</text>
              <text x="35" y="97" fontSize="12" fill="#9ca3af" textAnchor="end">3.0</text>
              <text x="35" y="35" fontSize="12" fill="#9ca3af" textAnchor="end">4.0</text>
              
              {/* X-axis labels */}
              <text x="130" y="305" fontSize="12" fill="#9ca3af" textAnchor="middle">Mon</text>
              <text x="235" y="305" fontSize="12" fill="#9ca3af" textAnchor="middle">Tue</text>
              <text x="340" y="305" fontSize="12" fill="#9ca3af" textAnchor="middle">Wed</text>
              <text x="445" y="305" fontSize="12" fill="#9ca3af" textAnchor="middle">Thu</text>
              <text x="550" y="305" fontSize="12" fill="#9ca3af" textAnchor="middle">Fri</text>
              
              {/* Smooth curve path */}
              <path 
                d="M 130,240 Q 182,215 235,190 Q 288,130 340,70 Q 393,95 445,115 Q 497,50 550,25" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              <circle cx="130" cy="240" r="5" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="235" cy="190" r="5" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="340" cy="70" r="5" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="445" cy="115" r="5" fill="white" stroke="#3b82f6" strokeWidth="3" />
              <circle cx="550" cy="25" r="5" fill="white" stroke="#3b82f6" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;