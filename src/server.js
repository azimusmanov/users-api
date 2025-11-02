const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// GET /users -> return all users as JSON
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, user_name, last_name, email FROM users ORDER BY id;"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

// Creating a new user
// Post /users - add new user
app.post("/users", async (req, res) => {
    try {
        const { user_name, last_name, email } = req.body
        const result = await pool.query(
            "INSERT INTO users (user_name, last_name, email) VALUES ($1, $2, $3) RETURNING *",
            [user_name, last_name, email]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Updating a user
// Put /users/:id
app.put("/users/:id", async (req, res) => {
    try{
        const { id } = req.params
        const { user_name, last_name, email } = req.body
        const result = await pool.query(
            "UPDATE users SET user_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING *",
            [user_name, last_name, email, id]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

 // DELETE /users/:id - delete user
 app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params
        await pool.query("DELETE FROM users where id = $1", [id])
        res.json({ message: "User deleted successfully" })
    }  catch (err) {
        res.status(500).json({ error: err.message })
    }
 })