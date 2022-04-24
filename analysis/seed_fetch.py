"""
Gets the necessary files for seeding IndexDB
"""
import pandas as pd
import pandas_datareader as web
import datetime
import os

start_date = datetime.datetime(2015, 1, 1)
end_date = datetime.datetime(2022, 1, 1)
# expetec observation count
expected = 1763

class NotEnoughObservations(Exception):
    pass

def get_filename(stock_symbol):
    """
    path helper
    """
    if stock_symbol == "^GSPC":
        return f"./src/data-seed/sp500.ts"
    else:
        return f"./src/data-seed/{stock_symbol.lower()}.ts"

def seed_exists(stock_symbol):
    """
    Check if the seed file exists for a given symbol
    """
    filename = get_filename(stock_symbol)
    return os.path.isfile(filename)

def create_seed_json_file(stock_symbol):
    """
    gets the data from yahoo finance and saves it to a .ts file
    """
    stock_data = web.DataReader(stock_symbol, "yahoo", start_date, end_date)
    prices = stock_data.loc[:,"Adj Close"]
    prices = prices.fillna(method="ffill")
    if len(prices) != expected:
        raise NotEnoughObservations

    prices.to_json(get_filename(stock_symbol))

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

# symbol_list = ["^GSPC", "AAPL", "AMZN", "FB", "GOOG", "MSFT"] #,"CAT", "NKE", "DAL","XOM"
# symbol_list = ["^GSPC", "AAPL", "AMZN", "FB", "GOOG", "MSFT","CAT", "NKE", "DAL","XOM"]
# redefine symbol list
index_lines = []
symbol_list = pd.read_csv("./analysis/nasdaq.csv")["Symbol"]

not_enough_observations_count = 0
no_data_count = 0
key_error_count = 0
# for symbol in nasdaq["Symbol"]:
for symbol in symbol_list:
    if seed_exists(symbol):
        print(f"Skipping {symbol}")
        if symbol == "^GSPC":
            index_lines.append("export * from './sp500';")
        else:
            index_lines.append(f"export * from './{symbol.lower()}';")
        continue
    print(f"Fetching {symbol}")
    try:
        if symbol == "^GSPC" or symbol.isalpha():
            create_seed_json_file(symbol)
            add_necessary_typescript_code(symbol)
            if symbol == "^GSPC":
                index_lines.append("export * from './sp500';")
            else:
                index_lines.append(f"export * from './{symbol.lower()}';")
        else:
            print(f"Skipping: {symbol}")
    except NotEnoughObservations:
        not_enough_observations_count += 1
    except web._utils.RemoteDataError:
        no_data_count += 1
    except KeyError:
        key_error_count += 1

print(f"For {len(symbol_list)} observations...")
print(f"{not_enough_observations_count} did not have enough observations")
print(f"{no_data_count} did not have data")
print(f"{key_error_count} KeyError")

with open("./src/data-seed/index.ts", "w") as outfile:
    outfile.write("\n".join(index_lines))