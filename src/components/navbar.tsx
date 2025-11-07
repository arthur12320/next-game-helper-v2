// "use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Book, Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "../../auth";
import { ThemeToggle } from "./ThemeToggle";
import AuthButton from "./authButton";

export default async function Navbar() {
  const session = await auth();
  const navItems = [
    { name: "Campaigns", href: "/campaigns" },
    { name: "Assets", href: "/assets" },
  ];

  return (
    <header className="sticky top-0 z-50 w-vw border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-3 container flex h-14 items-center w-full max-w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetTitle className="text-left mb-4">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Book className="h-6 w-6" />
                <span className="hidden font-bold sm:inline-block">
                  Cesar RPG Helper
                </span>
              </Link>
            </SheetTitle>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <SheetTrigger key={item.href} asChild>
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-2 py-1 text-lg"
                  >
                    {item.name}
                  </Link>
                </SheetTrigger>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className=" mr-6 flex items-center space-x-2">
          <Book className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            Cesar RPG Helper
          </span>
        </Link>
        <NavigationMenu className=" hidden lg:flex">
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  href={item.href}
                  className={`${navigationMenuTriggerStyle()}group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50`}
                >
                  {item.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex flex-1 items-center justify-end space-x-4 w-full">
          {/* {session?.user && (
            <Suspense fallback={<div className="w-9 h-9" />}>
              <NotificationBellWrapper />
            </Suspense>
          )} */}
          <ThemeToggle />
          <nav className="flex items-center space-x-2">
            <Suspense>
              <AuthButton user={session?.user} />
            </Suspense>
          </nav>
        </div>
      </div>
    </header>
  );
}
