import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("userAssets")
export class UserAssets {
    @PrimaryGeneratedColumn()
    id?: number;

    @Index()
    @Column()
    user_id: number;

    @Index()
    @Column()
    token_id: number;

    @Index()
    @Column()
    asset_id: number;
}