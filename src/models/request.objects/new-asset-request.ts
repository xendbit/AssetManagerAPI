import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from "class-validator";

export class NewAssetRequest {
    @IsNotEmpty()
    @ApiProperty()
    public tokenId: number;
    @IsNotEmpty()
    @ApiProperty()
    public name: string;
    @IsNotEmpty()
    @ApiProperty()
    public symbol: string;
    @IsNumber()
    @ApiProperty()
    public totalQuantity: number;
    @IsNumber()
    @ApiProperty()
    public price: number;
    @IsNotEmpty()
    @ApiProperty()
    public issuerId: number;
}