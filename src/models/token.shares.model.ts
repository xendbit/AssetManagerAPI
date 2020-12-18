import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("tokenShares")
@Unique("token_idx", ["tokenId"])
@Unique("shares_contract_idx", ["sharesContract"])
@Unique("token_name_issuer", ["name", "issuer"])
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
    name: string;

    @Column()
    symbol: string;

    @Column()
    totalSupply: number;
    
    @Column()
    issuingPrice: number;

    @Column()
    issuer: string;
}