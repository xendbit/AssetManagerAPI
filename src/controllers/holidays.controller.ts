import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Holiday } from 'src/models/holidays.model';
import { HolidaysService } from 'src/services/holidays.service';
import { Response, ResponseUtils } from 'src/utils';

@Controller('/holidays')
@ApiTags('admin')
export class HolidaysController {
    constructor(private holidayService: HolidaysService) {}

    @Get('')
    async getHolidays(): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.holidayService.getHolidays());
    }

    @Get(':id')
    async getHoliday(@Param("id") id: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.holidayService.getHoliday(id));
    }

    @Post('')
    @Roles('admin')
    @ApiSecurity('api-key')
    async saveHoliday(@Body() holiday: Holiday): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.holidayService.saveHoliday(holiday));
    }
}
