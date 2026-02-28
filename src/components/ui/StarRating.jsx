import React from 'react';
import { Star } from 'lucide-react';
import { cn } from './Button';
export function StarRating({ rating, max = 5, size = 16, className, onRatingChange, interactive = false }) {
    const [hoverRating, setHoverRating] = React.useState(0);
    return (<div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
            const starValue = i + 1;
            const isActive = interactive ? (hoverRating || rating) >= starValue : rating >= starValue;
            return (<Star key={i} size={size} className={cn("transition-all duration-200", isActive ? "fill-yellow-400 text-yellow-400" : "text-slate-200 fill-slate-200", interactive && "cursor-pointer hover:scale-110")} onMouseEnter={() => interactive && setHoverRating(starValue)} onMouseLeave={() => interactive && setHoverRating(0)} onClick={() => interactive && onRatingChange?.(starValue)}/>);
        })}
    </div>);
}
