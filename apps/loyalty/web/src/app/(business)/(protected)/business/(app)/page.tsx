import { DashboardMetricsGrid } from '@/modules/dashboard/components/dashboard-metrics-grid';
import { DocumentsTable } from '@/modules/dashboard/components/documents-table';
import { VisitorsChart } from '@/modules/dashboard/components/visitors-chart';

export default function DashboardPage() {
    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
            </div>

            <DashboardMetricsGrid />

            <VisitorsChart />

            <DocumentsTable />
        </div>
    );
}
