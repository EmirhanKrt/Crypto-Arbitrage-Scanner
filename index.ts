import axios from 'axios';
import fs from "fs";
import cliProgress from "cli-progress";
import { IExchangeAsset,IExchangeTicker,IExchangeTokenData,ITicker } from './types';
import Options from './options';
import { arraySorter, priceParser } from './utils';

import data from "./coinList.json";
import { clear } from 'node:console';

const coinList=data as ITicker[];
const progressVisual = new cliProgress.SingleBar({ barCompleteChar: '\u2588', barIncompleteChar: '\u2591', hideCursor: true }, cliProgress.Presets.shades_classic);
const PRICE_LIST:IExchangeTokenData[]=[];

const loadConfig =()=>{
    if(Options.activeExchanges.includes("Coinbase Exchange")) Options.timeout=100;
    progressVisual.start(coinList.length,0);
}

const getPrice = (exchangeAsset:IExchangeAsset,index:number) => {
    return new Promise( async (resolve, reject) => {
        setTimeout(async() => {
            try {
                await axios(exchangeAsset.exchange.tickerEndpoint!).then((response)=>{
                    let price:number = priceParser(exchangeAsset.exchange.name,response.data);
                    exchangeAsset.price=price;
                    resolve(price)
                }).catch((e)=>resolve(0))
            } catch (error) {
                
            }
        }, Options.timeout*index);
    });
}

const comparePrices = async () => {
    let tableOutput:any[]=[]
    let priceListTableTask = PRICE_LIST.map((element)=>{
        try {
            if(element.exchangePrices.length<=1) return;
            let sellHere: IExchangeTicker | null = element.exchangePrices[element.exchangePrices.length-1];
            if (!sellHere) sellHere = element.exchangePrices[element.exchangePrices.length-2];
            let buyHere: IExchangeTicker | null  = element.exchangePrices[0];
            let arbitrage = (buyHere!.priceDiff)*-1+sellHere!.priceDiff;
            if (arbitrage > Options.lowerArbitrageRate) 
            tableOutput.push({baseAsset:element.baseAsset,buyHereName:buyHere!.name,buyHerePrice:buyHere!.price,sellHereName:sellHere!.name,sellHerePrice:sellHere!.price,arbitrage:arbitrage})
            sellHere=null; buyHere=null;
            return new Promise((res,rej)=>res(""));
        } catch (error) {
            console.log(error)
        }
    })
    await Promise.all(priceListTableTask).then(() => {
        tableOutput=arraySorter(tableOutput,1);
        clear()
        console.table(tableOutput)
        tableOutput=[];
        return new Promise((res,rej)=>{res("")})
    })
}

const main = async () => {
    loadConfig();
    var isRunable=false;
    do {
        PRICE_LIST.splice(0,PRICE_LIST.length);
        progressVisual.update(0);
        isRunable=false;
        var coinListTasks = coinList.map( async (element:ITicker,index:number)=>{
            let totalPrice=0;
            let totalExchangeCount=element.exchanges!.length;
            var priceRequestTasks = element.exchanges!.map(async(exchangeAsset)=>{
                if (!Options.activeExchanges.includes(exchangeAsset.exchange.name)) return;
                await getPrice(exchangeAsset,index).then((priceOfTick)=>{
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
                PRICE_LIST.push({baseAsset:element.baseAsset,exchangePrices:priceCompareTasks as IExchangeTicker[]});
                progressVisual.increment(1)
                return new Promise((resolve,reject)=>resolve(""));
            })
        })
        await Promise.all(coinListTasks).then(async() => {
            if(Options.debug) fs.writeFileSync('./finalData.json', JSON.stringify(PRICE_LIST, null, 2), 'utf-8'); 
            await comparePrices().then(()=>{
                isRunable=true;
            })
        })

    } while (isRunable);
}

main();


