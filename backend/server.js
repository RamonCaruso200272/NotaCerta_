require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão pool MySQL
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

// --- Auth ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [rows] = await pool.query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name,email,password]);
    res.json({ id: rows.insertId, name, email });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao registrar. Email pode já estar em uso.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT id,name,email FROM users WHERE email=? AND password=?', [email,password]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });
    res.json(rows[0]);
  } catch(e){ console.error(e); res.status(500).json({ error: 'Erro no servidor' }); }
});

// --- Subjects (Matérias) ---
app.get('/api/subjects/:userId', async (req,res)=> {
  try {
      const [rows] = await pool.query('SELECT * FROM subjects WHERE user_id=?', [req.params.userId]);
      res.json(rows);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/subjects', async (req,res)=> {
  const { user_id, name, code, professor, credits, schedule } = req.body;
  try {
      const [r] = await pool.query(
        'INSERT INTO subjects (user_id,name,code,professor,credits,schedule) VALUES (?,?,?,?,?,?)',
        [user_id,name,code,professor,credits,schedule]
      );
      res.json({ id: r.insertId });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/subjects/:id', async (req,res)=> {
  const { name, code, professor, credits, schedule } = req.body;
  try {
      await pool.query('UPDATE subjects SET name=?,code=?,professor=?,credits=?,schedule=? WHERE id=?',
        [name,code,professor,credits,schedule,req.params.id]);
      res.json({ ok: true });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/subjects/:id', async (req,res)=> {
  try {
      await pool.query('DELETE FROM subjects WHERE id=?', [req.params.id]);
      res.json({ ok:true });
  } catch(e) { res.status(500).json({error: e.message}); }
});

// --- Attendance (Faltas) ---
app.get('/api/attendance/:userId', async (req,res)=> {
  try {
      // Retorna camelCase para facilitar no frontend ou tratamos lá. Vamos retornar snake_case do banco mesmo.
      const [rows] = await pool.query('SELECT * FROM attendance WHERE user_id=?', [req.params.userId]);
      res.json(rows);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/attendance', async (req,res)=> {
  const { user_id, subject_id, date, present, justification } = req.body;
  try {
      const [r] = await pool.query('INSERT INTO attendance (user_id,subject_id,date,present,justification) VALUES (?,?,?,?,?)',
        [user_id, subject_id, date, present ? 1 : 0, justification]);
      res.json({ id: r.insertId });
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/attendance/:id', async (req,res)=> {
    const { subject_id, date, present, justification } = req.body;
    try {
        await pool.query('UPDATE attendance SET subject_id=?, date=?, present=?, justification=? WHERE id=?',
          [subject_id, date, present ? 1 : 0, justification, req.params.id]);
        res.json({ ok: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/attendance/:id', async (req,res)=> {
    try {
        await pool.query('DELETE FROM attendance WHERE id=?', [req.params.id]);
        res.json({ ok:true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// --- Grades (Notas) ---
app.get('/api/grades/:userId', async (req,res)=> {
    try {
        const [rows] = await pool.query('SELECT * FROM grades WHERE user_id=?', [req.params.userId]);
        res.json(rows);
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/grades', async (req,res)=> {
    const { user_id, subject_id, activity_name, weight, score, max_score, date } = req.body;
    try {
        const [r] = await pool.query(
          'INSERT INTO grades (user_id, subject_id, activity_name, weight, score, max_score, date) VALUES (?,?,?,?,?,?,?)',
          [user_id, subject_id, activity_name, weight, score, max_score, date]
        );
        res.json({ id: r.insertId });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/grades/:id', async (req,res)=> {
    const { subject_id, activity_name, weight, score, max_score, date } = req.body;
    try {
        await pool.query(
          'UPDATE grades SET subject_id=?, activity_name=?, weight=?, score=?, max_score=?, date=? WHERE id=?',
          [subject_id, activity_name, weight, score, max_score, date, req.params.id]
        );
        res.json({ ok: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/grades/:id', async (req,res)=> {
    try {
        await pool.query('DELETE FROM grades WHERE id=?', [req.params.id]);
        res.json({ ok:true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', ()=> console.log(`API rodando na porta ${PORT}`));