import Link from "next/link";

const navItems = [
  { href: "/submit", label: "投稿する" },
  { href: "/archive", label: "公開アーカイブ" },
  { href: "/guideline", label: "ガイドライン" },
  { href: "/about", label: "この場所について" }
];

export function Header() {
  return (
    <header className="border-b border-white/10 bg-night-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-wide text-night-text">
          よるの相談箱
        </Link>
        <nav className="flex flex-wrap gap-3 text-sm text-night-muted">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 hover:bg-white/10 hover:text-night-text">
              {item.label}
            </Link>
          ))}
          <Link href="/admin/login" className="rounded-full px-3 py-1.5 hover:bg-white/10 hover:text-night-text">
            管理者
          </Link>
        </nav>
      </div>
    </header>
  );
}
