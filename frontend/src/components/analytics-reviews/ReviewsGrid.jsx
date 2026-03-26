"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote } from 'lucide-react';

const DUMMY_REVIEWS = [
  { id: 1, name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=1', rating: 5, date: '2 days ago', body: 'Absolutely phenomenal experience. The management was responsive, and the amenities are out of this world. Highly recommend the smart heating system!' },
  { id: 2, name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=2', rating: 4, date: '1 week ago', body: 'Great place overall. The view is stunning. Minor issue with the smart lock initially, but support fixed it within an hour.' },
  { id: 3, name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?u=3', rating: 5, date: '2 weeks ago', body: 'The rent collection system is so seamless. I literally just swipe on my phone and it is done. The best renting experience I have ever had.' },
  { id: 4, name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=4', rating: 5, date: '1 month ago', body: '5 stars without a doubt. Maintenance is blazing fast. The gym is top tier.' },
  { id: 5, name: 'Elena Rodriguez', avatar: 'https://i.pravatar.cc/150?u=5', rating: 4, date: '1 month ago', body: 'Very modern apartments with great community events. Sometimes the parking gets a bit crowded though.' },
  { id: 6, name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=6', rating: 5, date: '2 months ago', body: 'Exceptional! The property managers actually care about the tenants. The automated analytics on my utility usage actually helped me save money.' }
];

const GlowingStars = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          className={i < rating ? 'fill-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-slate-600'} 
        />
      ))}
    </div>
  );
};

export default function ReviewsGrid() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-10 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500 inline-block">
            Tenant Voices
          </h2>
          <p className="text-slate-400 mt-3 text-lg max-w-2xl mx-auto">
            Discover what our residents are saying about their smart renting experience.
          </p>
        </motion.div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {DUMMY_REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="break-inside-avoid relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-2xl shadow-emerald-500/5 hover:shadow-emerald-500/20 group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquareQuote size={64} className="text-emerald-400" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
                      <img 
                        src={review.avatar} 
                        alt={review.name} 
                        className="w-12 h-12 rounded-full border-2 border-emerald-500/30 relative z-10 object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{review.name}</h4>
                      <p className="text-xs text-slate-400">{review.date}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <GlowingStars rating={review.rating} />
                </div>
                
                <p className="text-slate-300 leading-relaxed text-sm">
                  "{review.body}"
                </p>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
