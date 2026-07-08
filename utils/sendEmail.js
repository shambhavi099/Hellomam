const nodemailer = require("nodemailer");


const sendEmail = async (options) => {

  try {

    console.log("Entered sendEmail");

    const transporter = nodemailer.createTransport({

      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

    });


    console.log("Transport created");


    await transporter.sendMail({

      from: `"HelloMaam" <${process.env.EMAIL_USER}>`,

      to: options.email,

      subject: options.subject,

      text: options.message,

    });


    console.log("Email sent");


  } catch (error) {

    console.log("BREVO ERROR:", error.message);

    throw error;

  }

};


module.exports = sendEmail;