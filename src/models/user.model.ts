import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("user")
@Unique("user_idx", ["email", "address"])
export class User {
    @PrimaryGeneratedColumn()
    id?: number;
    
    @Column()
    privateKey: string;
    
    @Column()
    passphrase: string;
    
    @Column()
    email: string;    
    
    @Column()
    password: string;    
    
    @Column()
    address: string;
}