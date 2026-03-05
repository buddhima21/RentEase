export default function TechnicianCard({ technician, showWorkload = false, onSelect }) {
    return (
        <div 
            className={`bg-white border rounded-2xl p-6 ${onSelect ? 'cursor-pointer hover:border-primary hover:shadow-lg' : ''} transition-all`}
            onClick={onSelect}
        >
            <div className="text-center mb-4">
                <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3"></div>
                <h3 className="font-bold text-lg">{technician.name}</h3>
                <p className="text-sm text-slate-600">{technician.specialty}</p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{technician.rating}</span>
            </div>

            <p className="text-sm text-slate-500 text-center mb-4">
                {technician.completedJobs} Repairs Completed
            </p>

            {showWorkload && (
                <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Tasks Today:</span>
                        <span className="font-semibold">{technician.tasksToday} / {technician.maxTasksPerDay}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <div 
                            className={`h-2 rounded-full ${
                                technician.workload === 'Low' ? 'bg-green-600' :
                                technician.workload === 'Medium' ? 'bg-yellow-600' :
                                'bg-red-600'
                            }`}
                            style={{ width: `${(technician.tasksToday / technician.maxTasksPerDay) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-sm font-semibold ${
                            technician.workload === 'Low' ? 'text-green-600' :
                            technician.workload === 'Medium' ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                            {technician.workload} Workload
                        </span>
                        {technician.available && (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Available
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
