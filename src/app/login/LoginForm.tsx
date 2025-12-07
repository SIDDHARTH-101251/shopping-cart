"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = { error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="mt-6 w-full rounded-xl bg-rose-400 px-4 py-3 text-sm font-semibold text-rose-950 shadow-lg shadow-rose-500/25 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Sending love..." : "Enter with love"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form className="space-y-4" action={formAction}>
      <label className="block text-sm font-medium text-slate-200" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={4}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
        placeholder="Enter the access password"
        autoComplete="current-password"
      />
      {state?.error ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
