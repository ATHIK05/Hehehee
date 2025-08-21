import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, CheckCircle, XCircle, MessageSquare, Filter } from 'lucide-react';
import { VideoReview as VideoReviewType } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getVideoReviews, 
  updateVideoReview, 
  getOrders 
} from '../services/firebase';

export default function VideoReview() {
  const [reviews, setReviews] = useState<VideoReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'before_edit' | 'after_edit'>('before_edit');
  const [selectedReview, setSelectedReview] = useState<VideoReviewType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchVideoReviews();
  }, []);

  const fetchVideoReviews = async () => {
    try {
      const reviewsData = await getVideoReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching video reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesTab = review.type === selectedTab;
    const matchesStatus = filterStatus === 'all' || review.reviewStatus === filterStatus;
    const matchesSearch = review.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.orderID.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesStatus && matchesSearch;
  });

  const beforeEditCount = reviews.filter(r => r.type === 'before_edit').length;
  const afterEditCount = reviews.filter(r => r.type === 'after_edit').length;

  const handleApprove = async (reviewId: string) => {
    try {
      await updateVideoReview(reviewId, { 
        reviewStatus: 'approved',
        comments: reviewComment 
      });
      fetchVideoReviews();
      setIsModalOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!reviewComment.trim()) {
      alert('Please add a comment explaining why this is being rejected.');
      return;
    }
    
    try {
      await updateVideoReview(reviewId, { 
        reviewStatus: 'needs_change',
        comments: reviewComment 
      });
      fetchVideoReviews();
      setIsModalOpen(false);
      setReviewComment('');
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleViewVideo = (review: VideoReviewType) => {
    setSelectedReview(review);
    setReviewComment(review.comments || '');
    setIsModalOpen(true);
  };

  const handleStartReview = async (reviewId: string) => {
    try {
      await updateVideoReview(reviewId, { reviewStatus: 'under_review' });
      fetchVideoReviews();
    } catch (error) {
      console.error('Error starting review:', error);
    }
  };

  const tabs = [
    { 
      id: 'before_edit' as const, 
      label: 'Before Edit Review', 
      count: beforeEditCount,
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    { 
      id: 'after_edit' as const, 
      label: 'After Edit Review', 
      count: afterEditCount,
      color: 'text-green-600 bg-green-50 border-green-200'
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
        <h1 className="text-2xl font-bold text-slate-900">Video Review</h1>
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${tab.color}`}>
                  {tab.count}
                </span>
              </div>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by client name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="not_reviewed">Not Reviewed</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="needs_change">Needs Change</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['not_reviewed', 'under_review', 'approved', 'needs_change'].map((status) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 capitalize">
                  {status.replace('_', ' ')}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredReviews.filter(r => r.reviewStatus === status).length}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${status === 'not_reviewed' ? 'bg-slate-50 text-slate-600' :
                  status === 'under_review' ? 'bg-blue-50 text-blue-600' :
                  status === 'approved' ? 'bg-green-50 text-green-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                {status === 'not_reviewed' ? '⏳' : 
                 status === 'under_review' ? '👁️' : 
                 status === 'approved' ? '✅' : '🔄'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Videos Table */}
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
                  Video Preview
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Editor Assigned
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Pilot Assigned
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Review Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredReviews.map((review, index) => (
                <motion.tr
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{review.orderID}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {review.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Drive Link</p>
                        <button 
                          onClick={() => window.open(review.driveLink, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          View Video
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">
                      {review.editorAssigned}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">
                      {review.pilotAssigned}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={review.reviewStatus} variant="review" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewVideo(review)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {review.reviewStatus === 'not_reviewed' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleStartReview(review.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Start Review"
                        >
                          <Play className="w-4 h-4" />
                        </motion.button>
                      )}
                      {review.reviewStatus === 'under_review' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReject(review.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <Play className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No videos found for review</p>
          </div>
        )}
      </motion.div>

      {/* Video Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Video Review"
        maxWidth="2xl"
      >
        {selectedReview && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Order ID</label>
                <p className="text-slate-900">{selectedReview.orderID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Client Name</label>
                <p className="text-slate-900">{selectedReview.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Editor</label>
                <p className="text-slate-900">{selectedReview.editorAssigned}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Pilot</label>
                <p className="text-slate-900">{selectedReview.pilotAssigned}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Review Type</label>
                <p className="text-slate-900 capitalize">{selectedReview.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Current Status</label>
                <StatusBadge status={selectedReview.reviewStatus} variant="review" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <Play className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 mb-4">Video preview will be displayed here</p>
              <Button
                onClick={() => window.open(selectedReview.driveLink, '_blank')}
                className="flex items-center justify-center mx-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                Open Drive Link
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Review Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add your review comments here..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {selectedReview.reviewStatus === 'not_reviewed' && (
                <Button onClick={() => handleStartReview(selectedReview.id)}>
                  Start Review
                </Button>
              )}
              {selectedReview.reviewStatus === 'under_review' && (
                <>
                  <Button variant="danger" onClick={() => handleReject(selectedReview.id)}>
                    Request Changes
                  </Button>
                  <Button variant="success" onClick={() => handleApprove(selectedReview.id)}>
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