import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between">
        <p>医療・診断・治療サービスではありません。</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-night-text">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-night-text">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
