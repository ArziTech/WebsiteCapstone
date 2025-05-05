const express = require('express');
const {Pool} = require("pg");
const router = express.Router();


const pool = new Pool({
  user: 'capstone',
  host: 'localhost',
  database: 'capstone',
  password: 'admin',
  port: 5432,
});

/* GET users listing. */
router.get('/', async function(req, res, next) {
  // Contoh route untuk mendapatkan data dari database
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
