import { redirect } from "next/navigation";

export default function LegacyAccessDeniedPage() {
  redirect("/access-denied");
}
