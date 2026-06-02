"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/es";
    } catch {
      setError("Correo o contrasena incorrectos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center bg-[#FFF7ED] dark:bg-[#0F172A] p-4">
        <div className="w-full max-w-sm">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-[#EA580C] flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍳</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B] dark:text-[#F1F5F9]">
              Cocina de Tonia
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Gestion de pedidos
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1E293B] dark:text-[#F1F5F9] mb-1.5"
              >
                Correo electronico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155]
                           bg-white dark:bg-[#1E293B] text-[#1E293B] dark:text-[#F1F5F9]
                           text-base touch-target-lg
                           focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                placeholder="mama@ejemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1E293B] dark:text-[#F1F5F9] mb-1.5"
              >
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155]
                           bg-white dark:bg-[#1E293B] text-[#1E293B] dark:text-[#F1F5F9]
                           text-base touch-target-lg
                           focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#EA580C] text-white font-semibold text-base
                         hover:bg-[#C2410C] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all touch-target-lg
                         flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {loading ? "Cargando..." : "Iniciar Sesion"}
            </button>
          </form>
        </div>
      </body>
    </html>
  );
}
