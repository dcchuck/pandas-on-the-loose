import React, { useEffect, useState } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { db } from './db';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(name: string, personName: string[], theme: Theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

interface PortfolioSelectProps {
    portfolio: string[];
    setPortfolio: React.Dispatch<React.SetStateAction<string[]>>;
}
export const PortfolioSelect: React.FC<PortfolioSelectProps> = ({ portfolio, setPortfolio }) => {
    const theme = useTheme();
    const [symbols, setSymbols] = useState<string[]>([])

    const init = async () => {
        const retrievedSymbols = await db.stockObservation.orderBy('symbol').uniqueKeys()
        const filteredSymbols = retrievedSymbols.filter(item => item !== 'sp500')
        setSymbols(filteredSymbols as unknown as string[])
    }

    const handleChange = (event: SelectChangeEvent<typeof portfolio>) => {
        const {
            target: { value },
        } = event;
        setPortfolio(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    useEffect(() => {
        init();
    })

    return (
        <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel id="demo-multiple-name-label">Portfolio</InputLabel>
            <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple
                value={portfolio}
                onChange={handleChange}
                input={<OutlinedInput label="Name" />}
                MenuProps={MenuProps}
            >
                {symbols.map((symbol) => (
                    <MenuItem
                        key={symbol}
                        value={symbol}
                        style={getStyles(symbol, portfolio, theme)}
                    >
                        {symbol}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}