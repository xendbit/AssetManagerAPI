import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class NseUserRequest {
    @IsNotEmpty()
    @ApiProperty()
    userId: number;

    @IsNotEmpty()
    @ApiProperty()
    email: string;

    @IsNotEmpty()
    @ApiProperty()
    phone: string;

    @IsNotEmpty()
    @ApiProperty()
    userName: string;    

    @IsNotEmpty()
    @ApiProperty()
    userType: string;    
}