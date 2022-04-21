import React from 'react'
import { Link } from 'react-router-dom'

export const Nav = () =>
    <div>
        <Link to="/">Home</Link>
        <div />
        <Link to="/correlation-matrix">CM</Link>
        <div />
        <Link to="/seeder">Seeder</Link>
    </div>