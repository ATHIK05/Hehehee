import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Plus, Edit, Trash2, Calendar, MapPin, User, DollarSign } from 'lucide-react';
import { Order, Pilot, Editor } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getOrders, 
  getPilots, 
  getEditors, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  generateOrderID
} from '../services/firebase';
import { format } from 'date-fns';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const [newOrder, setNewOrder] = useState({
    clientName: '',
    phoneNumber: '',
    city: '',
    requirementSummary: '',
    packageType: '',
    amount: 0,
    editor: '',
    pilot: '',
    referralCode: '',
    driveLink: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, pilotsData, editorsData] = await Promise.all([
        getOrders(),
        getPilots(),
        getEditors()
      ]);
      setOrders(ordersData);
      setPilots(pilotsData);
      setEditors(editorsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
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
        packageType: '',
        amount: 0,
        editor: '',
        pilot: '',
        referralCode: '',
        driveLink: ''
      });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      await updateOrder(orderId, updates);
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      fetchData();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.phoneNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesCity = filterCity === 'all' || order.city === filterCity;
    
    let matchesDate = true;
    if (dateRange.from && dateRange.to) {
      const orderDate = new Date(order.createdAt);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      matchesDate = orderDate >= fromDate && orderDate <= toDate;
    }
    
    return matchesSearch && matchesStatus && matchesCity && matchesDate;
  });

  const cities = [...new Set(orders.map(o => o.city))];
  const statusOptions = ['new', 'assigned', 'editing', 'final_review', 'completed', 'cancelled'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 border-blue-200';
      case 'assigned': return 'bg-yellow-50 border-yellow-200';
      case 'editing': return 'bg-orange-50 border-orange-200';
      case 'final_review': return 'bg-purple-50 border-purple-200';
      case 'completed': return 'bg-green-50 border-green-200';
      case 'cancelled': return 'bg-red-50 border-red-200';
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
        <h1 className="text-2xl font-bold text-slate-900">All Orders Database</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create New Order
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />

          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOptions.map((status) => {
          const count = orders.filter(o => o.status === status).length;
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
                  {status === 'new' && '📝'}
                  {status === 'assigned' && '👥'}
                  {status === 'editing' && '✂️'}
                  {status === 'final_review' && '👁️'}
                  {status === 'completed' && '✅'}
                  {status === 'cancelled' && '❌'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Orders Table */}
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
                  Date & Time
                </th>
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
                  Editor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Pilot
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`hover:bg-slate-50 transition-colors ${
                    order.status === 'completed' ? 'bg-green-50' : 
                    order.status === 'cancelled' ? 'bg-red-50 line-through' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-900">
                        {format(order.createdAt, 'dd MMM - hh:mm a')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{order.orderID}</span>
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
                      <span className="text-sm text-slate-900">{order.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">
                      {order.editor || 'Not Assigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">
                      {order.pilot || 'Not Assigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} variant="order" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
                      <span className="text-sm font-medium text-slate-900">
                        ₹{order.amount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Management"
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
                <label className="text-sm font-medium text-slate-700">Client Name</label>
                <p className="text-slate-900">{selectedOrder.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <p className="text-slate-900">{selectedOrder.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedOrder.city}</p>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2">Assigned Editor</label>
                <select
                  value={selectedOrder.editor || ''}
                  onChange={(e) => handleUpdateOrder(selectedOrder.id, { editor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Select Editor</option>
                  {editors.map(editor => (
                    <option key={editor.id} value={editor.name}>
                      {editor.name} ({editor.editorCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2">Assigned Pilot</label>
                <select
                  value={selectedOrder.pilot || ''}
                  onChange={(e) => handleUpdateOrder(selectedOrder.id, { pilot: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  <option value="">Select Pilot</option>
                  {pilots.map(pilot => (
                    <option key={pilot.id} value={pilot.name}>
                      {pilot.name} ({pilot.pilotCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateOrder(selectedOrder.id, { status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder.requirementSummary && (
              <div>
                <label className="text-sm font-medium text-slate-700">Requirement Summary</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedOrder.requirementSummary}
                </p>
              </div>
            )}

            {selectedOrder.driveLink && (
              <div>
                <label className="text-sm font-medium text-slate-700">Drive Link</label>
                <a
                  href={selectedOrder.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 block mt-1"
                >
                  {selectedOrder.driveLink}
                </a>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button variant="danger" onClick={() => {
                handleUpdateOrder(selectedOrder.id, { status: 'cancelled' });
                setIsModalOpen(false);
              }}>
                Cancel Order
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
              <label className="block text-sm font-medium text-slate-700 mb-2">Client Name</label>
              <input
                type="text"
                value={newOrder.clientName}
                onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={newOrder.phoneNumber}
                onChange={(e) => setNewOrder({ ...newOrder, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input
                type="text"
                value={newOrder.city}
                onChange={(e) => setNewOrder({ ...newOrder, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <input
                type="number"
                value={newOrder.amount}
                onChange={(e) => setNewOrder({ ...newOrder, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Editor</label>
              <select
                value={newOrder.editor}
                onChange={(e) => setNewOrder({ ...newOrder, editor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Select Editor</option>
                {editors.map(editor => (
                  <option key={editor.id} value={editor.name}>
                    {editor.name} ({editor.editorCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Pilot</label>
              <select
                value={newOrder.pilot}
                onChange={(e) => setNewOrder({ ...newOrder, pilot: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Select Pilot</option>
                {pilots.map(pilot => (
                  <option key={pilot.id} value={pilot.name}>
                    {pilot.name} ({pilot.pilotCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Requirement Summary</label>
            <textarea
              value={newOrder.requirementSummary}
              onChange={(e) => setNewOrder({ ...newOrder, requirementSummary: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
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