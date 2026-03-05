import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MaintenanceLanding() {
    const services = [
        { icon: "electrical_services", title: "Electrical Repairs", desc: "Wiring, sockets, breakers" },
        { icon: "plumbing", title: "Plumbing Services", desc: "Leaks, pipes, installations" },
        { icon: "ac_unit", title: "HVAC Maintenance", desc: "AC servicing, filters" },
        { icon: "kitchen", title: "Appliance Repair", desc: "Fridge, washer, dryer" },
        { icon: "format_paint", title: "Painting", desc: "Interior and exterior" },
        { icon: "handyman", title: "General Handyman", desc: "Various repairs" }
    ];

    const technicians = [
        { name: "John Silva", specialty: "Electrical Specialist", rating: 4.8, jobs: 96 },
        { name: "Maria Fernando", specialty: "Plumbing Expert", rating: 4.9, jobs: 112 },
        { name: "Kasun Perera", specialty: "HVAC Technician", rating: 4.7, jobs: 84 }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-50 to-teal-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl font-bold text-slate-900 mb-4">
                                Reliable Property <span className="text-primary">Maintenance</span> in Minutes
                            </h1>
                            <p className="text-lg text-slate-600 mb-8">
                                Book verified technicians for repairs, installations, and emergency fixes.
                            </p>
                            
                            {/* Statistics Dashboard */}
                            <div className="bg-white p-8 rounded-2xl shadow-xl mb-6">
                                <h3 className="font-bold text-xl mb-6 text-center">Trusted by Students Across Sri Lanka</h3>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-primary mb-1">500+</p>
                                        <p className="text-sm text-slate-600">Requests Completed</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-primary mb-1">4.8★</p>
                                        <p className="text-sm text-slate-600">Average Rating</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-primary mb-1">50+</p>
                                        <p className="text-sm text-slate-600">Verified Technicians</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-primary mb-1">2hrs</p>
                                        <p className="text-sm text-slate-600">Average Response Time</p>
                                    </div>
                                </div>
                                <div className="border-t pt-6">
                                    <p className="text-center text-slate-600 mb-4 font-semibold">See how easy it is to get maintenance done</p>
                                    <Link 
                                        to="/login" 
                                        className="block w-full bg-primary text-white text-center py-3 rounded-xl font-bold hover:bg-primary/90"
                                    >
                                        Login to Get Started
                                    </Link>
                                    <p className="text-center text-sm text-slate-500 mt-3">
                                        Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
                                    </p>
                                </div>
                            </div>

                            {/* Feature Highlights */}
                            <div className="bg-teal-50 p-6 rounded-2xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                                        <div>
                                            <p className="font-semibold text-sm">24/7 Emergency</p>
                                            <p className="text-xs text-slate-600">Always available</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                                        <div>
                                            <p className="font-semibold text-sm">Verified Techs</p>
                                            <p className="text-xs text-slate-600">Background checked</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                                        <div>
                                            <p className="font-semibold text-sm">Real-Time Track</p>
                                            <p className="text-xs text-slate-600">Live updates</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">speed</span>
                                        <div>
                                            <p className="font-semibold text-sm">2hr Response</p>
                                            <p className="text-xs text-slate-600">Average time</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white p-4 rounded-2xl shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600" alt="Technician" className="rounded-xl w-full" />
                                <div className="mt-4 flex items-center gap-2 bg-teal-50 p-3 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">verified</span>
                                    <span className="font-semibold">100% Verified - Safe listings for students</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Categories */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {services.map((service, i) => (
                            <div key={i} className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                <span className="material-symbols-outlined text-primary text-5xl mb-4">{service.icon}</span>
                                <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                                <p className="text-slate-600 mb-4">{service.desc}</p>
                                <Link to="/maintenance/services" className="text-primary font-semibold hover:underline">View Details →</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: "edit_note", title: "Submit Request", desc: "Describe your maintenance issue" },
                            { icon: "person_check", title: "Auto Assignment", desc: "Technician assigned instantly" },
                            { icon: "location_on", title: "Track in Real-Time", desc: "Monitor repair progress" },
                            { icon: "star", title: "Rate Service", desc: "Confirm completion & review" }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-primary text-4xl">{step.icon}</span>
                                </div>
                                <h3 className="font-bold mb-2">{step.title}</h3>
                                <p className="text-slate-600 text-sm">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technicians */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-4">Verified Technicians</h2>
                    <p className="text-center text-slate-600 mb-12">Licensed professionals with background checks</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {technicians.map((tech, i) => (
                            <div key={i} className="bg-white border rounded-2xl p-6 text-center">
                                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4"></div>
                                <h3 className="font-bold text-lg">{tech.name}</h3>
                                <p className="text-slate-600 text-sm mb-2">{tech.specialty}</p>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="font-semibold">{tech.rating}</span>
                                </div>
                                <p className="text-sm text-slate-500">{tech.jobs} Repairs Completed</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Emergency Banner */}
            <section className="py-16 bg-red-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <span className="material-symbols-outlined text-red-600 text-6xl mb-4">emergency</span>
                    <h2 className="text-3xl font-bold mb-4">24/7 Emergency Repairs</h2>
                    <p className="text-slate-600 mb-6">Urgent issues? We're here to help anytime.</p>
                    <Link to="/tenant/maintenance/emergency" className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700">
                        Report Emergency Issue
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
