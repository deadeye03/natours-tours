const nodemailer = require('nodemailer');
const ejs = require('ejs');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Saurabh Kumar <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // For example, you could use SendGrid or another email service
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        try {
            const html = await ejs.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
                firstName: this.firstName,
                url: this.url,
                subject
            });

            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html
            };

            await this.newTransport().sendMail(mailOptions);
        } catch (err) {
            console.error('Error sending email:', err);
        }
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Natours family!');
    }
    async sendRestPassword(){
        await this.send('passwordReset','this email is valid for only 10 minutes')
    }
};
