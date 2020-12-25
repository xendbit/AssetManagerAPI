import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("admin")
@Unique("admin_idx", ["email", "passphrase"])
export class Admin {
    @PrimaryGeneratedColumn()
    id?: number;
        
    @Column()
    passphrase: string;
    
    @Column()
    email: string;    
    
    @Column()
    password: string;        

    @Column()
    firstName: string;        
    
    @Column()
    lastName: string;            
}