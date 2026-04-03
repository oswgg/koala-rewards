'use client';

import Link from 'next/link';
import { Heart, LayoutDashboard, Menu, QrCode, ScanLine } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { usePathname } from 'next/navigation';
import { Button } from '@/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared/components/ui/sheet';
import { businessRoutes } from '@/shared/lib/routes';

const navHome = [
    { title: 'Dashboard', href: businessRoutes.dashboard, icon: LayoutDashboard },
    { title: 'Programas', href: businessRoutes.programs, icon: Heart },
    { title: 'Escanear tarjeta', href: businessRoutes.scan, icon: ScanLine },
];

function SidebarNav() {
    const pathname = usePathname();

    return (
        <nav className="space-y-6">
            <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Home
                </p>
                <ul className="space-y-1">
                    {navHome.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href === businessRoutes.scan && pathname.startsWith('/scan'));
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                        isActive
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                    )}
                                >
                                    <item.icon className="size-4 shrink-0" />
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}

function SidebarContent() {
    return (
        <>
            <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">K</span>
                </div>
                <span className="font-semibold">KoalaCards</span>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <SidebarNav />
            </div>
        </>
    );
}

function MobileScanFab() {
    const pathname = usePathname();
    if (pathname.startsWith('/scan')) return null;

    return (
        <Link
            href={businessRoutes.scan}
            className={cn(
                'fixed z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg',
                'bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))]',
                'transition-[opacity,box-shadow] hover:opacity-95 hover:shadow-xl',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'md:hidden'
            )}
            aria-label="Escanear tarjeta"
        >
            <QrCode className="size-7" strokeWidth={2} aria-hidden />
        </Link>
    );
}

export function AppSidebar() {
    return (
        <>
            <div className="fixed left-0 top-0 z-40 flex h-14 w-full items-center gap-2 border-b border-sidebar-border bg-sidebar px-4 md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Abrir menú">
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Menú de navegación</SheetTitle>
                        </SheetHeader>
                        <div className="flex h-full flex-col">
                            <SidebarContent />
                        </div>
                    </SheetContent>
                </Sheet>
                <span className="font-semibold">KoalaCards</span>
            </div>

            {/* Desktop: sidebar visible */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
                <SidebarContent />
            </aside>

            <MobileScanFab />
        </>
    );
}
