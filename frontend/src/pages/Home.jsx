import { useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import QuickCategoryChips from "../components/QuickCategoryChips";
import FeaturedListings from "../components/FeaturedListings";
import TestimonialsSection from "../components/TestimonialsSection";
import OwnerCTASection from "../components/OwnerCTASection";
import AboutUs from "../components/AboutUs";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

/**
 * Home – Landing page that composes all sections in their original order.
 */
export default function Home() {
    const [activeCategory, setActiveCategory] = useState("Near Universities");

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background-light text-slate-900"
        >
            <Navbar />

            <main>
                <HeroSection />
                <QuickCategoryChips
                    activeCategory={activeCategory}
                    onCategorySelect={setActiveCategory}
                />
                <FeaturedListings activeCategory={activeCategory} />
                <AboutUs />
                <TestimonialsSection />
                <OwnerCTASection />
            </main>

            <Footer />
        </motion.div>
    );
}

