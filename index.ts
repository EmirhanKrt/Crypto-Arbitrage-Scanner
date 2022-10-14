import axios from 'axios';
import fs from "fs";
import cliProgress from "cli-progress";

import { IExchangeAsset, ITicker } from './types';

import coinList from "./data.json";

const progressVisual = new cliProgress.SingleBar({
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
}, cliProgress.Presets.shades_classic);

progressVisual.start(coinList.length,0);

const PRICE_LIST: { baseAsset: string; exchangePrices: ({ name: string; price: number | undefined; priceDiff: number; } | undefined)[]; }[]=[];

const LOWER_ARBITRAGE_FILTER=1.5

const arraySorter = (willBeSorted:any[],called:number)=>{
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

const getPrice = (exchangeName: string,responseData:any) => {
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

const getPriceRequest = (exchangeAsset:IExchangeAsset,timeout:number) => {
    return new Promise( async (resolve, reject) => {
        setTimeout(async() => {
            await axios(exchangeAsset.exchange.tickerEndpoint).then((response)=>{
                let price:number = getPrice(exchangeAsset.exchange.name,response.data);
                exchangeAsset.price=price;
                resolve(price)
            }).catch((e)=>reject(e))
        }, 100*timeout);
    });
}

const comparePrices = async () => {
    let tableOutput:any[]=[]
    let priceListTableTask = PRICE_LIST.map((element)=>{
        try {
            if(element.exchangePrices.length<=1) return;
            let sellHere = element.exchangePrices[element.exchangePrices.length-1];
            if (!sellHere) sellHere = element.exchangePrices[element.exchangePrices.length-2];
            let buyHere = element.exchangePrices[0];
            let arbitrage = (buyHere!.priceDiff)*-1+sellHere!.priceDiff;
            if (arbitrage > LOWER_ARBITRAGE_FILTER) 
            tableOutput.push({baseAsset:element.baseAsset,buyHereName:buyHere!.name,buyHerePrice:buyHere!.price,sellHereName:sellHere!.name,sellHerePrice:sellHere!.price,arbitrage:arbitrage})
            return new Promise((res,rej)=>res(""));
        } catch (error) {
            console.log(error)
        }
    })
    await Promise.all(priceListTableTask).then(() => {
        tableOutput=arraySorter(tableOutput,1);
        console.clear()
        console.table(tableOutput)
        tableOutput=[];
        return new Promise((res,rej)=>{res("")})
    })
}

const main = async () => {
    let completedCount=0;
    progressVisual.update(completedCount);
    PRICE_LIST.splice(0,PRICE_LIST.length);
    
    let coinListTasks = coinList.map( async (element:ITicker,index)=>{
        let totalPrice=0;
        let totalExchangeCount=element.exchanges!.length;
        var priceRequestTasks = element.exchanges!.map(async(exchangeAsset)=>{
            await getPriceRequest(exchangeAsset,index).then((priceOfTick)=>{
                totalPrice+=priceOfTick as number;
                if(priceOfTick===0) totalExchangeCount--;
                return new Promise((res, rej) => { res("") })
            }).catch((e)=>console.log(e))
        })
        await Promise.all(priceRequestTasks).then(() => {
            var avgPrice=totalPrice/totalExchangeCount;
            element.avgPrice = avgPrice;
            var priceCompareTasks = element.exchanges!.map((exchangeAsset)=>{
                if (exchangeAsset.price===0) return;
                let priceDiff = (exchangeAsset.price!/avgPrice - 1)*100;
                return {name:exchangeAsset.exchange.name,price:exchangeAsset.price,priceDiff}
            })
            priceCompareTasks=arraySorter(priceCompareTasks,0);
            PRICE_LIST.push({baseAsset:element.baseAsset,exchangePrices:priceCompareTasks});
            progressVisual.update(++completedCount);
            return new Promise((resolve,reject)=>resolve(""));
        })
    })
    await Promise.all(coinListTasks).then(async() => {
        fs.writeFileSync('./finalData.json', JSON.stringify(PRICE_LIST, null, 2), 'utf-8');
        await comparePrices().then(()=>main())
    })
}

main();


