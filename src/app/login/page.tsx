import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { isAuthenticatedFromCookies } from "@/lib/auth";
import { CatEmojiMobile } from "@/components/cat-emoji";

export const metadata = {
  title: "Login | Eepy Love Gate",
  description: "A cozy, funny, slightly romantic doorway to the dashboard.",
};

export default async function LoginPage() {
  const isAuthed = await isAuthenticatedFromCookies();
  if (isAuthed) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-950 via-slate-950 to-indigo-950 px-6 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-8 top-10 h-48 w-48 rounded-full bg-rose-500/25 blur-3xl" />
        <div className="absolute right-6 bottom-10 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_75%_20%,rgba(244,114,182,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(45,212,191,0.14),transparent_32%)]" />
      </div>
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-rose-500/20 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.08em] text-rose-200">Secret doorway</p>
            <h1 className="text-3xl font-semibold leading-tight">Hey, cutie. Ready to sneak in?</h1>
          </div>
          <span className="text-3xl" role="img" aria-label="love letter">
            💌
          </span>
        </div>
        <p className="text-sm leading-relaxed text-rose-100/80">
          Whisper the password, promise to pet the cat, and we will open the gate. Keep it sweet, keep it silly.
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-rose-500/10">
          <LoginForm />
          <p className="mt-4 text-xs text-rose-100/70">
            Bonus points if you wink at the cat while typing. They love drama.
          </p>
        </div>
      </div>
      <CatEmojiMobile hideOnDesktop={false} message='Aimuu the password is. "y..n..a"' />
    </div>
  );
}
