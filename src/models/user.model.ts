import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("user")
@Unique("user_idx", ["email", "address"])
export class User {
    @PrimaryGeneratedColumn()
    id?: number;
    
    @Column({width: 512})
    privateKey: string;
    
    @Column({width: 512})
    passphrase: string;
    
    @Column({width: 512})
    email: string;    
    
    @Column({width: 512})
    password: string;    
    
    @Column({width: 512})
    address: string;
}