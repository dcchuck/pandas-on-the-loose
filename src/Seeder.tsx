import React, { useState } from 'react';
import { db } from './db';
import { Nav } from './Nav';
import * as allSymbols from './data-seed';

const SYMBOLS = Object.keys(allSymbols)

const seedAll = async (onComplete: () => void) => {
    for (let i = 0; i < SYMBOLS.length; i++) {
        const seed = (allSymbols as unknown as any)[SYMBOLS[i]]
        const data = Object.keys(seed).map(millisecondTimesampString => {
            return {
                symbol: SYMBOLS[i],
                date: new Date(parseInt(millisecondTimesampString)),
                adjustedClose: seed[millisecondTimesampString],
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
    const [seeding, setSeeding] = useState(false);

    const seedAllClickHandler = () => {
        if (!seeding) {
            setSeeding(true)
            seedAll(() => setSeeding(false));
        }
    }

    return (
        <div>
            <h1>
                Data Seeder
            </h1>
            <h2>{seeding ? 'Seeding In Progress...' : null }</h2>
            <div>
                <button onClick={seedAllClickHandler} disabled={seeding}>Seed All</button>
            </div>
            <div>
                <button onClick={clearTable} disabled={seeding}>Clear All</button>
            </div>
            <Nav />
        </div>
    )
}

export default Seeder;