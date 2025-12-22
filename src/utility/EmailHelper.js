const nodemailer = require("nodemailer");

const GMAIL_USER = "rahat.ahmed.jobu@g.bracu.ac.bd";
const GMAIL_APP_PASSWORD = "xjsdibclguvgjcux";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,          // 🔴 CHANGE: use 587 instead of 465
    secure: false,      // 🔴 required for 587
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
    family: 4, // force IPv4 (important on Render)
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
});

async function EmailSend(EmailTo, EmailText, EmailSubject) {
    try {
        const info = await transporter.sendMail({
            from: `MERN Ecommerce <${GMAIL_USER}>`,
            to: EmailTo,
            subject: EmailSubject,
            text: EmailText,
        });

        console.log("Email sent:", info.messageId);
        return true;
    } catch (error) {
        console.error("Email error:", error.message);
        return false;
    }
}

module.exports = EmailSend;