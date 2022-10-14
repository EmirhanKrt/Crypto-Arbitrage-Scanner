export interface IExchange{
    name:ExchangeList,
    tickerEndpoint?:string
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

export type ExchangeList="Binance" | "Kucoin" | "Gate.io" | "FTX" | "Coinbase Exchange" | "Bybit" | "Huobi"

export interface IOptions{
    debug:boolean,
    activeExchanges:ExchangeList[],
    lowerArbitrageRate:number,
    timeout:number
}

export interface IExchangeTokenData{
    baseAsset:string,
    exchangePrices:IExchangeTicker[]
}

export interface IExchangeTicker{
    name:ExchangeList,
    price?:number,
    priceDiff:number
}