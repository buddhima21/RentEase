import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AccountSettings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("security");

    const tabs = [
        { id: "security", label: "Login & Security", icon: "security" },
        { id: "payments", label: "Payments & Payouts", icon: "payments" },
        { id: "notifications", label: "Notifications", icon: "notifications" },
        { id: "preferences", label: "Global Preferences", icon: "language" },
        { id: "privacy", label: "Privacy & Data", icon: "privacy_tip" }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 max-w-7xl">
                
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-6 px-4">Account</h1>
                    <nav className="flex flex-col gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-10">
                    
                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Login & Security</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your password, 2FA, and device settings.</p>
                            </div>
                            
                            <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
                                <div className="flex justify-between items-center pb-6">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Password</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated 3 months ago</p>
                                    </div>
                                    <button className="text-primary font-bold hover:underline">Update</button>
                                </div>
                                <div className="flex justify-between items-center py-6">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Two-factor authentication</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Add an extra layer of security to your account.</p>
                                    </div>
                                    <button className="px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Set up</button>
                                </div>
                                <div className="flex justify-between items-center py-6">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Device history</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Review devices that have logged into your account.</p>
                                    </div>
                                    <button className="text-primary font-bold hover:underline">Review</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === "payments" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Payments & Payouts</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage payment methods and where you receive your income.</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">credit_card</span>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">No payment methods configured</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-6 max-w-sm mx-auto">Add a securely saved credit card or bank account to continue.</p>
                                <button className="bg-slate-800 dark:bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 dark:hover:bg-primary/90 transition-colors">Add Payment Method</button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Notifications</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Choose how we can stay in touch.</p>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { title: "Booking Updates", desc: "Get messages about your stays or inquiries." },
                                    { title: "Maintenance Alerts", desc: "Status updates regarding requests and technicians." },
                                    { title: "Marketing & Promotions", desc: "Receive tips, updates, and offers from RentEase." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.title}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={idx !== 2} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === "preferences" && (
                         <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Global Preferences</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Set your language, region, and currency.</p>
                            </div>
                            <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
                                <div className="flex justify-between items-center pb-6">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Language & region</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">English (US)</p>
                                    </div>
                                    <button className="text-primary font-bold hover:underline">Edit</button>
                                </div>
                                <div className="flex justify-between items-center py-6">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Currency</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">USD ($)</p>
                                    </div>
                                    <button className="text-primary font-bold hover:underline">Edit</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy & Data Tab */}
                    {activeTab === "privacy" && (
                         <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Privacy & Data</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your personal data and connected services.</p>
                            </div>
                            
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 space-y-4">
                               <h3 className="font-bold text-red-600">Danger Zone</h3>
                               <p className="text-sm text-slate-600 dark:text-slate-400">Once you delete your account, there is no going back. Please be certain.</p>
                               <button className="px-6 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors">
                                   Deactivate Account
                               </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>
            <Footer />
        </div>
    );
}