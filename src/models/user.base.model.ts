import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column } from "typeorm";
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
    
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    email: string;    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    role: Role

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
}