import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Segments from './pages/Segments';
import SegmentDetail from './pages/SegmentDetail';
import Rules from './pages/Rules';
import RuleDetail from './pages/RuleDetail';
import RuleForm from './pages/RuleForm';

// Import other pages (to be created)




function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:pl-64 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/segments" element={<Segments />} />
                  <Route path="/segments/:id" element={<SegmentDetail />} />
                  <Route path="/rules" element={<Rules />} />
                  <Route path="/rules/:id" element={<RuleDetail />} />
                  <Route path="/rules/new" element={<RuleForm />} />
                  <Route path="/rules/edit/:id" element={<RuleForm />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}

export default App;
