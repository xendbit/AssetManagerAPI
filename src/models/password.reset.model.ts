import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("passwordReset")
export class PasswordReset {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    userId: number;

    @Column()
    token: number;

    @Column({type: "bigint"})
    expiry: number;
}