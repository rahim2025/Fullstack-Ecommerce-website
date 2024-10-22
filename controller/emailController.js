const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

const sendEmail = asyncHandler(async (data,req, res) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html
        });
        console.log('Message sent: %s', info.messageId);
        console.log("preview url: %s",nodemailer.getTestMessageUrl(info));

});

module.exports = sendEmail;