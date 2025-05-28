# Email Setup Guide for Password Reset

This guide will help you configure the email service for the password reset functionality in your Inventory Management System.

## 1. Email Configuration in the Backend

You need to add email credentials to the backend `.env` file. If you don't have this file already, create it in the `backend` directory.

### Step 1: Create or Edit `.env` File

Create or edit the `.env` file in your `backend` directory and add the following:

```
# Email configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Replace `your_email@gmail.com` with your actual email address and `your_app_password` with your email password or app password.

## 2. Using Gmail for Sending Emails

If you're using Gmail, you'll need to either:

### Option A: Use App Passwords (Recommended)

1. Enable 2-Step Verification for your Google account
   - Go to your Google Account > Security > 2-Step Verification
   - Follow the steps to turn it on

2. Create an App Password
   - Go to your Google Account > Security > App passwords
   - Select "Mail" and "Other (Custom name)" 
   - Name it "Inventory Management System"
   - Google will generate a 16-character password
   - Use this password as `EMAIL_PASSWORD` in your `.env` file

### Option B: Allow Less Secure Apps (Not recommended)

If you can't use App Passwords:
1. Go to [Less secure app access](https://myaccount.google.com/lesssecureapps)
2. Turn on "Allow less secure apps"

**Note**: This is less secure and Google may block sign-in attempts.

## 3. Testing the Setup

1. Restart your backend server after making these changes
2. Try the "Forgot Password" functionality with a valid email
3. Check the backend console logs to see if emails are being sent successfully

## 4. Using Other Email Providers

If you want to use a different email provider:

1. Open `backend/controllers/userController.js`
2. Modify the Nodemailer transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## 5. Troubleshooting

If emails aren't being sent:

1. Check the backend console for error messages
2. Verify your email credentials are correct
3. If using Gmail, make sure you've set up App Passwords or Less Secure Apps correctly
4. Check if your email provider is blocking automated emails
5. Try a different email service

## 6. Email Template Customization

You can customize the email template by editing the HTML in the `sendPasswordResetEmail` function in `backend/controllers/userController.js`. 