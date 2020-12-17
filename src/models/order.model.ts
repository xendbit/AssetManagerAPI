import { OrderStrategy, OrderType, OrderStatus } from "./enums";

export class Order {
    id?: number;

    key: string;

    orderType: OrderType;

    orderStrategy: OrderStrategy;

    seller: string;

    buyer: string;

    tokenId: number;

    amountRemaining: number;

    originalAmount: number;

    price: number;

    status: OrderStatus;

    orderDate: number;

    statusDate: number;

    goodUntil: number;
}