// 冒煙測試：用模擬的 API 回應在 Chromium 裡跑一遍頁面，任何斷言失敗就以非 0 結束。
// 用法：npm test    （需要 Chromium：npx playwright install chromium）
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const assert = require('assert');
const ROOT = path.join(__dirname, '..');
const OFF=8*3600e3;
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
function tpeMidnight(daysBack){const t=new Date(Date.now()+OFF);return new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate()-daysBack));}
function mockForecast(u){
  const hourly=u.searchParams.get('hourly'); const past=+(u.searchParams.get('past_days')||0); const fd=+(u.searchParams.get('forecast_days')||7);
  const n=past+fd, start=tpeMidnight(past);
  const days=[...Array(n)].map((_,i)=>dkey(new Date(start.getTime()+i*864e5)));
  const model=u.searchParams.get('models')||'x'; const off=model.length%4;
  const daily={time:days,weathercode:days.map(()=>3),temperature_2m_max:days.map((_,i)=>24+off+Math.sin(i)*2),temperature_2m_min:days.map((_,i)=>17+off*.5+Math.sin(i)),apparent_temperature_max:days.map(()=>26),apparent_temperature_min:days.map(()=>17),precipitation_sum:days.map((_,i)=>i%3?0:2.4),windspeed_10m_max:days.map(()=>15),sunrise:days.map(x=>x+'T06:00'),sunset:days.map(x=>x+'T17:30')};
  const body={utc_offset_seconds:28800,timezone:'Asia/Taipei',daily};
  if(hourly){const t=[];const temp=[];for(let i=0;i<n*24;i++){const d=new Date(start.getTime()+i*36e5);t.push(`${dkey(d)}T${pad(d.getUTCHours())}:00`);temp.push(10+i%97/10);}
    body.hourly={time:t,temperature_2m:temp,apparent_temperature:temp.map(x=>x-1),precipitation:t.map((_,i)=>i%5?0:0.6),weathercode:t.map(()=>2),windspeed_10m:t.map(()=>12)};}
  return body;
}
function mockEnsemble(u){const past=+(u.searchParams.get('past_days')||0),fd=+(u.searchParams.get('forecast_days')||7),n=past+fd,start=tpeMidnight(past);
  const days=[...Array(n)].map((_,i)=>dkey(new Date(start.getTime()+i*864e5)));const daily={time:days};
  for(const base of ['temperature_2m_max','temperature_2m_min','precipitation_sum']){daily[base]=days.map((_,i)=>20+i%5);for(let m=1;m<=8;m++)daily[`${base}_member0${m}`]=days.map((_,i)=>(base==='precipitation_sum'?(m%2?2:0):20+i%5+m*.4));}
  return {daily};}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const f = path.join(ROOT, q.url.split('?')[0] === '/' ? 'RetroWeather.html' : decodeURIComponent(q.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.statusCode = 404; return r.end(); }
      r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f));
    }).listen(0, () => res(srv));
  });
}
function mockDetails() {
  const t = new Date(Date.now() + OFF), start = tpeMidnight(0), days = [0, 1].map(i => dkey(new Date(start.getTime() + i * 864e5)));
  const ht = [], pp = [];
  for (let i = 0; i < 48; i++) { const d = new Date(start.getTime() + i * 36e5); ht.push(`${dkey(d)}T${pad(d.getUTCHours())}:00`); pp.push(i % 10 * 8); }
  return { current: { time: `${dkey(t)}T${pad(t.getUTCHours())}:15`, relative_humidity_2m: 72, uv_index: 6.4 }, hourly: { time: ht, precipitation_probability: pp },
           daily: { uv_index_max: [7.2, 7], sunrise: days.map(x => x + 'T06:02'), sunset: days.map(x => x + 'T17:21') } };
}

(async () => {
  const srv = await serve(), base = `http://localhost:${srv.address().port}/RetroWeather.html`;
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  // 裝置時區故意設成紐約、資料是台北當地時間：驗證頁面不依賴瀏覽器時區
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true, timezoneId: 'America/New_York', geolocation: { latitude: 24.83, longitude: 121.01 }, permissions: ['geolocation'] });
  let apiDown = false, mainHits = 0;
  const json = (r, o) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(o) });
  await ctx.route('https://api.open-meteo.com/**', r => {
    if (apiDown) return r.abort();
    const u = new URL(r.request().url());
    if (u.searchParams.get('current')) return json(r, mockDetails());
    if ((u.searchParams.get('hourly') || '').includes('weathercode')) mainHits++;
    json(r, mockForecast(u));
  });
  await ctx.route('https://ensemble-api.open-meteo.com/**', r => apiDown ? r.abort() : json(r, mockEnsemble(new URL(r.request().url()))));
  await ctx.route('https://air-quality-api.open-meteo.com/**', r => json(r, { current: { us_aqi: 58 } }));
  await ctx.route('https://nominatim.openstreetmap.org/**', r => json(r, { address: { city: 'Zhubei' } }));
  for (const pat of ['https://api.rainviewer.com/**', '**/*basemaps.cartocdn.com/**', 'https://fonts.googleapis.com/**']) await ctx.route(pat, r => r.abort());

  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base);
  await page.waitForSelector('#cmp-table table', { state: 'attached', timeout: 60000 });
  await page.waitForTimeout(1000);
  const text = s => page.textContent(s);
  const visible = () => page.evaluate(() => [...document.querySelectorAll('section[data-tab]')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.dataset.sec).join(','));
  const checks = [];
  const check = (name, fn) => checks.push([name, fn]);

  check('時區：目前溫度與 12 小時起點用地點當地時間', async () => {
    const hr = new Date(Date.now() + OFF).getUTCHours();
    assert.strictEqual(await text('#curr-temp'), String(Math.round(10 + (48 + hr) % 97 / 10)));
    assert.strictEqual(await page.evaluate(() => STATE.charts.h.data.labels[0]), hr + ':00');
  });
  check('語言列四個按鈕都是單行', async () => {
    const hs = await page.$$eval('#btn-zh,#btn-ja,#btn-en,#theme-btn', x => x.map(e => Math.round(e.getBoundingClientRect().height)));
    assert.ok(hs.every(h => h <= 36), 'heights ' + hs);
    assert.strictEqual(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
  });
  check('分頁：概覽 / 模式 / 14日', async () => {
    assert.strictEqual(await visible(), 'details,h12,d8');
    await page.click('#tabbar button[data-tab=md]'); assert.strictEqual(await visible(), 'cmp,ens');
    await page.click('#tabbar button[data-tab=d14]'); assert.strictEqual(await visible(), 'd14');
    assert.strictEqual(await page.$$eval('#list-14d > div', x => x.length), 14);
    await page.click('#tabbar button[data-tab=ov]');
  });
  check('詳細資訊與摘要', async () => {
    const tiles = await page.$$eval('#details-grid .mini-tile', x => x.map(e => e.innerText));
    assert.strictEqual(tiles.length, 6); assert.ok(tiles[0].includes('72%') && tiles[5].includes('58'));
    assert.ok((await text('#daily-summary')).length > 5);
  });
  check('°F 切換不重新請求 API；切回 °C', async () => {
    // 頁面是由「原始 °C」換算再四捨五入，所以預期值也要由原始值算，不能由已四捨五入的 °C 算
    const hr = new Date(Date.now() + OFF).getUTCHours(), raw = 10 + (48 + hr) % 97 / 10, before = mainHits;
    await page.click('button[aria-label=settings]');
    try {
      await page.click('#unit-btn-F'); await page.waitForTimeout(800);
      assert.strictEqual(Number(await text('#curr-temp')), Math.round(raw * 9 / 5 + 32));
      await page.click('#unit-btn-C'); await page.waitForTimeout(500);
      assert.strictEqual(Number(await text('#curr-temp')), Math.round(raw)); assert.strictEqual(mainHits, before);
    } finally { await page.click('#ui-set-close'); }
  });
  check('深色模式切換', async () => {
    await page.click('#theme-btn'); assert.ok(await page.evaluate(() => document.documentElement.classList.contains('dark')));
    await page.click('#theme-btn');
  });
  check('切換語言後分頁名稱更新', async () => {
    await page.click('#btn-en'); await page.waitForTimeout(500);
    assert.strictEqual((await page.$$eval('#tabbar button', x => x.map(e => e.innerText))).join('/'), 'Overview/Models/14 Days');
    await page.click('#btn-zh');
  });
  check('Tailwind 編譯版樣式有生效', async () => {
    assert.ok(await page.evaluate(() => [...document.styleSheets].some(s => (s.href || '').endsWith('tailwind.css'))));
    assert.strictEqual(await page.$eval('.stat-card.bg-blue-600', e => getComputedStyle(e).borderTopWidth), '0px');
  });
  check('離線：API 全斷時顯示快取與提示', async () => {
    apiDown = true;
    const p2 = await ctx.newPage(); p2.on('pageerror', e => errors.push(e.message));
    await p2.goto(base);
    await p2.waitForFunction(() => document.getElementById('stale-note').innerText.length > 0, null, { timeout: 40000 });
    assert.ok((await p2.textContent('#curr-temp')).trim() !== '--'); await p2.close();
  });

  let failed = 0;
  for (const [name, fn] of checks) {
    try { await fn(); console.log('ok   -', name); } catch (e) { failed++; console.log('FAIL -', name, '\n      ', String(e.message).split('\n')[0]); }
  }
  if (errors.length) { failed++; console.log('FAIL - 頁面錯誤:', errors); }
  await browser.close(); srv.close();
  process.exit(failed ? 1 : 0);
})();
