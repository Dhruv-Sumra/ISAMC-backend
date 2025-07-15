import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendBrevoEmail = async ({ to, subject, html, text }) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME || 'ISAMC Team'
  };

  const receivers = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];

  const sendSmtpEmail = {
    sender,
    to: receivers,
    subject,
    htmlContent: html,
    textContent: text,
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return data;
  } catch (error) {
    console.error('Brevo email error:', error);
    throw error;
  }
};

export default sendBrevoEmail;
