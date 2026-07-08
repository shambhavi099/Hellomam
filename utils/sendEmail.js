const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");


const sendEmail = async (options) => {

  try {

    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 20000,

    });


    const info = await transporter.sendMail({

      from: `"HelloMaam" <${process.env.EMAIL_USER}>`,

      to: options.email,

      subject: options.subject,

      text: options.message,

    });


    console.log("Mail sent:", info.messageId);


  } catch(error){

    console.log("Email Error:", error);

    throw error;

  }

};


module.exports = sendEmail;