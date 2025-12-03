const { createClient } = require('@supabase/supabase-js');
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// load in env variables
const supabase_url = process.env.SUPABASE_URL
const supabase_key = process.env.SUPABASE_KEY
// Create a single supabase client for interacting with your database
const supabase = createClient(supabase_url, supabase_key)



app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// GET /users/profiles -> return all users as JSON
// TODO: DO A JOIN OP ON THE 2 USER TABLES LIKE BROCK SAID IN THE CORD
app.get("/users/profiles", async (req, res) => {
  try {
    const { data, error } = await supabase
    .from('user_profiles')
    .select('*, users!id(*)')
    if (error) {
      console.error("Supabase error:", error)
      return res.status(500).json({ error: error.message})
    }
    const flattened = data.map(profile => ({
      ...profile, // copies all existing fields
      username: profile.users?.username,
      email: profile.users?.email,
      users: undefined // removing nested object
    }))
    console.log("Raw data from Supabase:", data)
    console.log("Flattened data:", flattened)
    res.json(flattened)
  } catch (err){
    console.error("Erorr fetching users: ", err)
    res.status(500).json({ error: "Internal server error"})
  }
})



// // Creating a new user
// // Post /users - add new user
// app.post("/users", async (req, res) => {
//     try {
//         const { user_name, last_name, email } = req.body
//         const result = await pool.query(
//             "INSERT INTO users (user_name, last_name, email) VALUES ($1, $2, $3) RETURNING *",
//             [user_name, last_name, email]
//         )
//         res.json(result.rows[0])
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// })

// // Updating a user
// // Put /users/:id
// app.put("/users/:id", async (req, res) => {
//     try{
//         const { id } = req.params
//         const { user_name, last_name, email } = req.body
//         const result = await pool.query(
//             "UPDATE users SET user_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING *",
//             [user_name, last_name, email, id]
//         )
//         res.json(result.rows[0])
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// })

//  // DELETE /users/:id - delete user
//  app.delete("/users/:id", async (req, res) => {
//     try {
//         const { id } = req.params
//         await pool.query("DELETE FROM users where id = $1", [id])
//         res.json({ message: "User deleted successfully" })
//     }  catch (err) {
//         res.status(500).json({ error: err.message })
//     }
//  })

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;