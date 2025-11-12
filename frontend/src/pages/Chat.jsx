import React, { useEffect, useState } from 'react';
import '../styles/Chat.css';

function Chat() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => {
    if (selected && user.id) fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Poll for new messages while a conversation is open
  useEffect(() => {
    if (!selected || !user.id) return;
    let mounted = true;
    const iv = setInterval(() => {
      if (mounted) fetchMessages();
    }, 2500);
    return () => { mounted = false; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, user.id]);

  const fetchEmployees = async () => {
    try { const res = await fetch('/api/employees'); setEmployees(await res.json()); }
    catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${user.id}/${selected._id}`);
      setMessages(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    const payload = { senderId: user.id, recipientId: selected._id, message: text };
    try {
      const res = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const saved = await res.json();
        // clear input
        setText('');
        // optimistically append the saved message so sender sees it immediately
        setMessages(prev => [...prev, saved]);
        // fetch fresh messages (in case there are others)
        fetchMessages();
      } else {
        const err = await res.json();
        console.error('Failed to send message', err);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="chat-container">
      <div className="chat-left">
        <h3>Employees</h3>
        <ul>
          {employees.map(emp => (
            <li key={emp._id} className={selected?._id === emp._id ? 'active' : ''} onClick={() => setSelected(emp)}>
              <div className="emp-name">{emp.name}</div>
              <div className="emp-dept">{emp.department}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-main">
        {selected ? (
          <>
            <div className="chat-header">Chat with {selected.name}</div>
            <div className="chat-messages">
              {messages.map(m => (
                <div key={m._id} className={`chat-message ${m.senderId === user.id ? 'me' : 'them'}`}>
                  <div className="msg-text">{m.message}</div>
                  <div className="msg-time">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={handleSend}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a message..." />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat">Select an employee to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default Chat;
