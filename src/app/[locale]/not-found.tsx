import { Link } from "@/lib/i18n/navigation";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <p className="text-6xl font-bold text-[var(--muted-foreground)] mb-4">404</p>
      <h2 className="text-lg font-bold mb-2">Pagina no encontrada</h2>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        La pagina que buscas no existe.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold touch-target"
      >
        <Home size={18} />
        Ir al Tablero
      </Link>
    </div>
  );
}
