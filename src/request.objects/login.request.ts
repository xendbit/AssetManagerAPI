import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginRequest {
    @ApiProperty()
    @IsNotEmpty()
    password: string;
    
    @ApiProperty()
    @IsNotEmpty()
    email: string;    
}