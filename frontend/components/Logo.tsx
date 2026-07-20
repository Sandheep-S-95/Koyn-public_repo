import Image from "next/image";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Logo({ className = "h-8 text-3xl" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/assets/images/grow.png"
        alt="Koyn logo icon"
        width={64}
        height={64}
        className="h-full w-auto object-contain"
        priority
      />
      <span className={`${greatVibes.className} text-gray-100 leading-none pt-1 pl-1`} style={{ fontSize: '1.2em' }}>
        Koyn
      </span>
    </div>
  );
}
