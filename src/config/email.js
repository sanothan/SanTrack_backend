const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify((error, success) => {
        if (error) {
            console.error("Nodemailer connection error:", error);
        } else {
            console.log("Nodemailer transporter is ready");
        }
    });
} else {
    console.warn("Nodemailer credentials missing. Email service will be disabled.");
}

module.exports = transporter;
