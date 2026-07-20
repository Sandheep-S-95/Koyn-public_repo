import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";
import AuthLogo from "@/components/AuthLogo";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() })

    if(session?.user) redirect('/')

    return (
        <main className="auth-layout">
            {/* Candlestick chart background overlay */}
            <Image
                src="/assets/images/candlestick-bg.svg"
                alt=""
                fill
                className="auth-bg-overlay object-cover"
                priority
            />

            {/* Dual color glow behind card */}
            <div className="auth-glow-green" />
            <div className="auth-glow-gold" />

            {/* Logo */}
            <AuthLogo />



            {/* Auth card content */}
            <div className="relative z-10 w-full flex justify-center px-4">
                {children}
            </div>

            {/* Footer */}
            <div className="auth-footer">
                <div className="flex items-center gap-2">
                    <Logo className="h-6 opacity-50" />
                    <span className="text-gray-500 text-xs">© 2024 Koyn Inc.</span>
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-500">
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Support</Link>
                </div>
            </div>
        </main>
    )
}
export default Layout
