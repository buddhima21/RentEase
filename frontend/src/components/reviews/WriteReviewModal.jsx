import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";


export default function WriteReviewModal({ onClose, onSubmit, initialData = null }) {
  const [review, setReview] = useState(initialData?.comment || initialData?.text || "");
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || null);
  const fileInputRef = useRef();

  const [detailedRatings, setDetailedRatings] = useState(initialData?.detailedRating || {
    cleanliness: 5,
    safety: 5,
    wifi: 4,
    water: 4
  });

  const isEditing = !!initialData;

  const handleDetailedRatingChange = (category, value) => {
    setDetailedRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handlePhotoRemove() {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ 
        review, 
        rating, 
        photo,
        detailedRating: detailedRatings
    });
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Panel - Emerald Info Area */}
          <div className="bg-gradient-to-br from-[#10b981] to-[#0d9488] text-white p-10 md:w-[40%] flex flex-col relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

             <div className="relative z-10 flex flex-col h-full">
                <div className="bg-white/20 p-3 rounded-2xl w-fit mb-8 backdrop-blur-md border border-white/10">
                   <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isEditing ? "edit_square" : "kid_star"}
                   </span>
                </div>
                
                <h2 className="text-[32px] md:text-[40px] font-black leading-[1.1] mb-6 tracking-tight">
                  {isEditing ? "Community\nReview\nStandards" : "Share\nYour\nExperience"}
                </h2>
                
                <p className="text-emerald-50/90 text-[15px] font-medium leading-relaxed max-w-[240px]">
                  Your authentic feedback builds a safer, more transparent community. Share your insights to help fellow residents make informed housing decisions.
                </p>

                <div className="mt-auto pt-10">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      <span className="text-[12px] font-bold tracking-widest uppercase text-emerald-50">100% Verified Feedback</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                      <span className="text-[12px] font-bold tracking-widest uppercase text-emerald-100/70">Community Excellence</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Panel - Form Area */}
          <div className="p-8 md:p-10 md:w-[60%] flex flex-col bg-white">
            <button
              className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors z-20"
              onClick={onClose}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 h-full">
              
              {/* Overall Rating */}
              <div>
                <label className="block text-[11px] text-slate-400 font-extrabold tracking-widest uppercase mb-4">How was your stay?</label>
                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100/50">
                   <div className="w-full flex justify-center">
                    <StarRating rating={rating} onChange={setRating} />
                   </div>
                </div>
              </div>

              {/* Specifics (Interactive UI) */}
              <div>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cleanliness</span>
                       <div className="flex items-center gap-3">
                           <StarRating 
                              rating={detailedRatings.cleanliness} 
                              onChange={(val) => handleDetailedRatingChange('cleanliness', val)} 
                              size="text-[18px]"
                              gap="gap-0.5"
                           />
                           <span className="text-[13px] text-slate-400 font-black ml-auto border-l border-slate-100 pl-3 leading-none">{detailedRatings.cleanliness}.0</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Safety</span>
                       <div className="flex items-center gap-3">
                           <StarRating 
                              rating={detailedRatings.safety} 
                              onChange={(val) => handleDetailedRatingChange('safety', val)} 
                              size="text-[18px]"
                              gap="gap-0.5"
                           />
                           <span className="text-[13px] text-slate-400 font-black ml-auto border-l border-slate-100 pl-3 leading-none">{detailedRatings.safety}.0</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wi-Fi</span>
                       <div className="flex items-center gap-3">
                           <StarRating 
                              rating={detailedRatings.wifi} 
                              onChange={(val) => handleDetailedRatingChange('wifi', val)} 
                              size="text-[18px]"
                              gap="gap-0.5"
                           />
                           <span className="text-[13px] text-slate-400 font-black ml-auto border-l border-slate-100 pl-3 leading-none">{detailedRatings.wifi}.0</span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Water</span>
                       <div className="flex items-center gap-3">
                           <StarRating 
                              rating={detailedRatings.water} 
                              onChange={(val) => handleDetailedRatingChange('water', val)} 
                              size="text-[18px]"
                              gap="gap-0.5"
                           />
                           <span className="text-[13px] text-slate-400 font-black ml-auto border-l border-slate-100 pl-3 leading-none">{detailedRatings.water}.0</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Review Text */}
              <div className="flex flex-col flex-grow">
                <label className="block text-[11px] text-slate-400 font-extrabold tracking-widest uppercase mb-3">Share the details</label>
                <textarea
                  className="w-full border border-slate-200 bg-transparent rounded-2xl p-5 min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-700 placeholder:text-slate-300 transition-all"
                  placeholder="What was the neighborhood like? How was the water pressure?..."
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  required
                />
              </div>
              
              {/* Photo & Actions */}
              <div className="flex items-end justify-between mt-auto">
                 <div>
                    <label className="block text-[11px] text-slate-400 font-extrabold tracking-widest uppercase mb-2">Include Photos</label>
                    <div className="flex items-center gap-3">
                        {!photoPreview ? (
                            <label className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors flex items-center justify-center cursor-pointer">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">add_photo_alternate</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative group">
                                <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
                                <button
                                    type="button"
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                    onClick={handlePhotoRemove}
                                    aria-label="Remove photo"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    disabled={!review || rating === 0}
                  >
                    {isEditing ? "Save Changes" : "Submit Review"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
