import transporter from '../config/nodemailer.js';

export const submitPaper = async (req, res) => {
  try {
    const { name, email, title } = req.body;
    const file = req.file;
    
    if (!name || !email || !title || !file) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required.' 
      });
    }

    const mailOptions = {
      to: process.env.SENDER_EMAIL, // Fixed: Removed backslash
      subject: `New Paper Submission: ${title}`, // Fixed: Proper template literal
      text: `Name: ${name}\nEmail: ${email}\nTitle: ${title}`, // Fixed: Proper escape sequences
      html: `
        <h3>New Paper Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>File:</strong> ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)</p>
      `,
      // Add attachment if your email service supports it
      attachments: file ? [{
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype
      }] : []
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Paper submitted successfully!' 
    });
    
  } catch (err) {
    console.error('Paper submission error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to submit paper.' 
    });
  }
};
