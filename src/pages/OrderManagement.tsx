import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Eye, 
  UserCheck, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Clock,
  Play,
  Upload
} from 'lucide-react';
import { Order, Assignment, Submission, Comment, Staff } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getOrders, 
  getAssignments, 
  getSubmissions, 
  getComments,
  getStaff,
  updateOrder, 
  createAssignment,
  updateAssignment,
  updateSubmission,
  createComment
} from '../services/firebase';
import { format } from 'date-fns';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'assigned' | 'pilot_submitted' | 'editor_submitted' | 'completed'>('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedPilot, setSelectedPilot] = useState('');
  const [selectedEditor, setSelectedEditor] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, assignmentsData, submissionsData, commentsData, staffData] = await Promise.all([
        getOrders(),
        getAssignments(),
        getSubmissions(),
        getComments(),
        getStaff()
      ]);
      setOrders(ordersData);
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
      setComments(commentsData);
      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (order: Order) => {
    try {
      await updateOrder(order.id, { status: 'approved' });
      await createComment({
        orderId: order.id,
        commentBy: 'admin',
        commenterId: 'admin-1',
        commenterName: 'Admin',
        commentStage: 'general',
        commentText: reviewComment || 'Order approved for assignment'
      });
      fetchData();
      setIsModalOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  const handleRejectOrder = async (order: Order) => {
    if (!reviewComment.trim()) {
      alert('Please add a comment explaining the rejection reason.');
      return;
    }
    
    try {
      await updateOrder(order.id, { status: 'rejected', adminComments: reviewComment });
      await createComment({
        orderId: order.id,
        commentBy: 'admin',
        commenterId: 'admin-1',
        commenterName: 'Admin',
        commentStage: 'general',
        commentText: reviewComment
      });
      fetchData();
      setIsModalOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleAssignStaff = async (order: Order) => {
    if (!selectedPilot && !selectedEditor) {
      alert('Please select at least one staff member to assign.');
      return;
    }
    
    try {
      const pilot = staff.find(s => s.id === selectedPilot);
      const editor = staff.find(s => s.id === selectedEditor);
      
      await createAssignment({
        orderId: order.id,
        pilotId: selectedPilot || undefined,
        pilotName: pilot?.name || undefined,
        editorId: selectedEditor || undefined,
        editorName: editor?.name || undefined,
        status: 'assigned'
      });
      
      await updateOrder(order.id, { 
        status: 'assigned',
        pilot: pilot?.name,
        editor: editor?.name
      });
      
      await createComment({
        orderId: order.id,
        commentBy: 'admin',
        commenterId: 'admin-1',
        commenterName: 'Admin',
        commentStage: 'general',
        commentText: `Assigned - Pilot: ${pilot?.name || 'None'}, Editor: ${editor?.name || 'None'}`
      });
      
      fetchData();
      setIsModalOpen(false);
      setSelectedPilot('');
      setSelectedEditor('');
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  const handleReviewSubmission = async (submission: Submission, approved: boolean) => {
    try {
      await updateSubmission(submission.id, {
        status: approved ? 'approved' : 'rejected',
        reviewComments: reviewComment,
        reviewedBy: 'Admin'
      });
      
      // Update order status based on submission type and approval
      const order = orders.find(o => o.id === submission.orderId);
      if (order && approved) {
        if (submission.submittedBy === 'pilot') {
          await updateOrder(order.id, { status: 'pilot_reviewed' });
        } else if (submission.submittedBy === 'editor') {
          await updateOrder(order.id, { status: 'editor_reviewed' });
        }
      }
      
      await createComment({
        orderId: submission.orderId,
        commentBy: 'admin',
        commenterId: 'admin-1',
        commenterName: 'Admin',
        commentStage: submission.submittedBy === 'pilot' ? 'pilot_submission' : 'editor_submission',
        commentText: reviewComment || (approved ? 'Submission approved' : 'Submission rejected')
      });
      
      fetchData();
      setReviewComment('');
    } catch (error) {
      console.error('Error reviewing submission:', error);
    }
  };

  const getFilteredOrders = () => {
    let filteredOrders = orders;
    
    switch (selectedTab) {
      case 'pending':
        filteredOrders = orders.filter(o => o.status === 'pending');
        break;
      case 'approved':
        filteredOrders = orders.filter(o => o.status === 'approved');
        break;
      case 'assigned':
        filteredOrders = orders.filter(o => o.status === 'assigned');
        break;
      case 'pilot_submitted':
        filteredOrders = orders.filter(o => o.status === 'pilot_submitted');
        break;
      case 'editor_submitted':
        filteredOrders = orders.filter(o => o.status === 'editor_submitted');
        break;
      case 'completed':
        filteredOrders = orders.filter(o => ['editor_reviewed', 'completed'].includes(o.status));
        break;
    }
    
    return filteredOrders.filter(order => 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getOrderAssignment = (orderId: string) => {
    return assignments.find(a => a.orderId === orderId);
  };

  const getOrderSubmissions = (orderId: string) => {
    return submissions.filter(s => s.orderId === orderId);
  };

  const getOrderComments = (orderId: string) => {
    return comments.filter(c => c.orderId === orderId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const pilots = staff.filter(s => s.role === 'pilot');
  const editors = staff.filter(s => s.role === 'editor');

  const tabs = [
    { id: 'pending' as const, label: 'Pending Review', count: orders.filter(o => o.status === 'pending').length },
    { id: 'approved' as const, label: 'Approved', count: orders.filter(o => o.status === 'approved').length },
    { id: 'assigned' as const, label: 'Assigned', count: orders.filter(o => o.status === 'assigned').length },
    { id: 'pilot_submitted' as const, label: 'Pilot Submitted', count: orders.filter(o => o.status === 'pilot_submitted').length },
    { id: 'editor_submitted' as const, label: 'Editor Submitted', count: orders.filter(o => o.status === 'editor_submitted').length },
    { id: 'completed' as const, label: 'Completed', count: orders.filter(o => ['editor_reviewed', 'completed'].includes(o.status)).length },
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-600">Complete order lifecycle management</p>
        </div>
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

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders by client, order ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
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
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Location & Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assignment
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
              {getFilteredOrders().map((order, index) => {
                const assignment = getOrderAssignment(order.id);
                const orderSubmissions = getOrderSubmissions(order.id);
                const pilotSubmission = orderSubmissions.find(s => s.submittedBy === 'pilot');
                const editorSubmission = orderSubmissions.find(s => s.submittedBy === 'editor');
                
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
                        <div className="flex items-center mt-1">
                          <DollarSign className="w-3 h-3 text-slate-400 mr-1" />
                          <span className="text-sm text-slate-600">₹{order.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{order.clientName}</div>
                      <div className="text-sm text-slate-500">{order.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm text-slate-900">{order.city}</div>
                          <div className="flex items-center text-sm text-slate-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(order.orderDate, 'dd MMM yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment ? (
                        <div className="text-sm">
                          {assignment.pilotName && (
                            <div className="text-slate-900">P: {assignment.pilotName}</div>
                          )}
                          {assignment.editorName && (
                            <div className="text-slate-900">E: {assignment.editorName}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} variant="order" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedOrder(order);
                          setReviewComment('');
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {getFilteredOrders().length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No orders found</p>
          </div>
        )}
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
            {/* Order Details */}
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
                <label className="text-sm font-medium text-slate-700">Location</label>
                <p className="text-slate-900">{selectedOrder.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Order Date</label>
                <p className="text-slate-900">{format(selectedOrder.orderDate, 'dd MMM yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Duration</label>
                <p className="text-slate-900">{selectedOrder.duration} hours</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Package Type</label>
                <p className="text-slate-900 capitalize">{selectedOrder.packageType}</p>
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

            {/* Assignment Section */}
            {selectedOrder.status === 'approved' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Staff Assignment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Assign Pilot</label>
                    <select
                      value={selectedPilot}
                      onChange={(e) => setSelectedPilot(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="">Select Pilot</option>
                      {pilots.map(pilot => (
                        <option key={pilot.id} value={pilot.id}>
                          {pilot.name} - {pilot.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Assign Editor</label>
                    <select
                      value={selectedEditor}
                      onChange={(e) => setSelectedEditor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="">Select Editor</option>
                      {editors.map(editor => (
                        <option key={editor.id} value={editor.id}>
                          {editor.name} - {editor.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Submissions Section */}
            {getOrderSubmissions(selectedOrder.id).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Submissions
                </h3>
                <div className="space-y-4">
                  {getOrderSubmissions(selectedOrder.id).map(submission => (
                    <div key={submission.id} className="bg-slate-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            submission.submittedBy === 'pilot' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {submission.submittedBy === 'pilot' ? '✈️' : '✂️'}
                          </div>
                          <div>
                            <span className="font-medium capitalize">{submission.submittedBy}</span>
                            <span className="text-slate-500 ml-2">- {submission.submitterName}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={submission.status} />
                          <span className="text-xs text-slate-500">
                            {format(submission.submittedAt, 'dd MMM - hh:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Submission Details */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        {submission.duration && (
                          <div>
                            <label className="text-xs font-medium text-slate-600">Flight Duration</label>
                            <p className="text-sm text-slate-900">{submission.duration} minutes</p>
                          </div>
                        )}
                        {submission.hoursWorked && (
                          <div>
                            <label className="text-xs font-medium text-slate-600">Hours Worked</label>
                            <p className="text-sm text-slate-900">{submission.hoursWorked} hours</p>
                          </div>
                        )}
                      </div>

                      {/* Comments from Pilot/Editor */}
                      {submission.comments && (
                        <div className="mb-3">
                          <label className="text-xs font-medium text-slate-600 flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {submission.submittedBy === 'pilot' ? 'Pilot' : 'Editor'} Comments
                          </label>
                          <p className="text-sm text-slate-900 bg-white p-2 rounded border mt-1">
                            {submission.comments}
                          </p>
                        </div>
                      )}

                      {/* Drive Link */}
                      <div className="mb-3">
                        <a 
                          href={submission.driveLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          View {submission.submittedBy === 'pilot' ? 'Raw Footage' : 'Edited Video'}
                        </a>
                      </div>

                      {/* Admin Review Comments */}
                      {submission.reviewComments && (
                        <div className="mb-3">
                          <label className="text-xs font-medium text-slate-600">Admin Review Comments</label>
                          <p className="text-sm text-slate-700 bg-blue-50 p-2 rounded border mt-1">
                            {submission.reviewComments}
                          </p>
                        </div>
                      )}

                      {/* Review Actions */}
                      {submission.status === 'submitted' && (
                        <div className="flex items-center space-x-2 mt-3">
                          <input
                            type="text"
                            placeholder="Add review comment..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="flex-1 px-3 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                          />
                          <Button 
                            size="sm" 
                            variant="success"
                            onClick={() => handleReviewSubmission(submission, true)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleReviewSubmission(submission, false)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments History Section */}
            {getOrderComments(selectedOrder.id).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Comments History
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

            {/* Add Comment Section */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Admin Comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                rows={3}
                placeholder="Add your comments here..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {selectedOrder.status === 'pending' && (
                <>
                  <Button variant="danger" onClick={() => handleRejectOrder(selectedOrder)}>
                    Reject Order
                  </Button>
                  <Button onClick={() => handleApproveOrder(selectedOrder)}>
                    Approve Order
                  </Button>
                </>
              )}
              {selectedOrder.status === 'approved' && (
                <Button onClick={() => handleAssignStaff(selectedOrder)}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign Staff
                </Button>
              )}
              {reviewComment.trim() && (
                <Button onClick={async () => {
                  await createComment({
                    orderId: selectedOrder.id,
                    commentBy: 'admin',
                    commenterId: 'admin-1',
                    commenterName: 'Admin',
                    commentStage: 'general',
                    commentText: reviewComment
                  });
                  setReviewComment('');
                  fetchData();
                }}>
                  Add Comment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}