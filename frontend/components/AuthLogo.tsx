'use client';

import Link from "next/link";
import Logo from "@/components/Logo";
import { usePathname } from "next/navigation";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ['latin'] });

export default function AuthLogo() {
    const pathname = usePathname();
    const isSignIn = pathname === '/sign-in';

    return (
        <div className="relative z-10 mb-8 flex flex-col items-center">
            <Link href="/">
                <Logo className={isSignIn ? "h-16 text-6xl cursor-pointer mb-3" : "h-11 text-4xl cursor-pointer"} />
            </Link>
            {isSignIn && (
                <p className={`${montserrat.className} text-xs md:text-sm text-emerald-400/80 font-medium tracking-[0.25em] uppercase text-center`}>
                    Your Edge in Every Market Move.
                </p>
            )}
        </div>
    );
}
