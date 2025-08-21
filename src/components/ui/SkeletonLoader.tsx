import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
}

export default function SkeletonLoader({ rows = 5, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
          className="bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 h-12 rounded-lg"
          style={{
            backgroundSize: '200% 100%',
            animation: `shimmer 2s ease-in-out infinite ${index * 0.1}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}