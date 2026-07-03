import type { Metadata } from "next";
import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = { title: "Update password" };

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
