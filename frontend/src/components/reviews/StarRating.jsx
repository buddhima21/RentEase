import React from "react";

export default function StarRating({ rating, onChange }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          className={`text-3xl transition-colors ${star <= rating ? 'text-[#f59e0b]' : 'text-slate-300'} hover:text-[#fbbf24] focus:outline-none`}
          onClick={() => onChange(star)}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        </button>
      ))}
    </div>
  );
}
