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
import { Order, VideoReview } from '../types';
import { 
  getOrders, 
  getVideoReviews, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  generateOrderID,
  getPilots,
  getEditors
 } from '../services/firebase';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [videoReviews, setVideoReviews] = useState<VideoReview[]>([]);
  const [pilots, setPilots] = useState([]);
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [newOrder, setNewOrder] = useState({
    clientName: '',
    phoneNumber: '',
    city: '',
    requirementSummary: '',
    packageType: 'basic',
    amount: 0,
    editor: '',
    pilot: '',
    referralCode: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchVideoReviews();
    fetchPilotsAndEditors();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoReviews = async () => {
    try {
      const reviewsData = await getVideoReviews();
      setVideoReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching video reviews:', error);
    }
  };

  const fetchPilotsAndEditors = async () => {
    try {
      const [pilotsData, editorsData] = await Promise.all([
        getPilots(),
        getEditors()
      ]);
      setPilots(pilotsData);
      setEditors(editorsData);
    } catch (error) {
      console.error('Error fetching pilots and editors:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!newOrder.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    
    if (!newOrder.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(newOrder.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!newOrder.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!newOrder.requirementSummary.trim()) {
      newErrors.requirementSummary = 'Requirement summary is required';
    }
    
    if (newOrder.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const orderID = generateOrderID();
      await createOrder({
        ...newOrder,
        orderID,
        status: 'new',
        paymentStatus: 'pending'
      });
      
      setNewOrder({
        clientName: '',
        phoneNumber: '',
        city: '',
        requirementSummary: '',
        packageType: 'basic',
        amount: 0,
        editor: '',
        pilot: '',
        referralCode: ''
      });
      setErrors({});
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleViewOrder = (order: Order) => {
    // Implementation for viewing order details
    console.log('Viewing order:', order);
  };

  const handleEditOrder = (order: Order) => {
    // Implementation for editing order
    console.log('Editing order:', order);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
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
    videosForReviewBefore: videoReviews.filter(v => v.type === 'before_edit' && v.reviewStatus === 'not_reviewed').length,
    videosForReviewAfter: videoReviews.filter(v => v.type === 'after_edit' && v.reviewStatus === 'not_reviewed').length,
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: stats.totalOrders },
    { id: 'new', label: 'New Orders', count: stats.newOrders },
    { id: 'ongoing', label: 'Ongoing Orders', count: stats.ongoingOrders },
    { id: 'completed', label: 'Completed Orders', count: stats.completedOrders },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          change={{ 
            value: Math.round(((stats.totalOrders - (stats.totalOrders * 0.9)) / (stats.totalOrders * 0.9)) * 100), 
            trend: 'up' 
          }}
          color="blue"
        />
        <StatsCard
          title="Videos for Review"
          value={stats.videosForReviewBefore + stats.videosForReviewAfter}
          icon={Video}
          change={{ 
            value: Math.round(((stats.videosForReviewBefore + stats.videosForReviewAfter) / Math.max(1, videoReviews.length)) * 100), 
            trend: stats.videosForReviewBefore + stats.videosForReviewAfter > 0 ? 'up' : 'down' 
          }}
          color="purple"
        />
        <StatsCard
          title="Active Pilots"
          value={pilots.filter((p: any) => p.status === 'active').length}
          icon={Users}
          change={{ value: 5, trend: 'up' }}
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={{ 
            value: Math.round(((stats.totalRevenue - (stats.totalRevenue * 0.85)) / (stats.totalRevenue * 0.85)) * 100), 
            trend: 'up' 
          }}
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
                View Analytics
              </Button>
              <Button variant="secondary" size="sm" className="text-xs">
                Export Data
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
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={newOrder.clientName}
                onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.clientName ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter client name"
              />
              {errors.clientName && (
                <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={newOrder.phoneNumber}
                onChange={(e) => setNewOrder({ ...newOrder, phoneNumber: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.phoneNumber ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="+91 9876543210"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={newOrder.city}
                onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.city ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                value={newOrder.amount}
                onChange={(e) => setNewOrder({ ...newOrder, amount: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter amount"
                min="1"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Package Type</label>
              <select
                value={newOrder.packageType}
                onChange={(e) => setNewOrder({ ...newOrder, packageType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="basic">Basic Package</option>
                <option value="standard">Standard Package</option>
                <option value="premium">Premium Package</option>
                <option value="custom">Custom Package</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Referral Code</label>
              <input
                type="text"
                value={newOrder.referralCode}
                onChange={(e) => setNewOrder({ ...newOrder, referralCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Optional referral code"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assign Editor</label>
              <select
                value={newOrder.editor}
                onChange={(e) => setNewOrder({ ...newOrder, editor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Select Editor (Optional)</option>
                {editors.map((editor: any) => (
                  <option key={editor.id} value={editor.name}>
                    {editor.name} ({editor.editorCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assign Pilot</label>
              <select
                value={newOrder.pilot}
                onChange={(e) => setNewOrder({ ...newOrder, pilot: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Select Pilot (Optional)</option>
                {pilots.map((pilot: any) => (
                  <option key={pilot.id} value={pilot.name}>
                    {pilot.name} ({pilot.pilotCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Requirement Summary *
            </label>
            <textarea
              value={newOrder.requirementSummary}
              onChange={(e) => setNewOrder({ ...newOrder, requirementSummary: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                errors.requirementSummary ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Describe the video requirements..."
            />
            {errors.requirementSummary && (
              <p className="text-red-500 text-xs mt-1">{errors.requirementSummary}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>
              Create Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}