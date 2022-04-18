"""
Credit https://github.com/woutervanheeswijk/portfolio_variance/blob/main/portfolio_covariance.ipynb
"""
import datetime
import numpy as np
import pandas as pd
import pandas_datareader as web
import matplotlib.pyplot as plt
import seaborn as sns

def read_price_data(stock_symbol, start_date, end_date):
    """Read daily price data using Pandas Datareader"""
    stock_data = web.DataReader(stock_symbol, "yahoo", start_date, end_date) # Read stock data 
    prices = stock_data.loc[:, "Adj Close"] # Store adjusted close prices 
    prices = prices.fillna(method="ffill") # Forward fill missing data points

    return prices

def generate_return_series(prices):
    """Compute daily return series for given price series"""
    returns = np.zeros(len(prices) - 1)
    for i in range(len(prices) - 1):
        day_return = (prices[i + 1] - prices[i]) / prices[i]
        returns[i] = day_return

    return returns

"""Set input"""
start_date = datetime.datetime(2019, 1, 1)
end_date = datetime.datetime(2020, 1, 1)
symbol_list = ["AAPL", "AMZN", "FB", "GOOG", "MSFT"] #,"CAT", "NKE", "DAL","XOM"

num_stocks= len(symbol_list)
stock_weights = {stock_symbol:1/num_stocks for stock_symbol in symbol_list} # Set stock weights

price_series_sp500 = read_price_data("^GSPC", start_date, end_date) # Read price data
return_series_sp500 = generate_return_series(price_series_sp500) # Compute return data

no_business_days = len(return_series_sp500)
daily_returns = pd.DataFrame(index=symbol_list, columns=np.arange(no_business_days)) # Initialize DataFrame

"""Read price data and compute daily returns"""
for stock_symbol in symbol_list:   
    price_series = read_price_data(stock_symbol, start_date, end_date) # Read price data
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

print(correlation_matrix)

ax = sns.heatmap(correlation_matrix, vmin=-1, vmax=1)

portfolio_mean = 0
portfolio_variance = 0

"""Compute mean portfolio return"""
for stock_symbol in symbol_list:
    
    # Retrieve return series as arrays
    stock_returns = daily_returns.loc[stock_symbol].values.astype(float)
    
    weight_stock = stock_weights.get(stock_symbol)

    mean_return = stock_returns.mean()
    portfolio_mean += mean_return *weight_stock

"""Compute variance portfolio return"""
for stock1_symbol in symbol_list:
    for stock2_symbol in symbol_list:
        weight_stock1 = stock_weights.get(stock1_symbol)
        weight_stock2 = stock_weights.get(stock2_symbol)
        covariance= covariance_matrix.loc[stock1_symbol,stock2_symbol]    
        portfolio_variance += weight_stock1*weight_stock2*covariance

# Compute annualized mean and volatility portfolio
ann_portfolio_mean = portfolio_mean*252
ann_portfolio_volatility = np.sqrt(252)*np.sqrt(portfolio_variance)

print('Annualized mean return:',"{0:.2%}".format(ann_portfolio_mean))
print('Annualized portfolio volatility:',"{0:.2%}".format(ann_portfolio_volatility))

# Compute annualized mean and volatility S&P 500
ann_sp500_mean = np.mean(return_series_sp500) *252
ann_SP500_volatility = np.sqrt(252) * np.std(return_series_sp500)

print('Annualized SP500 return:',"{0:.2%}".format(ann_sp500_mean))
print('Annualized SP500 volatility:',"{0:.2%}".format(ann_SP500_volatility))