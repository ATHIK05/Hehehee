import { motion } from 'framer-motion';
import { Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import Modal from '../ui/Modal';

interface HeaderProps {
  title: string;
  sidebarCollapsed: boolean;
}

export default function Header({ title, sidebarCollapsed }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifications = [
    { id: 1, message: 'New order received from Mumbai', time: '2 min ago', type: 'order' },
    { id: 2, message: 'Video review completed for ORD001', time: '5 min ago', type: 'review' },
    { id: 3, message: 'Payment received ₹25,000', time: '10 min ago', type: 'payment' },
    { id: 4, message: 'New pilot application from Delhi', time: '1 hour ago', type: 'application' },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Implement logout logic here
      console.log('Logging out...');
    }
  };
  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          fixed top-0 right-0 h-16 bg-white border-b border-slate-200 shadow-sm z-30
          transition-all duration-300
          ${sidebarCollapsed ? 'left-20' : 'left-70'}
        `}
        style={{ left: sidebarCollapsed ? 80 : 280 }}
      >
        <div className="flex items-center justify-between h-full px-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">Manage your operations efficiently</p>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500">Level 2 Access</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Notifications"
        maxWidth="md"
      >
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No new notifications</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'order' ? 'bg-blue-500' :
                  notification.type === 'review' ? 'bg-green-500' :
                  notification.type === 'payment' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{notification.message}</p>
                  <p className="text-xs text-slate-500">{notification.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                  <p className="text-xs text-slate-500">Receive email alerts for new orders</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Auto-assign Orders</p>
                  <p className="text-xs text-slate-500">Automatically assign pilots and editors</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                  <p className="text-xs text-slate-500">Switch to dark theme</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">System Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Default Currency</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Zone</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="IST">India Standard Time (IST)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="Profile Settings"
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Admin User</h3>
              <p className="text-sm text-slate-500">admin@fpvadmin.com</p>
              <p className="text-xs text-slate-400">Level 2 Access</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input 
                type="text" 
                defaultValue="Admin User"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                defaultValue="admin@fpvadmin.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input 
                type="tel" 
                defaultValue="+91 9876543210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setShowProfile(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}