// routes/email.js
import express from "express";
import { Resend } from "resend";
import { basicEmailTemplate } from "../templates/basic.mjs";
import dotenv from "dotenv";

// Load environment variables to ensure they're available
dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Send email endpoint
router.post("/send", async (req, res, next) => {
  try {
    console.log("Sending email...");
    console.log(resend);
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
      from: "process.env.FROM_EMAIL" || "onboarding@resend.dev",
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
    next(error);
  }
});

// Get email status by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await resend.emails.get(id);

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
    next(error);
  }
});

export default router;
