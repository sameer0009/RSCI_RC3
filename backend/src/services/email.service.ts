import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'dummy',
        pass: process.env.SMTP_PASS || 'dummy',
      },
    });
  }

  async sendEmail(to: string, subject: string, templateName: string, context: any) {
    try {
      const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      const html = template(context);

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"RSCI-RC3" <noreply@rsci.rc3>',
        to,
        subject,
        html,
      });

      console.log('Message sent: %s', info.messageId);
      // Mode for dev testing: ethereal.email provides preview link
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }
}

export default new EmailService();
