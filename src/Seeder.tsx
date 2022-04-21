import React from 'react';
import { aapl } from './data-seed/aapl';
import { amzn } from './data-seed/amzn';
import { fb } from './data-seed/fb';
import { goog } from './data-seed/goog';
import { msft } from './data-seed/msft';
import { sp500 } from './data-seed/sp500';
import { db } from './db';

interface Seed {
    [index: string]: number;
}

const SYMBOLS = ['aapl', 'amzn', 'fb', 'goog', 'msft', 'sp500']
const SEEDS = [aapl as Seed, amzn as Seed, fb as Seed, goog as Seed, msft as Seed, sp500 as Seed]

// TODO fancy equals
if (SYMBOLS.length !== SEEDS.length) {
    throw Error('Out of Sync SYMBOLS and SEEDS')
}

const seedAll = async () => {
    for (let i = 0; i < SYMBOLS.length; i++) {
        const data = Object.keys(SEEDS[i]).map(millisecondTimesampString => {
            return {
                symbol: SYMBOLS[i],
                date: new Date(parseInt(millisecondTimesampString)),
                adjustedClose: SEEDS[i][millisecondTimesampString],
            }
        })

        for (const observation of data) {
            try {
                await db.stockObservation.add(observation)
            } catch (e) {
                console.log(`Error inserting: ${JSON.stringify(observation)}`);
                console.log(e);
            }
        }
        
        console.log('\n\n\n\n');
        console.log(`Completed seeding; ${SYMBOLS[i]}`);
        console.log('\n\n\n\n');
    }
}

const clearTable = async () => {
    try {
        await db.stockObservation.clear()
    } catch (e) {
        console.log(`Error clearing table: ${e}`);
    }
}

// stateful + progress tracker
const Seeder = () => {
    return (
        <div>
        <h1>
            Data Seeder
        </h1>
        <button onClick={seedAll}>Seed All</button>
        <button onClick={clearTable}>Clear All</button>
        </div>
    )
}

export default Seeder;