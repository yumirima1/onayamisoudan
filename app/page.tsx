import Link from "next/link";
import { SafetyNotice } from "@/components/SafetyNotice";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-night-accent">匿名投稿・管理者返信・公開アーカイブ</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-night-text sm:text-6xl">
            うまく話せなくてもいい。まずは書いて、少しだけ外に置いてみる場所。
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-night-muted">
            書かれた原文は非公開で保存され、管理者だけが確認します。公開されるのは、本人の許可があり、匿名編集された公開専用データだけです。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="rounded-md bg-night-accent px-5 py-3 text-sm font-semibold text-white">
              悩みを送る
            </Link>
            <Link href="/public" className="rounded-md border border-white/15 px-5 py-3 text-sm text-night-text hover:bg-white/10">
              みんなの悩みを見る
            </Link>
          </div>
        </div>
        <SafetyNotice />
      </section>
      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          ["原文は非公開", "投稿本文は管理者以外に表示されません。"],
          ["公開文を分離", "公開ページは編集済みの public_posts だけを参照します。"],
          ["AIは補助のみ", "返信案は管理者が確認し、保存するまで外に出ません。"]
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-white/10 bg-night-card p-5">
            <h2 className="font-semibold text-night-text">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-night-muted">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
