/* 八重瀬町・冠水リスクナビ：オフライン対応。
   通信できるときはいつも最新のHTMLを取りに行くので、HTMLを入れ替えるだけでホーム画面の版も新しくなります。 */
const C='frn-app',T='frn-tiles',TMAX=2500;
const FILES=['./','./index.html','./manifest.webmanifest','./icon-512.png','./icon-192.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
let n=0;
async function trim(){const c=await caches.open(T),k=await c.keys();if(k.length>TMAX)for(const r of k.slice(0,k.length-TMAX))await c.delete(r)}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 // 地理院の地図タイル：保存したものをすぐ出して、裏で新しくする
 if(u.hostname==='cyberjapandata.gsi.go.jp'){e.respondWith(caches.open(T).then(async c=>{const hit=await c.match(r.url);
  const net=fetch(r.url,{mode:'cors'}).then(res=>{if(res&&res.ok){c.put(r.url,res.clone());if(++n%50==0)trim()}return res}).catch(()=>fetch(r).catch(()=>hit));
  e.waitUntil(net.then(()=>{},()=>{}));return hit||net}));return}
 if(u.origin!==location.origin)return;
 // アプリのファイルと雨のデータ：通信できれば最新、できなければ保存した物
 e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})
  .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./index.html').then(x=>x||caches.match('./')):undefined))))});
