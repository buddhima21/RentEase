import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import QuickCategoryChips from "../components/QuickCategoryChips";
import FeaturedListings from "../components/FeaturedListings";
import TestimonialsSection from "../components/TestimonialsSection";
import OwnerCTASection from "../components/OwnerCTASection";
import Footer from "../components/Footer";

/**
 * Home – Landing page that composes all sections in their original order.
 */
export default function Home() {
    return (
        <div className="bg-background-light text-slate-900">
            <Navbar />

            <main>
                <HeroSection />
                <QuickCategoryChips />
                <FeaturedListings />
                <TestimonialsSection />
                <OwnerCTASection />
            </main>

            <Footer />
        </div>
    );
}
