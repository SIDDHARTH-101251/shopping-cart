import { prisma } from "@/lib/prisma";
import { Dashboard, type ProductDTO } from "@/components/dashboard";
import { logoutAction } from "./logout-action";
import { getSessionRoleFromCookies, type SessionRole } from "@/lib/auth";

export const revalidate = 0;

async function getProducts(): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    imageUrls:
      (product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : (product as any).imageUrl
          ? [(product as any).imageUrl]
          : []) ?? [],
    productUrl: product.productUrl,
    price: product.price.toString(),
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

export default async function HomePage() {
  const [products, role] = await Promise.all([getProducts(), getSessionRoleFromCookies()]);
  const userRole: SessionRole = role ?? "user";

  return (
    <div className="relative h-screen min-h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-10 left-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <main className="relative z-10 mx-auto flex h-full max-w-6xl min-h-0 flex-col space-y-6 px-6 py-12">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-amber-300 to-emerald-300 text-2xl shadow-lg shadow-rose-500/30">
              😺
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.08em] text-emerald-300">Purrfect Picks</p>
              <p className="text-sm font-semibold text-white">Cat-approved cart</p>
              <p className="text-xs text-slate-300">Cozy finds, gentle roasts, and instant approvals.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.08em] text-emerald-300">Session</p>
              <p className="text-sm text-slate-200">You are logged in.</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-rose-400/60 hover:text-white hover:shadow-lg hover:shadow-rose-500/20"
              >
                Logout
              </button>
            </form>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
          <div className="h-full">
            <Dashboard initialProducts={products} userRole={userRole} />
          </div>
        </div>
      </main>
    </div>
  );
}
