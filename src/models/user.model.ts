import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Role } from "./enums";
import { UserBase } from "./user.base.model";

@Entity("user")
@Unique("user_idx", ["email", "passphrase"])
export class User extends UserBase {
    @PrimaryGeneratedColumn()
    id?: number;    

    @Index("ngnc-account-number-idx") 
    @Column()
    ngncAccountNumber: string;

    @Column({width: 500})
    imageUrl: string

    @Column({type: 'tinyint', width: 1})
    activated: boolean;
}