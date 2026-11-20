# WeatherYa（RetroWeather Pro）

一個單檔的網頁天氣應用（PWA 形式），可以查看**目前位置或指定城市**的天氣，並且同時顯示**昨日回顧**、**今日預報**、**12 小時逐時預報**、**8 天氣溫趨勢（含昨日）**與 **14 日深度預報**。資料來源為 [Open-Meteo](https://open-meteo.com/)，不需要 API 金鑰。

## 🔗 使用網址

| 用途 | 網址 |
| --- | --- |
| 線上使用（GitHub Pages） | https://jfcc-github.github.io/weatherYa/RetroWeather.html |
| 原始碼倉庫 | https://github.com/JFCC-GITHUB/weatherYa |

> 直接用手機或電腦瀏覽器開啟上面的網址即可。在手機上可以選擇「加入主畫面」，以接近 App 的方式使用。

## ✨ 主要功能

- **目前天氣**：氣溫、體感溫度、降雨量（mm）、風速（km/h）。
- **昨日 / 今日對照**：最高 / 最低溫、體感溫度、降雨量、風速，並顯示今日與昨日的溫差。
- **12 小時時段預報**：長條圖（降雨量）與折線圖（氣溫、體感），背景依日出日落區分白天與夜晚。
- **8 天氣溫趨勢**：包含昨日，以折線與長條圖呈現最高 / 最低溫與降雨量。
- **14 日深度預報**：每日天氣圖示、最高 / 最低溫、體感溫度、降雨量與風速。
- **地點管理**
  - 預設提供「現在地」（GPS）與「竹北」兩個地點。
  - 可以用上方的搜尋按鈕搜尋全球城市，加入為新的地點；不需要的地點可以刪除（竹北與現在地為固定項目）。
  - 目前位置無法取得時，會退回使用預設座標。
- **氣象模式切換**：右上角可選擇 `Auto (Geo)`、`JMA`（日本氣象廳）、`KMA`（韓國氣象廳）、`ECMWF`、`GFS`。
  - `Auto` 會依座標自動選擇模式：台灣與日本使用 JMA，韓國使用 KMA，美洲使用 GFS，其他地區依距離最近的中心城市決定（倫敦→ECMWF、華盛頓→GFS、東京→JMA、首爾→KMA）。
- **迷你地圖**：以 CARTO 底圖顯示目前地點位置。
- **多語系**：繁體中文、日本語、English，可隨時切換。
- **設定保存**：語言、目前地點、自訂地點與氣象模式都會存在瀏覽器的 `localStorage`，下次開啟會保留。

## 🧭 使用方式

1. 開啟網址後，首次會要求定位權限（允許後顯示現在位置的天氣；拒絕則使用預設座標）。
2. 點選上方的地點按鈕切換地點；點「+」可搜尋並加入新城市。
3. 下方卡片與圖表會依所選地點自動更新。
4. 右上角切換語言或氣象模式。

## 🛠 技術組成

本專案刻意保持「單一 HTML 檔案」的結構，沒有建置流程（no build step）。

| 項目 | 說明 |
| --- | --- |
| `RetroWeather.html` | 主程式：HTML 結構、樣式與所有 JavaScript 邏輯 |
| `manifest.json` | PWA 清單（名稱、啟動網址、主題色） |
| `sw.js` | Service Worker，採用 Cache-First 策略快取核心檔案 |
| `LICENSE` | GNU Affero General Public License v3.0（AGPL-3.0） |

前端函式庫與服務（皆由 CDN 載入）：

- [Tailwind CSS](https://tailwindcss.com/)（樣式）
- [Chart.js 4.4.1](https://www.chartjs.org/) 與 [chartjs-plugin-datalabels 2.2.0](https://chartjs-plugin-datalabels.netlify.app/)（圖表）
- [Leaflet 1.9.4](https://leafletjs.com/)（地圖）
- [Google Fonts](https://fonts.google.com/)：Inter、Noto Sans TC / JP
- [Open-Meteo](https://open-meteo.com/) 預報與地理編碼 API
- [OpenStreetMap Nominatim](https://nominatim.org/)（反向地理編碼，將座標轉為城市名稱）
- [CARTO](https://carto.com/) 底圖

## 📦 本機執行

因為是純靜態檔案，任何靜態伺服器都可以執行：

```bash
git clone https://github.com/JFCC-GITHUB/weatherYa.git
cd weatherYa
python3 -m http.server 8000
```

然後開啟 http://localhost:8000/RetroWeather.html 。

> 定位功能在 `localhost` 可以使用；若部署在其他位置，需使用 HTTPS 才能取得 GPS。

## ⚠️ 已知限制與待改進事項

- **圖示檔缺失**：`manifest.json` 與 `sw.js` 參照的 `icon-512.png` 目前不在倉庫中，安裝 PWA 時圖示可能無法顯示。
- **Service Worker 尚未註冊**：`sw.js` 存在，但 `RetroWeather.html` 內沒有 `navigator.serviceWorker.register(...)`，且 HTML 也沒有 `<link rel="manifest">`，因此目前離線快取與「安裝為 App」的功能實際上不會啟用。
- **外部依賴**：所有函式庫與資料都依賴 CDN 與第三方 API，離線時無法取得新資料。
- **資料延遲**：天氣資料來自 Open-Meteo 的模式預報，並非即時觀測站資料。
- **Tailwind CDN**：`cdn.tailwindcss.com` 為開發用途的 CDN 版本，正式環境建議改用編譯版。
- **無自動更新**：頁面載入後不會自動刷新，需要重新整理或切換地點。

## 🙏 來源與致謝

本應用程式的初始架構由 Google Gemini 協助產生，後續由 [JFCC] 修改與完善。

> "This application was initially generated with the assistance of Google Gemini and subsequently refined by [JFCC]."

## 📄 授權

本專案採用 **GNU Affero General Public License v3.0**，詳見 [LICENSE](./LICENSE)。
