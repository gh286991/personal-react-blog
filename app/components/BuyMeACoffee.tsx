export function BuyMeACoffee() {
  return (
    <div className="flex justify-center my-12 not-prose">
      <a
        href="https://www.buymeacoffee.com/tomslab"
        target="_blank"
        rel="noreferrer"
        aria-label="Buy me a ramen"
        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#FFDD00] hover:bg-[#FFEA00] text-slate-900 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        {/* Shine Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 pointer-events-none"></div>
        
        <span className="text-2xl animate-bounce [animation-duration:2s]" aria-hidden="true">
          🍜
        </span>
        <span className="text-lg font-bold tracking-wide font-['Cookie',_cursive]">
          Buy me a Ramen
        </span>
      </a>
    </div>
  );
}
