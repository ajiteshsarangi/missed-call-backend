require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Create transporter with additional configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // your Gmail app password
  },
  // Add these settings to improve reliability
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

app.post('/send-email', async (req, res) => {
  const { number, time } = req.body;

  // Validate input
  if (!number || !time) {
    return res.status(400).send('Missing number or time');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Missed Call Alert',
    text: `You missed a call from ${number} at ${time}`,
  };

  try {
    // Verify transporter connection before sending
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('Transporter verification failed:', error);
          reject(error);
        } else {
          resolve(success);
        }
      });
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    
    // More detailed error handling
    if (error.code === 'EAUTH') {
      res.status(401).send('Authentication failed. Please check your email credentials.');
    } else {
      res.status(500).send('Failed to send email');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});