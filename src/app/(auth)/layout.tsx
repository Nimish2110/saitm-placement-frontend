import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-theme min-h-screen flex flex-col" style={{ background: "#FFFFFF" }}>
      {/* Scoped color + font overrides — only affects pages inside (auth), the rest
          of the app (Dashboard, Jobs & Placements, PM/Admin panels, etc.) is untouched. */}
      <style>{`
        .auth-theme {
          --c-primary: #1B2A4A;
          --c-primary-700: #101A30;
          --c-primary-50: #EEF1F6;
          --c-accent: #B8860B;
          --c-accent-50: #FBF3DE;
        }
        .auth-theme h1 {
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: -0.01em;
        }
      `}</style>

      <header className="border-b border-[#E4E7EE] py-5" style={{ background: "#F8F7F3" }}>
        <div className="px-6">
          <Image
            src="/college-logo.png"
            alt="St. Andrews Institute of Technology & Management"
            width={560}
            height={112}
            className="h-24 w-auto object-contain"
            priority
          />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-2xl shadow-[0_4px_28px_rgba(15,23,42,0.09)] border border-[#E4E7EE] p-8">
            {children}
          </div>
          <p className="text-center text-[11px] text-[#94A3B8] mt-6">
            © St. Andrews Institute of Technology &amp; Management, Gurugram (Delhi-NCR)
          </p>
        </div>
      </div>
    </div>
  );
}