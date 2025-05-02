// app.js
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import emailRouter from "./routes/email.mjs";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Email API is running" });
});

// Routes
app.use("/api/email", emailRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || "Something went wrong",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
