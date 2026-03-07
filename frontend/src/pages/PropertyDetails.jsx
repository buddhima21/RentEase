import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import mockListings from "../data/mockListings";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewSection from "../components/reviews/ReviewSection";
import { getPropertyReviews } from "../services/api";

export default function PropertyDetails() {
    const { id } = useParams();
    const property = mockListings.find(p => p.id === parseInt(id));

    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [averageRating, setAverageRating] = useState(property?.rating || 0);

    useEffect(() => {
        if (!property) return;

        setIsLoadingReviews(true);
        // Using "property_" prefix to match our mock backend setup for now, 
        // real app would use the actual MongoDB ObjectID
        getPropertyReviews(`property_${id}`)
            .then(res => {
                const fetchedReviews = res.data.data;
                setReviews(fetchedReviews);

                // Calculate dynamic rating
                if (fetchedReviews.length > 0) {
                    const total = fetchedReviews.reduce((sum, rev) => sum + rev.rating, 0);
                    setAverageRating((total / fetchedReviews.length).toFixed(1));
                }
            })
            .catch(err => console.error("Failed to fetch reviews:", err))
            .finally(() => setIsLoadingReviews(false));
    }, [id, property]);

    if (!property) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col justify-between">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold mb-4 text-slate-800">Property Not Found</h2>
                    <Link to="/" className="text-primary hover:underline">Return to Home</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-background-light min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
                {/* Back Button */}
                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-primary mb-6 transition-colors font-medium">
                    <span className="material-symbols-outlined mr-2">arrow_back</span>
                    Back to Listings
                </Link>

                {/* Property Header & Images */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {property.badge && (
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {property.badge}
                                    </span>
                                )}
                                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-sm font-bold">
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    {averageRating}
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-2">{property.title}</h1>
                            <p className="flex items-center text-slate-500 gap-1.5 text-lg">
                                <span className="material-symbols-outlined">location_on</span>
                                {property.location}
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-3xl md:text-4xl font-black text-slate-900">{property.price}</div>
                            <div className="text-slate-500 font-medium">per month</div>
                        </div>
                    </div>

                    <div className="w-full h-80 md:h-[500px] overflow-hidden rounded-2xl relative mb-8 group">
                        <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-full shadow-sm text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined shrink-0 text-xl">bed</span>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bedrooms</div>
                                <div className="font-bold text-slate-900">{property.beds}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-full shadow-sm text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined shrink-0 text-xl">shower</span>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bathrooms</div>
                                <div className="font-bold text-slate-900">{property.baths}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-full shadow-sm text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined shrink-0 text-xl">{property.amenityIcon}</span>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Top Amenity</div>
                                <div className="font-bold text-slate-900">{property.amenity}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-3 rounded-full shadow-sm text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined shrink-0 text-xl">check_circle</span>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Available</div>
                                <div className="font-bold text-slate-900">Move-in Ready</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                {isLoadingReviews ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading premium verified reviews...</p>
                    </div>
                ) : (
                    <ReviewSection
                        propertyId={`property_${id}`}
                        reviews={reviews}
                        rating={averageRating}
                    />
                )}

            </main>
            <Footer />
        </div>
    );
}
