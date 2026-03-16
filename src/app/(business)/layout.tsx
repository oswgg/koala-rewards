/**
 * Layout del grupo de rutas (business).
 * La protección se aplica en los layouts hijos:
 * - (protected): requireAuth para onboarding
 * - (protected)/(app): requireAuthAndStaff para dashboard, programas
 * - (protected)/scan: requireAuthAndStaff para escanear
 */
export default function BusinessLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
