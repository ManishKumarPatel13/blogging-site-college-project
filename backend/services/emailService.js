/**
 * Email Service
 * 
 * Handles sending emails for password reset and other notifications.
 * Uses Nodemailer with configurable SMTP settings.
 * 
 * @module services/emailService
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * Supports Gmail, custom SMTP, or other providers
 */
const createTransporter = () => {
  // Check if email configuration exists
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email configuration not found. Email service will be disabled.');
    return null;
  }

  // Configure based on provider
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // For Gmail, use App Password
    },
  };

  return nodemailer.createTransport(config);
};

let transporter = null;

/**
 * Initialize the email transporter
 */
const initTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Send password reset email
 * 
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name for personalization
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordResetEmail = async (to, resetToken, userName = 'User') => {
  const emailTransporter = initTransporter();
  
  if (!emailTransporter) {
    console.error('Email transporter not configured');
    return false;
  }

  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendURL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"BlogAI" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request - BlogAI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">BlogAI</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin-top: 8px;">Password Reset Request</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${userName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #6366f1;">
              ${resetLink}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                ⏰ This link will expire in <strong>1 hour</strong>.
              </p>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 8px;">
                If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} BlogAI. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${userName},
      
      We received a request to reset your password.
      
      Click the link below to reset your password:
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email.
      
      - BlogAI Team
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>}
 */
const verifyEmailConfig = async () => {
  const emailTransporter = initTransporter();
  
  if (!emailTransporter) {
    return false;
  }

  try {
    await emailTransporter.verify();
    console.log('Email service configured successfully');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  verifyEmailConfig,
};
