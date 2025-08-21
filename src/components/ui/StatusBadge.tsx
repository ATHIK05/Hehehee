import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: string;
  variant?: 'order' | 'payment' | 'review' | 'general';
  className?: string;
}

export default function StatusBadge({ status, variant = 'general', className = '' }: StatusBadgeProps) {
  const getStatusColors = (status: string, variant: string) => {
    const statusLower = status.toLowerCase();
    
    switch (variant) {
      case 'order':
        switch (statusLower) {
          case 'new': return 'bg-blue-100 text-blue-800';
          case 'assigned': return 'bg-yellow-100 text-yellow-800';
          case 'editing': return 'bg-orange-100 text-orange-800';
          case 'final_review': return 'bg-purple-100 text-purple-800';
          case 'completed': return 'bg-green-100 text-green-800';
          case 'cancelled': return 'bg-red-100 text-red-800';
          default: return 'bg-slate-100 text-slate-800';
        }
      case 'payment':
        switch (statusLower) {
          case 'pending': return 'bg-red-100 text-red-800';
          case 'partial': return 'bg-yellow-100 text-yellow-800';
          case 'completed': return 'bg-green-100 text-green-800';
          default: return 'bg-slate-100 text-slate-800';
        }
      case 'review':
        switch (statusLower) {
          case 'not_reviewed': return 'bg-slate-100 text-slate-800';
          case 'under_review': return 'bg-blue-100 text-blue-800';
          case 'approved': return 'bg-green-100 text-green-800';
          case 'rejected': return 'bg-red-100 text-red-800';
          case 'needs_change': return 'bg-orange-100 text-orange-800';
          default: return 'bg-slate-100 text-slate-800';
        }
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${getStatusColors(status, variant)}
        ${className}
      `}
    >
      {status.replace('_', ' ').toUpperCase()}
    </motion.span>
  );
}