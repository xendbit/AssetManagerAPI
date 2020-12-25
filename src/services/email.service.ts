import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    constructor(private readonly mailerService: MailerService) {}

    async sendPasswordResetToken(token: string, to: string) {
        let content = readFileSync('/etc/xendart/password_reset_token.html', 'utf8');                        
        content = content.replace("#token", token).replace("#time", process.env.RESET_TOKEN_EXPIRY);
        this.logger.debug(content);
        const subjectLine = "Password Reset Token";
        await this.sendEmail(to, subjectLine, content, [])
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
