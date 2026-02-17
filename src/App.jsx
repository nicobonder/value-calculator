import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ExitMultiple from './pages/ExitMultiple';
import DCF from './pages/DCF';
import IsItCheap from './pages/IsItCheap';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: { background: '#1e1e1e', color: '#fff', border: '1px solid #4caf50' }
          }} 
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<ExitMultiple />} />
          <Route path="/dcf" element={<DCF />} />
          <Route path="/is-it-cheap" element={<IsItCheap />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
