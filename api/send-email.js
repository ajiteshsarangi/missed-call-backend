import nodemailer from 'nodemailer';

// Serverless function handler
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { number, time } = req.body;

  // Validate input
  if (!number || !time) {
    return res.status(400).json({ message: 'Missing number or time' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your Gmail
      pass: process.env.EMAIL_PASS, // your Gmail app password
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Missed Call Alert',
    text: `You missed a call from ${number} at ${time}`,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);

    // Detailed error handling
    if (error.code === 'EAUTH') {
      return res.status(401).json({ message: 'Authentication failed. Please check your email credentials.' });
    }
    return res.status(500).json({ message: 'Failed to send email' });
  }
}
