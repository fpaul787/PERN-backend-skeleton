// imports
const express = require("express");

const app = express();

// Middleware
app.use(express.json({ extended: false }));
app.get("/", (req, res) => res.send("API Running"));

// Define Routes
app.use("/api/users", require("./routes/api/users.routes"));
app.use("/api/auth", require("./routes/api/auth.routes"));

// specify port
const PORT = process.env.PORT || 5000;

// Binds and listens for connections on the specified host and port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
