const dns = require("dns");
const nodemailer = require("nodemailer");
const axios = require("axios");

// Force IPv4 first to prevent ENETUNREACH on cloud providers like Render that do not support IPv6 outbound
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

let transporter = null;

const initTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, "");
        const cleanUser = process.env.EMAIL_USER.trim();

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
            auth: {
                user: cleanUser,
                pass: cleanPass
            },
            family: 4, // Force IPv4
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });
    }
};

initTransporter();

/**
 * Send email via Resend HTTPS REST API (Port 443 — NEVER blocked by Render or cloud firewalls)
 */
const sendViaResend = async (to, subject, text, html) => {
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (!resendKey) return null;

    try {
        const fromEmail = process.env.RESEND_FROM?.trim() || "SyncForge <onboarding@resend.dev>";
        const response = await axios.post(
            "https://api.resend.com/emails",
            {
                from: fromEmail,
                to: [to.trim()],
                subject: subject.trim(),
                text: text,
                ...(html ? { html } : {})
            },
            {
                headers: {
                    Authorization: `Bearer ${resendKey}`,
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }
        );
        console.log(`✅ [RESEND HTTPS API] Email delivered successfully to ${to} (ID: ${response.data?.id})`);
        return { success: true, messageId: response.data?.id };
    } catch (err) {
        console.error(`⚠️ [RESEND HTTPS ERROR]:`, err.response?.data || err.message);
        return { success: false, error: err.response?.data?.message || err.message };
    }
};

/**
 * Send email via Brevo HTTPS REST API (Port 443 — NEVER blocked by Render)
 */
const sendViaBrevo = async (to, subject, text, html) => {
    const brevoKey = process.env.BREVO_API_KEY?.trim();
    if (!brevoKey) return null;

    try {
        const senderEmail = process.env.EMAIL_USER?.trim() || "support@syncforge.dev";
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: { name: "SyncForge Support", email: senderEmail },
                to: [{ email: to.trim() }],
                subject: subject.trim(),
                textContent: text,
                ...(html ? { htmlContent: html } : {})
            },
            {
                headers: {
                    "api-key": brevoKey,
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }
        );
        console.log(`✅ [BREVO HTTPS API] Email delivered successfully to ${to} (Message ID: ${response.data?.messageId})`);
        return { success: true, messageId: response.data?.messageId };
    } catch (err) {
        console.error(`⚠️ [BREVO HTTPS ERROR]:`, err.response?.data || err.message);
        return { success: false, error: err.response?.data?.message || err.message };
    }
};

const sendEmail = async (to, subject, text, html = null) => {
    console.log(`\n==================================================`);
    console.log(`📧 [EMAIL DISPATCH] To: ${to}`);
    console.log(`📋 [SUBJECT]: ${subject}`);
    console.log(`📝 [CONTENT]:\n${text}`);
    console.log(`==================================================\n`);

    // 1. Try Resend HTTPS API if RESEND_API_KEY is present (Port 443, 100% reliable on Render)
    if (process.env.RESEND_API_KEY) {
        const resendResult = await sendViaResend(to, subject, text, html);
        if (resendResult && resendResult.success) return resendResult;
    }

    // 2. Try Brevo HTTPS API if BREVO_API_KEY is present
    if (process.env.BREVO_API_KEY) {
        const brevoResult = await sendViaBrevo(to, subject, text, html);
        if (brevoResult && brevoResult.success) return brevoResult;
    }

    // 3. Fallback to Nodemailer SMTP
    if (!transporter) {
        initTransporter();
    }

    if (!transporter) {
        console.warn(`[EMAIL NOTICE] EMAIL_USER / EMAIL_PASS not configured in environment.`);
        return { success: false, simulated: true, messageId: "simulated-" + Date.now() };
    }

    try {
        const cleanUser = process.env.EMAIL_USER.trim();
        const mailOptions = {
            from: `"SyncForge Support" <${cleanUser}>`,
            to: to.trim(),
            subject: subject.trim(),
            text: text,
            ...(html ? { html } : {})
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email delivered successfully to ${to} (Message ID: ${info.messageId})`);
        return { success: true, ...info };
    } catch (err) {
        console.error(`⚠️ Email delivery failed for ${to}:`, err.message);
        return { success: false, error: err.message };
    }
};

module.exports = sendEmail;