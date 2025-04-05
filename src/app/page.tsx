import LandingPage from "@/components/LadingPage";
import { redirect } from "next/navigation";
import { auth } from "../../auth"; // Adjust import based on your auth setup

export default async function Home() {
  // Check if user is authenticated server-side
  const session = await auth();

  // If logged in, redirect to campaigns page
  if (session?.user) {
    redirect("/campaigns");
  }

  // Otherwise show landing page
  return <LandingPage />;
}
