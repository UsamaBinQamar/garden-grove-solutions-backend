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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 650px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f7fa;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 30px;
          }
          .info-section {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
          }
          .info-row {
            display: flex;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e9ecef;
          }
          .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .label {
            font-weight: 600;
            color: #2c3e50;
            width: 140px;
            flex-shrink: 0;
          }
          .value {
            color: #34495e;
            flex-grow: 1;
          }
          .message-box {
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 20px;
            margin-top: 20px;
            border-radius: 0 6px 6px 0;
          }
          .message-box .label {
            display: block;
            margin-bottom: 10px;
            color: #3498db;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #7f8c8d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 15px;
          }
          .service-badge {
            display: inline-block;
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 5px;
          }
          @media (max-width: 600px) {
            .info-row {
              flex-direction: column;
            }
            .label {
              width: 100%;
              margin-bottom: 5px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Service Inquiry</h1>
            <p>Garden Grove Solutions</p>
          </div>
          <div class="content">
            <div class="info-section">
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${name}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${phone}</span>
              </div>
              <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">${address}</span>
              </div>
              <div class="info-row">
                <span class="label">Service Type:</span>
                <span class="value">
                  <span class="service-badge">${serviceType}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="label">Preferred Contact:</span>
                <span class="value">${preferredContact || "Not specified"}</span>
              </div>
              <div class="info-row">
                <span class="label">Submission Date:</span>
                <span class="value">${submissionDate}</span>
              </div>
            </div>
            <div class="message-box">
              <span class="label">Message:</span>
              <p>${message}</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Garden Grove Solutions. All rights reserved.</p>
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
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
