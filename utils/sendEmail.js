const SibApiV3Sdk = require("@getbrevo/brevo");


const sendEmail = async (options) => {

  try {

    console.log("Brevo API init");
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    apiInstance.authentications.apiKey.apiKey =
      process.env.BREVO_API_KEY;
    const sendSmtpEmail =
      new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: "HelloMaam",
      email: process.env.EMAIL_FROM,
    };
    sendSmtpEmail.to = [
      {
        email: options.email,
      },
    ];

    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.textContent = options.message;
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully");
  } catch (error) {
    console.log(
      "BREVO API ERROR:",
      error.message
    );
    throw error;
  }
};

module.exports = sendEmail;