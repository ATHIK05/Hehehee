import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Phone, UserCheck, X, Download } from 'lucide-react';
import { Inquiry } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getInquiries, 
  updateInquiry, 
  deleteInquiry, 
  createOrder, 
  generateOrderID 
} from '../services/firebase';
import { format } from 'date-fns';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [followUpNotes, setFollowUpNotes] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const inquiriesData = await getInquiries();
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.phoneNumber.includes(searchTerm) ||
                         inquiry.inquiryID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || inquiry.status === filterStatus;
    const matchesSource = filterSource === 'all' || inquiry.source === filterSource;
    return matchesSearch && matchesFilter && matchesSource;
  });

  const handleConvert = async (inquiry: Inquiry) => {
    try {
      // Create order from inquiry
      const orderID = generateOrderID();
      await createOrder({
        orderID,
        clientName: inquiry.clientName,
        phoneNumber: inquiry.phoneNumber,
        city: inquiry.city,
        requirementSummary: inquiry.requirementSummary,
        status: 'new',
        paymentStatus: 'pending',
        amount: 0, // Will be updated later
        packageType: 'basic'
      });
      
      // Update inquiry status
      await updateInquiry(inquiry.id, { status: 'converted' });
      fetchInquiries();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error converting inquiry:', error);
    }
  };

  const handleMarkContacted = async (inquiryId: string) => {
    try {
      await updateInquiry(inquiryId, { status: 'contacted' });
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry:', error);
    }
  };

  const handleReject = async (inquiryId: string) => {
    try {
      await updateInquiry(inquiryId, { status: 'rejected' });
      fetchInquiries();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error rejecting inquiry:', error);
    }
  };

  const handleUpdateFollowUp = async () => {
    if (!selectedInquiry || !followUpNotes.trim()) return;
    
    try {
      await updateInquiry(selectedInquiry.id, { 
        followUpNotes: followUpNotes,
        status: 'contacted'
      });
      fetchInquiries();
      setFollowUpNotes('');
    } catch (error) {
      console.error('Error updating follow-up notes:', error);
    }
  };

  const exportInquiries = () => {
    const csvContent = [
      ['Inquiry ID', 'Client Name', 'Phone', 'City', 'Source', 'Status', 'Date', 'Requirement'],
      ...filteredInquiries.map(inquiry => [
        inquiry.inquiryID,
        inquiry.clientName,
        inquiry.phoneNumber,
        inquiry.city,
        inquiry.source,
        inquiry.status,
        format(inquiry.createdAt, 'dd/MM/yyyy'),
        inquiry.requirementSummary
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'instagram': return '📱';
      case 'website': return '🌐';
      case 'whatsapp': return '💬';
      case 'referral': return '👥';
      default: return '📝';
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
        <h1 className="text-2xl font-bold text-slate-900">New Inquiries Management</h1>
        <Button variant="secondary" className="flex items-center" onClick={exportInquiries}>
          <Download className="w-4 h-4 mr-2" />
          Export Inquiries
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or inquiry ID..."
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
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          <option value="all">All Sources</option>
          <option value="instagram">Instagram</option>
          <option value="website">Website</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="referral">Referral</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['new', 'contacted', 'converted', 'rejected'].map((status) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 capitalize">{status}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {inquiries.filter(i => i.status === status).length}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${status === 'new' ? 'bg-blue-50 text-blue-600' :
                  status === 'contacted' ? 'bg-yellow-50 text-yellow-600' :
                  status === 'converted' ? 'bg-green-50 text-green-600' :
                  'bg-red-50 text-red-600'
                }`}>
                {status === 'new' ? '📨' : 
                 status === 'contacted' ? '📞' : 
                 status === 'converted' ? '✅' : '❌'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inquiries Table */}
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
                  Inquiry ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Requirement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
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
              {filteredInquiries.map((inquiry, index) => (
                <motion.tr
                  key={inquiry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{inquiry.inquiryID}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {inquiry.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">
                    {inquiry.requirementSummary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSourceIcon(inquiry.source)}</span>
                      <span className="text-sm text-slate-600 capitalize">{inquiry.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {inquiry.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {format(inquiry.createdAt, 'dd MMM')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={inquiry.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          setFollowUpNotes(inquiry.followUpNotes || '');
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {inquiry.status === 'new' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleMarkContacted(inquiry.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </motion.button>
                      )}
                      {inquiry.status !== 'converted' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleConvert(inquiry)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </motion.button>
                      )}
                      {inquiry.status !== 'rejected' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReject(inquiry.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
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

      {/* Inquiry Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Inquiry Details"
        maxWidth="lg"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Inquiry ID</label>
                <p className="text-slate-900">{selectedInquiry.inquiryID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Client Name</label>
                <p className="text-slate-900">{selectedInquiry.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <p className="text-slate-900">{selectedInquiry.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedInquiry.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Source</label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSourceIcon(selectedInquiry.source)}</span>
                  <span className="text-slate-900 capitalize">{selectedInquiry.source}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Date</label>
                <p className="text-slate-900">{format(selectedInquiry.createdAt, 'dd MMM yyyy - hh:mm a')}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Requirement Summary</label>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                {selectedInquiry.requirementSummary}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Follow-up Notes</label>
              <textarea
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                rows={3}
                placeholder="Add follow-up notes here..."
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
              />
              {followUpNotes !== (selectedInquiry.followUpNotes || '') && (
                <Button 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleUpdateFollowUp}
                >
                  Save Notes
                </Button>
              )}
            </div>

            {selectedInquiry.followUpNotes && (
              <div>
                <label className="text-sm font-medium text-slate-700">Previous Notes</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedInquiry.followUpNotes}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {selectedInquiry.status !== 'rejected' && (
                <Button variant="danger" onClick={() => handleReject(selectedInquiry.id)}>
                  Reject
                </Button>
              )}
              {selectedInquiry.status !== 'converted' && (
                <Button onClick={() => handleConvert(selectedInquiry)}>
                  Convert to Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}