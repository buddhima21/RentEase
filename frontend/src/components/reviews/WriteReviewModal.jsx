import React, { useState, useRef } from "react";
import StarRating from "./StarRating";


export default function WriteReviewModal({ onClose, onSubmit }) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef();

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
    // In a real app, photo would be uploaded to a server or cloud storage
    onSubmit({ review, rating, photo: photoPreview });
    setReview("");
    setRating(0);
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0d9488] text-3xl">draw</span>
          Write a Review
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Your Rating</label>
            <StarRating rating={rating} onChange={setRating} />
          </div>
          <textarea
            className="border rounded-lg p-3 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-[#0d9488]"
            placeholder="Share your experience..."
            value={review}
            onChange={e => setReview(e.target.value)}
            required
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
              className="px-4 py-2 rounded-lg bg-[#0d9488] text-white font-bold hover:bg-[#16a085] disabled:opacity-60"
              disabled={!review || rating === 0}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
