import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from 'src/services/config.service';
import { Response, ResponseUtils } from 'src/utils';

@Controller('config')
@ApiTags('Config')
export class ConfigController {
    constructor(private configService: ConfigService) {}

    @Get('')
    async getEnums(): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.configService.getEnums());
    }
}
