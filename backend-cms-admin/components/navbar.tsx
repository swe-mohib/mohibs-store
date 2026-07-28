import { UserButton } from "@clerk/nextjs";
import MainNav from "@/components/main-nav";
import StoreSwitcher from "@/components/store-switcher";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Navbar() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const stores = await prismadb?.store.findMany({
    where: {
      userId,
    },
  });
  return (
    <div className="border-b">
      <div className="flex min-h-16 flex-wrap items-center gap-y-2 px-4 py-2 sm:flex-nowrap">
        <StoreSwitcher items={stores} />
        <MainNav className="order-3 w-full sm:order-none sm:mx-6 sm:w-auto" />
        <div className="ml-auto flex shrink-0 items-center space-x-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
