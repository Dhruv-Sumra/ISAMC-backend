import transporter from "../config/nodemailer.js";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    if (mobile && mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number"
      });
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.CONTACT_EMAIL || process.env.SENDER_EMAIL, // Send to contact email or fallback to sender email
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Contact Details:</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${email}</td>
              </tr>
              ${mobile ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Mobile:</td>
                <td style="padding: 8px 0; color: #1f2937;">${mobile}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td>
                <td style="padding: 8px 0; color: #1f2937;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Message:</h3>
            <p style="color: #1f2937; line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              <strong>Submission Time:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This message was sent from the ISAMC website contact form.
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Contact Details:
- Name: ${name}
- Email: ${email}
${mobile ? `- Mobile: ${mobile}` : ''}
- Subject: ${subject}

Message:
${message}

Submission Time: ${new Date().toLocaleString()}

This message was sent from the ISAMC website contact form.
      `
    };

    await transporter.sendMail(mailOptions);

    const confirmationMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Thank you for contacting ISAMC",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Thank you for contacting ISAMC
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1f2937; line-height: 1.6; margin: 0;">
              Dear ${name},
            </p>
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.
            </p>
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              <strong>Your message details:</strong><br>
              Subject: ${subject}<br>
              Message: ${message}
            </p>
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              We appreciate your interest in ISAMC and look forward to assisting you.
            </p>
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              Best regards,<br>
              The ISAMC Team
            </p>
          </div>
        </div>
      `,
      text: `
Thank you for contacting ISAMC

Dear ${name},

Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.

Your message details:
Subject: ${subject}
Message: ${message}

We appreciate your interest in ISAMC and look forward to assisting you.

Best regards,
The ISAMC Team
      `
    };

    await transporter.sendMail(confirmationMailOptions);

    return res.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon."
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later."
    });
  }
}; 