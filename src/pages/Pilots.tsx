import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Pilot, PilotApplication } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getPilots, 
  getPilotApplications, 
  createPilot, 
  updatePilot, 
  deletePilot,
  updatePilotApplication,
  deletePilotApplication,
  generatePilotCode
} from '../services/firebase';
import { format } from 'date-fns';

export default function Pilots() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [applications, setApplications] = useState<PilotApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'database' | 'applications' | 'create'>('database');
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<PilotApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');

  const [newPilot, setNewPilot] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    city: '',
    state: '',
    experience: '',
    referralCode: '',
    adminComments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pilotsData, applicationsData] = await Promise.all([
        getPilots(),
        getPilotApplications()
      ]);
      setPilots(pilotsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePilot = async () => {
    try {
      const pilotCode = generatePilotCode(newPilot.city);
      await createPilot({
        ...newPilot,
        pilotCode,
        totalOrders: 0,
        isVerified: false,
        status: 'active',
        totalEarnings: 0,
        amountPaid: 0,
        remainingDues: 0
      });
      
      setNewPilot({
        name: '',
        phoneNumber: '',
        email: '',
        city: '',
        state: '',
        experience: '',
        referralCode: '',
        adminComments: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating pilot:', error);
    }
  };

  const handleApproveApplication = async (application: PilotApplication) => {
    try {
      const pilotCode = generatePilotCode(application.city);
      await createPilot({
        name: application.name,
        pilotCode,
        phoneNumber: application.phoneNumber,
        email: application.email,
        city: application.city,
        state: '', // Will need to be added to application form
        totalOrders: 0,
        isVerified: false,
        status: 'active',
        experience: application.experience,
        referralCode: application.referralCode,
        totalEarnings: 0,
        amountPaid: 0,
        remainingDues: 0
      });
      
      await updatePilotApplication(application.id, { status: 'approved' });
      fetchData();
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await updatePilotApplication(applicationId, { status: 'rejected' });
      fetchData();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleDeletePilot = async (pilotId: string) => {
    try {
      await deletePilot(pilotId);
      fetchData();
    } catch (error) {
      console.error('Error deleting pilot:', error);
    }
  };

  const filteredPilots = pilots.filter(pilot => {
    const matchesSearch = pilot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pilot.pilotCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pilot.phoneNumber.includes(searchTerm);
    const matchesFilter = filterCity === 'all' || pilot.city === filterCity;
    return matchesSearch && matchesFilter;
  });

  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phoneNumber.includes(searchTerm) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cities = [...new Set(pilots.map(p => p.city))];

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
        <h1 className="text-2xl font-bold text-slate-900">Pilot Management</h1>
        <Button onClick={() => setSelectedTab('create')} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Pilot
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'database', label: 'Pilot Database', count: pilots.length },
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
              placeholder={selectedTab === 'database' ? "Search by name, code, or phone..." : "Search applications..."}
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
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Pilot Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Orders
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
                {filteredPilots.map((pilot, index) => (
                  <motion.tr
                    key={pilot.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {pilot.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-slate-900">{pilot.name}</span>
                          {pilot.isVerified && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-slate-900">{pilot.pilotCode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">{pilot.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">{pilot.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">{pilot.totalOrders}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={pilot.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedPilot(pilot);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeletePilot(pilot.id)}
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
                    Applied Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Experience
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
                      {format(application.appliedDate, 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {application.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 max-w-xs truncate">
                      {application.experience}
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
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Create New Pilot Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={newPilot.name}
                onChange={(e) => setNewPilot({ ...newPilot, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={newPilot.phoneNumber}
                onChange={(e) => setNewPilot({ ...newPilot, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={newPilot.email}
                onChange={(e) => setNewPilot({ ...newPilot, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input
                type="text"
                value={newPilot.city}
                onChange={(e) => setNewPilot({ ...newPilot, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <input
                type="text"
                value={newPilot.state}
                onChange={(e) => setNewPilot({ ...newPilot, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Referral Code (Optional)</label>
              <input
                type="text"
                value={newPilot.referralCode}
                onChange={(e) => setNewPilot({ ...newPilot, referralCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Experience Description</label>
            <textarea
              value={newPilot.experience}
              onChange={(e) => setNewPilot({ ...newPilot, experience: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Internal Admin Comments</label>
            <textarea
              value={newPilot.adminComments}
              onChange={(e) => setNewPilot({ ...newPilot, adminComments: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCreatePilot}>
              Create Pilot
            </Button>
          </div>
        </motion.div>
      )}

      {/* Pilot Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPilot ? "Pilot Profile" : "Application Details"}
        maxWidth="lg"
      >
        {selectedPilot && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Pilot Code</label>
                <p className="text-slate-900 font-mono">{selectedPilot.pilotCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <p className="text-slate-900">{selectedPilot.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <p className="text-slate-900">{selectedPilot.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{selectedPilot.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedPilot.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">State</label>
                <p className="text-slate-900">{selectedPilot.state}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Total Orders</label>
                <p className="text-2xl font-bold text-slate-900">{selectedPilot.totalOrders}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Total Earnings</label>
                <p className="text-2xl font-bold text-green-600">₹{selectedPilot.totalEarnings.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Remaining Dues</label>
                <p className="text-2xl font-bold text-red-600">₹{selectedPilot.remainingDues.toLocaleString()}</p>
              </div>
            </div>

            {selectedPilot.experience && (
              <div>
                <label className="text-sm font-medium text-slate-700">Experience</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                  {selectedPilot.experience}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-700 mr-2">Verified:</span>
                <StatusBadge status={selectedPilot.isVerified ? 'verified' : 'pending'} />
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-700 mr-2">Status:</span>
                <StatusBadge status={selectedPilot.status} />
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
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <p className="text-slate-900">{selectedApplication.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{selectedApplication.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedApplication.city}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Experience</label>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                {selectedApplication.experience}
              </p>
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
    </div>
  );
}