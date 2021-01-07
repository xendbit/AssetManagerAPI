import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from "class-validator";
import { Column } from 'typeorm';

export abstract class AssetBaseClass {
    @Column()
    tokenId?: number;

    @Column()
    public issuer: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public description: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public symbol: string;
    
    @IsNumber()
    @ApiProperty()
    @Column()
    public totalSupply: number;
    
    @IsNumber()
    @ApiProperty()
    @Column()
    public issuingPrice: number;
    
    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public issuerId: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public artistName: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public titleOfWork: string;

    @IsNotEmpty()
    @ApiProperty()    
    public image: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public commission: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public price: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column({width: 20, type: 'bigint'})
    public createdOn: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public sharesAvailable: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    public nameOfOwners: string;
}