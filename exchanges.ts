import { IExchange } from "./types";

const Exchanges:IExchange[] = [
    {name:"Binance",tickerEndpoint:"https://api.binance.com/api/v3/ticker/price?symbol="},
    {name:"Coinbase Exchange",tickerEndpoint:"https://api.exchange.coinbase.com/products/"}
]

export default Exchanges;

