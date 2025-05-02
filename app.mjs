// api/index.js
import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
// CORS middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Service inquiry email template function
const serviceInquiryTemplate = ({
  name,
  email,
  phone,
  address,
  serviceType,
  preferredContact,
  message,
  submissionDate,
}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Service Inquiry</title>
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
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 5px;
            margin-top: 20px;
          }
          .info-section {
            margin-bottom: 15px;
            padding: 10px;
            background-color: white;
            border-radius: 3px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .label {
            font-weight: bold;
            color: #2c3e50;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
          .message-box {
            background-color: white;
            padding: 15px;
            border-left: 4px solid #2c3e50;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Service Inquiry</h1>
        </div>
        <div class="content">
          <div class="info-section">
            <p><span class="label">Name:</span> ${name}</p>
            <p><span class="label">Email:</span> ${email}</p>
            <p><span class="label">Phone:</span> ${phone}</p>
            <p><span class="label">Address:</span> ${address}</p>
            <p><span class="label">Service Type:</span> ${serviceType}</p>
            <p><span class="label">Preferred Contact:</span> ${preferredContact || "Not specified"}</p>
            <p><span class="label">Submission Date:</span> ${submissionDate}</p>
          </div>
          <div class="message-box">
            <p><span class="label">Message:</span></p>
            <p>${message}</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Garden Grove Solutions. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
};

// Root route - Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Email API is running" });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Send email endpoint
app.post("/api/email-send", async (req, res) => {
  try {
    console.log("Sending email...");
    const {
      name,
      email,
      phone,
      address,
      serviceType,
      preferredContact,
      message,
      submissionDate,
      to_email,
    } = req.body;

    // Validate request
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !serviceType ||
      !message ||
      !to_email
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Missing required fields",
        },
      });
    }

    // Create email html using template
    const html = serviceInquiryTemplate({
      name,
      email,
      phone,
      address,
      serviceType,
      preferredContact,
      message,
      submissionDate,
    });

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: process.env.TO_EMAIL || "antavius68@gmail.com",
      subject: `New Service Inquiry: ${serviceType}`,
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
