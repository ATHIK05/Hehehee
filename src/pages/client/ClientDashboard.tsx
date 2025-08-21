import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Building,
  MapPin,
  User,
  Download,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { getOrders, createOrder, generateOrderID } from '../../services/firebase';
import StatsCard from '../../components/dashboard/StatsCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { format } from 'date-fns';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [newOrder, setNewOrder] = useState({
    location: '',
    orderDate: '',
    packageType: 'basic' as const,
    requirements: '',
    budget: 0,
    referenceFiles: [] as string[]
  });

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders();
      // Filter orders for this client
      const clientOrders = ordersData.filter(order => 
        order.clientId === user?.id || order.clientName === user?.name
      );
      setOrders(clientOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.location || !newOrder.orderDate || !newOrder.requirements) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const orderID = generateOrderID();
      await createOrder({
        orderID,
        clientId: user?.id || '',
        clientName: user?.name || '',
        orderDate: new Date(newOrder.orderDate),
        location: newOrder.location,
        packageType: newOrder.packageType,
        requirements: newOrder.requirements,
        budget: newOrder.budget,
        referenceFiles: newOrder.referenceFiles,
        status: 'pending',
        advancePaid: false,
        finalPaid: false
      });

      setNewOrder({
        location: '',
        orderDate: '',
        packageType: 'basic',
        requirements: '',
        budget: 0,
        referenceFiles: []
      });
      setIsCreateModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => ['pending', 'approved', 'assigned'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders.reduce((sum, order) => sum + (order.budget || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Client Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Business Client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="In Progress"
            value={stats.pendingOrders}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Completed"
            value={stats.completedOrders}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">My Orders</h2>
            <p className="text-slate-600">Track your video production orders</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Location & Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{order.orderID}</div>
                        <div className="text-sm text-slate-500">
                          Created {format(order.createdAt, 'dd MMM yyyy')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm text-slate-900">{order.location}</div>
                          <div className="text-sm text-slate-500">
                            {format(order.orderDate, 'dd MMM yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 capitalize">{order.packageType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
                        <span className="text-sm font-medium text-slate-900">
                          ₹{order.budget.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} variant="order" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderModalOpen(true);
                          }}
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {order.status === 'completed' && order.finalDriveLink && (
                          <Button
                            size="sm"
                            onClick={() => window.open(order.finalDriveLink, '_blank')}
                            className="flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No orders yet</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Your First Order
              </Button>
            </div>
          )}
        </motion.div>

        {/* Create Order Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Order"
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={newOrder.location}
                  onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter shoot location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shoot Date *
                </label>
                <input
                  type="date"
                  value={newOrder.orderDate}
                  onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Package Type
                </label>
                <select
                  value={newOrder.packageType}
                  onChange={(e) => setNewOrder({ ...newOrder, packageType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="basic">Basic Package</option>
                  <option value="premium">Premium Package</option>
                  <option value="custom">Custom Package</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Budget
                </label>
                <input
                  type="number"
                  value={newOrder.budget}
                  onChange={(e) => setNewOrder({ ...newOrder, budget: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter budget"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Requirements *
              </label>
              <textarea
                value={newOrder.requirements}
                onChange={(e) => setNewOrder({ ...newOrder, requirements: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Describe your video requirements in detail..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateOrder}>
                Create Order
              </Button>
            </div>
          </div>
        </Modal>

        {/* Order Details Modal */}
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          title="Order Details"
          maxWidth="lg"
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Order ID</label>
                  <p className="text-slate-900 font-mono">{selectedOrder.orderID}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedOrder.status} variant="order" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <p className="text-slate-900">{selectedOrder.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Shoot Date</label>
                  <p className="text-slate-900">{format(selectedOrder.orderDate, 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Package</label>
                  <p className="text-slate-900 capitalize">{selectedOrder.packageType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Budget</label>
                  <p className="text-slate-900 font-semibold">₹{selectedOrder.budget.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Requirements</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedOrder.requirements}
                </p>
              </div>

              {selectedOrder.finalDriveLink && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Final Video</label>
                  <div className="mt-2">
                    <Button
                      onClick={() => window.open(selectedOrder.finalDriveLink, '_blank')}
                      className="flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Final Video
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}