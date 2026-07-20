import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import MobileNav from "@/components/MobileNav";
import UserDropdown from "@/components/UserDropdown";
import Logo from "@/components/Logo";
import {searchStocks} from "@/lib/actions/finnhub.actions";

const Header = async ({ user }: { user: User }) => {
    const initialStocks = await searchStocks(undefined, user.email);

    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/">
                    <Logo className="h-8 cursor-pointer" />
                </Link>
                <nav className="hidden sm:block">
                    <NavItems initialStocks={initialStocks} userEmail={user.email} />
                </nav>
                <div className="flex items-center gap-2">
                    <MobileNav initialStocks={initialStocks} userEmail={user.email} />
                    <UserDropdown user={user} initialStocks={initialStocks} />
                </div>
            </div>
        </header>
    )
}
export default Header
