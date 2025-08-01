// backend/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv    from 'dotenv';

dotenv.config();

// configure SMTP transporter (e.g. Gmail, SendGrid SMTP, etc.)
const transporter = nodemailer.createTransport({
  host:     process.env.EMAIL_HOST,
  port:     Number(process.env.EMAIL_PORT),
  secure:   process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send a generic email.
 * @param {{to:string,subject:string,text?:string,html?:string}} opts
 */
export async function sendEmail({ to, subject, text, html }) {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
}

/**
 * Send a verification / welcome email with a link containing a token.
 * @param {{to:string,name:string,token:string}} opts
 */
export async function sendVerificationEmail({ to, name, token }) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  const subject   = 'Please verify your email';
  const html = `
    <p>Hi ${name},</p>
    <p>Thanks for registering! Please <a href="${verifyUrl}">click here to verify your email</a>.</p>
  `;
  await sendEmail({ to, subject, html });
}

/**
 * Send a password-reset email.
 * @param {{to:string,name:string,token:string}} opts
 */
export async function sendResetPasswordEmail({ to, name, token }) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const subject  = 'Reset your password';
  const html = `
    <p>Hi ${name},</p>
    <p>You requested a password reset. <a href="${resetUrl}">Click here to reset your password</a>.</p>
  `;
  await sendEmail({ to, subject, html });
}
