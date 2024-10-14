const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
const JWT_SECRET = "swayamisagiidboy";

app.use(express.json()); // Middleware to parse JSON request bodies

// Serve static files from the "public" directory
app.use(express.static("public")); // This line serves CSS, JS, images, etc.

// In-memory user store (for simplicity)
const users = [];

// Logger middleware for logging requests
function logger(req, res, next) {
  console.log(`Request made: ${req.method} ${req.url}`);
  next();
}

// Authentication middleware
function auth(req, res, next) {
  const token = req.headers.token; // Extract the token from headers
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET); // Verify the token
    req.username = decodedToken.username; // Attach username to request
    next(); // Proceed to next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Serve the login.html file by default at the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html")); // Serve the combined login and signup HTML
});

// Signup Route
app.post("/signup", logger, (req, res) => {
  // Change route to /signup
  const { username, password } = req.body;

  // Check if user already exists
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Add user to the in-memory user list
  users.push({ username, password });

  return res.status(201).json({ message: "Signup successful!" });
});

// Signin Route
app.post("/signin", logger, (req, res) => {
  // Use /signin for login
  const { username, password } = req.body;

  // Find user by username and password
  const foundUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!foundUser) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create JWT token with the username
  const token = jwt.sign({ username: foundUser.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  // Send the token back in the response
  return res.json({ token });
});

app.get("/todo.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "todo.html")); // Serve todo.html
});


// Protected Route to fetch user details (only accessible with valid token)
app.get("/me", logger, auth, (req, res) => {
  const foundUser = users.find((user) => user.username === req.username);

  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({
    username: foundUser.username,
    password: foundUser.password, // Normally, passwords should not be sent back, even in protected routes
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
