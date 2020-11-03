export declare class Asset {
    id: number;
    name: string;
    description: string;
    totalQuantity: number;
    quantity: number;
    decimal: number;
    issuer: string;
    owner: string;
    static assetFromResponse(res: any): Asset;
}
