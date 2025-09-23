const nodemailer = require('nodemailer');

// Email credentials from GitHub Secrets
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

async function main() {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // or your SMTP server
        port: 465,
        secure: true,
        auth: { user, pass }
    });

    let info = await transporter.sendMail({
        from: `"GitHub Action" <${user}>`,
        to: "recipient@example.com",
        subject: "GitHub Actions Email",
        text: "Hello! This email was sent from a GitHub Action using Node.js.",
    });

    console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
