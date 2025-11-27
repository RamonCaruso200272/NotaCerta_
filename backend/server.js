// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão pool MySQL (credenciais em .env)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Auth simples (registro rápido) ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [rows] = await pool.query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name,email,password]);
    res.json({ id: rows.insertId, name, email });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'erro ao registrar' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT id,name,email FROM users WHERE email=? AND password=?', [email,password]);
    if (rows.length === 0) return res.status(401).json({ error: 'credenciais inválidas' });
    res.json(rows[0]);
  } catch(e){ console.error(e); res.status(500).json({ error: 'erro' }); }
});

// --- Subjects CRUD ---
app.get('/api/subjects/:userId', async (req,res)=> {
  const userId = req.params.userId;
  const [rows] = await pool.query('SELECT * FROM subjects WHERE user_id=?', [userId]);
  res.json(rows);
});

app.post('/api/subjects', async (req,res)=> {
  const { user_id, name, code, professor, credits, schedule } = req.body;
  const [r] = await pool.query(
    'INSERT INTO subjects (user_id,name,code,professor,credits,schedule) VALUES (?,?,?,?,?,?)',
    [user_id,name,code,professor,credits,schedule]
  );
  res.json({ id: r.insertId });
});

app.put('/api/subjects/:id', async (req,res)=> {
  const id = req.params.id;
  const { name, code, professor, credits, schedule } = req.body;
  await pool.query('UPDATE subjects SET name=?,code=?,professor=?,credits=?,schedule=? WHERE id=?',
    [name,code,professor,credits,schedule,id]);
  res.json({ ok: true });
});

app.delete('/api/subjects/:id', async (req,res)=> {
  const id = req.params.id;
  await pool.query('DELETE FROM subjects WHERE id=?', [id]);
  res.json({ ok:true });
});

// --- Attendance CRUD (exemplo de POST e GET) ---
app.get('/api/attendance/:userId', async (req,res)=> {
  const userId = req.params.userId;
  const [rows] = await pool.query('SELECT * FROM attendance WHERE user_id=?', [userId]);
  res.json(rows);
});
app.post('/api/attendance', async (req,res)=> {
  const { user_id, subject_id, date, present, justification } = req.body;
  const [r] = await pool.query('INSERT INTO attendance (user_id,subject_id,date,present,justification) VALUES (?,?,?,?,?)',
    [user_id, subject_id, date, present ? 1 : 0, justification]);
  res.json({ id: r.insertId });
});
// -- Grades similar, omitido por brevidade (mas repete a mesma lógica) --

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`API rodando na porta ${PORT}`));
