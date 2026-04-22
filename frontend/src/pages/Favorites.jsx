import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFavorites } from "../services/api";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";

export default function Favorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const res = await getFavorites(user.id);
            // We get back an array of properties
            setFavorites(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <span className="material-symbols-outlined text-7xl text-slate-300 mb-4">favorite</span>
                    <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Sign in to view favorites</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                        You need to be logged in to save and view your favorite properties.
                    </p>
                    <Link
                        to="/login"
                        className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm shadow-md shadow-primary/20"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex flex-col">
            <Navbar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
                        My <span className="text-primary">Favorites</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Properties you've saved for later. Keep track of homes you love.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl h-[380px] animate-pulse border border-slate-100 dark:border-slate-700/50 shadow-sm" />
                        ))}
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-500">heart_broken</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No favorites yet</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                            You haven't saved any properties yet. Browse our listings and click the heart icon on properties you like to save them here.
                        </p>
                        <Link
                            to="/listings"
                            className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm flex items-center gap-2 shadow-md shadow-primary/20 hover:scale-105"
                        >
                            <span className="material-symbols-outlined text-[18px]">search</span>
                            Explore Properties
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
