export interface IExchange{
    name:string,
    tickerEndpoint:string
}

export interface IExchangeAsset{
    price?:number,
    exchange:IExchange
}

export interface ITicker{
    baseAsset:string,
    avgPrice?:number,
    exchanges?:IExchangeAsset[]
}