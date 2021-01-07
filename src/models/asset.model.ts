import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { AssetBaseClass } from "./asset.base.model";
import { Market } from "./enums";

@Entity("asset")
@Unique("token_idx", ["tokenId"])
@Unique("shares_contract_idx", ["sharesContract"])
@Unique("token_name_issuer", ["symbol", "issuer"])
export class Asset extends AssetBaseClass {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    owner: string;
    
    @Column()
    sharesContract: string;

    @Column({type: "tinyint", width: 1})
    approved: boolean

    @Column()
    imageUrl: string;

    @Column()
    market: Market;
}