import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class NSEAssetRequest {
    @ApiProperty()
    @IsNotEmpty()
    artistName: string;
    
    @ApiProperty()
    @IsNotEmpty()
    artId: number;

    @ApiProperty()
    @IsNotEmpty()
    artTitle: string;

    @ApiProperty()
    @IsNotEmpty()
    artSymbol: string;

    @ApiProperty()
    @IsNotEmpty()
    artDescription: string;

    @ApiProperty()
    @IsNotEmpty()
    artCreationYear: string;

    @ApiProperty()
    @IsNotEmpty()
    artValue: string;

    @ApiProperty()
    @IsNotEmpty()
    artPicture: string;

    @ApiProperty()
    @IsNotEmpty()
    pricePerToken: number;

    @ApiProperty()
    @IsNotEmpty()
    numberOfTokens: number;

    @ApiProperty()
    @IsNotEmpty()
    numberOfTokensForSale: number;

    @ApiProperty()
    @IsNotEmpty()
    issuerEmail: number;    
}