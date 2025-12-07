"use server";

import { redirect } from "next/navigation";
import { ADMIN_PASSWORD, LOGIN_PASSWORD, setSessionCookie, type SessionRole } from "@/lib/auth";

export type LoginFormState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const password = (formData.get("password") ?? "").toString();

  let role: SessionRole | null = null;

  if (password === ADMIN_PASSWORD) {
    role = "admin";
  } else if (password === LOGIN_PASSWORD) {
    role = "user";
  }

  if (!role) {
    return { error: "Incorrect password" };
  }

  await setSessionCookie(role);
  redirect("/");
}
