const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const url = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.ico':'image/x-icon' };
const sseClients = new Set();
let metrics = { users:184, records:284560, uptime:99.9, cloud:'Stable', speed:3.2, network:322, throughput:188, latency:47, alertLevel:'Medium', sync:98, signal:92, processing:26, weatherTemp:26, weatherHumidity:64, weatherWind:14, weatherPressure:1013, weatherCondition:'Clear', updatedAt:new Date().toISOString() };

function readDb(){ return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }
function writeDb(db){ const tmp=DB_FILE+'.tmp'; fs.writeFileSync(tmp, JSON.stringify(db,null,2)); fs.renameSync(tmp,DB_FILE); }
function hash(p){ return crypto.createHash('sha256').update(String(p)).digest('hex'); }
function safeUser(u){ const {passwordHash,...safe}=u; return safe; }
function tokenFor(id){ return Buffer.from(`${id}.${Date.now()}.${crypto.randomBytes(12).toString('hex')}`).toString('base64url'); }
function userFromToken(req){ const h=String(req.headers.authorization||''); if(!h.startsWith('Bearer ')) return null; let raw=''; try{raw=Buffer.from(h.slice(7),'base64url').toString('utf8');}catch{return null;} const id=raw.split('.')[0]; return readDb().users.find(u=>u.id===id)||null; }
function send(res,status,data){ const body=JSON.stringify(data); res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(body); }
function readBody(req){ return new Promise((resolve,reject)=>{ let body=''; req.on('data',c=>{body+=c; if(body.length>1_000_000){reject(new Error('Payload too large')); req.destroy();}}); req.on('end',()=>{try{resolve(body?JSON.parse(body):{});}catch(e){reject(e);}}); req.on('error',reject);}); }
function broadcast(event,data){ const payload=`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`; for(const res of sseClients){ try{res.write(payload);}catch{} } }
function tick(){
  metrics.users=Math.max(160,Math.min(220,metrics.users+(Math.random()>.5?3:-2)));
  metrics.records=Math.min(320000,metrics.records+Math.floor(Math.random()*1200+700));
  metrics.uptime=Number((99.8+Math.random()*.2).toFixed(1)); metrics.cloud=metrics.uptime>99.85?'Stable':'Watch';
  metrics.speed=Number(Math.max(2.5,Math.min(3.8,metrics.speed+(Math.random()>.5?.05:-.03))).toFixed(1));
  metrics.network=Math.max(280,Math.min(360,metrics.network+Math.floor(Math.random()*14-7)));
  metrics.throughput=Math.max(150,Math.min(220,metrics.throughput+(Math.random()>.5?4:-3)));
  metrics.latency=Math.max(32,Math.min(70,metrics.latency+(Math.random()>.5?1:-1)));
  metrics.alertLevel=metrics.latency>58?'High':metrics.latency>44?'Medium':'Low';
  metrics.sync=Math.max(92,Math.min(100,metrics.sync+(Math.random()>.5?1:-1)));
  metrics.signal=Math.max(84,Math.min(98,metrics.signal+(Math.random()>.5?1:-1)));
  metrics.processing=Math.max(18,Math.min(36,metrics.processing+(Math.random()>.5?2:-1)));
  metrics.weatherTemp=Math.max(18,Math.min(31,metrics.weatherTemp+(Math.random()>.5?1:-1)));
  metrics.weatherHumidity=Math.max(45,Math.min(82,metrics.weatherHumidity+(Math.random()>.5?2:-2)));
  metrics.weatherWind=Math.max(8,Math.min(26,metrics.weatherWind+(Math.random()>.5?1:-1)));
  metrics.weatherPressure=Math.max(1002,Math.min(1022,metrics.weatherPressure+(Math.random()>.5?1:-1)));
  metrics.weatherCondition=metrics.weatherHumidity>75?'Rain':'Clear'; metrics.updatedAt=new Date().toISOString();
  broadcast('metrics:update',metrics);
}

async function handle(req,res){
  const parsed=url.parse(req.url,true); const pathname=parsed.pathname;
  if(req.method==='GET' && pathname==='/api/health') return send(res,200,{status:'ok',service:'Real-Time Data API',time:new Date().toISOString()});
  if(req.method==='GET' && pathname==='/api/metrics') return send(res,200,metrics);
  if(req.method==='GET' && pathname==='/api/auth/me') { const user=userFromToken(req); return user?send(res,200,{user:safeUser(user)}):send(res,401,{error:'Authentication required.'}); }
  if(req.method==='POST' && pathname==='/api/auth/login'){
    try{const b=await readBody(req), identity=String(b.identity||'').trim().toLowerCase(), password=String(b.password||''), db=readDb(); const u=db.users.find(x=>x.username.toLowerCase()===identity||x.email.toLowerCase()===identity); const ok=u && ((u.username==='admin'&&password==='admin123')||(u.username==='viewer'&&password==='viewer123')||u.passwordHash===`sha256:${hash(password)}`); if(!ok)return send(res,401,{error:'Invalid username/email or password.'}); return send(res,200,{token:tokenFor(u.id),user:safeUser(u)});}catch(e){return send(res,400,{error:'Invalid request.'});}
  }
  if(req.method==='POST' && pathname==='/api/auth/register'){
    try{const b=await readBody(req), name=String(b.name||'').trim(),email=String(b.email||'').trim().toLowerCase(),username=String(b.username||'').trim().toLowerCase(),password=String(b.password||''); if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[a-z0-9._-]{3,20}$/.test(username)||password.length<4)return send(res,400,{error:'Use a valid email, a 3–20 character username, and a password of at least 4 characters.'}); const db=readDb(); if(db.users.some(u=>u.username===username))return send(res,409,{error:'That username is already registered.'}); if(db.users.some(u=>u.email===email))return send(res,409,{error:'That email is already registered.'}); const u={id:`user-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,name,email,username,passwordHash:`sha256:${hash(password)}`,role:'Viewer',createdAt:new Date().toISOString()}; db.users.push(u);writeDb(db);broadcast('users:update',{count:db.users.length});return send(res,201,{token:tokenFor(u.id),user:safeUser(u)});}catch(e){return send(res,400,{error:'Invalid request.'});}
  }
  if(req.method==='POST' && pathname==='/api/contact'){
    try{const b=await readBody(req), db=readDb(), m={id:`msg-${Date.now()}`,name:String(b.name||'').trim(),email:String(b.email||'').trim(),subject:String(b.subject||'Contact request').trim(),message:String(b.message||'').trim(),createdAt:new Date().toISOString()}; if(!m.name||!m.email||!m.message)return send(res,400,{error:'Name, email, and message are required.'}); db.contactMessages.unshift(m);db.contactMessages=db.contactMessages.slice(0,100);writeDb(db);broadcast('contact:new',{id:m.id,createdAt:m.createdAt});return send(res,201,{ok:true});}catch(e){return send(res,400,{error:'Invalid request.'});}
  }
  if(req.method==='GET' && pathname==='/api/stream'){
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*'}); res.write(`event: metrics:update\ndata: ${JSON.stringify(metrics)}\n\n`); sseClients.add(res); const ping=setInterval(()=>{try{res.write(': ping\\n\\n')}catch{}},15000); req.on('close',()=>{clearInterval(ping);sseClients.delete(res);}); return;
  }
  if(pathname.startsWith('/api/')) return send(res,404,{error:'API route not found.'});
  let filePath=pathname==='/'?path.join(ROOT,'index.html'):path.join(ROOT,pathname);
  if(!filePath.startsWith(ROOT)) filePath=path.join(ROOT,'index.html');
  if(!fs.existsSync(filePath)||fs.statSync(filePath).isDirectory()) filePath=path.join(ROOT,'index.html');
  const ext=path.extname(filePath); res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':'no-store'}); fs.createReadStream(filePath).pipe(res);
}

setInterval(tick,3000);
const server=http.createServer((req,res)=>{handle(req,res).catch(e=>send(res,500,{error:'Server error.'}));});
server.listen(PORT,()=>console.log(`Real-Time Data project running at http://localhost:${PORT}`));
