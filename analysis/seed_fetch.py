"""
Gets the necessary files for seeding IndexDB
"""
import pandas as pd
import pandas_datareader as web
import datetime

start_date = datetime.datetime(2015, 1, 1)
end_date = datetime.datetime(2022, 1, 1)

def get_filename(stock_symbol):
    """
    path helper
    """
    if stock_symbol == "^GSPC":
        return f"./src/data-seed/sp500.ts"
    else:
        return f"./src/data-seed/{stock_symbol.lower()}.ts"

def create_seed_json_file(stock_symbol):
    """
    gets the data from yahoo finance and saves it to a .ts file
    """
    stock_data = web.DataReader(stock_symbol, "yahoo", start_date, end_date)
    prices = stock_data.loc[:,"Adj Close"]
    prices = prices.fillna(method="ffill")

    prices.to_json(get_filename(stock_symbol))

symbol_list = ["^GSPC", "AAPL", "AMZN", "FB", "GOOG", "MSFT"] #,"CAT", "NKE", "DAL","XOM"

def get_ts_text(stock_symbol):
    """
    translating the sp500 name again
    """
    if (stock_symbol == "^GSPC"):
        return f"export const sp500 = "
    else :
        return f"export const {stock_symbol.lower()} = "


def add_necessary_typescript_code(stock_symol):
    """
    The raw JSON file is just one big line, so add a line above:
    export const {lowercase stock symbol} = 
    which will turn the file into something that IS a typescript
    module. Left to you to make the contets pretty (lint fix or VS Code)
    """
    with open(get_filename(stock_symol), 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        ts_text = get_ts_text(stock_symol)
        f.write(ts_text + '\n' + content)

for symbol in symbol_list:
    create_seed_json_file(symbol)
    add_necessary_typescript_code(symbol)