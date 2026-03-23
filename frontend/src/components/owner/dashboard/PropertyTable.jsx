import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertiesData } from "../../../data/ownerDashboardData";
import ActionDropdown from "./ActionDropdown";
import DeletePropertyModal from "./DeletePropertyModal";

const statusStyles = {
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-500",
    yellow: "bg-amber-50 text-amber-600",
};

/**
 * PropertyTable — Responsive table listing the owner's properties (Dashboard summary).
 */
export default function PropertyTable() {
    const navigate = useNavigate();
    const [deletingProperty, setDeletingProperty] = useState(null);

    const handleDeleteConfirm = (reason) => {
        console.log(`Deleting property: ${deletingProperty.name}, Reason: ${reason}`);
        // Here you would typically dispatch an action or make an API call to delete the property
        // For now, since propertiesData is static, we just log it
        setDeletingProperty(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-emerald-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">My Properties</h3>
                <button 
                    onClick={() => navigate('/owner/properties')}
                    className="text-primary text-sm font-bold hover:underline underline-offset-4 transition-all"
                >
                    View All →
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead>
                        <tr className="bg-emerald-50/50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                            <th className="px-6 py-4">Property</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Rent / Month</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                        {propertiesData.map((prop) => (
                            <tr
                                key={prop.id}
                                className="hover:bg-emerald-50/30 transition-colors duration-200 group"
                            >
                                {/* Property name + thumbnail */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={prop.thumbnail}
                                            alt={prop.name}
                                            className="w-11 h-11 rounded-lg object-cover ring-1 ring-emerald-100"
                                        />
                                        <span className="font-semibold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">
                                            {prop.name}
                                        </span>
                                    </div>
                                </td>

                                {/* Type */}
                                <td className="px-6 py-4 text-sm text-slate-600">{prop.type}</td>

                                {/* Status badge */}
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyles[prop.statusColor] || statusStyles.slate
                                            }`}
                                    >
                                        {prop.status}
                                    </span>
                                </td>

                                {/* Rent */}
                                <td className="px-6 py-4 text-sm font-medium text-emerald-700">{prop.rent}</td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <ActionDropdown 
                                        onUpdate={() => navigate(`/owner/properties/${prop.id}/edit`)}
                                        onView={() => navigate(`/owner/properties/${prop.id}`)}
                                        onDelete={() => setDeletingProperty(prop)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Modal */}
            <DeletePropertyModal 
                isOpen={!!deletingProperty}
                onClose={() => setDeletingProperty(null)}
                onConfirm={handleDeleteConfirm}
                propertyName={deletingProperty?.name}
            />
        </div>
    );
}

