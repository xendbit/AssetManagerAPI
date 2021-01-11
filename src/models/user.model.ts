import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Role } from "./enums";
import { UserBase } from "./user.base.model";

@Entity("user")
@Unique("user_idx", ["email", "passphrase"])
export class User extends UserBase {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Column()
    ngncAccountNumber: string;
}