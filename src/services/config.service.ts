import { Injectable } from "@nestjs/common";

@Injectable()
export class ConfigService {
    constructor() { }

    getEnums(): Promise<EnumClass[]> {
        return new Promise((resolve, reject) => {
            const orderTypes: EnumClass[] =
            [
                {
                    type: 'OrderType',
                    name: 'BUY',
                    code: 0,
                },
                {
                    type: 'OrderType',
                    name: 'SELL',
                    code: 1,
                },   
                {
                    type: 'OrderStrategy',
                    name: 'Good Till Cancel',
                    code: 0,
                },
                {
                    type: 'OrderStrategy',
                    name: 'All Or Nothing',
                    code: 1,
                },
                {
                    type: 'OrderStrategy',
                    name: 'Good Till Day',
                    code: 2
                },         
                {
                    type: 'OrderStrategy',
                    name: 'Good Till Month',
                    code: 3
                },
                {
                    type: 'OrderStrategy',
                    name: 'Market Order',
                    code: 4
                },         
                {
                    type: 'OrderStatus',
                    name: 'New',
                    code: 0
                },
                {
                    type: 'OrderStatus',
                    name: 'Matched',
                    code: 1
                },         
                {
                    type: 'OrderStatus',
                    name: 'Deleted',
                    code: 2
                },         
                {
                    type: 'OrderStatus',
                    name: 'Expired',
                    code: 3
                },                                                                                                                                          
            ]

            resolve(orderTypes);
        });
    }
}

export class EnumClass {
    type: string;
    name: string;
    code: number
}