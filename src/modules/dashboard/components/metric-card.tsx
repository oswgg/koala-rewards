import { TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader } from '@/ui/card';

export interface MetricCardProps {
    title: string;
    value: string;
    /** Opcional: ej. "+12%" o "44%" */
    change?: string;
    changePositive?: boolean;
    description: string;
    detail?: string;
}

export function MetricCard({
    title,
    value,
    change,
    changePositive = true,
    description,
    detail,
}: MetricCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <p className="text-xs font-medium text-muted-foreground md:text-sm">{title}</p>
                <p className="text-xl font-bold md:text-2xl">{value}</p>
                {change != null && (
                    <div className="flex items-center gap-1">
                        <span
                            className={cn(
                                'text-sm font-medium',
                                changePositive ? 'text-green-500' : 'text-red-500'
                            )}
                        >
                            {change}
                        </span>
                        {changePositive ? (
                            <TrendingUp className="size-4 text-green-500" />
                        ) : (
                            <TrendingDown className="size-4 text-red-500" />
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{description}</p>
                {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
            </CardContent>
        </Card>
    );
}
