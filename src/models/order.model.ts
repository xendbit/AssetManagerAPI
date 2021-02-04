import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from "typeorm";
import { OrderStrategy, OrderType, OrderStatus } from "./enums";

@Entity()
@Unique("key_idx", ["key"])
@Index("tokenId_idx", ["tokenId"])
export class Order {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    key: string;
    @Column()
    orderType: OrderType;
    @Column()
    orderStrategy: OrderStrategy;
    @Column()
    seller: string;
    @Column()
    buyer: string;
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