import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Plus, Edit, Trash2, Phone, Mail, MapPin, Award } from 'lucide-react';
import { Editor, EditorApplication } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getEditors, 
  getEditorApplications, 
  createEditor, 
  updateEditor, 
  deleteEditor,
  updateEditorApplication,
  deleteEditorApplication,
  generateEditorCode
} from '../services/firebase';
import { format } from 'date-fns';

export default function Editors() {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [applications, setApplications] = useState<EditorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'database' | 'applications' | 'create'>('database');
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<EditorApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');

  const [newEditor, setNewEditor] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    city: '',
    specialization: [] as string[],
    adminComments: ''
  });

  const specializationOptions = [
    'Wedding Videos',
    'Corporate Events',
    'Real Estate',
    'Music Videos',
    'Documentary',
    'Commercial',
    'Social Media Content',
    'Drone Footage',
    'Color Grading',
    'Motion Graphics'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [editorsData, applicationsData] = await Promise.all([
        getEditors(),
        getEditorApplications()
      ]);
      setEditors(editorsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEditor = async () => {
    try {
      const editorCode = generateEditorCode();
      await createEditor({
        ...newEditor,
        editorCode,
        totalOrders: 0,
        isVerified: false,
        status: 'active',
        totalEarnings: 0,
        amountPaid: 0,
        remainingDues: 0
      });
      
      setNewEditor({
        name: '',
        phoneNumber: '',
        email: '',
        city: '',
        specialization: [],
        adminComments: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating editor:', error);
    }
  };

  const handleApproveApplication = async (application: EditorApplication) => {
    try {
      const editorCode = generateEditorCode();
      await createEditor({
        name: application.name,
        editorCode,
        phoneNumber: application.phoneNumber,
        email: application.email,
        city: application.city,
        totalOrders: 0,
        isVerified: false,
        specialization: application.specialization,
        status: 'active',
        totalEarnings: 0,
        amountPaid: 0,
        remainingDues: 0
      });
      
      await updateEditorApplication(application.id, { status: 'approved' });
      fetchData();
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await updateEditorApplication(applicationId, { status: 'rejected' });
      fetchData();
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleDeleteEditor = async (editorId: string) => {
    try {
      await deleteEditor(editorId);
      fetchData();
    } catch (error) {
      console.error('Error deleting editor:', error);
    }
  };

  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    if (checked) {
      setNewEditor(prev => ({
        ...prev,
        specialization: [...prev.specialization, specialization]
      }));
    } else {
      setNewEditor(prev => ({
        ...prev,
        specialization: prev.specialization.filter(s => s !== specialization)
      }));
    }
  };

  const filteredEditors = editors.filter(editor => {
    const matchesSearch = editor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         editor.editorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         editor.phoneNumber.includes(searchTerm);
    const matchesFilter = filterCity === 'all' || editor.city === filterCity;
    return matchesSearch && matchesFilter;
  });

  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phoneNumber.includes(searchTerm) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cities = [...new Set(editors.map(e => e.city))];

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
        <h1 className="text-2xl font-bold text-slate-900">Editor Management</h1>
        <Button onClick={() => setSelectedTab('create')} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Editor
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'database', label: 'Editor Database', count: editors.length },
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
                    Editor Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Specialization
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
                {filteredEditors.map((editor, index) => (
                  <motion.tr
                    key={editor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {editor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-slate-900">{editor.name}</span>
                          {editor.isVerified && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-slate-900">{editor.editorCode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">{editor.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-sm text-slate-900">{editor.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {editor.specialization.slice(0, 2).map((spec, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {spec}
                          </span>
                        ))}
                        {editor.specialization.length > 2 && (
                          <span className="text-xs text-slate-500">
                            +{editor.specialization.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">{editor.totalOrders}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={editor.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedEditor(editor);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteEditor(editor.id)}
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
                    Specialization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Portfolio
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {application.specialization.slice(0, 2).map((spec, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {spec}
                          </span>
                        ))}
                        {application.specialization.length > 2 && (
                          <span className="text-xs text-slate-500">
                            +{application.specialization.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.portfolioLink ? (
                        <a
                          href={application.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Portfolio
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">No portfolio</span>
                      )}
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
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Create New Editor Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={newEditor.name}
                onChange={(e) => setNewEditor({ ...newEditor, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={newEditor.phoneNumber}
                onChange={(e) => setNewEditor({ ...newEditor, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={newEditor.email}
                onChange={(e) => setNewEditor({ ...newEditor, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input
                type="text"
                value={newEditor.city}
                onChange={(e) => setNewEditor({ ...newEditor, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Specialization</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specializationOptions.map((spec) => (
                <label key={spec} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newEditor.specialization.includes(spec)}
                    onChange={(e) => handleSpecializationChange(spec, e.target.checked)}
                    className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Internal Admin Comments</label>
            <textarea
              value={newEditor.adminComments}
              onChange={(e) => setNewEditor({ ...newEditor, adminComments: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCreateEditor}>
              Create Editor
            </Button>
          </div>
        </motion.div>
      )}

      {/* Editor Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEditor ? "Editor Profile" : "Application Details"}
        maxWidth="lg"
      >
        {selectedEditor && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Editor Code</label>
                <p className="text-slate-900 font-mono">{selectedEditor.editorCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <p className="text-slate-900">{selectedEditor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <p className="text-slate-900">{selectedEditor.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{selectedEditor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <p className="text-slate-900">{selectedEditor.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Registered</label>
                <p className="text-slate-900">{format(selectedEditor.registeredDate, 'dd MMM yyyy')}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2">Specialization</label>
              <div className="flex flex-wrap gap-2">
                {selectedEditor.specialization.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Total Orders</label>
                <p className="text-2xl font-bold text-slate-900">{selectedEditor.totalOrders}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Total Earnings</label>
                <p className="text-2xl font-bold text-green-600">₹{selectedEditor.totalEarnings.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Remaining Dues</label>
                <p className="text-2xl font-bold text-red-600">₹{selectedEditor.remainingDues.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-700 mr-2">Verified:</span>
                <StatusBadge status={selectedEditor.isVerified ? 'verified' : 'pending'} />
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-slate-700 mr-2">Status:</span>
                <StatusBadge status={selectedEditor.status} />
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
              <label className="text-sm font-medium text-slate-700 mb-2">Specialization</label>
              <div className="flex flex-wrap gap-2">
                {selectedApplication.specialization.map((spec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Experience</label>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                {selectedApplication.experience}
              </p>
            </div>

            {selectedApplication.portfolioLink && (
              <div>
                <label className="text-sm font-medium text-slate-700">Portfolio</label>
                <a
                  href={selectedApplication.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 block mt-1"
                >
                  {selectedApplication.portfolioLink}
                </a>
              </div>
            )}

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