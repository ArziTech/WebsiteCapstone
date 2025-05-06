const express = require('express');
const {Pool} = require("pg");
const router = express.Router();

const dbUrl = new URL(process.env.DATABASE_URL);

const pool = new Pool({
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: dbUrl.port,
  database: dbUrl.pathname.split('/')[1], // Ambil nama database dari path
  ssl: {
    rejectUnauthorized: false // Untuk development saja, sesuaikan untuk production
  }
});

router.get('/', async function(req, res, next) {
  try {
    const {rows} = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', async function(req, res){
  const { name, email } = req.body;

  res.send({email,name});
})

module.exports = router;
