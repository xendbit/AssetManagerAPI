import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AssetBaseClass } from "./asset.base.model";
import { Market } from "./enums";

@Entity("asset")
export class Asset extends AssetBaseClass {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    owner: string;
    
    @Column()
    sharesContract: string;

    @Column({type: "tinyint", width: 1})
    approved: number

    @Column()
    imageUrl: string;

    @Column()
    market: Market;
}