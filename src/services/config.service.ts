import { Injectable } from "@nestjs/common";
import { Market, OrderStatus, OrderStrategy, OrderType, Role } from "src/models/enums";

@Injectable()
export class ConfigService {
    getEnums(): Promise<EnumClass[]> {
        return new Promise((resolve, _reject) => {
            const orderTypes: EnumClass[] =
            [
                {
                    type: 'OrderType',
                    name: 'BUY',
                    code: OrderType.BUY,
                },
                {
                    type: 'OrderType',
                    name: 'SELL',
                    code: OrderType.SELL,
                },   
                {
                    type: 'OrderStrategy',
                    name: 'Good Till Cancel',
                    code: OrderStrategy.GOOD_TILL_CANCEL,
                },
                {
                    type: 'OrderStrategy',
                    name: 'All Or Nothing',
                    code: OrderStrategy.ALL_OR_NOTHING,
                },
                {
                    type: 'OrderStrategy',
                    name: 'Good Till Day',
                    code: OrderStrategy.GOOD_TILL_DAY,
                },         
                {
                    type: 'OrderStrategy',
                    name: 'Good Till Month',
                    code: OrderStrategy.GOOD_TILL_MONTH,
                },
                {
                    type: 'OrderStrategy',
                    name: 'Market Order',
                    code: OrderStrategy.MARKET_ORDER,
                },         
                {
                    type: 'OrderStatus',
                    name: 'New',
                    code: OrderStatus.NEW,
                },
                {
                    type: 'OrderStatus',
                    name: 'Matched',
                    code: OrderStatus.MATCHED
                },         
                {
                    type: 'OrderStatus',
                    name: 'Deleted',
                    code: OrderStatus.DELETED,
                },         
                {
                    type: 'OrderStatus',
                    name: 'Expired',
                    code: OrderStatus.EXPIRED
                },                           
                {
                    type: 'Market',
                    name: 'Primary',
                    code: Market.PRIMARY,
                }, 
                {
                    type: 'Market',
                    name: 'Secondary',
                    code: Market.SECONDARY,                    
                },
                {
                    type: 'Role',
                    name: 'Investor',
                    code: Role.INVESTOR,
                },
                {
                    type: 'Role',
                    name: 'ADmin',
                    code: Role.ADMIN,
                },                  
                {
                    type: 'Role',
                    name: 'Issuer',
                    code: Role.ISSUER,
                },                                                                                                                    
            ]

            resolve(orderTypes);
        });
    }

    getAssetManagerAbi(): string {
        return 
    }
}

export class EnumClass {
    type: string;
    name: string;
    code: number
}