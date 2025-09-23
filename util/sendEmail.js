const nodemailer = require('nodemailer');

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

const to = process.env.EMAIL_TO || "default@example.com";
const subject = process.env.EMAIL_SUBJECT || "GitHub Actions Notification";
const body = process.env.EMAIL_BODY || "This is an automated email.";

async function main() {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: { user, pass }
    });

    let info = await transporter.sendMail({
        from: `"GitHub Action" <${user}>`,
        to: to,
        subject: subject,
        text: body,
    });

    console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
