
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { Toaster } from '@/components/ui/toaster';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-foreground flex flex-col items-center p-4">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mb-8 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 sm:text-5xl">
          GeoGuard
        </h1>
        <p className="mt-2 text-lg text-slate-300">
          Your Personal Location-Aware Assistant
        </p>
      </motion.header>
      <main className="w-full max-w-3xl">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
