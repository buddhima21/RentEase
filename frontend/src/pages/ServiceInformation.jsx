import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ServiceInformation() {
    const services = [
        {
            icon: "electrical_services",
            title: "Electrical Repairs",
            description: "Professional electrical services for all your property needs",
            avgTime: "2-4 hours",
            costRange: "LKR 3,000 - 15,000",
            issues: ["Wiring repairs", "Socket installation", "Breaker issues", "Light fixture installation", "Power outages"]
        },
        {
            icon: "plumbing",
            title: "Plumbing Services",
            description: "Expert plumbing solutions for leaks, installations, and repairs",
            avgTime: "1-3 hours",
            costRange: "LKR 2,500 - 12,000",
            issues: ["Leak repairs", "Pipe installation", "Drain cleaning", "Faucet replacement", "Water heater service"]
        },
        {
            icon: "ac_unit",
            title: "HVAC Maintenance",
            description: "Keep your air conditioning and heating systems running efficiently",
            avgTime: "2-5 hours",
            costRange: "LKR 4,000 - 20,000",
            issues: ["AC servicing", "Filter replacement", "Refrigerant refill", "Duct cleaning", "Thermostat repair"]
        },
        {
            icon: "kitchen",
            title: "Appliance Repair",
            description: "Repair services for all household appliances",
            avgTime: "1-4 hours",
            costRange: "LKR 3,500 - 18,000",
            issues: ["Refrigerator repair", "Washer/dryer service", "Oven repair", "Dishwasher fix", "Microwave repair"]
        },
        {
            icon: "format_paint",
            title: "Painting Services",
            description: "Interior and exterior painting for a fresh look",
            avgTime: "1-3 days",
            costRange: "LKR 10,000 - 50,000",
            issues: ["Interior painting", "Exterior painting", "Wall preparation", "Color consultation", "Touch-ups"]
        },
        {
            icon: "handyman",
            title: "General Handyman",
            description: "Various repair and maintenance services",
            avgTime: "1-3 hours",
            costRange: "LKR 2,000 - 10,000",
            issues: ["Furniture assembly", "Door repairs", "Window fixes", "Shelf installation", "General repairs"]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            <div className="bg-gradient-to-br from-slate-50 to-teal-50 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Our Maintenance Services</h1>
                    <p className="text-lg text-slate-600">Professional, reliable, and affordable property maintenance</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="space-y-12">
                    {services.map((service, i) => (
                        <div key={i} className="bg-white border rounded-2xl p-8 hover:shadow-xl transition-shadow">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-2">
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="material-symbols-outlined text-primary text-5xl">{service.icon}</span>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{service.title}</h2>
                                            <p className="text-slate-600">{service.description}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-bold mb-2">Common Issues Covered:</h3>
                                        <ul className="grid md:grid-cols-2 gap-2">
                                            {service.issues.map((issue, j) => (
                                                <li key={j} className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                                    <span className="text-slate-700">{issue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-teal-50 p-4 rounded-xl">
                                        <p className="text-sm text-slate-600 mb-1">Average Repair Time</p>
                                        <p className="font-bold text-lg">{service.avgTime}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl">
                                        <p className="text-sm text-slate-600 mb-1">Typical Cost Range</p>
                                        <p className="font-bold text-lg">{service.costRange}</p>
                                    </div>
                                    <Link 
                                        to="/tenant/maintenance/request"
                                        className="block w-full bg-primary text-white text-center py-3 rounded-xl font-bold hover:bg-primary/90"
                                    >
                                        Request This Service
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
                    <p className="text-slate-600 mb-8">Our team can help you identify the right service for your needs</p>
                    <Link to="/tenant/maintenance/request" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90">
                        Get Started
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}
