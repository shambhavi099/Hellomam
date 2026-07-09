const brevo = require("@getbrevo/brevo");


const sendEmail = async (options) => {

  try {

    console.log("Brevo API init");


    const apiInstance =
      new brevo.TransactionalEmailsApi();


    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );


    await apiInstance.sendTransacEmail({

      sender: {
        name: "HelloMaam",
        email: process.env.EMAIL_FROM,
      },

      to: [
        {
          email: options.email,
        },
      ],

      subject: options.subject,

      textContent: options.message,

    });


    console.log("Brevo API email sent");


  } catch(error){

    console.log(
      "BREVO API ERROR:",
      error.message
    );

    throw error;

  }

};


module.exports = sendEmail;