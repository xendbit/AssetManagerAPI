import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { AES } from 'crypto-js';
import { readFileSync } from 'fs';
import { User } from 'src/models/user.model';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    constructor(private readonly mailerService: MailerService) {}

    async sendPasswordResetToken(token: string, to: string) {
        let content = readFileSync('src/etc/password_reset_token.html', 'utf8');                        
        content = content.replace("#token", token).replace("#time", process.env.RESET_TOKEN_EXPIRY);
        this.logger.debug(content);
        const subjectLine = "Password Reset Token";
        await this.sendEmail(to, subjectLine, content, [])
    }

    async sendConfirmationEmail(dbUser: User) {
        let content = readFileSync('src/etc/confirmation_email.html', 'utf8');
        const link =  process.env.EMAIL_CONFIRMATION_URL + "/" + Buffer.from(AES.encrypt(dbUser.email, process.env.KEY).toString()).toString('base64');
        const name = `${dbUser.firstName} ${dbUser.middleName} ${dbUser.lastName}`;
        content = content.replace("#link", link).replace("#name", name).replace('#link', link);
        this.logger.debug(content);

        const subjectLine = "Congratulations: Welcome to NSE Art Exchange";
        await this.sendEmail(dbUser.email, subjectLine, content, [])
    }


    async sendEmail(to: string, subject: string, content: string, cc: string[]) {
        await this.mailerService.sendMail({
          to: to,
          cc: cc,
          from: process.env.MAIL_USER,
          subject: subject,
          text: content,
          html: content
        });  
    }    
}
