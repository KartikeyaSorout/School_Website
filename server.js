const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend HTML statically
app.use(express.static(path.join(__dirname, 'public')));

// ── Database Setup ──
const db = new sqlite3.Database('./enquiries.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Create enquiries table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    enquiry_for TEXT,
    message TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new'
  )
`, (err) => {
  if (err) console.error('Table creation error:', err.message);
  else console.log('✅ Enquiries table ready.');
});

// ── Routes ──

// POST /api/enquiry — Save a new enquiry
app.post('/api/enquiry', (req, res) => {
  const { full_name, phone, email, enquiry_for, message } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ success: false, error: 'Name and phone are required.' });
  }

  const sql = `
    INSERT INTO enquiries (full_name, phone, email, enquiry_for, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [full_name, phone, email, enquiry_for, message], function (err) {
    if (err) {
      console.error('Insert error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to save enquiry.' });
    }
    console.log(`📩 New enquiry saved — ID: ${this.lastID}, Name: ${full_name}`);
    res.json({ success: true, message: 'Enquiry saved successfully!', id: this.lastID });
  });
});

// GET /api/enquiries — View all enquiries (admin use)
app.get('/api/enquiries', (req, res) => {
  const { status, search } = req.query;
  let sql = 'SELECT * FROM enquiries';
  const params = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  if (search) {
    sql += params.length ? ' AND' : ' WHERE';
    sql += ' (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY submitted_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, total: rows.length, enquiries: rows });
  });
});

// GET /api/enquiries/:id — Get a single enquiry
app.get('/api/enquiries/:id', (req, res) => {
  db.get('SELECT * FROM enquiries WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    res.json({ success: true, enquiry: row });
  });
});

// PATCH /api/enquiries/:id/status — Update enquiry status
app.patch('/api/enquiries/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['new', 'contacted', 'resolved'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status. Use: new, contacted, resolved.' });
  }

  db.run('UPDATE enquiries SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (this.changes === 0) return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    res.json({ success: true, message: `Status updated to "${status}"` });
  });
});

// DELETE /api/enquiries/:id — Delete an enquiry
app.delete('/api/enquiries/:id', (req, res) => {
  db.run('DELETE FROM enquiries WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (this.changes === 0) return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    res.json({ success: true, message: 'Enquiry deleted.' });
  });
});

// GET /admin — Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`🌐 School website:  http://localhost:${PORT}\n`);
});
