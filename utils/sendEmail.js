const nodemailer = require("nodemailer");

const sendEmail = async (options) => {

  console.log("Sending mail to:", options.email);

  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
  });


  console.log("Mail sent:", info.messageId);
};


module.exports = sendEmail;