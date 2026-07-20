"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import NavItems from "./NavItems";
import Logo from "./Logo";

export default function MobileNav({ initialStocks, userEmail }: { initialStocks: StockWithWatchlistStatus[], userEmail?: string }) {
  return (
    <Sheet>
      <SheetTrigger className="sm:hidden p-2 text-gray-400 hover:text-white transition">
        <Menu size={24} />
      </SheetTrigger>
      <SheetContent side="left" className="bg-[#050505] border-r-white/10 p-6">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">
            <Logo className="h-6" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4">
          <NavItems initialStocks={initialStocks} userEmail={userEmail} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
