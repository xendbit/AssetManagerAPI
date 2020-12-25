import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("tokenShares")
@Unique("token_idx", ["tokenId"])
@Unique("shares_contract_idx", ["sharesContract"])
@Unique("token_name_issuer", ["symbol", "issuer"])
export class TokenShares {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    tokenId: number;

    @Column()
    owner: string;

    @Column()
    sharesContract: string;

    @Column()
    description: string;

    @Column()
    symbol: string;

    @Column()
    totalSupply: number;
    
    @Column()
    issuingPrice: number;

    @Column()
    issuer: string;

    @Column({type: "tinyint", width: 1})
    approved: number = null;
}