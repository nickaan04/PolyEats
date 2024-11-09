import nodemailer from 'nodemailer';

export const createMailTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'hotmail' if using Outlook
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your app password
    },
  });

  return transporter;
};
