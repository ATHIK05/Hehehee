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
  Eye,
  Upload,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Order, Comment } from '../../types';
import { getOrders, createOrder, generateOrderID, getComments, createComment } from '../../services/firebase';
import StatsCard from '../../components/dashboard/StatsCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { format } from 'date-fns';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [clientFeedback, setClientFeedback] = useState('');

  const [newOrder, setNewOrder] = useState({
    city: '',
    orderDate: '',
    duration: 2, // default 2 hours
    packageType: 'basic' as const,
    requirementSummary: '',
    amount: 0,
    referenceFiles: [] as string[]
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersData, commentsData] = await Promise.all([
        getOrders(),
        getComments()
      ]);
      
      // Filter orders for this client
      const clientOrders = ordersData.filter(order => 
        order.clientId === user?.id || order.clientName === user?.profile.name
      );
      setOrders(clientOrders);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!newOrder.city.trim()) {
      newErrors.city = 'Location is required';
    }
    
    if (!newOrder.orderDate) {
      newErrors.orderDate = 'Order date is required';
    } else {
      const selectedDate = new Date(newOrder.orderDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.orderDate = 'Order date cannot be in the past';
      }
    }
    
    if (!newOrder.requirementSummary.trim()) {
      newErrors.requirementSummary = 'Requirements are required';
    }
    
    if (newOrder.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
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
        orderID,
        clientId: user?.id || '',
        clientName: user?.profile.name || '',
        phoneNumber: user?.profile.phone || '',
        city: newOrder.city,
        orderDate: new Date(newOrder.orderDate),
        duration: newOrder.duration,
        packageType: newOrder.packageType,
        requirementSummary: newOrder.requirementSummary,
        amount: newOrder.amount,
        referenceFiles: newOrder.referenceFiles.filter(file => file.trim()),
        paymentStatus: 'pending',
        status: 'pending'
      });

      // Add initial comment
      await createComment({
        orderId: '', // Will be updated with actual order ID
        commentBy: 'client',
        commenterId: user?.id || '',
        commenterName: user?.profile.name || '',
        commentStage: 'general',
        commentText: `Order created: ${newOrder.requirementSummary}`
      });

      setNewOrder({
        city: '',
        orderDate: '',
        duration: 2,
        packageType: 'basic',
        requirementSummary: '',
        amount: 0,
        referenceFiles: []
      });
      setErrors({});
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedOrder || !clientFeedback.trim()) return;
    
    try {
      await createComment({
        orderId: selectedOrder.id,
        commentBy: 'client',
        commenterId: user?.id || '',
        commenterName: user?.profile.name || '',
        commentStage: 'client_feedback',
        commentText: clientFeedback
      });
      
      setClientFeedback('');
      fetchData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleReferenceFileChange = (index: number, value: string) => {
    const newFiles = [...newOrder.referenceFiles];
    newFiles[index] = value;
    setNewOrder({ ...newOrder, referenceFiles: newFiles });
  };

  const addReferenceFile = () => {
    setNewOrder({ 
      ...newOrder, 
      referenceFiles: [...newOrder.referenceFiles, ''] 
    });
  };

  const removeReferenceFile = (index: number) => {
    const newFiles = newOrder.referenceFiles.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, referenceFiles: newFiles });
  };

  const getOrderComments = (orderId: string) => {
    return comments.filter(c => c.orderId === orderId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => ['pending', 'approved', 'assigned'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders.reduce((sum, order) => sum + (order.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
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
            <p className="text-slate-600">Welcome back, {user?.profile.name}</p>
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
                <p className="text-sm font-medium text-slate-900">{user?.profile.name}</p>
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
                    Package & Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Amount & Payment
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
                          <div className="text-sm text-slate-900">{order.city}</div>
                          <div className="text-sm text-slate-500">
                            {format(order.orderDate, 'dd MMM yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm text-slate-900 capitalize">{order.packageType}</span>
                        <div className="text-sm text-slate-500">{order.duration} hours</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
                        <div>
                          <span className="text-sm font-medium text-slate-900">
                            ₹{order.amount.toLocaleString()}
                          </span>
                          <div className="text-xs">
                            <StatusBadge status={order.paymentStatus} variant="payment" />
                          </div>
                        </div>
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
                            setClientFeedback('');
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
                  value={newOrder.city}
                  onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.city ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Enter shoot location"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shoot Date *
                </label>
                <input
                  type="date"
                  value={newOrder.orderDate}
                  onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.orderDate ? 'border-red-300' : 'border-slate-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.orderDate && <p className="text-red-500 text-xs mt-1">{errors.orderDate}</p>}
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
                  Estimated Duration (hours) *
                </label>
                <input
                  type="number"
                  value={newOrder.duration}
                  onChange={(e) => setNewOrder({ ...newOrder, duration: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.duration ? 'border-red-300' : 'border-slate-300'
                  }`}
                  min="1"
                  max="12"
                />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Budget (Optional)
              </label>
              <input
                type="number"
                value={newOrder.amount}
                onChange={(e) => setNewOrder({ ...newOrder, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Enter your budget"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Requirements *
              </label>
              <textarea
                value={newOrder.requirementSummary}
                onChange={(e) => setNewOrder({ ...newOrder, requirementSummary: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.requirementSummary ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Describe your video requirements in detail..."
              />
              {errors.requirementSummary && <p className="text-red-500 text-xs mt-1">{errors.requirementSummary}</p>}
            </div>

            {/* Reference Files */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reference Files (Optional)
              </label>
              <div className="space-y-2">
                {newOrder.referenceFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={file}
                      onChange={(e) => handleReferenceFileChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="https://drive.google.com/... or reference image URL"
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeReferenceFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={addReferenceFile}
                  className="flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Reference File
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Package Information:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>Basic:</strong> Standard drone footage, basic editing</div>
                <div><strong>Premium:</strong> Advanced shots, professional editing, color grading</div>
                <div><strong>Custom:</strong> Tailored to your specific requirements</div>
              </div>
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
          maxWidth="2xl"
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
                  <p className="text-slate-900">{selectedOrder.city}</p>
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
                  <label className="text-sm font-medium text-slate-700">Duration</label>
                  <p className="text-slate-900">{selectedOrder.duration} hours</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Amount</label>
                  <p className="text-slate-900 font-semibold">₹{selectedOrder.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Payment Status</label>
                  <StatusBadge status={selectedOrder.paymentStatus} variant="payment" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Requirements</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedOrder.requirementSummary}
                </p>
              </div>

              {selectedOrder.referenceFiles && selectedOrder.referenceFiles.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Reference Files</label>
                  <div className="space-y-1 mt-1">
                    {selectedOrder.referenceFiles.map((file, idx) => (
                      <a 
                        key={idx}
                        href={file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 block text-sm"
                      >
                        Reference File {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignment Info */}
              {(selectedOrder.pilot || selectedOrder.editor) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Assignment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.pilot && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Assigned Pilot</label>
                        <p className="text-slate-900">{selectedOrder.pilot}</p>
                      </div>
                    )}
                    {selectedOrder.editor && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Assigned Editor</label>
                        <p className="text-slate-900">{selectedOrder.editor}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comments History */}
              {getOrderComments(selectedOrder.id).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-slate-900 mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Order Updates
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {getOrderComments(selectedOrder.id).map(comment => (
                      <div key={comment.id} className="bg-slate-50 p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              comment.commentBy === 'admin' ? 'bg-red-100 text-red-600' :
                              comment.commentBy === 'pilot' ? 'bg-blue-100 text-blue-600' :
                              comment.commentBy === 'editor' ? 'bg-purple-100 text-purple-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {comment.commentBy === 'admin' ? 'A' :
                               comment.commentBy === 'pilot' ? 'P' :
                               comment.commentBy === 'editor' ? 'E' : 'C'}
                            </div>
                            <span className="text-sm font-medium">{comment.commenterName}</span>
                            <span className="text-xs text-slate-500 capitalize">
                              ({comment.commentStage.replace('_', ' ')})
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(comment.createdAt, 'dd MMM - hh:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.commentText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Feedback Section */}
              {selectedOrder.status === 'completed' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Submit Feedback</h3>
                  <div className="space-y-3">
                    <textarea
                      value={clientFeedback}
                      onChange={(e) => setClientFeedback(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      rows={3}
                      placeholder="Share your feedback about the final video..."
                    />
                    <Button
                      size="sm"
                      onClick={handleSubmitFeedback}
                      disabled={!clientFeedback.trim()}
                      className="flex items-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              )}

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