import React from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Footer from './components/Footer'; // Import the Footer
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: { background: '#1e1e1e', color: '#fff', border: '1px solid #4caf50' }
        }} 
      />
      <Home />
      <Footer /> {/* Add the Footer component */}
    </div>
  );
}

export default App;