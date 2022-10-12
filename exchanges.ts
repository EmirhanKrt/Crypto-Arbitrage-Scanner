import { IExchange } from "./types";

const Exchanges:IExchange[] = [
    {name:"Binance",tickerEndpoint:"https://api.binance.com/api/v3/ticker/price?symbol="},
    {name:"Coinbase Exchange",tickerEndpoint:"https://api.exchange.coinbase.com/products/"},
    {name:"FTX",tickerEndpoint:"https://ftx.com/api/markets/"},
    {name:"Kucoin",tickerEndpoint:"https://api.kucoin.com/api/v1/market/orderbook/level1?symbol="},
    {name:"Gate.io",tickerEndpoint:"https://data.gateapi.io/api2/1/ticker/"},
    {name:"Bybit",tickerEndpoint:"https://api.bybit.com/public/linear/recent-trading-records?symbol="},
    {name:"Huobi",tickerEndpoint:"https://api.huobi.pro/market/history/trade?symbol="}
]

export default Exchanges;

