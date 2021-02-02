import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from "class-validator";
import { Column } from 'typeorm';

export abstract class AssetBaseClass {
    @Column()
    tokenId?: number;

    @Column()
    issuer: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    description: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @Column()
    symbol: string;
    
    @IsNumber()
    @ApiProperty()
    @Column()
    totalSupply: number;
    
    @IsNumber()
    @ApiProperty()
    @Column()
    issuingPrice: number;
    
    @IsNotEmpty()
    @ApiProperty()
    @Column()
    issuerId: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    artistName: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    titleOfWork: string;

    @IsNotEmpty()
    @ApiProperty()    
    image: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @Column()
    commission: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    price: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column({width: 20, type: 'bigint'})
    createdOn: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    sharesAvailable: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    nameOfOwners: string;

    @ApiProperty()
    @Column()
    brokerId: string = "";

    @ApiProperty()
    listImmediately?: boolean = false;
}