import { ApiProperty } from "@nestjs/swagger";

export class Asset {
    // assert.equal(sca.owner, props.contractor);
    // assert.equal(sca.tokenId, ar.tokenId);
    // assert.equal(sca.name, ar.name);
    // assert.equal(sca.symbol, ar.symbol);
    // assert.equal(sca.totalSupply, ar.totalQuantity);
    // assert.equal(sca.issuingPrice, ar.price);
    // assert.notEqual(sca.sharesContract, "0x0000000000000000000000000000000000000000");

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
