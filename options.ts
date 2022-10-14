import { IOptions } from "./types";

const Options:IOptions = {
    debug:false,
    activeExchanges:["Binance","Kucoin","Gate.io","FTX","Bybit","Gate.io","Huobi"],
    lowerArbitrageRate:1,
    timeout:75
}

export default Options;
