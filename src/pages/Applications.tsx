import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, CheckCircle, XCircle, Clock, FileText, Users, Edit3 } from 'lucide-react';
import { ClientApplication, StaffApplication } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getClientApplications, 
  getStaffApplications, 
  updateClientApplication, 
  updateStaffApplication,
  createClient,
  createStaff
} from '../services/firebase';
import { format } from 'date-fns';

export default function Applications() {
  const [clientApplications, setClientApplications] = useState<ClientApplication[]>([]);
  const [staffApplications, setStaffApplications] = useState<StaffApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'clients' | 'pilots' | 'editors'>('clients');
  const [selectedApplication, setSelectedApplication] = useState<ClientApplication | StaffApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const [clientApps, staffApps] = await Promise.all([
        getClientApplications(),
        getStaffApplications()
      ]);
      setClientApplications(clientApps);
      setStaffApplications(staffApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (application: ClientApplication | StaffApplication) => {
    try {
      if ('companyName' in application) {
        // Client application
        await updateClientApplication(application.id, { 
          status: 'approved',
          adminComments: reviewComment 
        });
        
        // Create client record
        await createClient({
          userId: '', // Will be set when user registers
          companyName: application.companyName,
          contactName: application.contactName,
          phone: application.phone,
          city: application.city,
          industry: application.industry,
          website: application.website,
          status: 'active'
        });
      } else {
        // Staff application
        await updateStaffApplication(application.id, { 
          status: 'approved',
          adminComments: reviewComment 
        });
        
        // Create staff record
        await createStaff({
          userId: '', // Will be set when user registers
          name: application.name,
          role: application.role,
          location: application.location,
          skills: application.skills,
          status: 'active'
        });
      }
      
      fetchApplications();
      setIsModalOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (application: ClientApplication | StaffApplication) => {
    if (!reviewComment.trim()) {
      alert('Please add a comment explaining the rejection reason.');
      return;
    }
    
    try {
      if ('companyName' in application) {
        await updateClientApplication(application.id, { 
          status: 'rejected',
          adminComments: reviewComment 
        });
      } else {
        await updateStaffApplication(application.id, { 
          status: 'rejected',
          adminComments: reviewComment 
        });
      }
      
      fetchApplications();
      setIsModalOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleRequestMoreInfo = async (application: ClientApplication | StaffApplication) => {
    if (!reviewComment.trim()) {
      alert('Please add a comment explaining what additional information is needed.');
      return;
    }
    
    try {
      if ('companyName' in application) {
        await updateClientApplication(application.id, { 
          status: 'more_info',
          adminComments: reviewComment 
        });
      } else {
        await updateStaffApplication(application.id, { 
          status: 'more_info',
          adminComments: reviewComment 
        });
      }
      
      fetchApplications();
      setIsModalOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error requesting more info:', error);
    }
  };

  const getFilteredApplications = () => {
    let applications: (ClientApplication | StaffApplication)[] = [];
    
    if (selectedTab === 'clients') {
      applications = clientApplications;
    } else {
      applications = staffApplications.filter(app => app.role === selectedTab.slice(0, -1) as 'pilot' | 'editor');
    }
    
    return applications.filter(app => {
      const matchesSearch = 'companyName' in app 
        ? app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.contactName.toLowerCase().includes(searchTerm.toLowerCase())
        : app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      case 'approved': return 'bg-green-50 border-green-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      case 'more_info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const tabs = [
    { 
      id: 'clients' as const, 
      label: 'Client Applications', 
      count: clientApplications.filter(app => app.status === 'pending').length,
      icon: Users
    },
    { 
      id: 'pilots' as const, 
      label: 'Pilot Applications', 
      count: staffApplications.filter(app => app.role === 'pilot' && app.status === 'pending').length,
      icon: Users
    },
    { 
      id: 'editors' as const, 
      label: 'Editor Applications', 
      count: staffApplications.filter(app => app.role === 'editor' && app.status === 'pending').length,
      icon: Edit3
    },
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Applications Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab(tab.id)}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2
                ${selectedTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search applications..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="more_info">More Info Needed</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'approved', 'rejected', 'more_info'].map((status) => {
          const count = getFilteredApplications().filter(app => app.status === status).length;
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
                  {status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                  {status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                  {status === 'more_info' && <FileText className="w-5 h-5 text-blue-600" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Applications Table */}
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
                  {selectedTab === 'clients' ? 'Company / Contact' : 'Name'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {selectedTab === 'clients' ? 'Industry' : 'Location'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Applied Date
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
              {getFilteredApplications().map((application, index) => (
                <motion.tr
                  key={application.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {'companyName' in application ? application.companyName : application.name}
                      </div>
                      {'companyName' in application && (
                        <div className="text-sm text-slate-500">{application.contactName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {application.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {'companyName' in application ? application.industry : application.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {format(application.createdAt, 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={application.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedApplication(application);
                          setReviewComment(application.adminComments || '');
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApproveApplication(application)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRejectApplication(application)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {getFilteredApplications().length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No applications found</p>
          </div>
        )}
      </motion.div>

      {/* Application Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Application Review"
        maxWidth="2xl"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Application Details */}
            <div className="grid grid-cols-2 gap-4">
              {'companyName' in selectedApplication ? (
                // Client Application
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Company Name</label>
                    <p className="text-slate-900">{selectedApplication.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Contact Person</label>
                    <p className="text-slate-900">{selectedApplication.contactName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Industry</label>
                    <p className="text-slate-900">{selectedApplication.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <p className="text-slate-900">{selectedApplication.city}</p>
                  </div>
                  {selectedApplication.website && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">Website</label>
                      <a 
                        href={selectedApplication.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedApplication.website}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                // Staff Application
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Name</label>
                    <p className="text-slate-900">{selectedApplication.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Role</label>
                    <p className="text-slate-900 capitalize">{selectedApplication.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Location</label>
                    <p className="text-slate-900">{selectedApplication.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedApplication.portfolioLink && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">Portfolio</label>
                      <a 
                        href={selectedApplication.portfolioLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Portfolio
                      </a>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{selectedApplication.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <p className="text-slate-900">{selectedApplication.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Applied Date</label>
                <p className="text-slate-900">{format(selectedApplication.createdAt, 'dd MMM yyyy - hh:mm a')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Current Status</label>
                <StatusBadge status={selectedApplication.status} />
              </div>
            </div>

            {selectedApplication.referralCode && (
              <div>
                <label className="text-sm font-medium text-slate-700">Referral Code</label>
                <p className="text-slate-900 font-mono">{selectedApplication.referralCode}</p>
              </div>
            )}

            {selectedApplication.documentsLink && (
              <div>
                <label className="text-sm font-medium text-slate-700">Documents</label>
                <a 
                  href={selectedApplication.documentsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 block"
                >
                  View Documents
                </a>
              </div>
            )}

            {/* Review Comments */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Review Comments</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                rows={3}
                placeholder="Add your review comments here..."
              />
            </div>

            {selectedApplication.adminComments && (
              <div>
                <label className="text-sm font-medium text-slate-700">Previous Comments</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedApplication.adminComments}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {selectedApplication.status === 'pending' && (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleRequestMoreInfo(selectedApplication)}
                  >
                    Request More Info
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => handleRejectApplication(selectedApplication)}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => handleApproveApplication(selectedApplication)}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}