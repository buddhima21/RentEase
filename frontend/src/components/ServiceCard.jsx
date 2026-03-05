import { Link } from "react-router-dom";

export default function ServiceCard({ service, showDetails = false }) {
    return (
        <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                {service.icon}
            </span>
            <h3 className="font-bold text-xl mb-2">{service.name}</h3>
            <p className="text-slate-600 mb-4">{service.description}</p>
            
            {showDetails && (
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Avg Time:</span>
                        <span className="font-semibold">{service.avgTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Cost Range:</span>
                        <span className="font-semibold">{service.costRange}</span>
                    </div>
                </div>
            )}
            
            <Link 
                to="/tenant/maintenance/request" 
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
                Request Service
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
        </div>
    );
}
