export default function StatusBadge({ status, priority }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700";
            case "In Progress":
                return "bg-blue-100 text-blue-700";
            case "Assigned":
                return "bg-purple-100 text-purple-700";
            case "Pending":
                return "bg-slate-100 text-slate-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "Emergency":
                return "bg-red-600 text-white";
            case "High":
                return "bg-red-100 text-red-700";
            case "Medium":
                return "bg-yellow-100 text-yellow-700";
            case "Low":
                return "bg-green-100 text-green-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    if (priority) {
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(priority)}`}>
                {priority}
            </span>
        );
    }

    if (status) {
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                {status}
            </span>
        );
    }

    return null;
}
