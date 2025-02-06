const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, text, attachments) => {
  try {
    await transporter.sendMail({
      from: process.env.COMPANY_EMAIL,
      to,
      subject,
      text,
      attachments,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
