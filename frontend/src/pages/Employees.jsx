import React, { useEffect, useState } from 'react';
import '../styles/Employees.css';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', department: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ name: '', email: '', department: '' });
        fetchEmployees();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add');
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employees</h1>
        <p>View and add employees</p>
      </div>

      <div className="employees-main">
        <div className="employees-list">
          <h3>Team</h3>
          {employees.length === 0 ? (<p>No employees yet</p>) : (
            <ul>
              {employees.map(emp => (
                <li key={emp._id}>
                  <div className="emp-name">{emp.name}</div>
                  <div className="emp-dept">{emp.department}</div>
                  <div className="emp-email">{emp.email}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="employees-form">
          <h3>Add Employee</h3>
          <form onSubmit={handleAdd}>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} required />
            <label>Department</label>
            <input name="department" value={form.department} onChange={handleChange} />
            <button className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Employees;
