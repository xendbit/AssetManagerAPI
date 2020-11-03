import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SetAccountBalanceRequest {
    @ApiProperty()
    @IsNumber()
    public userId: number;
    @ApiProperty()
    @IsNumber()    
    public newBalance: number;
}