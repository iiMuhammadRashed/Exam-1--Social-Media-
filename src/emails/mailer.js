import { createTransport } from 'nodemailer';

export const sendEmail = async (options) => {
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.NODEMAILER_EMAIL}>`,
    to: options.receiverEmail,
    subject: 'Social Media App',
    html: options.html,
  });
  console.log('Message sent: %s', info.messageId);
};
