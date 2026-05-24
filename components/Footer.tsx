import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-night-line">
      <div className="mx-auto flex max-w-6xl min-w-0 flex-col gap-3 px-4 py-8 text-sm leading-6 text-night-muted sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="break-words">医療・診断・治療サービスではありません。</p>
        <div className="flex flex-wrap gap-4">
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
