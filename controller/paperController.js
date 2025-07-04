import nodemailer from 'nodemailer';

export const submitPaper = async (req, res) => {
  try {
    const { name, email, title } = req.body;
    const file = req.file;
    if (!name || !email || !title || !file) {
      return res.json({ success: false, message: 'All fields are required.' });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.SENDER_EMAIL, // send to yourself
      subject: `New Paper Submission: ${title}`,
      text: `Name: ${name}\nEmail: ${email}\nTitle: ${title}`,
      attachments: [
        {
          filename: file.originalname,
          content: file.buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Paper submitted successfully!' });
  } catch (err) {
    console.error('Paper submission error:', err);
    res.json({ success: false, message: err.message || 'Failed to submit paper.' });
  }
}; 