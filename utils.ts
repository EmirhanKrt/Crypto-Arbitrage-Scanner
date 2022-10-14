import { ExchangeList } from "./types";

export const arraySorter = (willBeSorted:any[],called:number)=>{
    let tempArray:any[]=[];
    switch (called) {
        case 0:
            tempArray=willBeSorted.sort((a,b) => {
                return a!.priceDiff - b!.priceDiff;
            })
            break;
        case 1:
            tempArray=willBeSorted.sort((a,b) => {
                return b!.arbitrage - a!.arbitrage;
            })
            break;
        default:
            break;
    }
    return tempArray;
}

export const priceParser = (exchangeName:ExchangeList, responseData:any) => {
    let price=0;
    switch (exchangeName) {
        case "Binance":
        case "Coinbase Exchange":
            price=parseFloat(responseData.price);
            break;
        case "FTX":
            price=parseFloat(responseData.result.price);
            break;
        case "Bybit":
            price=parseFloat(responseData.result[0].price);
            break;
        case "Kucoin":
            price=parseFloat(responseData.data.price);
            break;
        case "Huobi":
            price=parseFloat(responseData.data[0].data[0].price);
            break;
        case "Gate.io":
            price=parseFloat(responseData.highestBid);
            break;
        default:
            break;
    }
    if(!price) price=0;
    return price;
}