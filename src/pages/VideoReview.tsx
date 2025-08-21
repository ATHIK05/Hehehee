import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, CheckCircle, XCircle, MessageSquare, Filter } from 'lucide-react';
import { VideoReview as VideoReviewType } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export default function VideoReview() {
  const [reviews, setReviews] = useState<VideoReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'before_edit' | 'after_edit'>('before_edit');
  const [selectedReview, setSelectedReview] = useState<VideoReviewType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Mock data - replace with Firebase fetch
    setTimeout(() => {
      const mockReviews: VideoReviewType[] = [
        {
          id: '1',
          orderID: 'ORD001',
          clientName: 'John Smith',
          driveLink: 'https://drive.google.com/example1',
          editorAssigned: 'Editor A',
          pilotAssigned: 'Pilot A',
          reviewStatus: 'not_reviewed',
          type: 'before_edit',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          orderID: 'ORD002',
          clientName: 'Sarah Johnson',
          driveLink: 'https://drive.google.com/example2',
          editorAssigned: 'Editor B',
          pilotAssigned: 'Pilot B',
          reviewStatus: 'under_review',
          type: 'after_edit',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReviews = reviews.filter(review => review.type === selectedTab);

  const beforeEditCount = reviews.filter(r => r.type === 'before_edit').length;
  const afterEditCount = reviews.filter(r => r.type === 'after_edit').length;

  const handleApprove = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, reviewStatus: 'approved' } : review
    ));
  };

  const handleReject = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, reviewStatus: 'rejected' } : review
    ));
  };

  const handleViewVideo = (review: VideoReviewType) => {
    setSelectedReview(review);
    setIsModalOpen(true);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Video Review</h1>
        </div>
        <SkeletonLoader rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Video Review</h1>
        <Button variant="secondary" className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
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
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          View Video
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {review.editorAssigned}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {review.pilotAssigned}
                    </button>
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
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-slate-600 hover:text-slate-900 p-1 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <label className="text-sm font-medium text-slate-700">Add Comment</label>
                <textarea
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add your review comments here..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleReject(selectedReview.id)}>
                Request Changes
              </Button>
              <Button variant="success" onClick={() => handleApprove(selectedReview.id)}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}