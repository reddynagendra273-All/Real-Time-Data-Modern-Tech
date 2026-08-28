const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const url = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png' };
const sseClients = new Set();
const tokenBlacklist = new Set(); // Token revocation on logout
let metrics = { users:184, records:284560, uptime:99.9, cloud:'Stable', speed:3.2, network:322, throughput:188, latency:47, alertLevel:'Medium', sync:98, signal:92, processing:26, weatherTemp:26, weatherHumidity:58, weatherWind:14, weatherPressure:1012, weatherCondition:'Clear', updatedAt:new Date().toISOString() };

function readDb(){ return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }
function writeDb(db){ const tmp=DB_FILE+'.tmp'; fs.writeFileSync(tmp, JSON.stringify(db,null,2)); fs.renameSync(tmp,DB_FILE); }
function hash(p){ return crypto.createHash('sha256').update(String(p)).digest('hex'); }
function safeUser(u){ const {passwordHash,...safe}=u; return safe; }

function tokenFor(id){ 
  const token = {
    userId: id,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    random: crypto.randomBytes(12).toString('hex')
  };
  return Buffer.from(JSON.stringify(token)).toString('base64url');
}

function userFromToken(req){ 
  const h = String(req.headers.authorization || ''); 
  if (!h.startsWith('Bearer ')) return null; 
  
  try {
    const tokenStr = h.slice(7);
    const raw = Buffer.from(tokenStr, 'base64url').toString('utf8');
    const token = JSON.parse(raw);
    
    // Check if token is blacklisted (revoked)
    if (tokenBlacklist.has(tokenStr)) return null;
    
    // Check token expiration
    if (token.expiresAt < Date.now()) return null;
    
    const db = readDb();
    const user = db.users.find(u => u.id === token.userId);
    return user || null;
  } catch {
    return null;
  }
}

function send(res, status, data){ 
  const body = JSON.stringify(data); 
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); 
  res.end(body); 
}

function readBody(req){ 
  return new Promise((resolve,reject)=>{ 
    let body=''; 
    req.on('data', c=>{ 
      body+=c; 
      if(body.length>1_000_000){reject(new Error('Payload too large')); req.destroy();} 
    }); 
    req.on('end',()=>{ 
      try { resolve(JSON.parse(body)); } 
      catch { resolve({}); } 
    }); 
    req.on('error',reject); 
  }); 
}

function broadcast(event, data){ 
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`; 
  for(const res of sseClients){ 
    try{res.write(payload);} catch{} 
  } 
}

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
  metrics.weatherCondition=metrics.weatherHumidity>75?'Rain':'Clear'; 
  metrics.updatedAt=new Date().toISOString();
  broadcast('metrics:update',metrics);
}

async function handle(req,res){
  const parsed=url.parse(req.url,true); 
  const pathname=parsed.pathname;
  
  if(req.method==='GET' && pathname==='/api/health') 
    return send(res,200,{status:'ok',service:'Real-Time Data API',time:new Date().toISOString()});
  
  if(req.method==='GET' && pathname==='/api/metrics') 
    return send(res,200,metrics);
  
  if(req.method==='GET' && pathname==='/api/auth/me'){ 
    const user=userFromToken(req); 
    return user ? send(res,200,{user:safeUser(user)}) : send(res,401,{error:'Authentication required.'}); 
  }
  
  if(req.method==='POST' && pathname==='/api/auth/login'){
    try{
      const b=await readBody(req), 
            identity=String(b.identity||'').trim().toLowerCase(), 
            password=String(b.password||''), 
            db=readDb(); 
      const u=db.users.find(x=>x.username.toLowerCase()===identity || x.email.toLowerCase()===identity);
      if(!u || hash(password)!==u.passwordHash) return send(res,401,{error:'Invalid credentials.'});
      const token=tokenFor(u.id);
      return send(res,200,{token,user:safeUser(u)});
    }catch(e){return send(res,500,{error:'Server error.'});}
  }
  
  if(req.method==='POST' && pathname==='/api/auth/register'){
    try{
      const b=await readBody(req), 
            name=String(b.name||'').trim(),
            email=String(b.email||'').trim().toLowerCase(),
            username=String(b.username||'').trim().toLowerCase(),
            password=String(b.password||''), 
            db=readDb();
      if(!name||!email||!username||!password) return send(res,400,{error:'Missing fields.'});
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res,400,{error:'Invalid email.'});
      if(!/^[a-z0-9._-]{3,20}$/.test(username)) return send(res,400,{error:'Invalid username format.'});
      if(password.length<4) return send(res,400,{error:'Password too short.'});
      if(db.users.some(u=>u.username.toLowerCase()===username)) return send(res,409,{error:'Username exists.'});
      if(db.users.some(u=>u.email.toLowerCase()===email)) return send(res,409,{error:'Email exists.'});
      const user={id:`user-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`,name,email,username,passwordHash:hash(password),role:'Viewer',createdAt:new Date().toISOString()};
      db.users.push(user);
      writeDb(db);
      const token=tokenFor(user.id);
      return send(res,201,{token,user:safeUser(user)});
    }catch(e){return send(res,500,{error:'Server error.'});}
  }
  
  if(req.method==='POST' && pathname==='/api/auth/logout'){
    try{
      const h=String(req.headers.authorization||''); 
      if(h.startsWith('Bearer ')) {
        tokenBlacklist.add(h.slice(7));
      }
      return send(res,200,{message:'Logged out successfully.'});
    }catch(e){return send(res,500,{error:'Server error.'});}
  }
  
  if(req.method==='POST' && pathname==='/api/contact'){
    try{
      const b=await readBody(req), 
            db=readDb(), 
            m={id:`msg-${Date.now()}`,name:String(b.name||'').trim(),email:String(b.email||'').trim(),subject:String(b.subject||'Contact request').trim(),message:String(b.message||'').trim(),timestamp:new Date().toISOString()};
      db.messages||(db.messages=[]);
      db.messages.unshift(m);
      writeDb(db);
      return send(res,200,{message:'Contact saved.'});
    }catch(e){return send(res,500,{error:'Server error.'});}
  }
  
  if(req.method==='GET' && pathname==='/api/stream'){
    const user=userFromToken(req);
    if(!user) return send(res,401,{error:'Authentication required.'});
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*'}); 
    res.write(`event: metrics:update\ndata: ${JSON.stringify(metrics)}\n\n`);
    sseClients.add(res);
    req.on('close',()=>sseClients.delete(res));
  }else if(pathname.startsWith('/api/')) 
    return send(res,404,{error:'API route not found.'});
  
  let filePath=pathname==='/'?path.join(ROOT,'index.html'):path.join(ROOT,pathname);
  if(!filePath.startsWith(ROOT)) filePath=path.join(ROOT,'index.html');
  if(!fs.existsSync(filePath)||fs.statSync(filePath).isDirectory()) filePath=path.join(ROOT,'index.html');
  const ext=path.extname(filePath); 
  res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':'no-store'}); 
  fs.createReadStream(filePath).pipe(res);
}

setInterval(tick,3000);
const server=http.createServer((req,res)=>{handle(req,res).catch(e=>send(res,500,{error:'Server error.'}));});
server.listen(PORT,()=>console.log(`Real-Time Data project running at http://localhost:${PORT}`));
