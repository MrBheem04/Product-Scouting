const nodemailer = require('nodemailer');

// Set up mock/real mail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || 'ethereal_user',
    pass: process.env.EMAIL_PASS || 'ethereal_pass',
  },
});

/**
 * Dispatches an email alert to the user when a price drop is caught.
 * @param {string} email - User email
 * @param {object} product - Product details
 * @param {number} targetPrice - User's set threshold price
 * @param {number} currentPrice - New scraped lower price
 */
const sendPriceDropEmail = async (email, product, targetPrice, currentPrice) => {
  const savings = product.originalPrice - currentPrice;
  const storeFormatted = product.store.charAt(0).toUpperCase() + product.store.slice(1);
  
  const mailOptions = {
    from: '"ScoutPrice Alerts" <alerts@scoutprice.com>',
    to: email,
    subject: `🚨 Price Drop Alert: ${product.title} has dropped to INR ${currentPrice}!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #8B5CF6;">
          <h1 style="color: #7C3AED; margin: 0; font-size: 26px;">ScoutPrice</h1>
          <p style="color: #6B7280; font-size: 14px; margin: 5px 0 0 0;">AI-Powered Smart Shopping Assistant</p>
        </div>
        <div style="padding: 25px 0;">
          <h2 style="color: #1F2937; margin-top: 0;">Amazing News! 🎉</h2>
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
            A product on your watch list has hit a new low and dropped below your target price of <strong>INR ${targetPrice}</strong>!
          </p>
          
          <div style="display: flex; background: #F5F3FF; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
            <img src="${product.image}" alt="${product.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; margin-right: 15px;" />
            <div>
              <h3 style="color: #1F2937; margin: 0 0 5px 0; font-size: 16px;">${product.title}</h3>
              <p style="color: #6B7280; margin: 0 0 5px 0; font-size: 13px;">Store: <strong>${storeFormatted}</strong></p>
              <div style="display: flex; gap: 10px; align-items: baseline;">
                <span style="color: #EF4444; font-weight: bold; font-size: 18px;">INR ${currentPrice}</span>
                <span style="color: #9CA3AF; text-decoration: line-through; font-size: 14px; margin-left: 8px;">INR ${product.originalPrice}</span>
                <span style="color: #10B981; font-weight: 600; font-size: 13px; margin-left: 8px;">(${product.discountPercent}% Off)</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${product.originalUrl}" style="background-color: #7C3AED; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.4);">
              Buy on ${storeFormatted} Now
            </a>
          </div>
        </div>
        <div style="text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 12px; color: #9CA3AF;">
          You received this email because you registered a Price Drop Alert on ScoutPrice.com.<br/>
          To manage your notifications, log in to your <a href="http://localhost:5173/dashboard" style="color: #7C3AED;">ScoutPrice Dashboard</a>.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Notification Service] Email successfully sent to ${email}. MessageId: ${info.messageId}`);
    // Ethereal mock logging url
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Notification Service] Ethereal Email Preview URL: ${previewUrl}`);
    }
    return true;
  } catch (err) {
    console.error(`[Notification Service] Failed to dispatch email alert: ${err.message}`);
    // Print mock log
    console.log(`
=========================================
[MOCK EMAIL DISPATCHED]
To: ${email}
Subject: ${mailOptions.subject}
Message: Price threshold reached for ${product.title}. Price is now INR ${currentPrice}.
=========================================
    `);
    return false;
  }
};

/**
 * Push notifications dummy trigger (Firebase)
 */
const sendPushNotification = async (deviceToken, product, currentPrice) => {
  console.log(`[Notification Service] Dispatching Push Alert to FCM Token ${deviceToken.slice(0, 10)}...: "${product.title} is now ${currentPrice}!"`);
  return true;
};

module.exports = {
  sendPriceDropEmail,
  sendPushNotification
};
