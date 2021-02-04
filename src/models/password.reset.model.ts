import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("passwordReset")
export class PasswordReset {
    @PrimaryGeneratedColumn()
    id?: number;

    @Index("user-id-idx") 
    @Column()
    userId: number;

    @Index("token-idx") 
    @Column()
    token: number;

    @Column({type: "bigint"})
    expiry: number;
}