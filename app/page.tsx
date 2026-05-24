import Link from "next/link";
import { SafetyNotice } from "@/components/SafetyNotice";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-5 sm:py-20">
      <section className="grid min-w-0 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-[0.08em] text-night-warm">匿名の手紙箱</p>
          <h1 className="mt-5 max-w-3xl break-words text-3xl font-semibold leading-tight text-night-text sm:text-5xl">
            うまく話せなくてもいい。まずは書いて、少しだけ外に置いてみる場所。
          </h1>
          <p className="mt-6 max-w-2xl break-words text-base leading-8 text-night-muted sm:text-lg sm:leading-9">
            よるの相談箱は、診断やすぐの答えを出す場所ではありません。名前を出さずに、いま抱えていることを静かに置いておける場所です。
          </p>
          <div className="mt-8 flex flex-col gap-3 min-[380px]:flex-row min-[380px]:flex-wrap">
            <Link href="/submit" className="rounded-md bg-night-accent px-5 py-3 text-center text-sm font-semibold text-night-background transition hover:bg-night-accent/90">
              悩みを送る
            </Link>
            <Link href="/archive" className="rounded-md border border-night-line px-5 py-3 text-center text-sm text-night-text transition hover:bg-white/[0.06]">
              公開アーカイブを読む
            </Link>
          </div>
        </div>
        <SafetyNotice />
      </section>
      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["原文は非公開", "投稿本文は管理者以外に表示されません。"],
          ["返信確認URL", "投稿後に表示される専用URLから、あとで返信を確認できます。"],
          ["公開は確認後", "公開アーカイブには、投稿者が公開を希望し、管理者が確認した相談だけが並びます。"]
        ].map(([title, body]) => (
          <div key={title} className="min-w-0 rounded-lg border border-night-line bg-night-card p-4 sm:p-5">
            <h2 className="break-words font-semibold text-night-text">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-night-muted">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
