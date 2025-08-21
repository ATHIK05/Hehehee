import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Video, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import OrdersTable from '../components/dashboard/OrdersTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Order } from '../types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order);
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'new') return order.status === 'new';
    if (selectedTab === 'ongoing') return ['assigned', 'editing', 'final_review'].includes(order.status);
    if (selectedTab === 'completed') return order.status === 'completed';
    return true;
  });

  const stats = {
    totalOrders: orders.length,
    newOrders: orders.filter(o => o.status === 'new').length,
    ongoingOrders: orders.filter(o => ['assigned', 'editing', 'final_review'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.amount || 0), 0),
    videosForReviewBefore: 60, // Mock data
    videosForReviewAfter: 65, // Mock data
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: stats.totalOrders },
    { id: 'new', label: 'New Orders', count: stats.newOrders },
    { id: 'ongoing', label: 'Ongoing Orders', count: stats.ongoingOrders },
    { id: 'completed', label: 'Completed Orders', count: stats.completedOrders },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          change={{ value: 12, trend: 'up' }}
          color="blue"
        />
        <StatsCard
          title="Videos for Review"
          value={stats.videosForReviewBefore + stats.videosForReviewAfter}
          icon={Video}
          change={{ value: 8, trend: 'up' }}
          color="purple"
        />
        <StatsCard
          title="Active Users"
          value={156}
          icon={Users}
          change={{ value: 5, trend: 'up' }}
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={{ value: 15, trend: 'up' }}
          color="orange"
        />
      </div>

      {/* Video Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Video Review Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-slate-700">Before Edit</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-slate-900">{stats.videosForReviewBefore}</span>
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pending</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-slate-700">After Edit</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-slate-900">{stats.videosForReviewAfter}</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Ready</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Order
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" className="text-xs">
                Manage Pre-List
              </Button>
              <Button variant="secondary" size="sm" className="text-xs">
                Add New Pilot
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Order Overview</h2>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 py-0.5 px-2 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          onViewOrder={(order) => console.log('View order:', order)}
          onEditOrder={(order) => console.log('Edit order:', order)}
          onDeleteOrder={(orderId) => console.log('Delete order:', orderId)}
        />
      </motion.div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Order"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Create a new order form will be implemented here.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>
              Create Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}