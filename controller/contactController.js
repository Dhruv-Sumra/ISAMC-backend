import transporter from "../config/nodemailer.js";
import userModel from "../models/userModel.js";
import sendBrevoEmail from "../utils/bervoEmail.js";

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

    await sendBrevoEmail({
      to: process.env.CONTACT_EMAIL || process.env.SENDER_EMAIL,
      subject: `Contact Form: ${subject}`,
      html: mailOptions.html,
      text: mailOptions.text
    });

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

    await sendBrevoEmail({
      to: email,
      subject: "Thank you for contacting ISAMC",
      html: confirmationMailOptions.html,
      text: confirmationMailOptions.text
    });

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

export const sendMembershipApplication = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      institute, 
      designation, 
      linkedinProfile, 
      gender, 
      dateOfBirth, 
      expertise, 
      membershipType, 
      notes,
      tierPrice,
      tierDuration,
      tierTitle
    } = req.body;

    // Get user ID from the request (assuming it's passed from frontend)
    const userId = req.user?._id || req.body.userId;

    if (!fullName || !email || !phone || !institute || !designation || !gender || !dateOfBirth || !expertise || !membershipType) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.CONTACT_EMAIL || process.env.SENDER_EMAIL,
      subject: `New Membership Application: ${membershipType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Membership Application
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Membership Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tier Title:</td>
                <td style="padding: 8px 0; color: #1f2937;">${tierTitle || membershipType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Membership Type:</td>
                <td style="padding: 8px 0; color: #1f2937;">${membershipType}</td>
              </tr>
              ${tierPrice ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Price:</td>
                <td style="padding: 8px 0; color: #1f2937;">₹${tierPrice}</td>
              </tr>
              ` : ''}
              ${tierDuration ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Duration:</td>
                <td style="padding: 8px 0; color: #1f2937;">${tierDuration}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Personal Information:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Full Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td>
                <td style="padding: 8px 0; color: #1f2937;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Gender:</td>
                <td style="padding: 8px 0; color: #1f2937;">${gender}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date of Birth:</td>
                <td style="padding: 8px 0; color: #1f2937;">${dateOfBirth}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Professional Information:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Institute:</td>
                <td style="padding: 8px 0; color: #1f2937;">${institute}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Designation:</td>
                <td style="padding: 8px 0; color: #1f2937;">${designation}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Area of Expertise:</td>
                <td style="padding: 8px 0; color: #1f2937;">${expertise}</td>
              </tr>
              ${linkedinProfile ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">LinkedIn Profile:</td>
                <td style="padding: 8px 0; color: #1f2937;"><a href="${linkedinProfile}" target="_blank">${linkedinProfile}</a></td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          ${notes ? `
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Additional Notes:</h3>
            <p style="color: #1f2937; line-height: 1.6; margin: 0;">${notes.replace(/\n/g, '<br>')}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              <strong>Application Time:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This membership application was submitted from the ISAMC website.
            </p>
          </div>
        </div>
      `,
      text: `
New Membership Application

Membership Details:
- Tier Title: ${tierTitle || membershipType}
- Membership Type: ${membershipType}
${tierPrice ? `- Price: ₹${tierPrice}` : ''}
${tierDuration ? `- Duration: ${tierDuration}` : ''}

Personal Information:
- Full Name: ${fullName}
- Email: ${email}
- Phone: ${phone}
- Gender: ${gender}
- Date of Birth: ${dateOfBirth}

Professional Information:
- Institute: ${institute}
- Designation: ${designation}
- Area of Expertise: ${expertise}
${linkedinProfile ? `- LinkedIn Profile: ${linkedinProfile}` : ''}

${notes ? `Additional Notes: ${notes}` : ''}

Application Time: ${new Date().toLocaleString()}

This membership application was submitted from the ISAMC website.
      `
    };

    await sendBrevoEmail({
      to: process.env.CONTACT_EMAIL || process.env.SENDER_EMAIL,
      subject: `New Membership Application: ${membershipType}`,
      html: mailOptions.html,
      text: mailOptions.text
    });

    const confirmationMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Thank you for your ISAMC membership application",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Thank you for your ISAMC membership application
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1f2937; line-height: 1.6; margin: 0;">
              Dear ${fullName},
            </p>
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              Thank you for submitting your membership application for <strong>${tierTitle || membershipType}</strong>. We have received your application and will review it carefully.
            </p>
            ${tierPrice && tierDuration ? `
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb;">
              <p style="color: #1e40af; margin: 0; font-weight: 600;">Application Details:</p>
              <p style="color: #1e293b; margin: 5px 0;">Price: ₹${tierPrice}</p>
              <p style="color: #1e293b; margin: 5px 0;">Duration: ${tierDuration}</p>
            </div>
            ` : ''}
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              Our team will contact you within 3-5 business days regarding the status of your application and next steps.
            </p>
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              If you have any questions in the meantime, please don't hesitate to contact us.
            </p>
            <p style="color: #1f2937; line-height: 1.6; margin: 10px 0;">
              Best regards,<br>
              The ISAMC Team
            </p>
          </div>
        </div>
      `,
      text: `
Thank you for your ISAMC membership application

Dear ${fullName},

Thank you for submitting your membership application for ${tierTitle || membershipType}. We have received your application and will review it carefully.
${tierPrice && tierDuration ? `
Application Details:
- Price: ₹${tierPrice}
- Duration: ${tierDuration}
` : ''}

Our team will contact you within 3-5 business days regarding the status of your application and next steps.

If you have any questions in the meantime, please don't hesitate to contact us.

Best regards,
The ISAMC Team
      `
    };

    await sendBrevoEmail({
      to: email,
      subject: "Thank you for your ISAMC membership application",
      html: confirmationMailOptions.html,
      text: confirmationMailOptions.text
    });

    // Update user profile with form data if user is authenticated
    if (userId) {
      try {
        const updateData = {
          name: fullName,
          contact: phone,
          institute: institute,
          designation: designation,
          gender: gender,
          dateOfBirth: dateOfBirth,
          expertise: expertise
        };

        // Add LinkedIn profile if provided
        if (linkedinProfile) {
          updateData.linkedinProfile = linkedinProfile;
        }

        // Add bio if expertise is provided
        if (expertise) {
          updateData.bio = expertise;
        }

        await userModel.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true, runValidators: true }
        );

        console.log('User profile updated successfully with membership form data');
      } catch (profileError) {
        console.error('Error updating user profile:', profileError);
        // Don't fail the entire request if profile update fails
      }
    }

    return res.json({
      success: true,
      message: "Membership application submitted successfully! We'll contact you within 3-5 business days."
    });

  } catch (error) {
    console.error("Membership application error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit application. Please try again later."
    });
  }
};