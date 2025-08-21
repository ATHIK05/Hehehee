import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Plus, Edit, Trash2, ExternalLink, Users, DollarSign } from 'lucide-react';
import { Referral, ReferralApplication } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getReferrals, 
  getReferralApplications, 
  createReferral, 
  updateReferral, 
  deleteReferral,
  updateReferralApplication,
  deleteReferralApplication,
  generateRIN
} from '../services/firebase';
import { format } from 'date-fns';

export default function Referrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [applications, setApplications] = useState<ReferralApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'database' | 'applications' | 'create'>('database');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ReferralApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');

  const [newReferral, setNewReferral] = useState({
    name: '',
    email: '',
    city: '',
    state: '',
    socialProfiles: ['', '', ''],
    followersCount: 0,
    category: '',
    adminComments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [referralsData, applicationsData] = await Promise.all([
        getReferrals(),
        getReferralApplications()
      ]);
      setReferrals(referralsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async () => {
    try {
      const rin = generateRIN();
      await createReferral({
        ...newReferral,
        rin,
        socialProfiles: newReferral.socialProfiles.filter(profile => profile.trim() !== ''),
        referredClients: 0,
        totalOrderCost: 0,
        referralFee: 0,
        centralProfit: 0,
        status: 'active'
      });
      
      setNewReferral({
        name: '',
        email: '',
        city: '',
        state: '',
        socialProfiles: ['', '', ''],
        followersCount: 0,
        category: '',
        adminComments: ''
      });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  const handleApproveApplication = async (application: ReferralApplication) => {
    try {
      const rin = generateRIN();
      await createReferral({
        name: application.name,
        rin,
        email: application.email,
        city: application.city,
        state: application.state,
        socialProfiles: application.socialProfiles,
        followersCount: application.followersCount,
        category: application.category,
        referredClients: 0,
        totalOrderCost: 0,
        referralFee: 0,
        centralProfit: 0,
        status: 'active'
      });
      
      await updateReferralApplication(application.id, { status: 'approved' });
      fetchData();
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await updateReferralApplication(applicationId, { status: 'rejected' });
      fetchData();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleDeleteReferral = async (referralId: string) => {
    try {
      await deleteReferral(referralId);
      fetchData();
    } catch (error) {
      console.error('Error deleting referral:', error);
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.rin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCity === 'all' || referral.city === filterCity;
    return matchesSearch && matchesFilter;
  });

  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cities = [...new Set(referrals.map(r => r.city))];

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
        <h1 className="text-2xl font-bold text-slate-900">Referral Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Referral
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'database', label: 'Referral Database', count: referrals.length },
            { id: 'applications', label: 'Applications', count: applications.filter(a => a.status === 'pending').length },
            { id: 'create', label: 'Create New', count: 0 }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${selectedTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                    {tab.count}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Search and Filter */}
      {selectedTab !== 'create' && (
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={selectedTab === 'database' ? "Search by name or RIN..." : "Search applications..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          {selectedTab === 'database' && (
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
          )}
        </div>
      )}

      {/* Content based on selected tab */}
      {selectedTab === 'database' && (
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
                    RIN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Social Profile
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Referred Clients
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Order Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Referral Fee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Central Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredReferrals.map((referral, index) => (
                  <motion.tr
                    key={referral.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{referral.rin}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {referral.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {referral.socialProfiles.length > 0 ? (
                        <a
                          href={referral.socialProfiles[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Profile
                        </a>
                      ) : (
                        <span className="text-slate-400">No profile</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">{referral.referredClients}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
                        <span className="text-sm text-slate-900">₹{referral.totalOrderCost.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600 font-medium">₹{referral.referralFee.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600 font-medium">₹{referral.centralProfit.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedReferral(referral);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteReferral(referral.id)}
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
      )}

      {selectedTab === 'applications' && (
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
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Social Profile
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Followers
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
                {filteredApplications.map((application, index) => (
                  <motion.tr
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {application.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {application.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.socialProfiles.length > 0 ? (
                        <a
                          href={application.socialProfiles[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">No profile</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {application.followersCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(application.appliedDate, 'dd MMM yyyy')}
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
                              onClick={() => handleRejectApplication(application.id)}
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
        </motion.div>
      )}

      {selectedTab === 'create' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Create New Referral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={newReferral.name}
                onChange={(e) => setNewReferral({ ...newReferral, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={newReferral.email}
                onChange={(e) => setNewReferral({ ...newReferral, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input
                type="text"
                value={newReferral.city}
                onChange={(e) => setNewReferral({ ...newReferral, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <input
                type="text"
                value={newReferral.state}
                onChange={(e) => setNewReferral({ ...newReferral, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={newReferral.category}
                onChange={(e) => setNewReferral({ ...newReferral, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Influencer">Influencer</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Promoter">Promoter</option>
                <option value="Content Creator">Content Creator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Followers Count</label>
              <input
                type="number"
                value={newReferral.followersCount}
                onChange={(e) => setNewReferral({ ...newReferral, followersCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Social Profile Links</label>
            {newReferral.socialProfiles.map((profile, index) => (
              <input
                key={index}
                type="url"
                placeholder={`Social Profile Link ${index + 1}`}
                value={profile}
                onChange={(e) => {
                  const updatedProfiles = [...newReferral.socialProfiles];
                  updatedProfiles[index] = e.target.value;
                  setNewReferral({ ...newReferral, socialProfiles: updatedProfiles });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-2"
              />
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Admin Comments</label>
            <textarea
              value={newReferral.adminComments}
              onChange={(e) => setNewReferral({ ...newReferral, adminComments: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCreateReferral}>
              Create Referral
            </Button>
          </div>
        </motion.div>
      )}

      {/* Referral Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedReferral ? "Referral Details" : "Application Details"}
        maxWidth="lg"
      >
        {selectedReferral && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">RIN</label>
                <p className="text-slate-900">{selectedReferral.rin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <p className="text-slate-900">{selectedReferral.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{selectedReferral.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedReferral.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <p className="text-slate-900">{selectedReferral.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Followers</label>
                <p className="text-slate-900">{selectedReferral.followersCount.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Social Profiles</label>
              <div className="space-y-2 mt-1">
                {selectedReferral.socialProfiles.map((profile, index) => (
                  <a
                    key={index}
                    href={profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 block"
                  >
                    {profile}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Referred Clients</label>
                <p className="text-2xl font-bold text-slate-900">{selectedReferral.referredClients}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Total Order Cost</label>
                <p className="text-2xl font-bold text-green-600">₹{selectedReferral.totalOrderCost.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Referral Fee</label>
                <p className="text-2xl font-bold text-blue-600">₹{selectedReferral.referralFee.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {selectedApplication && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <p className="text-slate-900">{selectedApplication.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{selectedApplication.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedApplication.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <p className="text-slate-900">{selectedApplication.category}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Social Profiles</label>
              <div className="space-y-2 mt-1">
                {selectedApplication.socialProfiles.map((profile, index) => (
                  <a
                    key={index}
                    href={profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 block"
                  >
                    {profile}
                  </a>
                ))}
              </div>
            </div>

            {selectedApplication.adminComments && (
              <div>
                <label className="text-sm font-medium text-slate-700">Admin Comments</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedApplication.adminComments}
                </p>
              </div>
            )}

            {selectedApplication.status === 'pending' && (
              <div className="flex justify-end space-x-3">
                <Button variant="danger" onClick={() => handleRejectApplication(selectedApplication.id)}>
                  Reject
                </Button>
                <Button onClick={() => handleApproveApplication(selectedApplication)}>
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Referral Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Referral"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Use the Create New tab to add referrals manually.</p>
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsCreateModalOpen(false);
              setSelectedTab('create');
            }}>
              Go to Create Form
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}