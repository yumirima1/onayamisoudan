import Link from "next/link";

const navItems = [
  { href: "/submit", label: "投稿する" },
  { href: "/archive", label: "公開アーカイブ" },
  { href: "/guideline", label: "ガイドライン" },
  { href: "/about", label: "この場所について" }
];

export function Header() {
  return (
    <header className="border-b border-night-line bg-night-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Link href="/" className="break-words text-lg font-semibold tracking-wide text-night-text">
          よるの相談箱
        </Link>
        <nav className="flex min-w-0 flex-wrap gap-2 text-sm leading-6 text-night-muted sm:gap-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="max-w-full rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-night-text">
              {item.label}
            </Link>
          ))}
          <Link href="/admin/login" className="max-w-full rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-night-text">
            管理者
          </Link>
        </nav>
      </div>
    </header>
  );
}
