import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from 'src/services/config.service';

@Controller('config')
@ApiTags('Config')
export class ConfigController {
    constructor(private configService: ConfigService) {}

    @Get('')
    getEnums() {
        return this.configService.getEnums();
    }
}
