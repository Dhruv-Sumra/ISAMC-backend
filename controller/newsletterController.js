import Subscriber from '../models/subscriberModel.js';
import Newsletter from '../models/newsletterModel.js';
import sendCpanelEmail from '../utils/cpanelEmail.js';

// Subscribe to newsletter
export const subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ success: false, message: 'You are already subscribed' });
    }
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    res.status(201).json({ success: true, message: 'Subscription successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create and send a newsletter
export const sendNewsletter = async (req, res) => {
  const { subject, content } = req.body;
  if (!subject || !content) {
    return res.status(400).json({ success: false, message: 'Subject and content are required' });
  }
  try {
    const subscribers = await Subscriber.find({ isSubscribed: true });
    if (subscribers.length === 0) {
      return res.status(404).json({ success: false, message: 'No subscribers found' });
    }

    const newNewsletter = new Newsletter({ subject, content });
    await newNewsletter.save();

    const emails = subscribers.map(s => s.email);
    
    // Send emails individually to avoid bulk email issues
    for (const email of emails) {
      try {
        await sendCpanelEmail({
          to: email,
          subject: subject,
          html: content,
          text: content.replace(/<[^>]*>/g, '') // Strip HTML for text version
        });
      } catch (emailError) {
        console.error(`Failed to send newsletter to ${email}:`, emailError);
        // Continue with other emails even if one fails
      }
    }

    newNewsletter.isSent = true;
    newNewsletter.sentAt = new Date();
    await newNewsletter.save();

    res.status(200).json({ success: true, message: 'Newsletter sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send newsletter' });
  }
}; 