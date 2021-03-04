import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { TradeBaseClass } from "./trade.base.model";

@Entity()
export class Trade extends TradeBaseClass {
    @PrimaryGeneratedColumn()
    id?: number;
}