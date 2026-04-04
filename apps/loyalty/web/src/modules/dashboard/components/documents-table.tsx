'use client';

import { useState } from 'react';
import { ChevronDown, GripHorizontal, Loader2, Plus } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { useDashboardTableData } from '../hooks/useDashboardTableData';
import { Button } from '@vado/shared/ui';

type TabId = 'latest-activities' | 'new-customers' | 'sales' | 'rewards-claimed';

const tabConfig = [
    {
        id: 'latest-activities' as const,
        label: 'Últimos Movimientos',
        columns: [
            { id: 'id', label: 'ID' },
            { id: 'client', label: 'Cliente' },
            { id: 'type', label: 'Tipo' },
            { id: 'registered_by', label: 'Registrado Por' },
            { id: 'date', label: 'Fecha de Registro' },
        ],
    },
    {
        id: 'new-customers' as const,
        label: 'Nuevos Clientes',
        columns: [
            { id: 'id', label: 'ID' },
            { id: 'name', label: 'Nombre' },
            { id: 'date', label: 'Fecha' },
        ],
    },
    {
        id: 'sales' as const,
        label: 'Ventas',
        columns: [
            { id: 'id', label: 'ID' },
            { id: 'client', label: 'Cliente' },
            { id: 'amount', label: 'Monto' },
            { id: 'date', label: 'Fecha' },
        ],
    },
    {
        id: 'rewards-claimed' as const,
        label: 'Recompensas Reclamadas',
        columns: [
            { id: 'id', label: 'ID' },
            { id: 'client', label: 'Cliente' },
            { id: 'program_name', label: 'Programa' },
            { id: 'reward_name', label: 'Recompensa' },
            { id: 'date', label: 'Fecha' },
        ],
    },
] as const;

export function DocumentsTable() {
    const [activeTab, setActiveTab] = useState<TabId>('latest-activities');
    const { data, isLoading, error } = useDashboardTableData();

    const counts = data?.counts ?? {
        'latest-activities': 0,
        'new-customers': 0,
        sales: 0,
        'rewards-claimed': 0,
    };
    const tableDataByTab = data?.data ?? {
        'latest-activities': [],
        'new-customers': [],
        sales: [],
        'rewards-claimed': [],
    };

    const tabs = tabConfig.map((tab) => ({
        ...tab,
        count: counts[tab.id],
    }));

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm',
                                activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            {tab.label}
                            <span
                                className={cn(
                                    'flex size-5 min-w-5 items-center justify-center rounded-full text-xs',
                                    activeTab === tab.id ? 'bg-primary-foreground/20' : 'bg-muted'
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="size-3 animate-spin" />
                                ) : (
                                    tab.count
                                )}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <GripHorizontal className="mr-2 size-4" />
                        Customize Columns
                        <ChevronDown className="ml-2 size-4" />
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none">
                        <Plus className="mr-2 size-4" />
                        Add Section
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="w-12 px-4 py-3 text-left">
                                <input type="checkbox" className="rounded border-input" />
                            </th>
                            {tabConfig
                                .find((tab) => tab.id === activeTab)
                                ?.columns.map((column) => (
                                    <th
                                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                                        key={column.id}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {error ? (
                            <tr>
                                <td
                                    colSpan={
                                        (tabConfig.find((t) => t.id === activeTab)?.columns
                                            .length ?? 0) + 1
                                    }
                                    className="px-4 py-12 text-center text-sm text-destructive"
                                >
                                    Error al cargar los datos
                                </td>
                            </tr>
                        ) : isLoading ? (
                            <tr>
                                <td
                                    colSpan={
                                        (tabConfig.find((t) => t.id === activeTab)?.columns
                                            .length ?? 0) + 1
                                    }
                                    className="px-4 py-12 text-center"
                                >
                                    <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
                                </td>
                            </tr>
                        ) : tableDataByTab[activeTab].length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        (tabConfig.find((t) => t.id === activeTab)?.columns
                                            .length ?? 0) + 1
                                    }
                                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                                >
                                    No hay datos para mostrar
                                </td>
                            </tr>
                        ) : (
                            tableDataByTab[activeTab].map((row, i) => (
                                <tr
                                    key={row.id ?? i}
                                    className="border-b border-border last:border-0 hover:bg-muted/50"
                                >
                                    <td className="px-4 py-3">
                                        <input type="checkbox" className="rounded border-input" />
                                    </td>
                                    {tabConfig
                                        .find((tab) => tab.id === activeTab)
                                        ?.columns.map((column) => (
                                            <td
                                                key={column.id}
                                                className={cn(
                                                    'px-4 py-3',
                                                    column.id === 'id' &&
                                                        'font-mono text-xs text-muted-foreground',
                                                    (column.id === 'client' ||
                                                        column.id === 'name') &&
                                                        'font-medium'
                                                )}
                                            >
                                                {row[column.id] ?? '—'}
                                            </td>
                                        ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
