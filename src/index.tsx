import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CorCovMatrix, MatrixDefinition } from './CorCovMatrix';
import Seeder from './Seeder';
import './index.css';
import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'; // Optional theme CSS

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/correlation-matrix" element={<CorCovMatrix matrixDefinition={MatrixDefinition.Correlation} />} />
        <Route path="/covariance-matrix" element={<CorCovMatrix matrixDefinition={MatrixDefinition.Covariance} />} />
        <Route path="/seeder" element={<Seeder />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
