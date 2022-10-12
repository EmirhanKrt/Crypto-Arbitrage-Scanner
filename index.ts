import axios from 'axios';
import fs from "fs";

import Exchanges from "./exchanges";
import Tickers from './tickers';

import { IExchangeAsset } from './types';

const getPriceList = async () => {
    var exchangeTasks = Exchanges.map(async (exchange) => {
        console.time(`${exchange.name}, Done in`)
        var tickerTasks = Tickers.map(async (ticker, index) => {
            var exchangeAsset: IExchangeAsset = { exchange };
            var endpoint = exchange.tickerEndpoint + ticker.baseAsset;
            var timeout=0;
            switch (exchange.name) {
                case "Binance":
                    endpoint += "USDT"
                    break;
                case "Coinbase Exchange":
                    endpoint += "-USD/ticker"
                    timeout=100;
                    break;
                default:
                    break;
            }
            await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        await axios(endpoint).then((data) => {
                            exchangeAsset.price = parseFloat(data.data.price);
                            ticker.exchanges!.push(exchangeAsset)
                        }).catch((error)=>{
                            if(error.response.status===429) console.count(`${exchange.name}, Error Count`);
                        })
                    } finally {
                        resolve("");
                    }
                }, timeout * index);
            }).then(()=>{
                return new Promise((res, rej) => {res("")})
            })
        })
        await Promise.all(tickerTasks).then(() => {
            console.timeEnd(`${exchange.name}, Done in`)
            return new Promise((res, rej) => { res("") })
        })
    })
    await Promise.all(exchangeTasks).then(() => {
        console.log(Tickers)
        fs.writeFileSync('./data.json', JSON.stringify(Tickers, null, 2), 'utf-8');
    })
}

/*const getPriceList = async () => {
    var exchangeTasks=Exchanges.map(async(exchange)=>{
        console.time(`${exchange.name}, Done in`)
        var tickerTasks=Tickers.map(async (ticker,index) => {
            var exchangeAsset: IExchangeAsset = { exchange };
            var endpoint=exchange.tickerEndpoint + ticker.baseAsset;

            switch (exchange.name) {
                case "Binance":
                    endpoint+= "USDT"
                    break;
                case "Coinbase Exchange":
                    endpoint+= "-USD/ticker"
                    break;
                default:
                    break;
            }
            try {
                await axios(endpoint).then((data)=>{
                    exchangeAsset.price = parseFloat(data.data.price);
                    ticker.exchanges!.push(exchangeAsset)
                })
            } catch (error) { 
                console.count(`${exchange.name}, Error Count`)
            } finally {
                return new Promise((res, rej) => {res("")})
            }
        })
        await Promise.all(tickerTasks).then(()=>{
            console.timeEnd(`${exchange.name}, Done in`)
            return new Promise((res, rej) => {res("")})
        })
    })
    await Promise.all(exchangeTasks).then(()=>{
        console.log(Tickers)
        fs.writeFileSync('./data.json', JSON.stringify(Tickers, null, 2) , 'utf-8');
    })
}*/

getPriceList()