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
- **今日一句話摘要**：位於目前天氣下方，例如「今天比昨天高 3°，未來 12 小時約 1.2 mm 降雨」。
- **昨日 / 今日對照**：最高 / 最低溫、體感溫度、降雨量、風速，並顯示今日與昨日的溫差。
- **12 小時時段預報**：長條圖（降雨量）與折線圖（氣溫、體感），另以灰色虛線疊上「昨天同一時段」的氣溫，背景依日出日落區分白天與夜晚。
- **8 天氣溫趨勢**：包含昨日，以折線與長條圖呈現最高 / 最低溫與降雨量。
- **14 日深度預報**：每日天氣圖示、最高 / 最低溫、體感溫度、降雨量與風速。
- **地點管理**
  - 預設提供「現在地」（GPS）與「竹北」兩個地點。
  - 可以用上方的搜尋按鈕搜尋全球城市，加入為新的地點；不需要的地點可以刪除（竹北與現在地為固定項目）。
  - 目前位置無法取得時，會退回使用預設座標。
- **氣象模式切換**：右上角可選擇 `Auto (Geo)`、`JMA`（日本氣象廳）、`KMA`（韓國氣象廳）、`ECMWF`、`GFS`、`AIFS`（ECMWF 的 AI 模型）、`ICON`（德國氣象局）。
  - `Auto` 會依座標自動選擇模式：台灣使用 JMA，韓國使用 KMA，日本使用 JMA，美洲使用 GFS，其他地區依距離最近的中心城市決定（倫敦→ECMWF、華盛頓→GFS、東京→JMA、首爾→KMA）。
- **模式比較（高溫＋低溫）**：同一地點，同時比較 JMA/KMA（依地點）、ECMWF、GFS、AIFS、ICON 與 Google WeatherNext 2 對**昨日**與未來 8 天的**最高溫**與**最低溫**（兩張折線圖，昨日以灰底標示），並附各模式預測降雨量表格。線靠得越近代表各模式意見一致，分得越開代表越沒把握。各模式獨立請求，單一模式失敗只會標註，不影響其他模式。
- **Google WeatherNext 2（AI 預報）**：Google DeepMind 的 AI 天氣模型，一次跑 64 組略有不同的模擬（集合預報，透過 Open-Meteo ensemble API 取得）。顯示昨日與未來 14 天：
  - 紅線＝每日**最高溫**、藍線＝每日**最低溫**（取 64 組模擬的中間值）；
  - 淡色帶＝大部分模擬（80%）會落在的範圍，色帶越寬代表越沒把握；
  - 藍色長條＝**降雨機率**（64 組中預測降雨 ≥1 mm 的比例）。
- **迷你地圖**：以 CARTO 底圖顯示目前地點位置。
- **多語系**：繁體中文、日本語、English，可隨時切換。
- **天氣文字與日夜圖示**：目前、昨日、今日與 14 日預報都標示天氣文字（晴、多雲、陣雨、雷雨…）；12 小時圖與目前天氣會依日出日落顯示夜晚圖示（🌙、☁️）。
- **詳細資訊**：濕度、未來 12 小時最高降雨機率、紫外線（含等級與今日最高）、日出、日落、空氣品質（US AQI 與等級）。
- **雨雲雷達**：點選右上角的小地圖，開啟全螢幕地圖並播放最近的雨雲雷達動畫（含短時預測），資料來自 RainViewer。
- **設定**：點選地點列的設定鈕，可切換 °C / °F，並管理地點（上下排序、改名、刪除）。
- **下拉重新整理**：在頁面最上方往下拉即可強制更新；頁面回到前景超過 15 分鐘會自動更新。切換地點時只淡化內容並顯示頂部進度條，不再整頁遮住。
- **區塊收合**：詳細資訊、12 小時、8 天、模式比較、WeatherNext 2、14 日預報都可點標題收合，狀態會被記住。
- **深色模式**：右上角按鈕切換；首次使用時跟隨系統設定。
- **離線顯示**：網路失敗時改用上一次成功取得的資料，並標示資料時間（僅保存最近一個地點的主要預報）。
- **正確的當地時間**：所有時間都以「該地點的當地時間」計算，在其他時區查詢（例如人在台灣查倫敦）時，目前天氣與 12 小時圖不會錯位。
- **行動裝置友善**：可縮放頁面；觸控裝置上地點的刪除鈕常駐顯示；最小文字 10px。
- **設定保存**：語言、主題、目前地點、自訂地點與氣象模式都會存在瀏覽器的 `localStorage`，下次開啟會保留。

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
| `icon-512.png` | PWA 圖示（512×512） |
| `manifest.json` | PWA 清單（名稱、啟動網址、主題色） |
| `sw.js` | Service Worker，採用網路優先、離線時退回快取的策略；跨網域 API 請求不攔截 |
| `LICENSE` | GNU Affero General Public License v3.0（AGPL-3.0） |

前端函式庫與服務（皆由 CDN 載入）：

- [Tailwind CSS](https://tailwindcss.com/)（樣式）
- [Chart.js 4.4.1](https://www.chartjs.org/) 與 [chartjs-plugin-datalabels 2.2.0](https://chartjs-plugin-datalabels.netlify.app/)（圖表）
- [Leaflet 1.9.4](https://leafletjs.com/)（地圖）
- [Google Fonts](https://fonts.google.com/)：Inter、Noto Sans TC / JP
- [Open-Meteo](https://open-meteo.com/) 預報、集合預報（WeatherNext 2）與地理編碼 API
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)（空氣品質）
- [RainViewer](https://www.rainviewer.com/api.html)（雨雲雷達圖磚）
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

- **GraphCast 已移除**：Open-Meteo 的 `gfs_graphcast025` 目前全球都沒有資料（回傳全為空值），因此不提供；若瀏覽器先前儲存了這個選項，會自動重設為 Auto。
- **各模式預報天數不同**：部分模式（例如 ICON、UKMO、CMA）的預報範圍少於 8 天，比較圖後段可能沒有該條線。
- **偶發的連線失敗**：Open-Meteo 偶爾回傳空內容，程式會自動重試；全部失敗時該區塊會顯示提示文字。
- **外部依賴**：所有函式庫都來自 CDN，模式比較與 WeatherNext 2 沒有離線快取；完全離線且從未載入過時無法取得新資料。
- **資料延遲**：天氣資料來自 Open-Meteo 的模式預報，並非即時觀測站資料。
- **Tailwind CDN**：`cdn.tailwindcss.com` 為開發用途的 CDN 版本，正式環境建議改用編譯版。
- **自動更新有限**：頁面停留在前景時不會定時刷新；需下拉重新整理，或離開後回來（超過 15 分鐘）才會自動更新。
- **雷達資料**：RainViewer 的公開雷達圖磚解析度與縮放層級有限，放大後會變模糊；該服務若調整公開 API，雷達可能暫時無法顯示。
- **未提供氣象署警特報**：台灣中央氣象署的警特報 API 需要申請金鑰，不適合放在純前端的公開頁面，因此未納入。

## 🙏 來源與致謝

本應用程式的初始架構由 Google Gemini 協助產生，後續由 [JFCC] 修改與完善。

> "This application was initially generated with the assistance of Google Gemini and subsequently refined by [JFCC]."

## 📄 授權

本專案採用 **GNU Affero General Public License v3.0**，詳見 [LICENSE](./LICENSE)。
