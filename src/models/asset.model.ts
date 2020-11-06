import { ApiProperty } from "@nestjs/swagger";

export class Asset {
    @ApiProperty()
    public contract: string;    
    @ApiProperty()
    public tokenId: number;
    @ApiProperty()
    public name: string;
    @ApiProperty()
    public symbol: string;
    @ApiProperty()
    public totalQuantity: number;
    @ApiProperty()
    public price: number;
    
    public static assetFromResponse(res): Asset {
        const asset = {
            contract: res[0],
            tokenId: res[1],
            name: res[2],
            symbol: res[3],
            totalQuantity: res[4],
            price: res[5],
        }
        
        return asset;
    }
}
