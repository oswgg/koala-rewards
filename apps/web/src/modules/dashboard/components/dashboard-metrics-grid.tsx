'use client';

import { Loader2 } from 'lucide-react';

import { MetricCard } from './metric-card';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

export function DashboardMetricsGrid() {
    const { data, isLoading, error } = useDashboardMetrics();

    if (isLoading) {
        return (
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex h-32 animate-pulse items-center justify-center rounded-xl border border-border bg-card"
                    >
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
                Error al cargar las métricas
            </div>
        );
    }

    const emptyChange = { value: '0%', positive: true };
    const m = data ?? {
        activeClientsLast30Days: 0,
        activeClientsChange: emptyChange,
        recurringClients: 0,
        recurringClientsPercent: 0,
        recurringClientsChange: emptyChange,
        visitsThisMonth: 0,
        visitsChange: emptyChange,
        rewardsRedeemedThisMonth: 0,
        rewardsChange: emptyChange,
        activeCards: 0,
        activeCardsChange: emptyChange,
        clientsNearReward: 0,
        clientsNearRewardChange: emptyChange,
    };

    const metrics = [
        {
            title: 'Clientes activos',
            value: String(m.activeClientsLast30Days),
            change: m.activeClientsChange.value,
            changePositive: m.activeClientsChange.positive,
            description: 'vs. 30 días anteriores',
            detail: 'Indica si el programa realmente se usa y muestra crecimiento',
        },
        {
            title: 'Clientes recurrentes',
            value: `${m.recurringClients}`,
            change: m.recurringClientsChange.value,
            changePositive: m.recurringClientsChange.positive,
            description: 'vs. 30 días anteriores',
            detail: 'Métrica clave: gran parte de los ingresos proviene de clientes repetidos',
        },
        {
            title: 'Visitas registradas',
            value: String(m.visitsThisMonth),
            change: m.visitsChange.value,
            changePositive: m.visitsChange.positive,
            description: 'vs. mes anterior',
            detail: 'Refleja uso del sistema y tráfico recurrente',
        },
        {
            title: 'Recompensas canjeadas',
            value: String(m.rewardsRedeemedThisMonth),
            change: m.rewardsChange.value,
            changePositive: m.rewardsChange.positive,
            description: 'vs. mes anterior',
            detail: 'Indica que los clientes llegan al objetivo y el incentivo funciona',
        },
        {
            title: 'Tarjetas activas',
            value: String(m.activeCards),
            change: m.activeCardsChange.value,
            changePositive: m.activeCardsChange.positive,
            description: 'vs. inicio de mes',
            detail: 'Tamaño de la base de clientes del programa',
        },
        {
            title: 'Clientes cerca de recompensa',
            value: String(m.clientsNearReward),
            change: m.clientsNearRewardChange.value,
            changePositive: m.clientsNearRewardChange.positive,
            description: 'cerca + canjeados vs. mes anterior',
            detail: 'Probablemente regresarán pronto',
        },
    ];

    return (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
            ))}
        </div>
    );
}
