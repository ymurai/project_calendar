README.md


# カレンダー

## 準備

### バックエンド

#### インストール
```
$ cd Server
$ npm install
```

## テスト実行手順
- **前提:** macOS、`zsh`、Node.js/npmがインストール済み。サーバーは`Server/`ディレクトリ配下。
- **依存関係のインストール:** クリーンな再現性のため `npm ci` を使用します。
- **テスト実行:** `jest` を使った統合テスト（`supertest`）を実行します。

### コマンド
```zsh
cd Server
npm ci
npm test
```

### 期待される結果
- すべてのテストがパスします（9件）。
- 環境変数 `NODE_ENV=test` が自動設定され、インメモリSQLiteでテストが実行されます。

### よくある補足
- 依存の脆弱性警告が出る場合は任意で次を実行できます。
```zsh
cd Server
npm audit fix
```
- ローカル起動は`npm start`が利用できます。
```zsh
cd Server
npm start
# 開発モード（任意）
npm run dev
```

#### 起動
```zsh
cd Server
npm start
```

## フロントエンドの起動（Site/）
- バックエンドは`http://localhost:3000`で起動しておいてください。
- CORSの許可オリジンは`http://localhost:5173`に設定済みのため、以下のように静的サーバーで配信します。
```zsh
cd Site
python3 -m http.server 5173
# ブラウザで http://localhost:5173 を開く
```

## API一覧（v1）
- `GET /api/v1/events`: イベント一覧取得（クエリ`start_date`,`end_date`で範囲指定可）。
- `POST /api/v1/events`: イベント作成（`event_date: YYYY-MM-DD`, `content: string`）。重複日は409。
- `GET /api/v1/events/:id`: ID指定で取得。存在しない場合404。
- `GET /api/v1/events/by-date/:date`: 日付指定で取得。存在しない場合404。
- `PUT /api/v1/events/:id`: イベント更新（`event_date`/`content`のいずれか必須）。存在しない場合404。
- `DELETE /api/v1/events/:id`: イベント削除。成功時204、存在しない場合404。

## データベースのリセット（見本用の簡易運用）
- 破壊的なスキーマ変更や初期データを入れ直したい場合は、DBファイルを削除して再初期化します。
```zsh
cd Server/database
rm -f calendar.db
node ../database/initialize.js
```
- 注意: ローカルの既存データは消えます。見本用途のため、履歴管理ツールは導入していません。

## CORS設定（フロント別オリジンの場合）
- 既定で`http://localhost:5173`を許可しています。公開時は実際のフロントのURLに置き換え、ワイルドカード許可は避けます。
- 設定変更箇所: `Server/index.js`のCORSミドルウェアの`origin`配列を編集。
```js
// index.js 抜粋
app.use(cors({
  origin: ['http://localhost:5173'],
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type'],
}));
```

## 本番運用のポイント（ミニマム）
- **ポート設定:** 環境変数`PORT`で指定可能にしておくと便利。例: `index.js`で`const port = process.env.PORT || 3000;`。
- **環境変数:** `NODE_ENV=production`で起動。ログ量やエラーメッセージを抑える方針。
- **起動コマンド:**
```zsh
cd Server
NODE_ENV=production PORT=3000 npm start
```
- **ログ/監視:** 見本では標準出力ログのみ。必要なら`morgan`等を導入。
- **バックアップ:** SQLiteファイル`Server/database/calendar.db`の定期バックアップ（ファイルコピー）で十分。
- **セキュリティ最小:**
	- 不要なCORS許可を削除
	- 入力バリデーションは既存維持
	- HTTPヘッダー強化は`helmet`の導入を検討（任意）
- **再起動:** プロセスマネージャー（`pm2`やsystemd）での常時稼働は任意。見本用途なら手動起動で可。