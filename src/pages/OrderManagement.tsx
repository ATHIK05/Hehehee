import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, UserCheck, Users, Calendar, MapPin, DollarSign, FileText, CheckCircle, XCircle } from 'lucide-react';
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
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'assigned' | 'in_progress' | 'completed'>('pending');
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
      
      await updateOrder(order.id, { status: 'assigned' });
      
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
      case 'in_progress':
        filteredOrders = orders.filter(o => ['pilot_submitted', 'pilot_reviewed', 'editor_submitted'].includes(o.status));
        break;
      case 'completed':
        filteredOrders = orders.filter(o => ['editor_reviewed', 'completed'].includes(o.status));
        break;
    }
    
    return filteredOrders.filter(order => 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getOrderAssignment = (orderId: string) => {
    return assignments.find(a => a.orderId === orderId);
  };

  const getOrderSubmissions = (orderId: string) => {
    return submissions.filter(s => s.orderId === orderId);
  };

  const getOrderComments = (orderId: string) => {
    return comments.filter(c => c.orderId === orderId);
  };

  const pilots = staff.filter(s => s.role === 'pilot');
  const editors = staff.filter(s => s.role === 'editor');

  const tabs = [
    { id: 'pending' as const, label: 'Pending Review', count: orders.filter(o => o.status === 'pending').length },
    { id: 'approved' as const, label: 'Approved', count: orders.filter(o => o.status === 'approved').length },
    { id: 'assigned' as const, label: 'Assigned', count: orders.filter(o => o.status === 'assigned').length },
    { id: 'in_progress' as const, label: 'In Progress', count: orders.filter(o => ['pilot_submitted', 'pilot_reviewed', 'editor_submitted'].includes(o.status)).length },
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
        <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
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
                          <span className="text-sm text-slate-600">₹{order.budget.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{order.clientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm text-slate-900">{order.location}</div>
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
                <label className="text-sm font-medium text-slate-700">Location</label>
                <p className="text-slate-900">{selectedOrder.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Order Date</label>
                <p className="text-slate-900">{format(selectedOrder.orderDate, 'dd MMM yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Package Type</label>
                <p className="text-slate-900 capitalize">{selectedOrder.packageType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Budget</label>
                <p className="text-slate-900 font-semibold">₹{selectedOrder.budget.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Requirements</label>
              <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                {selectedOrder.requirements}
              </p>
            </div>

            {/* Assignment Section */}
            {selectedOrder.status === 'approved' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Staff Assignment</h3>
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
                <h3 className="text-lg font-medium text-slate-900 mb-4">Submissions</h3>
                <div className="space-y-4">
                  {getOrderSubmissions(selectedOrder.id).map(submission => (
                    <div key={submission.id} className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium capitalize">{submission.submittedBy}</span>
                          <span className="text-slate-500 ml-2">- {submission.submitterName}</span>
                        </div>
                        <StatusBadge status={submission.status} />
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{submission.comments}</p>
                      <a 
                        href={submission.driveLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Drive Link
                      </a>
                      {submission.status === 'submitted' && (
                        <div className="mt-3 flex space-x-2">
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

            {/* Comments Section */}
            {getOrderComments(selectedOrder.id).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Comments History</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {getOrderComments(selectedOrder.id).map(comment => (
                    <div key={comment.id} className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{comment.commenterName}</span>
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

            {/* Review Comments */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Add Comment</label>
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
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}