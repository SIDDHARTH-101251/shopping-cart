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
      <main className="relative z-10 flex h-full w-full min-h-0 flex-col">
        <header className="flex w-full items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-3 py-2 shadow-lg shadow-emerald-500/10 backdrop-blur-xl sm:px-5 sm:py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-amber-300 to-emerald-300 text-2xl shadow-lg shadow-rose-500/30">
              😺
            </div>
            <div id="nav-controls" className="flex items-center gap-2 sm:hidden" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div id="nav-controls-desktop" className="hidden sm:flex items-center gap-2" />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-rose-400/60 hover:text-white hover:shadow-lg hover:shadow-rose-500/20"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
                <span className="sr-only">Logout</span>
              </button>
            </form>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Dashboard initialProducts={products} userRole={userRole} />
        </div>
      </main>
    </div>
  );
}
