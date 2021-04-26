import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Index } from "typeorm";
import { Role } from "./enums";

export abstract class UserBase {    
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    passphrase: string;

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    password: string;
    
    @Index("email-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    email: string;    

    @Index("phone-number-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    phoneNumber?: string;

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    role: Role

    @Index("bvn-idx") 
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    bvn: string    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    firstName: string    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    middleName: string    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    lastName: string   
    
    @ApiProperty()
    image?: string

    @Column()
    @ApiProperty()
    userId?: number;    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    address?: string;
}