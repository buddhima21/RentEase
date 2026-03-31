import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Profile() {
    const { user, login } = useAuth(); // Assuming login updates the user state
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: user?.location || "",
        bio: user?.bio || "",
        avatar: user?.profileImageUrl || user?.avatar || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                fullName: formData.fullName,
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
                profileImageUrl: formData.avatar
            };

            const response = await updateUser(user.id, payload);
            console.log("Response:", response);
            if (response.data && response.data.success) {
                // Update local auth context with fresh data from server
                login(response.data.data);
                setIsEditing(false);
            } else {
                console.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                        {/* Header Background */}
                        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary relative">
                            <div className="absolute inset-0 bg-pattern opacity-10"></div>
                        </div>

                        <div className="px-8 pb-8">
                            {/* Avatar Section */}
                            <div className="relative -mt-12 mb-6 flex justify-between items-end">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                                        {(isEditing ? formData.avatar : (user?.profileImageUrl || user?.avatar)) ? (
                                            <img
                                                src={isEditing ? formData.avatar : (user?.profileImageUrl || user?.avatar)}
                                                alt={user?.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white text-2xl font-bold">
                                                {user?.fullName?.charAt(0) || "U"}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current.click()}
                                                className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border border-slate-200 text-slate-600 hover:text-[#26C289] transition-colors"
                                                title="Change Avatar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {!isEditing ? (
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                fullName: user?.fullName || "",
                                                email: user?.email || "",
                                                phone: user?.phone || "",
                                                location: user?.location || "",
                                                bio: user?.bio || "",
                                                avatar: user?.profileImageUrl || user?.avatar || "",
                                            });
                                            setIsEditing(true);
                                        }}
                                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    fullName: user?.fullName || "",
                                                    email: user?.email || "",
                                                    phone: user?.phone || "",
                                                    location: user?.location || "",
                                                    bio: user?.bio || "",
                                                    avatar: user?.profileImageUrl || user?.avatar || "",
                                                });
                                            }}
                                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">save</span>
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Column: Identity */}
                                <div className="md:col-span-1 space-y-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900">{user?.fullName}</h1>
                                        <p className="text-slate-500 font-medium">{user?.role || "User"}</p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 space-y-3">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <span className="material-symbols-outlined text-slate-400">mail</span>
                                            <span className="text-sm">{user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <span className="material-symbols-outlined text-slate-400">call</span>
                                            <span className="text-sm">{user?.phone || "No phone added"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <span className="material-symbols-outlined text-slate-400">location_on</span>
                                            <span className="text-sm">{user?.location || "No location added"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                                            <span className="text-sm">Joined March 2024</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Form/Details */}
                                <div className="md:col-span-2">
                                    {!isEditing ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">About</h3>
                                                <p className="text-slate-600 leading-relaxed">
                                                    {user?.bio || "No bio added yet. Click 'Edit Profile' to tell others about yourself."}
                                                </p>
                                            </div>

                                            {/* Could add more read-only sections here */}
                                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary">verified_user</span>
                                                    Account Status
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Email Verified</span>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Identity Verified</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        className="w-full rounded-lg border-slate-300 focus:border-primary focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        disabled
                                                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="+1 (555) 000-0000"
                                                        className="w-full rounded-lg border-slate-300 focus:border-primary focus:ring-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleChange}
                                                        placeholder="City, Country"
                                                        className="w-full rounded-lg border-slate-300 focus:border-primary focus:ring-primary"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                                <textarea
                                                    name="bio"
                                                    rows="4"
                                                    value={formData.bio}
                                                    onChange={handleChange}
                                                    placeholder="Tell us about yourself..."
                                                    className="w-full rounded-lg border-slate-300 focus:border-primary focus:ring-primary"
                                                ></textarea>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
