import { Injectable, Logger } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);
    constructor() {
        v2.config({
            cloud_name: 'xendbit',
            api_key: '289875491748246',
            api_secret: 'tZILi09rvlogXGuTMkP7x0MrhTA'
        });
    }

    async uploadCustomerIdImage(idImage: string): Promise<string> {
        const response: UploadApiResponse = await v2.uploader.upload(idImage);
        return response.secure_url;
    }
}
