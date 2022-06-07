import React from 'react'
import { Link } from 'react-router-dom'

export const Nav = () =>
    <div>
        <Link to="/">Home</Link>
        <div />
        <Link to="/correlation-matrix">Correlation Matrix</Link>
        <div />
        <Link to="/covariance-matrix">Covariance Matrix</Link>
        <div />
        <Link to="/portfolio-vs-sp">Portfolio vs SP</Link>
        <div />
        <Link to="/seeder">Seeder</Link>
        <div />
        <Link to="/basic-example">Basic Example</Link>
    </div>