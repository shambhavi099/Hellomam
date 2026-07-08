const nodemailer = require("nodemailer");


const sendEmail = async (options) => {

  try {

    console.log("Preparing email...");
    console.log("Sending mail to:", options.email);


    const transporter = nodemailer.createTransport({

      host: "smtp.gmail.com",

      port: 587,

      secure: false,

      family: 4, // force IPv4

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

    });


    console.log("Before sendMail");


    const info = await transporter.sendMail({

      from: `"HelloMaam" <${process.env.EMAIL_USER}>`,

      to: options.email,

      subject: options.subject,

      text: options.message,

    });



    console.log("Mail sent:", info.messageId);


  } catch (error) {


    console.log("Email Error:", error);

    throw error;

  }

};


module.exports = sendEmail;