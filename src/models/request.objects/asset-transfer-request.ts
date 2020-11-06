import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
export class AssetTransferRequest {
    @IsNotEmpty()
    @ApiProperty()
    public tokenId: number;
    @IsNotEmpty()
    @ApiProperty()
    public sellerId: number;
    @IsNotEmpty()
    @ApiProperty()
    public buyerId: number;
    @IsNumber()
    @ApiProperty()
    public quantity: number;
    @IsNumber()
    @ApiProperty()
    public price: number;
}
