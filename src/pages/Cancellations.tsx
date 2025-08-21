import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, AlertTriangle, RefreshCw, DollarSign, Calendar } from 'lucide-react';
import { Cancellation, Order } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getCancellations, 
  getOrders, 
  createCancellation, 
  updateCancellation,
  updateOrder
} from '../services/firebase';
import { format } from 'date-fns';

export default function Cancellations() {
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCancellation, setSelectedCancellation] = useState<Cancellation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [cancellationData, setCancellationData] = useState({
    reason: 'client' as const,
    adminNotes: '',
    refundAmount: 0
  });

  const reasonOptions = [
    { value: 'client', label: 'Client Request' },
    { value: 'weather', label: 'Weather Conditions' },
    { value: 'gear_issue', label: 'Equipment Issue' },
    { value: 'pilot_unavailable', label: 'Pilot Unavailable' },
    { value: 'editor_unavailable', label: 'Editor Unavailable' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cancellationsData, ordersData] = await Promise.all([
        getCancellations(),
        getOrders()
      ]);
      setCancellations(cancellationsData);
      setOrders(ordersData.filter(order => 
        ['assigned', 'editing', 'final_review'].includes(order.status)
      ));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      // Create cancellation record
      await createCancellation({
        orderID: selectedOrder.orderID,
        clientName: selectedOrder.clientName,
        city: selectedOrder.city,
        assignedPilot: selectedOrder.pilot,
        assignedEditor: selectedOrder.editor,
        reason: cancellationData.reason,
        status: 'cancelled',
        refundAmount: cancellationData.refundAmount,
        adminNotes: cancellationData.adminNotes
      });

      // Update order status
      await updateOrder(selectedOrder.id, { status: 'cancelled' });

      setCancellationData({
        reason: 'client',
        adminNotes: '',
        refundAmount: 0
      });
      setIsCancelModalOpen(false);
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleReassignOrder = async (cancellationId: string) => {
    try {
      await updateCancellation(cancellationId, { status: 'reassigned' });
      fetchData();
    } catch (error) {
      console.error('Error reassigning order:', error);
    }
  };

  const handleMarkHandled = async (cancellationId: string) => {
    try {
      await updateCancellation(cancellationId, { status: 'refund_completed' });
      fetchData();
    } catch (error) {
      console.error('Error marking as handled:', error);
    }
  };

  const filteredCancellations = cancellations.filter(cancellation => {
    const matchesSearch = cancellation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cancellation.orderID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = filterReason === 'all' || cancellation.reason === filterReason;
    const matchesStatus = filterStatus === 'all' || cancellation.status === filterStatus;
    return matchesSearch && matchesReason && matchesStatus;
  });

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'client': return '👤';
      case 'weather': return '🌧️';
      case 'gear_issue': return '⚙️';
      case 'pilot_unavailable': return '✈️';
      case 'editor_unavailable': return '✂️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cancelled': return 'bg-red-50 border-red-200';
      case 'reassigned': return 'bg-green-50 border-green-200';
      case 'refund_initiated': return 'bg-yellow-50 border-yellow-200';
      case 'refund_completed': return 'bg-blue-50 border-blue-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cancellations Management</h1>
          <p className="text-slate-600">Emergency last-minute order cancellations</p>
        </div>
        <Button 
          onClick={() => setIsCancelModalOpen(true)} 
          variant="danger"
          className="flex items-center"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Cancel Order
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by client name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterReason}
          onChange={(e) => setFilterReason(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          <option value="all">All Reasons</option>
          {reasonOptions.map(reason => (
            <option key={reason.value} value={reason.value}>{reason.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="cancelled">Cancelled</option>
          <option value="reassigned">Reassigned</option>
          <option value="refund_initiated">Refund Initiated</option>
          <option value="refund_completed">Refund Completed</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['cancelled', 'reassigned', 'refund_initiated', 'refund_completed'].map((status) => {
          const count = cancellations.filter(c => c.status === status).length;
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 ${getStatusColor(status)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 capitalize">
                    {status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  {status === 'cancelled' && '❌'}
                  {status === 'reassigned' && '🔄'}
                  {status === 'refund_initiated' && '💰'}
                  {status === 'refund_completed' && '✅'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cancellations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assigned Pilot
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assigned Editor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Cancellation Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Reason
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
              {filteredCancellations.map((cancellation, index) => (
                <motion.tr
                  key={cancellation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`hover:bg-slate-50 transition-colors ${
                    cancellation.status === 'cancelled' && 
                    new Date().getTime() - cancellation.cancellationDate.getTime() < 24 * 60 * 60 * 1000
                      ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{cancellation.orderID}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {cancellation.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {cancellation.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {cancellation.assignedPilot || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {cancellation.assignedEditor || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-900">
                        {format(cancellation.cancellationDate, 'dd MMM - hh:mm a')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getReasonIcon(cancellation.reason)}</span>
                      <span className="text-sm text-slate-900 capitalize">
                        {cancellation.reason.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={cancellation.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedCancellation(cancellation);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {cancellation.status === 'cancelled' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReassignOrder(cancellation.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Cancellation Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cancellation Details"
        maxWidth="lg"
      >
        {selectedCancellation && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Order ID</label>
                <p className="text-slate-900 font-mono">{selectedCancellation.orderID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Client Name</label>
                <p className="text-slate-900">{selectedCancellation.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedCancellation.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Cancellation Date</label>
                <p className="text-slate-900">
                  {format(selectedCancellation.cancellationDate, 'dd MMM yyyy - hh:mm a')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Assigned Pilot</label>
                <p className="text-slate-900">{selectedCancellation.assignedPilot || 'Not Assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Assigned Editor</label>
                <p className="text-slate-900">{selectedCancellation.assignedEditor || 'Not Assigned'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Reason</label>
                <div className="flex items-center mt-1">
                  <span className="text-lg mr-2">{getReasonIcon(selectedCancellation.reason)}</span>
                  <span className="text-slate-900 capitalize">
                    {selectedCancellation.reason.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedCancellation.status} />
                </div>
              </div>
            </div>

            {selectedCancellation.refundAmount && (
              <div>
                <label className="text-sm font-medium text-slate-700">Refund Amount</label>
                <div className="flex items-center mt-1">
                  <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
                  <span className="text-slate-900 font-semibold">
                    ₹{selectedCancellation.refundAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {selectedCancellation.adminNotes && (
              <div>
                <label className="text-sm font-medium text-slate-700">Admin Notes</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedCancellation.adminNotes}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {selectedCancellation.status === 'cancelled' && (
                <Button onClick={() => handleReassignOrder(selectedCancellation.id)}>
                  Reassign Order
                </Button>
              )}
              {selectedCancellation.status !== 'refund_completed' && (
                <Button variant="success" onClick={() => handleMarkHandled(selectedCancellation.id)}>
                  Mark as Handled
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Order to Cancel</label>
            <select
              value={selectedOrder?.id || ''}
              onChange={(e) => {
                const order = orders.find(o => o.id === e.target.value);
                setSelectedOrder(order || null);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Select an order</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.orderID} - {order.clientName} ({order.city})
                </option>
              ))}
            </select>
          </div>

          {selectedOrder && (
            <>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Order Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Client: {selectedOrder.clientName}</div>
                  <div>City: {selectedOrder.city}</div>
                  <div>Pilot: {selectedOrder.pilot || 'Not Assigned'}</div>
                  <div>Editor: {selectedOrder.editor || 'Not Assigned'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cancellation Reason</label>
                <select
                  value={cancellationData.reason}
                  onChange={(e) => setCancellationData({ 
                    ...cancellationData, 
                    reason: e.target.value as any 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  {reasonOptions.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Refund Amount (Optional)</label>
                <input
                  type="number"
                  value={cancellationData.refundAmount}
                  onChange={(e) => setCancellationData({ 
                    ...cancellationData, 
                    refundAmount: parseInt(e.target.value) || 0 
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Notes</label>
                <textarea
                  value={cancellationData.adminNotes}
                  onChange={(e) => setCancellationData({ 
                    ...cancellationData, 
                    adminNotes: e.target.value 
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Add notes about the cancellation..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCancelOrder}
              disabled={!selectedOrder}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}