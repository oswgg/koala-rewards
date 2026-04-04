'use client';

import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { useChartData } from '../hooks/useChartData';

const timeRanges = [
    { label: 'Últimos 3 meses', value: '3m' },
    { label: 'Últimos 30 días', value: '30d' },
    { label: 'Últimos 7 días', value: '7d' },
];

export function VisitorsChart() {
    const [selectedRange, setSelectedRange] = useState('7d');
    const { data = [], isLoading, error } = useChartData(selectedRange);

    return (
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold md:text-lg">Actividad del programa</h3>
                    <p className="text-xs text-muted-foreground md:text-sm">
                        Refleja uso del sistema y tráfico recurrente
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {timeRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setSelectedRange(range.value)}
                            className={cn(
                                'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors md:px-3 md:text-sm',
                                selectedRange === range.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-55 w-full sm:h-75">
                {error ? (
                    <div className="flex h-full items-center justify-center text-sm text-destructive">
                        Error al cargar el gráfico
                    </div>
                ) : isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="0%"
                                        stopColor="var(--color-chart-1)"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="var(--color-chart-1)"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-lg)',
                                }}
                                labelStyle={{ color: 'var(--foreground)' }}
                                formatter={(value) => [`${value ?? 0}`, 'Visitas']}
                            />
                            <Area
                                type="monotone"
                                dataKey="visitors"
                                name="Visitas"
                                stroke="var(--color-chart-1)"
                                strokeWidth={2}
                                fill="url(#visitorsGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
