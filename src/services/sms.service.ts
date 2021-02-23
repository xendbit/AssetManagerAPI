import { Injectable, Logger } from '@nestjs/common';
const AIS = require('africastalking');

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);

    private AfricasTalking;

    constructor() {
        const user = process.env.SMS_SERVICE_USER;
        const apiKey = process.env.SMS_SERVICE_API_KEY;

        const credentials = {
            apiKey: apiKey,
            username: user,
        }
        
        this.AfricasTalking = AIS(credentials);

        // this.sendSMS('+2348089370313', 'Hello World, this is a long as SMS, not 11 characters. Let us see what will happen now');
    }

    async sendSMS(phoneNumber: string, message: string): Promise<string> {
        try {
            const url = process.env.SMS_SERVICE_URL;
            const sms = this.AfricasTalking.SMS;

            const options = {
                // Set the numbers you want to send to in international format
                to: [phoneNumber],
                // Set your message
                message: message,
            }

            sms.send(options).then(console.log).catch(e => { throw (e) });

            return "Success";
        } catch (error) {
            throw (error);
        }
    }
}
