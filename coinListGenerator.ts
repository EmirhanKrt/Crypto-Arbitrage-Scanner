import axios from 'axios';
import fs from "fs";

import Exchanges from "./exchanges";
import Tickers from './tickers';

import { IExchangeAsset } from './types';

const createEndpointAndTimeout = (tickerEndpoint: string, baseAsset: string, exchangeName: string) => {
    var endpoint = tickerEndpoint + baseAsset;
    var timeout=50;
    switch (exchangeName) {
        case "Binance":
            endpoint += "USDT"
            break;
        case "Coinbase Exchange":
            endpoint += "-USD/ticker"
            timeout=150;
            break;
        case "FTX":
            endpoint += "/USD"
            break;
        case "Kucoin":
            endpoint += "-USDT"
            break;
        case "Gate.io":
            endpoint += "_USDT"
            break;
        case "Bybit":
            endpoint += "USDT&limit=1"
            break;
        case "Huobi":
            endpoint = tickerEndpoint + baseAsset.toLowerCase() + "usdt&size=1"
            break;
        default:
            break;
    }
    return {endpoint,timeout};
}

const generateCoinList = async () => {
    var exchangeTasks = Exchanges.map(async (exchange) => {
        console.time(`${exchange.name}, Done in`)
        var tickerTasks = Tickers.map(async (ticker, index) => {
            var {endpoint,timeout} = createEndpointAndTimeout(exchange.tickerEndpoint!, ticker.baseAsset, exchange.name);
            var exchangeAsset: IExchangeAsset = { exchange: { name: exchange.name, tickerEndpoint: endpoint } };
            await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        await axios(endpoint).then((data) => {
                            if (data.data.status !== "error" && data.data.data !== null && data.data.result !== null) {
                                ticker.exchanges!.push(exchangeAsset)
                            }
                        }).catch((error) => {
                            if (error.response.status === 429) {
                                console.count(`${exchange.name},${error.response.status} Error Count`);
                            } else if (error.response.status !== 404) {
                                console.log(ticker.baseAsset, exchange.name, error.response.status)
                            }
                        })
                    } catch (error) {
                        console.log(ticker.baseAsset, exchange.name, error)
                    } finally {
                        resolve("");
                    }
                }, timeout * index);
            }).then(() => {
                return new Promise((res, rej) => { res("") })
            })
        })
        await Promise.all(tickerTasks).then(() => {
            console.timeEnd(`${exchange.name}, Done in`)
            return new Promise((res, rej) => { res("") })
        })
    })
    await Promise.all(exchangeTasks).then(() => {
        fs.writeFileSync('./data.json', JSON.stringify(Tickers, null, 2), 'utf-8');
    })
}

generateCoinList()