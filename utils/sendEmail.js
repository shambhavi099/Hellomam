const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    console.log("Preparing email...");
    console.log("EMAIL:", process.env.EMAIL_USER);
    console.log("Sending mail to:", options.email);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
    });

    console.log("Before sendMail");

    const info = await transporter.sendMail({
      from: `"E-Commerce Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    });

    console.log("Mail sent:", info.messageId);

    return true;
  } catch (error) {

  console.log("========= EMAIL ERROR =========");

  console.log(error);

  console.log("===============================");

  throw error;

}
};

module.exports = sendEmail;