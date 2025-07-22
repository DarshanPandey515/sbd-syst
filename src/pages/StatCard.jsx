const StatCard = ({ icon, value, label }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    </div>
);