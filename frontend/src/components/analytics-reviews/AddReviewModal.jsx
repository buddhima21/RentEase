"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';

export default function AddReviewModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // Reset state if needed
      setRating(0);
      setReviewText('');
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col"
          >
            {/* Top decorative gradient line */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500" />
            
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 z-10 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="p-8 relative z-10">
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                Share Your Experience
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                Your feedback helps us create better living environments for everyone.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Star Selection */}
                <div className="flex flex-col items-center justify-center space-y-4 py-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-slate-300 font-medium">Overall Rating</span>
                  <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
                      >
                        <Star 
                          size={40} 
                          className={`transition-all duration-300 ${
                            star <= (hoverRating || rating) 
                              ? 'fill-emerald-400 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]' 
                              : 'text-slate-700 hover:text-slate-500'
                          }`} 
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Text Area */}
                <div className="relative group">
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us what you loved..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none shadow-inner"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  whileHover={{ scale: (rating === 0 || isSubmitting) ? 1 : 1.02 }}
                  whileTap={{ scale: (rating === 0 || isSubmitting) ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    rating > 0 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Submit Review
                      <Send size={18} className={rating > 0 ? 'text-white' : 'text-slate-500'} />
                    </>
                  )}
                </motion.button>

              </form>
            </div>
            
            {/* Bottom Glow */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-blue-500/20 blur-[50px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
