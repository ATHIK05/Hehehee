import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Phone, UserCheck, X, Download } from 'lucide-react';
import { Inquiry } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { format } from 'date-fns';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Mock data - replace with Firebase fetch
    setTimeout(() => {
      const mockInquiries: Inquiry[] = [
        {
          id: '1',
          inquiryID: 'INQ001',
          clientName: 'Alex Thompson',
          requirementSummary: 'Wedding drone coverage for outdoor ceremony',
          source: 'instagram',
          city: 'Mumbai',
          phoneNumber: '+91 9876543210',
          createdAt: new Date(),
          status: 'new'
        },
        {
          id: '2',
          inquiryID: 'INQ002',
          clientName: 'Priya Sharma',
          requirementSummary: 'Real estate property showcase video',
          source: 'website',
          city: 'Delhi',
          phoneNumber: '+91 9876543211',
          createdAt: new Date(),
          status: 'contacted'
        },
        {
          id: '3',
          inquiryID: 'INQ003',
          clientName: 'Rahul Gupta',
          requirementSummary: 'Corporate event documentation',
          source: 'referral',
          city: 'Bangalore',
          phoneNumber: '+91 9876543212',
          createdAt: new Date(),
          status: 'converted'
        }
      ];
      setInquiries(mockInquiries);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.phoneNumber.includes(searchTerm) ||
                         inquiry.inquiryID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleConvert = (inquiryId: string) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId ? { ...inquiry, status: 'converted' as const } : inquiry
    ));
  };

  const handleMarkContacted = (inquiryId: string) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId ? { ...inquiry, status: 'contacted' as const } : inquiry
    ));
  };

  const handleReject = (inquiryId: string) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId ? { ...inquiry, status: 'rejected' as const } : inquiry
    ));
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">New Inquiries</h1>
        </div>
        <SkeletonLoader rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">New Inquiries Management</h1>
        <Button variant="secondary" className="flex items-center">
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
                          onClick={() => handleConvert(inquiry.id)}
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
                defaultValue={selectedInquiry.followUpNotes || ''}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button variant="danger" onClick={() => handleReject(selectedInquiry.id)}>
                Reject
              </Button>
              <Button onClick={() => handleConvert(selectedInquiry.id)}>
                Convert to Order
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}