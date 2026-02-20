import { redirect } from "next/navigation";

// Root page — bas redirect karta hai
// Login nahi hai → /login
// Login hai → /dashboard (middleware handle karega)
export default function HomePage() {
  redirect("/login");
}
