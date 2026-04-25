# portfolio.signal

日本株・米国株・ETFの売買シグナルをMA・RSI・MACD・ボリンジャーバンドで確認するWebアプリです。

## セットアップ

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## ビルド

```bash
npm run build
npm start
```

## Vercel へのデプロイ（友達と共有する方法）

### 方法1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### 方法2: GitHub + Vercel（推奨）

1. このフォルダを GitHub にプッシュ
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   gh repo create portfolio-signal --public --push
   ```

2. https://vercel.com にアクセスして GitHub と連携
3. リポジトリを選択して「Deploy」をクリック
4. 数分で `https://portfolio-signal-xxx.vercel.app` のURLが発行されます

## プロジェクト構成

```
src/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインページ（ポートフォリオ管理）
│   ├── globals.css         # グローバルスタイル・CSS変数
│   ├── page.module.css
│   └── components/
│       ├── GlossaryCard.tsx   # 指標説明カード
│       ├── GlossaryCard.module.css
│       ├── StockCard.tsx      # 銘柄カード（シグナル表示）
│       ├── StockCard.module.css
│       └── SparklineChart.tsx # Canvas折れ線チャート
└── lib/
    └── indicators.ts       # MA・RSI・MACD・BB計算ロジック
```

## 対応銘柄の例

| ティッカー | 種別 |
|---|---|
| 7203, 6758, 9984 | 日本株 |
| AAPL, MSFT, NVDA | 米国株 |
| 1306, 1321, 2558 | ETF |

## 注意事項

現在の価格データはデモ用のシミュレーション値です。  
リアルタイムデータに対応する場合は Yahoo Finance API などを `src/lib/indicators.ts` の `genPrices` 関数と差し替えてください。
