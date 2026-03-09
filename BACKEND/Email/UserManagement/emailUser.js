
import { VERIFICATION_EMAIL_TEMPLATE,
         PASSWORD_RESET_REQUEST_TEMPLATE,
         PASSWORD_RESET_SUCCESS_TEMPLATE,
        WELCOME_EMAIL_TEMPLATE } from "./emailTemplatesUser.js";
import { transporter, FROM } from "./email.config.js";

// 1) Verification code email
export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      text: `Your verification code is ${verificationToken}. It expires in 15 minutes.`,
      headers: { "X-Category": "Email Verification" },
    });
    console.log("Verification email queued");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error.message || error}`);
  }
};

// 2) Welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  const name = firstName || "there";
  const html = WELCOME_EMAIL_TEMPLATE.replace("{firstName}",firstName);
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Welcome aboard!",
      html,
      text: `Hi ${name}, your account is ready. Thanks for joining us!`,
      headers: { "X-Category": "Welcome" },
    });
    console.log("Welcome email queued");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error.message || error}`);
  }
};

// 3) Password reset request (link)
export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      text: `Reset your password using this link: ${resetURL} (expires in 1 hour)`,
      headers: { "X-Category": "Password Reset" },
    });
    console.log("Password reset email queued");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error.message || error}`);
  }
};

// 4) Password reset success
export const sendResetSuccessEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      text: "Your password was reset successfully. If this wasn’t you, contact support immediately.",
      headers: { "X-Category": "Password Reset" },
    });
    console.log("Password reset success email queued");
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw new Error(`Error sending password reset success email: ${error.message || error}`);
  }
};
