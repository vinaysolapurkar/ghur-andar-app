import NavBar from "@/components/nav-bar";
import NotificationBell from "@/components/notification-bell";

export default function DtdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-slate-100">
          Ghur<span className="text-amber-400">.</span>Andar{" "}
          <span className="text-sm font-normal text-slate-400">DTD</span>
        </h1>
        <NotificationBell role="dtd" />
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <NavBar role="dtd" />
    </div>
  );
}
