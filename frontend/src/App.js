import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import SKUs from './components/SKUs';
import Inventory from './components/Inventory';
import Categories from './components/Categories';
import StockAlerts from './components/StockAlerts';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-brand">
            <h1>Shop ERP</h1>
          </div>
          <ul className="navbar-menu">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/skus">SKUs</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/alerts">Stock Alerts</Link></li>
          </ul>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/skus" element={<SKUs />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/alerts" element={<StockAlerts />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
