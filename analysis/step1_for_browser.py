"""
In this version, I comment out the fetch logic to include the approach outlined by Pyodide (context)
Credit https://github.com/woutervanheeswijk/portfolio_variance/blob/main/portfolio_covariance.ipynb
"""
import json
import datetime
import numpy as np
import pandas as pd
from js import allRecords # allRecords is added to the global context by us

def read_price_data(stock_symbol):
    """
    creates dataframe from the global js context via allRecords
    """
    rows = []
    for recc in allRecords:
        if recc.symbol == stock_symbol.lower():
            row_dict = {
                "Adjusted Close": recc.adjustedClose,
                "Date": datetime.datetime(recc.date.getFullYear(), recc.date.getMonth() + 1, recc.date.getDate()),
                "Symbol": recc.symbol,
            }
            rows.append(row_dict)

    # This is translation matches what is required by the script
    df = pd.DataFrame(rows)
    df = df.set_index("Date")
    df = df.loc[:, "Adjusted Close"] # Store adjusted close prices 
    df = df.fillna(method="ffill") # Forward fill missing data points
    return df

def generate_return_series(prices):
    """Compute daily return series for given price series"""
    returns = np.zeros(len(prices) - 1)
    for i in range(len(prices) - 1):
        day_return = (prices[i + 1] - prices[i]) / prices[i]
        returns[i] = day_return

    return returns

"""Set input"""
symbol_list = ["AAPL", "AMZN", "FB", "GOOG", "MSFT"] #,"CAT", "NKE", "DAL","XOM"

num_stocks= len(symbol_list)
stock_weights = {stock_symbol:1/num_stocks for stock_symbol in symbol_list} # Set stock weights

price_series_sp500 = read_price_data("SP500") # Read price data
return_series_sp500 = generate_return_series(price_series_sp500) # Compute return data

no_business_days = len(return_series_sp500)
daily_returns = pd.DataFrame(index=symbol_list, columns=np.arange(no_business_days)) # Initialize DataFrame

"""Read price data and compute daily returns"""
for stock_symbol in symbol_list:   
    price_series = read_price_data(stock_symbol) # Read price data
    return_series = generate_return_series(price_series) # Compute return data
    daily_returns.loc[stock_symbol] = return_series # Store return series in DataFrame
        
daily_returns.head()

covariance_matrix = pd.DataFrame(index=symbol_list, columns=symbol_list)
correlation_matrix = pd.DataFrame(index=symbol_list, columns=symbol_list)

"""Compute all covariances and correlation coefficients"""
for stock1_symbol in symbol_list:
    for stock2_symbol in symbol_list:
        # Retrieve return series as arrays
        stock1_returns = daily_returns.loc[stock1_symbol].values.astype(float)
        stock2_returns = daily_returns.loc[stock2_symbol].values.astype(float)

        # Compute covariance
        cov = np.cov(stock1_returns, stock2_returns)[0][1]

        # Add covariance to matrix
        covariance_matrix.loc[stock1_symbol, stock2_symbol] = cov

        # Compute correlation
        corr = np.corrcoef(stock1_returns, stock2_returns)[0][1]

        # Add correlation to matrix
        correlation_matrix.loc[stock1_symbol, stock2_symbol] = corr

# Round correlation coefficients
correlation_matrix = correlation_matrix.astype(float).round(5)

# Translate the final values to two lists - one of column headers, the other a list of lists of row
json.dumps([list(correlation_matrix.columns), correlation_matrix.values.tolist()])