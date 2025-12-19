const nodemailer = require('nodemailer');

const GMAIL_USER = 'rahat.ahmed.jobu@g.bracu.ac.bd';
const GMAIL_APP_PASSWORD = 'xjsdibclguvgjcux'; // 16-character Gmail App Password

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    },
    family: 4, // optional, force IPv4
});
//hello
async function EmailSend(EmailTo, EmailText, EmailSubject) {
    try {

        await transporter.verify();

        const mailOptions = {
            from: `MERN Ecommerce <${GMAIL_USER}>`,
            to: EmailTo,
            subject: EmailSubject,
            text: EmailText,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = EmailSend;

