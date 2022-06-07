import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CorCovMatrix, MatrixDefinition } from './CorCovMatrix';
import Seeder from './Seeder';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { PortfoioVsSp } from './PortfolioVsSp';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { BasicExample } from './BasicExample';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/correlation-matrix" element={<CorCovMatrix matrixDefinition={MatrixDefinition.Correlation} />} />
          <Route path="/covariance-matrix" element={<CorCovMatrix matrixDefinition={MatrixDefinition.Covariance} />} />
          <Route path="/portfolio-vs-sp" element={<PortfoioVsSp />} />
          <Route path="/seeder" element={<Seeder />} />
          <Route path="/basic-example" element={<BasicExample />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
