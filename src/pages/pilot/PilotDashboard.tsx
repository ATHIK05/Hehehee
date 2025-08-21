import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Video,
  MapPin,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Order, Submission } from '../../types';
import { getOrders, getSubmissions, createSubmission } from '../../services/firebase';
import StatsCard from '../../components/dashboard/StatsCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { format } from 'date-fns';

export default function PilotDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    driveLink: '',
    duration: 0,
    comments: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersData, submissionsData] = await Promise.all([
        getOrders(),
        getSubmissions()
      ]);
      
      // Filter orders assigned to this pilot
      const pilotOrders = ordersData.filter(order => 
        order.pilot === user?.name || order.assignedPilot === user?.name
      );
      
      // Filter submissions by this pilot
      const pilotSubmissions = submissionsData.filter(submission =>
        submission.submitterId === user?.id
      );
      
      setOrders(pilotOrders);
      setSubmissions(pilotSubmissions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!selectedOrder || !submissionData.driveLink.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await createSubmission({
        orderId: selectedOrder.id,
        submittedBy: 'pilot',
        submitterId: user?.id || '',
        submitterName: user?.name || '',
        driveLink: submissionData.driveLink,
        duration: submissionData.duration,
        comments: submissionData.comments,
        status: 'submitted'
      });

      setSubmissionData({ driveLink: '', duration: 0, comments: '' });
      setIsSubmissionModalOpen(false);
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting work:', error);
    }
  };

  const getOrderSubmission = (orderId: string) => {
    return submissions.find(s => s.orderId === orderId);
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'assigned').length,
    completedOrders: orders.filter(o => ['pilot_reviewed', 'completed'].includes(o.status)).length,
    totalEarnings: orders.length * 2500 // Mock calculation
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
            <h1 className="text-3xl font-bold text-slate-900">Pilot Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Professional Pilot</p>
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
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Completed Orders"
            value={stats.completedOrders}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Earnings"
            value={`₹${stats.totalEarnings.toLocaleString()}`}
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
            <p className="text-slate-600">Orders assigned to you</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Location & Date
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
                {orders.map((order, index) => {
                  const submission = getOrderSubmission(order.id);
                  return (
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
                          <div className="text-sm text-slate-500 capitalize">{order.packageType} Package</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-900">{order.clientName}</span>
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
                        <StatusBadge status={order.status} variant="order" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {!submission && order.status === 'assigned' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsSubmissionModalOpen(true);
                              }}
                              className="flex items-center"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Submit Work
                            </Button>
                          )}
                          {submission && (
                            <div className="flex items-center space-x-2">
                              <StatusBadge status={submission.status} />
                              {submission.status === 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setSubmissionData({
                                      driveLink: submission.driveLink,
                                      duration: submission.duration || 0,
                                      comments: submission.comments
                                    });
                                    setIsSubmissionModalOpen(true);
                                  }}
                                >
                                  Resubmit
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No orders assigned yet</p>
            </div>
          )}
        </motion.div>

        {/* Submission Modal */}
        <Modal
          isOpen={isSubmissionModalOpen}
          onClose={() => {
            setIsSubmissionModalOpen(false);
            setSelectedOrder(null);
            setSubmissionData({ driveLink: '', duration: 0, comments: '' });
          }}
          title="Submit Your Work"
          maxWidth="lg"
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Order ID: {selectedOrder.orderID}</div>
                  <div>Client: {selectedOrder.clientName}</div>
                  <div>Location: {selectedOrder.location}</div>
                  <div>Package: {selectedOrder.packageType}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Drive Link *
                </label>
                <input
                  type="url"
                  value={submissionData.driveLink}
                  onChange={(e) => setSubmissionData({ ...submissionData, driveLink: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Flight Duration (minutes)
                </label>
                <input
                  type="number"
                  value={submissionData.duration}
                  onChange={(e) => setSubmissionData({ ...submissionData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={submissionData.comments}
                  onChange={(e) => setSubmissionData({ ...submissionData, comments: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Add any notes about the shoot..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsSubmissionModalOpen(false);
                    setSelectedOrder(null);
                    setSubmissionData({ driveLink: '', duration: 0, comments: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitWork}>
                  Submit Work
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}