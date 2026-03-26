import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";


export default function WriteReviewModal({ onClose, onSubmit, initialData = null }) {
  const [review, setReview] = useState(initialData?.comment || initialData?.text || "");
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || null);
  const fileInputRef = useRef();

  const isEditing = !!initialData;

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  function handlePhotoRemove() {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }
    if (!review.trim()) {
      setError("Review comment cannot be empty");
      return;
    }

    // In a real app, photo would be uploaded to a server or cloud storage
    onSubmit({ review, rating, photo: photoPreview });
    setReview("");
    setRating(0);
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 w-full max-w-md shadow-[0_10px_40px_rgb(0,0,0,0.1)] relative"
        >
          <button
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0d9488] text-3xl">{isEditing ? "edit_note" : "draw"}</span>
            {isEditing ? "Edit Review" : "Write a Review"}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold"
              >
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Your Rating</label>
              <StarRating rating={rating} onChange={(r) => { setRating(r); setError(null); }} />
            </div>
            <textarea
              className={`border ${error && !review.trim() ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} bg-white/50 backdrop-blur-sm rounded-xl p-4 min-h-[120px] resize-y focus:outline-none focus:ring-4 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all duration-300`}
              placeholder="Share your experience..."
              value={review}
              onChange={e => { setReview(e.target.value); setError(null); }}
            />
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Photo Review (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0d9488]/10 file:text-[#0d9488] hover:file:bg-[#0d9488]/20"
                />
                {photoPreview && (
                  <div className="relative group">
                    <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white border border-slate-300 rounded-full p-1 text-xs text-slate-400 hover:text-red-500 shadow"
                      onClick={handlePhotoRemove}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#115e59] text-white font-bold hover:shadow-[0_4px_15px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {isEditing ? "Save Changes" : "Submit"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
