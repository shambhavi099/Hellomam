const nodemailer = require("nodemailer");


const sendEmail = async (options) => {

  try {

    const transporter = nodemailer.createTransport({

      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

    });



    await transporter.sendMail({

      from: `"HelloMaam" <${process.env.EMAIL_USER}>`,

      to: options.email,

      subject: options.subject,

      text: options.message,

    });



    console.log("Email sent successfully");


  } catch (error) {

    console.log("Email error:", error.message);

    throw error;

  }

};


module.exports = sendEmail;