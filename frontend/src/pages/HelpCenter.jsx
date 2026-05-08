import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        { icon: "vpn_key", title: "Account & Profile", desc: "Manage your account settings and profile." },
        { icon: "home_work", title: "For Owners", desc: "Learn how to host, manage listings, and get paid." },
        { icon: "luggage", title: "For Renters", desc: "Find a place, book, and handle agreements." },
        { icon: "credit_card", title: "Payments & Refunds", desc: "Understand your payments, receipts, and refund policies." },
        { icon: "gpp_good", title: "Trust & Safety", desc: "Community guidelines, verification, and protection." },
        { icon: "build", title: "Maintenance", desc: "How to request repairs or manage maintenance tasks." }
    ];

    const popularArticles = [
        "How do I create a listing?",
        "What is the RentEase cancellation policy?",
        "How does RentEase verify identities?",
        "When will I get my payout?",
        "How do I report a maintenance issue?"
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Search Section */}
                <div className="bg-primary pt-16 pb-24 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-8">Hi, how can we help?</h1>
                    <div className="max-w-2xl mx-auto relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl group-focus-within:text-primary transition-colors">search</span>
                        <input 
                            type="text"
                            placeholder="Search for help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl text-lg text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/30 shadow-xl"
                        />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10 pb-20 space-y-16">
                    {/* Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer group">
                                <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{cat.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400">{cat.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Top Articles Section */}
                    <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Popular Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {popularArticles.map((article, i) => (
                                <button key={i} className="flex items-center gap-3 text-left w-full hover:bg-slate-50 dark:hover:bg-slate-700/50 py-3 px-4 rounded-xl transition-colors text-slate-700 dark:text-slate-300 font-medium">
                                    <span className="material-symbols-outlined text-primary text-[20px]">article</span>
                                    {article}
                                    <span className="material-symbols-outlined ml-auto text-slate-400 text-[18px]">chevron_right</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-lg">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-4">Still need help?</h2>
                            <p className="text-slate-300 mb-8 max-w-lg mx-auto">Our support team is available 24/7 to help you with any questions or issues you might have.</p>
                            <button className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold text-lg transition-transform scale-100 hover:scale-105 active:scale-95 shadow-sm">
                                Contact Support
                            </button>
                        </div>
                        <span className="material-symbols-outlined absolute -right-8 -bottom-12 text-[15rem] text-white/5 rotate-12 pointer-events-none">support_agent</span>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}