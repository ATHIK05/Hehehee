import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import OrderManagement from './pages/OrderManagement';
import VideoReview from './pages/VideoReview';
import Inquiries from './pages/Inquiries';
import Referrals from './pages/Referrals';
import Pilots from './pages/Pilots';
import Editors from './pages/Editors';
import Orders from './pages/Orders';
import Cancellations from './pages/Cancellations';

function AdminApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Dashboard />;
      case 'applications':
        return <Applications />;
      case 'order-management':
        return <OrderManagement />;
      case 'video-review':
        return <VideoReview />;
      case 'inquiries':
        return <Inquiries />;
      case 'referrals':
        return <Referrals />;
      case 'pilots':
        return <Pilots />;
      case 'editors':
        return <Editors />;
      case 'orders':
        return <Orders />;
      case 'payments':
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Payments Management</h2>
            <p className="text-slate-600">Payments page is under development</p>
          </div>
        );
      case 'cancellations':
        return <Cancellations />;
      // Quick Actions
      case 'add-referral':
        return <Referrals />;
      case 'add-pilot':
        return <Pilots />;
      case 'add-editor':
        return <Editors />;
      case 'manage-orders':
        return <Orders />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'Dashboard';
      case 'applications': return 'Applications Management';
      case 'order-management': return 'Order Management';
      case 'video-review': return 'Video Review';
      case 'referrals': return 'Referrals';
      case 'pilots': return 'Pilot Management';
      case 'editors': return 'Editor Management';
      case 'orders': return 'All Orders';
      case 'inquiries': return 'New Inquiries';
      case 'payments': return 'Payments';
      case 'cancellations': return 'Cancellations';
      case 'add-referral': return 'Add Referral';
      case 'add-pilot': return 'Add Pilot';
      case 'add-editor': return 'Add Editor';
      case 'manage-orders': return 'Manage Orders';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
      
      <Header 
        title={getPageTitle()}
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
            key={currentPage}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="max-w-7xl mx-auto"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminApp;