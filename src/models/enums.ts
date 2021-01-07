export enum OrderType {
    BUY = 0, SELL = 1
}

export enum OrderStrategy {
    GOOD_TILL_CANCEL = 0,
    ALL_OR_NOTHING = 1,
    GOOD_TILL_DAY = 2,
    GOOD_TILL_MONTH = 3,
    MARKET_ORDER = 4,
}

export enum OrderStatus {
    NEW = 0,
    MATCHED = 1,
    DELETED = 2,
    EXPIRED = 3
}

export enum Market {
    PRIMARY = 0,
    SECONDARY = 1
}

export enum Role {
    INVESTOR = 0,
    ADMIN = 1,
    ISSUER = 2,
}