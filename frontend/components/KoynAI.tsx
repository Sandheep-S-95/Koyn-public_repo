import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
});

export default function KoynAI({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className={`${greatVibes.className} text-gray-100 leading-none pt-1`} style={{ fontSize: '1.2em' }}>
        Koyn
      </span>
      <span className="font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent">
        AI
      </span>
    </span>
  );
}
