import transporter from '../config/nodemailer.js';

export const submitPaper = async (req, res) => {
  try {
    const { name, email, title } = req.body;
    const file = req.file;
    if (!name || !email || !title || !file) {
      return res.json({ success: false, message: 'All fields are required.' });
    }

    const mailOptions = {
      to: process.env.SENDER_EMAIL, // send to yourself
      subject: `New Paper Submission: ${title}`,
      text: `Name: ${name}\nEmail: ${email}\nTitle: ${title}`,
      // Brevo API does not support attachments in the free plan, so skip attachments if not on paid plan
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Paper submitted successfully!' });
  } catch (err) {
    console.error('Paper submission error:', err);
    res.json({ success: false, message: err.message || 'Failed to submit paper.' });
  }
}; 