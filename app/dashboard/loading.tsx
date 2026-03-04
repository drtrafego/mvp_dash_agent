export default function DashboardLoading() {
    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}
                </div>
            </div>
        </div>
    );
}
