import nodemailer from 'nodemailer';
import { config } from './env.js';

let transporter;

export const initEmailTransporter = async () => {
  if (config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else {
    // Generate test SMTP service if ethereal credentials not set
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email] Ethereal test mailer initialized: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Email] Could not create test account, falling back to console logger:', err.message);
      transporter = null;
    }
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      await initEmailTransporter();
    }
    if (transporter) {
      const info = await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log(`[Email Preview URL]: ${preview}`);
      return info;
    } else {
      console.log(`[Mock Email to ${to}] Subject: "${subject}"\n${text || html}`);
      return { messageId: 'mock-id' };
    }
  } catch (error) {
    console.error(`[Email Error]:`, error.message);
    return null;
  }
};
