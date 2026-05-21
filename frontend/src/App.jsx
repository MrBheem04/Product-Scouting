import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages imports
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetails from './pages/ProductDetails';
import Compare from './pages/Compare';
import Deals from './pages/Deals';
import Coupons from './pages/Coupons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ExtensionPage from './pages/ExtensionPage';
import Category from './pages/Category';
import Wishlist from './pages/Wishlist';
import PriceAlerts from './pages/PriceAlerts';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950">
          {/* Header */}
          <Navbar />

          {/* Page Routing */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/extension" element={<ExtensionPage />} />
              <Route path="/category" element={<Category />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/alerts" element={<PriceAlerts />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}
