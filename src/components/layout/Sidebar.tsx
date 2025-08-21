import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Video, 
  Users, 
  Plane, 
  Edit3, 
  ShoppingBag, 
  MessageSquare, 
  CreditCard, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  UserPlus,
  PlusCircle
  FileText,
  ClipboardList,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'applications', icon: FileText, label: 'Applications' },
    { id: 'order-management', icon: ClipboardList, label: 'Order Management' },
    { id: 'video-review', icon: Video, label: 'Video Review' },
    { id: 'referrals', icon: Users, label: 'Referrals' },
    { id: 'pilots', icon: Plane, label: 'Pilots' },
    { id: 'editors', icon: Edit3, label: 'Editors' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'inquiries', icon: MessageSquare, label: 'Inquiries' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'cancellations', icon: XCircle, label: 'Cancellations' },
  ];

  const quickActions = [
    { id: 'add-referral', icon: UserPlus, label: 'Add Referral' },
    { id: 'add-pilot', icon: PlusCircle, label: 'Add Pilot' },
    { id: 'add-editor', icon: Edit3, label: 'Add Editor' },
    { id: 'manage-orders', icon: Database, label: 'Manage Orders' },
  ];

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0, width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-lg z-40"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FPV Admin</span>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-3 space-y-1">
            {navigationItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPageChange(item.id)}
                className={`
                  w-full flex items-center px-3 py-2.5 text-left rounded-xl transition-all duration-200
                  ${currentPage === item.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 px-3"
            >
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onPageChange(action.id)}
                    className="w-full flex items-center px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <action.icon className="w-4 h-4 mr-3" />
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}