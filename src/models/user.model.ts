import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("user")
@Unique("user_idx", ["email", "passphrase"])
export class User {
    @PrimaryGeneratedColumn()
    id?: number;
        
    @Column()
    passphrase: string;
    
    @Column()
    email: string;    
    
    @Column()
    password: string;        
}