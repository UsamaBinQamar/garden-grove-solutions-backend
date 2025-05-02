// api/index.js
import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic email template function
const basicEmailTemplate = ({ name, message }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
          }
          .content {
            padding: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hello, ${name}!</h1>
        </div>
        <div class="content">
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
};

// Root route - Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Email API is running" });
});

// Send email endpoint
app.post("/api/email-send", async (req, res) => {
  try {
    const { to, subject, name, message } = req.body;

    // Validate request
    if (!to || !subject || !name || !message) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Missing required fields: to, subject, name, message",
        },
      });
    }

    // Create email html using template
    const html = basicEmailTemplate({
      name,
      message,
    });

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to send email",
      },
    });
  }
});

// This is crucial for Vercel serverless deployment
export default app;
