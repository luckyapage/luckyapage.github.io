# 招牌YA 一頁式銷售網頁

靜態網站，可直接放上 GitHub Pages。

## 上線步驟
1. 在 GitHub 建一個新的 repository（例如 `luckya-page`）。
2. 把本資料夾內所有檔案（index.html、assets/、demo-*.html、support.js、thumbs/）上傳到 repository 根目錄。
3. Settings → Pages → Source 選 `main` 分支、資料夾選 `/ (root)`，儲存。
4. 幾分鐘後可用 `https://<你的帳號>.github.io/<repo 名稱>/` 開啟。

## 檔案說明
- `index.html`：主銷售頁（招牌YA）。純靜態 HTML，不需要 JavaScript 就能完整顯示。
- `assets/site.css`：主銷售頁的完整樣式表。
- `assets/reveal.js`：主銷售頁的捲動進場動畫，由 index.html 動態載入。
- `assets/fonts/`：自架的子集字型（4 個檔、共約 230 KiB），**要一起上傳**。
- `tools/build-fonts.mjs`：重新產生上面那些字型檔的工具，見下方「改了文字之後」。
- `demo-cafe / pet / gym / noodle / cram .html`：五個示範店家網站，從主頁作品區另開視窗連過去
- `thumbs/`：作品區使用的頁面快照（更新範例頁後需重新截圖替換，尺寸 909×540）

### 作品區第二格連的是外部網址
美甲美睫那一格不是本資料夾裡的示範頁，而是直接連到
<https://luckyapage.github.io/yongyan-lash-studio/>，縮圖是該站首屏的截圖
`thumbs/yongyan.png`。之後那邊改版時，重新截一張 909×540 的首屏圖覆蓋即可。

原本這一格的示範頁 `demo-nail.html` 與 `thumbs/nail.png` 已無人連結，
確定不再用到可以刪除。
- `support.js`：**六個 demo 頁**執行所需的程式檔，請勿刪除（主頁 index.html 已不再使用）

## 修改內容
文字直接編輯對應的 .html 檔即可。

### 換 LINE 官方帳號
`index.html` 裡有 **6 處** LINE 連結（頁首、首屏、AI 段落、價格、結尾按鈕、結尾聯絡卡），
全部是同一個網址 `https://line.me/R/ti/p/@083scjjc`。換帳號時整份檔案搜尋取代這個網址，
再把結尾聯絡卡顯示的 `@083scjjc` 文字一起改掉。

這個網址在手機上會直接喚起 LINE App 的加好友畫面，沒裝 App 會導到商店；
電腦上會開 line.me 的 QR code 頁。**不要加 `target="_blank"`**，
手機喚起 App 後會留下一個空白分頁。

Email（`LuckYa.Page@gmail.com`）出現在結尾區塊的按鈕與聯絡卡，共 2 處。

### 改主頁的樣式
所有樣式都在 `assets/site.css`。換主題色只要改檔案最上面 `:root` 裡的
`--accent`（主色）、`--ink`（深底色）、`--on-accent`（主色上的文字色）三個變數。

⚠️ `index.html` 的 `<head>` 內有一份「關鍵 CSS」，是 `site.css` 第 1~6 節
（變數／基本設定／header／hero）的副本，用來讓第一屏不必等樣式表就能顯示。
**改到這幾節時，兩邊都要改。** 其餘區塊只存在於 `site.css`，改一處即可。

### 改了文字之後（字型要重跑）
網站沒有用 Google Fonts，而是把 Noto Sans TC 裁成「只含本頁用到的 585 個字元」放在
`assets/fonts/`。這樣字型從 887 KiB 降到 230 KiB，也不必連到外部網站。

代價是：**如果你新增的文字用到子集裡沒有的字，那幾個字會改用系統內建字型顯示**
（不會破版、也不會消失，只是字體看起來跟旁邊不太一樣）。要補回來就重跑一次：

```
pip install fonttools brotli     # 只要裝一次
node tools/build-fonts.mjs
```

跑完把 `assets/fonts/` 裡更新的檔案一起上傳即可。只改顏色、排版、連結不用跑。
（`tools/.cache/` 是下載來的原始字型，很大，已設定不會進版本控制。）

## SEO 設定

目標關鍵字是**做官網**與**行銷頁面**，相關設定分散在這幾個地方：

| 檔案 | 放什麼 |
| --- | --- |
| `index.html` `<head>` | `<title>`、`description`、`canonical`、`robots`、og／twitter 分享標籤 |
| `index.html` `</head>` 前 | JSON-LD 結構化資料（Organization／WebSite／WebPage／Service／FAQPage） |
| `assets/og.png` | 分享預覽圖，1200×630 |
| `robots.txt` | 允許全站抓取，並指向 sitemap |
| `sitemap.xml` | 只列首頁一個網址 |
| `demo-*.html` | 六個示範頁都掛 `noindex,follow` |

### 自訂網域（page.luckya.tw）
正式網址是 <https://page.luckya.tw/>，靠 repo 根目錄的 `CNAME` 檔（內容一行 `page.luckya.tw`）
告訴 GitHub Pages 要用這個網域。**這個檔案不能刪**，刪掉就會退回 github.io 網址。

網域商那邊要有一筆 DNS 記錄：

```
類型      主機名稱   指向
CNAME    page      luckyapage.github.io.
```

DNS 生效後到 GitHub 的 Settings → Pages 勾選 **Enforce HTTPS**（憑證要等幾分鐘才簽好）。
舊的 `luckyapage.github.io` 網址 GitHub 會自動 301 轉到新網域，不必自己處理。

### 換網址時要一起改的地方
所有絕對網址都寫死成 `https://page.luckya.tw/`。之後再換網域的話，
**這六處要一起換**，漏改會讓 Google 收錄到錯的網址：

1. `CNAME` 檔的內容
2. `index.html` 的 `<link rel="canonical">`
3. `index.html` 的 `og:url`、`og:image`、`twitter:image`
4. `index.html` JSON-LD 裡的網址（搜尋 `page.luckya.tw` 全部取代最快）
5. `robots.txt` 最後一行的 `Sitemap:`
6. `sitemap.xml` 的 `<loc>`

⚠️ 全部取代時注意：作品區連到 `https://luckyapage.github.io/yongyan-lash-studio/`
的那一筆是**別的網站**，不要跟著換掉。

改完到 Google Search Console 重新提交 sitemap。

### 為什麼示範頁要 noindex
`demo-*.html` 是虛構店家（假地址、假電話）。讓 Google 收錄有兩個壞處：
會跟主頁搶排名，也可能被判定成假商家頁面。要放行的話，把那六個檔案
`<title>` 下面那行 `<meta name="robots" content="noindex,follow">` 刪掉即可。

### FAQ 改了要同步兩個地方
`<head>` 的 JSON-LD 裡有一份 FAQ 的純文字副本，**必須跟畫面上 `<details>` 的文字一致**
（Google 規定結構化資料的內容要在頁面上看得到）。改 FAQ 文字時兩邊都要改。

### 重新產生 og.png
`assets/og.png` 是用 Python + Pillow 畫的（微軟正黑體）。要改上面的文字，
目前沒有留腳本，重畫一張 1200×630、底色 `#17130D`、主色 `#F0A81E` 的圖覆蓋即可。

## 效能設計（為什麼要這樣寫）
- 頁面內容全部寫死在 HTML 裡，打開就看得到，Google 也不必執行 JavaScript 才讀得到內容。
- 第一屏樣式內嵌在 `<head>`，完整樣式表用
  `<link rel="preload" as="style" onload="...">` 非阻塞載入，不會擋住畫面繪製。
- 字型自架且已裁切，`<head>` 只預先抓第一屏最吃重的 400 與 900 兩個字重。
- 唯一的 JS 是 `assets/reveal.js`（約 1KB），用 `import()` 動態載入，
  而且只有在瀏覽器支援 IntersectionObserver、使用者也沒有開啟「減少動態效果」時才會下載。
- 作品區縮圖使用 `loading="lazy"`，捲到才載入。
- 原本的設計原始檔（Claude Design 版本）已移到上層資料夾 `../index.dc.html` 保存。
