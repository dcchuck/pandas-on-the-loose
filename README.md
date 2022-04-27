# Pandas on the loose!

## Seeding the Data

The typescript will not compile without it

```
python analysis/seed_fetch.py
```

This fetches the data using pandas_data_reader for a defined collection of stock tickers. Then, creates a typescript module with the results.

```
npm i
npm start
// ... navigate to localhost:3000/seeder
```

The `/seeder` route will allow you to seed your IndexDB with this content. Note: the seeding takes some time and the screen is feature minimal. Follow along in the console and be patient.

## About

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

<a target="_blank" href="https://icons8.com/icon/9219/panda">Panda</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>