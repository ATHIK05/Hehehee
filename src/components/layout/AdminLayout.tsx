import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        currentPage="home" 
        onPageChange={() => {}} 
      />
      
      <Header 
        title="Admin Dashboard"
        sidebarCollapsed={sidebarCollapsed}
      />

      <main 
        className={`
          transition-all duration-300 pt-20 p-6
          ${sidebarCollapsed ? 'ml-20' : 'ml-70'}
        `}
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}