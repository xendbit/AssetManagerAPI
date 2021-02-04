import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";
import { OrderStrategy, OrderType, OrderStatus } from "./enums";

@Entity()
@Unique("key_idx", ["key"])
@Index("tokenId_idx", ["tokenId"])
export class Order {
    @PrimaryGeneratedColumn()
    id?: number;

    @Index("key-idx") 
    @Column()    
    key: string;

    @Column()
    orderType: OrderType;
    @Column()
    orderStrategy: OrderStrategy;
    
    @Index("seller-idx") 
    @Column()
    seller: string;

    @Index("buyer-idx") 
    @Column()
    buyer: string;

    @Index("token-id-idx") 
    @Column()
    tokenId: number;
    
    @Column()
    amountRemaining: number;
    @Column()
    originalAmount: number;
    @Column()
    price: number;
    @Column()
    status: OrderStatus;
    @Column()
    goodUntil: number;
    @Column()
    issuerIsSeller: boolean;
}