const nodemailer = require("nodemailer");

const GMAIL_USER = "rahat.ahmed.jobu@g.bracu.ac.bd";
const GMAIL_APP_PASSWORD = "xjsdibclguvgjcux";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
    requireTLS: true,
    family: 4, // force IPv4
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

/**
 * Send OTP Email
 * @returns {boolean}
 */
async function EmailSend(EmailTo, EmailText, EmailSubject) {
    try {
        console.log("📧 Attempting to send email to:", EmailTo);

        const info = await transporter.sendMail({
            from: `"MERN Ecommerce" <${GMAIL_USER}>`,
            to: EmailTo,
            subject: EmailSubject,
            text: EmailText,
        });

        console.log("✅ Email accepted by transporter");
        console.log("MessageId:", info.messageId);
        console.log("Response:", info.response);

        // Gmail MUST return accepted recipients
        if (!info.accepted || info.accepted.length === 0) {
            console.error("❌ Email NOT accepted by Gmail");
            return false;
        }

        return true;
    } catch (error) {
        console.error("❌ Email send failed");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Response:", error.response);
        return false;
    }
}

module.exports = EmailSend;