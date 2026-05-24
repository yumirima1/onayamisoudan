# よるの相談箱

匿名で悩みを投稿し、管理者が返信し、許可された投稿だけを匿名編集済みで公開アーカイブや配信候補に使う Next.js サイトです。

このサービスは医療・診断・治療サービスではありません。目的は「診断」ではなく、悩みの言語化、管理者による返信、匿名編集済みの共有アーカイブです。

## 技術構成

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Database
- 管理者ログインは `ADMIN_PASSWORD` + httpOnly Cookie
- Vercel
- 下書き補助は初期OFF対応

## セットアップ手順

```bash
npm install
npm run dev
```

ローカルでは `http://localhost:3000` を開きます。

## 必要な環境変数

`.env.local` を作成してください。秘密鍵は絶対に `NEXT_PUBLIC_` に入れないでください。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_PASSWORD=
APP_BASE_URL=http://localhost:3000
OPENAI_API_KEY=
```

`ADMIN_PASSWORD` は管理画面ログインに使います。`NEXT_PUBLIC_` 付きの環境変数には入れないでください。

`OPENAI_API_KEY` は空でも動きます。空の場合、管理画面には「下書き補助は未設定」と表示され、下書き補助APIも無効になります。

## Supabaseプロジェクト作成方法

1. Supabaseで無料プロジェクトを作成します。
2. Project Settings から `Project URL` を `NEXT_PUBLIC_SUPABASE_URL` に設定します。
3. API Keys から publishable key を `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` に設定します。
4. server-only の secret/service key を `SUPABASE_SECRET_KEY` に設定します。
5. 管理者ログインには Supabase Auth を使いません。管理画面は `ADMIN_PASSWORD` と httpOnly Cookie で保護します。

## Supabase RLS適用方法

`supabase/migrations/schema.sql` を Supabase SQL Editor で実行します。

このSQLは以下を設定します。

- `posts`: 非公開の原文保存
- `public_posts`: 公開専用の匿名編集済みデータ
- `post_tags`: タグ
- `admin_profiles`: 管理者権限
- `admin_audit_logs`: 管理者操作ログ
- RLS有効化
- 匿名/通常ユーザーは `posts` に insert のみ
- 匿名/通常ユーザーは `posts` の select/update/delete 禁止
- 公開ページは `archive_status='published'` の `public_posts` のみ参照
- 管理者だけが原文と公開データを管理可能
- `public_posts_view` は `security_invoker=true`

## 管理者ログイン設定方法

1. Vercel の Environment Variables に `ADMIN_PASSWORD` を登録します。
2. `/admin/login` で管理者パスワードを入力します。
3. ログイン後は httpOnly Cookie の `admin_session` で管理画面を保護します。

管理者パスワードはフロント側や `NEXT_PUBLIC_` 付き環境変数に入れないでください。

## GitHubにpushする方法

```bash
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

## Vercelに接続する方法

1. Vercelで New Project を選びます。
2. GitHubリポジトリを選択します。
3. Framework Preset は Next.js を選びます。
4. Environment Variables に必要な環境変数を登録します。

## Vercel環境変数設定方法

Production / Preview / Development の必要な環境に以下を設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_PASSWORD=
APP_BASE_URL=https://your-domain.vercel.app
OPENAI_API_KEY=
```

`APP_BASE_URL` は `sitemap.xml` と `robots.txt` に使われます。本番URLにしてください。

## Vercel Deploy手順

1. 環境変数を保存します。
2. Deploy を実行します。
3. `/admin/login` から管理者ログインを確認します。

## Google Search Console登録手順

1. Google Search Console を開きます。
2. URLプレフィックスで本番URLを登録します。
3. Vercelのドメイン確認方法に従い、必要なメタタグやDNS設定を追加します。
4. 所有権確認を完了します。

## sitemap送信手順

Search Console の「サイトマップ」から以下を送信します。

```text
https://your-domain.vercel.app/sitemap.xml
```

`sitemap.xml` には以下が含まれます。

- `/`
- `/submit`
- `/archive`
- `/about`
- `/guideline`
- `/privacy`
- `/terms`
- 公開アーカイブ詳細ページ

`robots.txt` は `/admin` 配下をクロール禁止にし、sitemap URLを記載します。

## 医療サービスではない注意

このサイトは医療・診断・治療サービスではありません。返信では診断名の断定、治療効果の断定、医療判断の代替になる表現を避けてください。

緊急時、自傷や他害のおそれ、暴力や危険が迫っている場合は、地域の緊急窓口、公的相談窓口、警察・消防、信頼できる身近な人への連絡を優先してください。

## 個人情報を公開しない注意

公開アーカイブに載せる文章は、投稿者が公開を希望し、管理者が確認したものだけにしてください。

公開前に以下を確認してください。

- 氏名が入っていない
- 学校名、勤務先、団体名が入っていない
- 住所、駅名、細かい地名が入っていない
- 電話番号、メール、SNS IDが入っていない
- 日付や出来事の組み合わせで個人が特定されない
- 第三者の個人情報が残っていない

## 下書き補助について

初期状態では下書き補助はOFFです。`OPENAI_API_KEY` が未設定でもサイトは動きます。

将来、自動生成を追加する場合も、管理者向けの下書き補助に限定してください。自動返信は禁止です。出力は必ず人間の管理者が確認・編集してから保存してください。

将来想定している下書き補助:

- 投稿要約
- 返信案3パターン
- 個人情報マスク候補
- 危険サイン
- 配信用要約

## 検証コマンド

```bash
npm run lint
npm run typecheck
npm run build
```

`npm test` は現時点では未定義です。テストを追加したら `package.json` に `test` スクリプトを追加してください。
