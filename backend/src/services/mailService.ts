import axios from "axios";
import ApiError from "../utils/ApiError";

const RESEND_API_URL = "https://api.resend.com/emails";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const getEmailProvider = () => (process.env.EMAIL_PROVIDER || "resend").toLowerCase();

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new ApiError(500, `${key} is not configured`);
  }
  return value;
};

const getResendErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message || error.response?.data?.error;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      if (responseMessage.includes("You can only send testing emails to your own email address")) {
        return "Resend is using its test domain, so it can only send to the account owner's email. Verify a domain in Resend and set EMAIL_FROM to that domain, or switch EMAIL_PROVIDER to brevo.";
      }

      if (
        responseMessage.toLowerCase().includes("domain") &&
        responseMessage.toLowerCase().includes("not verified")
      ) {
        return "Your email sender domain is not verified in Resend. Verify the domain that matches EMAIL_FROM, or switch EMAIL_PROVIDER to brevo.";
      }

      return responseMessage;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Email delivery failed";
};

const getBrevoErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message || error.response?.data?.code;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Email delivery failed";
};

const parseFromAddress = (from: string) => {
  const trimmed = from.trim();
  const match = trimmed.match(/^(.*)<([^>]+)>$/);

  if (!match) {
    return {
      name: undefined,
      email: trimmed,
    };
  }

  const name = match[1].trim().replace(/^"|"$/g, "");
  const email = match[2].trim();

  return {
    name: name || undefined,
    email,
  };
};

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const sendViaResend = async ({ to, subject, text, html }: EmailPayload) => {
  const apiKey = requireEnv("RESEND_API_KEY");
  const from = requireEnv("EMAIL_FROM");

  try {
    await axios.post(
      RESEND_API_URL,
      {
        from,
        to: [to],
        subject,
        text,
        ...(html ? { html } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "final-project02-backend/1.0",
        },
        timeout: 10000,
      },
    );
  } catch (error) {
    throw new ApiError(400, getResendErrorMessage(error));
  }
};

const sendViaBrevo = async ({ to, subject, text, html }: EmailPayload) => {
  const apiKey = requireEnv("BREVO_API_KEY");
  const from = parseFromAddress(requireEnv("EMAIL_FROM"));

  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: from.email,
          ...(from.name ? { name: from.name } : {}),
        },
        to: [{ email: to }],
        subject,
        textContent: text,
        ...(html ? { htmlContent: html } : {}),
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "User-Agent": "final-project02-backend/1.0",
        },
        timeout: 10000,
      },
    );
  } catch (error) {
    throw new ApiError(400, getBrevoErrorMessage(error));
  }
};

const sendEmail = async (payload: EmailPayload) => {
  const provider = getEmailProvider();

  if (provider === "resend") {
    await sendViaResend(payload);
    return;
  }

  if (provider === "brevo") {
    await sendViaBrevo(payload);
    return;
  }

  throw new ApiError(500, `Unsupported email provider: ${provider}`);
};

export const sendVerificationEmail = async (to: string, otp: string) => {
  await sendEmail({
    to,
    subject: "Your verification code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};

export const sendAdminInvitationEmail = async (
  to: string,
  {
    invitedByName,
    acceptUrl,
    declineUrl,
    loginUrl,
    signupUrl,
    expiresAt,
    message,
  }: {
    invitedByName?: string;
    acceptUrl: string;
    declineUrl: string;
    loginUrl: string;
    signupUrl: string;
    expiresAt: Date;
    message?: string;
  },
) => {
  const lines = [
    "You have been invited to become an admin on Sandysquad.",
    invitedByName ? `Invited by: ${invitedByName}` : undefined,
    message ? `Message: ${message}` : undefined,
    "Review the invitation below and choose Accept or Decline.",
    `Accept invitation: ${acceptUrl}`,
    `Decline invitation: ${declineUrl}`,
    `If you accept and already have an account, sign in here: ${loginUrl}`,
    `If you accept and need an account, sign up here: ${signupUrl}`,
    `This invite expires on ${expiresAt.toUTCString()}.`,
  ].filter(Boolean);

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin-bottom:12px;">Sandysquad Admin Invitation</h2>
      <p>You have been invited to become an admin on Sandysquad.</p>
      ${invitedByName ? `<p><strong>Invited by:</strong> ${invitedByName}</p>` : ""}
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
      <p>Please review the request and choose one option below.</p>
      <p style="margin:24px 0;">
        <a href="${acceptUrl}" style="display:inline-block;margin-right:12px;padding:12px 20px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;">Accept</a>
        <a href="${declineUrl}" style="display:inline-block;padding:12px 20px;background:#e2e8f0;color:#0f172a;text-decoration:none;border-radius:10px;font-weight:600;">Decline</a>
      </p>
      <p>If you accept and already have an account, sign in here: <a href="${loginUrl}">${loginUrl}</a></p>
      <p>If you accept and need an account, sign up here: <a href="${signupUrl}">${signupUrl}</a></p>
      <p>This invite expires on ${expiresAt.toUTCString()}.</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: "Sandysquad admin invitation",
    text: lines.join("\n\n"),
    html,
  });
};

export const sendAdminAccessGrantedEmail = async (
  to: string,
  {
    invitedByName,
    loginUrl,
    message,
  }: {
    invitedByName?: string;
    loginUrl: string;
    message?: string;
  },
) => {
  const lines = [
    "Your Sandysquad account now has admin access.",
    invitedByName ? `Granted by: ${invitedByName}` : undefined,
    message ? `Message: ${message}` : undefined,
    `Sign in here: ${loginUrl}`,
  ].filter(Boolean);

  await sendEmail({
    to,
    subject: "Sandysquad admin access granted",
    text: lines.join("\n\n"),
  });
};
