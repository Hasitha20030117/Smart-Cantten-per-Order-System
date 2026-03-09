// /mailtrap/mailtrap.config.js  (ESM)
import nodemailer from "nodemailer";
import 'dotenv/config';
const isProd = process.env.NODE_ENV === "production";

// In dev we use Mailtrap **Testing (Sandbox)** so emails are captured in Mailtrap UI.
// In prod, point to your real SMTP (Mailtrap Email Sending or any provider).
export const transporter = nodemailer.createTransport(
  isProd
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      }
    : {
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: { user: process.env.MT_TEST_USER, pass: process.env.MT_TEST_PASS },
      }
);

// Single source of truth for the From header
export const FROM = {
  name: process.env.MAIL_FROM_NAME || "Yong SMART",
  address: process.env.MAIL_FROM || "no-reply@example.test",
};

// Optional sanity check you can call on app start
export async function verifyMailer() {
  try {
    await transporter.verify();
    console.log("Mailer ready");
  } catch (e) {
    console.error("Mailer config error:", e);
  }
}
