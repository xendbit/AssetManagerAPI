import { ApiProperty } from "@nestjs/swagger";

export class Asset {
        
    @ApiProperty()
    public owner: string;        
    @ApiProperty()
    public tokenId: number;
    @ApiProperty()
    public name: string;
    @ApiProperty()
    public symbol: string;
    @ApiProperty()
    public totalSupply: number;
    @ApiProperty()
    public isssuingPrice: number;
    @ApiProperty()
    public sharesContract: string;    

    
    public static assetFromResponse(res): Asset {
        const asset: Asset = {
            owner: res.owner,
            tokenId: res.tokenId,
            name: res.name,
            symbol: res.symbol,
            totalSupply: res.totalSupply,
            isssuingPrice: res.isssuingPrice,
            sharesContract: res.sharesContract
        }
        
        return asset;
    }
}
