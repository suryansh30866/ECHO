// ══════════════════════════════
//  API KEY POOLS — auto-rotates on 429 / auth errors
// ══════════════════════════════

// OpenRouter keys (primary → backups)
const _OR_KEYS = [
  "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",
  "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",
];
let _orKeyIdx = 0;
function getORKey() { return _OR_KEYS[_orKeyIdx % _OR_KEYS.length]; }
function rotateORKey(reason) {
  const prev = _orKeyIdx;
  _orKeyIdx = (_orKeyIdx + 1) % _OR_KEYS.length;
  console.warn(`[KeyRotate] OpenRouter key rotated (${prev}→${_orKeyIdx}). Reason: ${reason}`);
  showKeyRotationToast('OpenRouter', _orKeyIdx + 1, _OR_KEYS.length, reason);
}

// Apify keys (primary → backups)
const _APIFY_KEYS = [
  "apify_api_zwLJiEJkAmn9JjClfzb8QGqRSIicxI379Tvo",
  "apify_api_f1CEX4pxWg1n6YfKHVyMwQaQGxAfIS0mGoyR",
];
let _apifyKeyIdx = 0;
function getApifyKey() { return _APIFY_KEYS[_apifyKeyIdx % _APIFY_KEYS.length]; }
function rotateApifyKey(reason) {
  const prev = _apifyKeyIdx;
  _apifyKeyIdx = (_apifyKeyIdx + 1) % _APIFY_KEYS.length;
  console.warn(`[KeyRotate] Apify key rotated (${prev}→${_apifyKeyIdx}). Reason: ${reason}`);
  showKeyRotationToast('Apify', _apifyKeyIdx + 1, _APIFY_KEYS.length, reason);
}

// Cerebras keys
const _CEREBRAS_KEYS = [
  "csk-tf65rt69p993tc86td2p5539y9hemywnxdjjkcxw34tfvjxy",
  "csk-fvreh4nhwtvvmh3w8w64xwhwnxvj9fvhrnjm59v8wwxpnnp6",
];
let _cerebrasKeyIdx = 0;
function getCerebrasKey() { return _CEREBRAS_KEYS[_cerebrasKeyIdx % _CEREBRAS_KEYS.length]; }
function rotateCerebrasKey(reason) {
  const prev = _cerebrasKeyIdx;
  _cerebrasKeyIdx = (_cerebrasKeyIdx + 1) % _CEREBRAS_KEYS.length;
  console.warn(`[KeyRotate] Cerebras key rotated (${prev}→${_cerebrasKeyIdx}). Reason: ${reason}`);
  showKeyRotationToast('Cerebras', _cerebrasKeyIdx + 1, _CEREBRAS_KEYS.length, reason);
}

// YouTube Data API keys (primary → backups)
const _YT_KEYS = [
  "AIzaSyC8TwqSD51bGj3p4DOCWWgW3A3OBMWinlE",
  "AIzaSyD-9tSod_v4GPxNX0e5UhzfWLWBiLikHTU",  // backup key 2
  "AIzaSyBDN7WOlFl0m_r-lkFLCf0LMQW6nymBT10",  // backup key 3
];
let _ytKeyIdx = 0;
function getYTKey() { return _YT_KEYS[_ytKeyIdx % _YT_KEYS.length]; }
function rotateYTKey(reason) {
  const prev = _ytKeyIdx;
  _ytKeyIdx = (_ytKeyIdx + 1) % _YT_KEYS.length;
  console.warn(`[KeyRotate] YouTube key rotated (${prev}→${_ytKeyIdx}). Reason: ${reason}`);
  showKeyRotationToast('YouTube API', _ytKeyIdx + 1, _YT_KEYS.length, reason);
}
// Legacy aliases kept for safety
const YOUTUBE_KEY  = "AIzaSyC8TwqSD51bGj3p4DOCWWgW3A3OBMWinlE";
const YOUTUBEKEY   = "AIzaSyC8TwqSD51bGj3p4DOCWWgW3A3OBMWinlE";

// Legacy aliases — kept so any remaining references don't break
// (always resolved dynamically via getter functions now)
const APIFY_ACTOR    = "SbK00X0JYCPblD2wp";
const CEREBRAS_MODEL = "llama3.1-8b";

// ── toast notification helper ──────────────────────────────────
function showKeyRotationToast(service, newIdx, total, reason) {
  const existing = document.getElementById('key-rotate-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'key-rotate-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:#1e293b;border:1px solid #334155;
    border-left:3px solid #f59e0b;
    border-radius:10px;padding:12px 16px;
    font-family:'Inter',sans-serif;font-size:13px;
    color:#e2e8f0;max-width:300px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:slideInToast 0.3s ease;
  `;
  // inject animation once
  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = `
      @keyframes slideInToast{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes fadeOutToast{from{opacity:1}to{opacity:0;transform:translateY(8px)}}
    `;
    document.head.appendChild(s);
  }
  const isLast = newIdx >= total;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
      <span style="font-size:16px">${isLast ? '⚠️' : '🔄'}</span>
      <strong style="color:#f59e0b">${service} Key Rotated</strong>
    </div>
    <div style="color:#94a3b8;font-size:11.5px;line-height:1.5;">
      Switched to key ${newIdx} of ${total}<br>
      <span style="color:#64748b">Reason: ${reason}</span>
    </div>
    ${isLast ? '<div style="color:#f87171;font-size:11px;margin-top:6px;">⚠️ All backup keys exhausted</div>' : ''}
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOutToast 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ── rate-limit / auth error detector ─────────────────────────
function isRateLimitError(status, message) {
  if ([429, 401, 403].includes(status)) return true;
  const m = (message || '').toLowerCase();
  return m.includes('rate limit') || m.includes('quota') ||
         m.includes('unauthorized') || m.includes('invalid api') ||
         m.includes('exceeded') || m.includes('credits');
}

let currentPlatform=null,
    lastSavedJSON=null,
    lastFileName="",
    chatHistory=[],
    systemPrompt="",
    _authorNames=[],
    _countryMapSnapshot=null,
    _hateSourceSnapshot=null,
    _topDiscussionSnapshot=null;

function detectPlatform(){
  const val=document.getElementById("urlInput").value.trim();
  const icon=document.getElementById("platformIcon"),badge=document.getElementById("detectedBadge");
  const input=document.getElementById("urlInput"),btn=document.getElementById("fetchBtn");
  const ytOpts=document.getElementById("ytOptions");
  if(val.includes("instagram.com")){
    currentPlatform="insta";icon.textContent="📸";badge.textContent="Instagram";
    badge.className="detected-badge insta";input.className="insta";btn.className="";
    btn.textContent="🚀 Fetch Instagram Comments";ytOpts.style.display="none";
  }else if(val.includes("youtube.com")||val.includes("youtu.be")){
    currentPlatform="yt";icon.textContent="▶️";badge.textContent="YouTube";
    badge.className="detected-badge yt";input.className="yt";btn.className="yt-mode";
    btn.textContent="▶️ Fetch YouTube Comments";ytOpts.style.display="block";
  }else{
    currentPlatform=null;icon.textContent="🔗";badge.className="detected-badge";
    input.className="";btn.className="";btn.textContent="🚀 Fetch Comments";ytOpts.style.display="none";
  }
}
function setStatus(msg,loading=false){document.getElementById("status").innerHTML=loading?`<span class="spinner"></span>${msg}`:msg;}
function formatDate(ts){if(!ts)return"";return new Date(ts).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"});}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function extractYouTubeId(input){
  input=input.trim();
  if(/^[a-zA-Z0-9_-]{11}$/.test(input))return input;
  const s=input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);if(s)return s[1];
  const l=input.match(/(?:v=|\/shorts\/|\/embed\/|\/v\/)([a-zA-Z0-9_-]{11})/);if(l)return l[1];
  return null;
}
function slugify(str){return str.replace(/[^a-z0-9]/gi,"_").slice(0,40);}

function saveJSON(payload,filename){
  lastSavedJSON=payload;lastFileName=filename;
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=filename;a.click();
  URL.revokeObjectURL(url);
  showSaveBanner(filename,payload);
}
function reDownload(){
  if(!lastSavedJSON)return;
  const blob=new Blob([JSON.stringify(lastSavedJSON,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=lastFileName;a.click();
  URL.revokeObjectURL(url);
}
function showSaveBanner(filename,payload){
  const count=Array.isArray(payload.comments)?payload.comments.length:(payload.commentThreads?.length||0);
  const size=(JSON.stringify(payload).length/1024).toFixed(1);
  document.getElementById("saveBanner").style.display="block";
  document.getElementById("saveBanner").innerHTML=
    `<div class="save-banner"><div class="info"><strong>✅ Saved: ${filename}</strong><span>${count} comments • ${size} KB</span></div><button class="dl-btn" onclick="reDownload()">⬇️ Again</button></div>`;
}

// callAI — auto-rotates OpenRouter key on rate-limit / auth errors
// retries up to _OR_KEYS.length times (once per key)
async function callAI(prompt, temp = 0.2) {
  const maxAttempts = _OR_KEYS.length;
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getORKey()}`
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{ role: 'user', content: prompt }],
          reasoning: { enabled: true },
          temperature: temp,
          max_tokens: 6000,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        if (isRateLimitError(res.status, msg) && attempt < maxAttempts - 1) {
          rotateORKey(`${res.status} – ${msg}`);
          await sleep(600);
          continue;
        }
        throw new Error(msg);
      }
      return data.choices?.[0]?.message?.content;
    } catch (err) {
      lastErr = err;
      if (isRateLimitError(0, err.message) && attempt < maxAttempts - 1) {
        rotateORKey(err.message);
        await sleep(600);
        continue;
      }
      throw err;
    }
  }
  throw lastErr || new Error('All OpenRouter keys exhausted');
}

function parseJSON(raw) {
  if (!raw) throw new Error('Empty AI response');

  // ── Step 1: strip markdown fences ────────────────────────────
  raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  // ── Step 2: extract outermost { … } ──────────────────────────
  const start = raw.indexOf('{');
  const end   = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start)
    throw new Error('No JSON object found in AI response');
  raw = raw.slice(start, end + 1);

  // ── Step 3: try native parse first ───────────────────────────
  try { return JSON.parse(raw); } catch (_) {}

  // ── Step 4: aggressive auto-repair ───────────────────────────
  let fixed = raw
    // remove JS-style // comments
    .replace(/\/\/[^\n]*/g, '')
    // remove JS-style /* */ block comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // replace curly/smart quotes with straight quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // remove control characters except normal whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // trailing commas before } or ]
    .replace(/,\s*([}\]])/g, '$1')
    // missing comma between } and { (object in array)
    .replace(/}\s*\n\s*{/g, '},\n{')
    // missing comma between ] and [ or } and [
    .replace(/]\s*\n\s*\[/g, '],\n[')
    // unquoted keys  e.g.  key: "value"  →  "key": "value"
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
    // single-quoted strings → double-quoted
    .replace(/'([^']*)'/g, '"$1"')
    // newlines / tabs inside string values that break JSON
    .replace(/"([^"]*?)"/g, (m) =>
      m.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
    );

  try { return JSON.parse(fixed); } catch (_) {}

  // ── Step 5: truncation repair — find last complete object ─────
  // Walk backwards to find largest valid JSON prefix
  for (let i = fixed.length; i > 0; i--) {
    const ch = fixed[i - 1];
    if (ch !== '}' && ch !== ']') continue;
    try {
      const candidate = fixed.slice(0, i);
      // balance braces / brackets
      let balanced = candidate;
      const opens  = (candidate.match(/{/g) || []).length - (candidate.match(/}/g) || []).length;
      const openB  = (candidate.match(/\[/g) || []).length - (candidate.match(/]/g) || []).length;
      if (opens > 0)  balanced += '}'.repeat(opens);
      if (openB > 0)  balanced += ']'.repeat(openB);
      return JSON.parse(balanced);
    } catch (_) { continue; }
  }

  // ── Step 6: nothing worked — surface a useful error ──────────
  try {
    JSON.parse(fixed); // will throw with position info
  } catch (e) {
    throw new Error(`JSON repair failed: ${e.message} — Raw snippet: ${raw.slice(0, 120)}…`);
  }
  throw new Error('JSON parse failed after all repair attempts');
}

// ══ 2. SENTIMENT ══
async function runSentimentAnalysis(texts,total){
  document.getElementById("sentimentSection").style.display="block";
  document.getElementById("sentimentLoading").style.display="flex";
  document.getElementById("sentimentContent").style.display="none";
  try{
    const raw=await callAI(
      `Analyze these ${texts.length} social media comments. Classify each into: Happy, Love, Excited, Angry, Sad, Toxic, Neutral, Sarcasm.\n\nComments:\n${texts.slice(0,200).map((t,i)=>`${i+1}. ${t.slice(0,150)}`).join("\n")}\n\nRespond ONLY valid JSON:\n{"counts":{"Happy":0,"Love":0,"Excited":0,"Angry":0,"Sad":0,"Toxic":0,"Neutral":0,"Sarcasm":0},"overall_mood":"Positive|Negative|Mixed|Neutral","insight":"2-3 sentence summary"}`,
      0.1
    );
    renderSentimentChart(parseJSON(raw),total);
  }catch(err){
    document.getElementById("sentimentLoading").innerHTML=`<p style="color:#e63946;font-family:'Segoe UI',sans-serif">⚠️ ${err.message}</p>`;
  }
}

function renderSentimentChart(result,totalComments){
  const counts=result.counts;const maxVal=Math.max(...Object.values(counts),1);
  const bars=[
    {key:"Happy",emoji:"😄",cls:"pos",label:"Happy"},
    {key:"Love",emoji:"❤️",cls:"pos",label:"Love"},
    {key:"Excited",emoji:"🔥",cls:"pos",label:"Excited"},
    {key:"Angry",emoji:"😡",cls:"neg",label:"Angry",sep:true},
    {key:"Sad",emoji:"😢",cls:"neg",label:"Sad"},
    {key:"Toxic",emoji:"🤬",cls:"neg",label:"Toxic"},
    {key:"Neutral",emoji:"😐",cls:"neu",label:"Neutral",sep:true},
    {key:"Sarcasm",emoji:"😏",cls:"neu",label:"Sarcasm"}
  ];
  document.getElementById("graphWrapper").innerHTML=bars.map(b=>{
    const val=counts[b.key]||0;const pct=Math.round((val/maxVal)*100);
    return `<div class="bar-group${b.sep?" sep-left":""}">
      <span class="emoji">${b.emoji}</span>
      <div class="bar ${b.cls}" id="bar-${b.key}" style="height:0%" data-target="${pct}">
        <span class="count">${val}</span>
      </div>
      <span class="label">${b.label}</span>
    </div>`;
  }).join("");

  const posTotal=(counts.Happy||0)+(counts.Love||0)+(counts.Excited||0);
  const negTotal=(counts.Angry||0)+(counts.Sad||0)+(counts.Toxic||0);
  const neuTotal=(counts.Neutral||0)+(counts.Sarcasm||0);
  document.getElementById("sentimentSummary").innerHTML=
    `<div class="sentiment-pill pill-pos">😊 Positive: ${posTotal} (${Math.round(posTotal/totalComments*100)}%)</div>
     <div class="sentiment-pill pill-neg">😤 Negative: ${negTotal} (${Math.round(negTotal/totalComments*100)}%)</div>
     <div class="sentiment-pill pill-neu">😐 Other: ${neuTotal} (${Math.round(neuTotal/totalComments*100)}%)</div>`;

  const mood=result.overall_mood||"Neutral";
  const moodMap={
    Positive:{cls:"mood-pos",icon:"🌟",text:"Overall: Positive Audience"},
    Negative:{cls:"mood-neg",icon:"⚠️",text:"Overall: Negative Audience"},
    Mixed:{cls:"mood-mix",icon:"⚖️",text:"Overall: Mixed Reactions"},
    Neutral:{cls:"mood-neu",icon:"😐",text:"Overall: Neutral Audience"}
  };
  const m=moodMap[mood]||moodMap.Neutral;
  document.getElementById("moodBadge").className=`mood-badge ${m.cls}`;
  document.getElementById("moodBadge").textContent=`${m.icon} ${m.text}`;
  document.getElementById("aiInsightText").textContent=result.insight||"";
  document.getElementById("sentimentSubtitle").textContent=`${totalComments} comments analyzed`;
  document.getElementById("sentimentLoading").style.display="none";
  document.getElementById("sentimentContent").style.display="flex";

  requestAnimationFrame(()=>setTimeout(()=>{
    bars.forEach(b=>{
      const el=document.getElementById(`bar-${b.key}`);
      if(el){el.style.height=el.dataset.target+"%";el.classList.add("animated");}
    });
  },100));
}

// ══ 3. AUDIENCE SUMMARY ══
async function runAudienceSummary(texts,total,platform){
  document.getElementById("audienceSummarySection").style.display="block";
  document.getElementById("audienceLoading").style.display="flex";
  document.getElementById("audienceContent").style.display="none";
  try{
    const raw=await callAI(
      `You are an expert social media analyst. Analyze these ${texts.length} ${platform==="yt"?"YouTube":"Instagram"} comments and generate exactly 10 key audience insights.\n\nFor each: short title (max 6 words), description (1-2 sentences), estimated comment count (out of ${total}), category (positive/negative/concern/suggestion/highlight/general), relevant emoji.\n\nComments:\n${texts.slice(0,200).map((t,i)=>`${i+1}. ${t.slice(0,150)}`).join("\n")}\n\nRespond ONLY valid JSON:\n{"items":[{"rank":1,"icon":"🌟","category":"positive","title":"Short title","description":"Description.","commentCount":42}],"totalAnalyzed":${total}}`,
      0.2
    );
    renderAudienceSummary(parseJSON(raw),total);
  }catch(err){
    document.getElementById("audienceLoading").innerHTML=`<p style="color:#f87171;font-family:'Segoe UI',sans-serif">⚠️ ${err.message}</p>`;
  }
}

function renderAudienceSummary(result, totalCount) {
  const items = result.items || [];

  // category → band class + fill class
  const catMeta = {
    positive:   { band: 'band-positive',   cat: 'cat-positive',   fill: 'fill-positive',   emoji: '✅' },
    negative:   { band: 'band-negative',   cat: 'cat-negative',   fill: 'fill-negative',   emoji: '⚠️' },
    concern:    { band: 'band-concern',    cat: 'cat-concern',    fill: 'fill-concern',    emoji: '🔔' },
    suggestion: { band: 'band-suggestion', cat: 'cat-suggestion', fill: 'fill-suggestion', emoji: '💡' },
    highlight:  { band: 'band-highlight',  cat: 'cat-highlight',  fill: 'fill-highlight',  emoji: '⭐' },
    general:    { band: 'band-general',    cat: 'cat-general',    fill: 'fill-general',    emoji: '💬' },
    question:   { band: 'band-question',   cat: 'cat-question',   fill: 'fill-question',   emoji: '❓' },
    humor:      { band: 'band-humor',      cat: 'cat-humor',      fill: 'fill-humor',      emoji: '😄' },
  };

  document.getElementById('summaryGrid').innerHTML = items.slice(0, 10).map((item, idx) => {
    const key   = (item.category || 'general').toLowerCase();
    const meta  = catMeta[key] || catMeta.general;
    const pct   = Math.min(100, Math.round((item.commentCount / Math.max(totalCount, 1)) * 100));
    const icon  = item.icon || meta.emoji;
    const label = (item.category || 'general').toUpperCase();

    return `
    <div class="summary-item" style="animation-delay:${(idx * 0.055).toFixed(2)}s">
      <div class="summary-item-band ${meta.band}"></div>
      <div class="summary-item-body">
        <div class="summary-icon-bubble">${icon}</div>
        <div class="summary-body">
          <div class="summary-category ${meta.cat}">${label}</div>
          <div class="summary-title">${item.title || ''}</div>
          <div class="summary-desc">${item.description || ''}</div>
        </div>
        <div class="summary-rank">${item.rank || idx + 1}</div>
      </div>
      <div class="summary-item-footer">
        <span class="summary-count-badge">💬 ~${(item.commentCount || 0).toLocaleString()} comments</span>
        <div class="summary-pct-track">
          <div class="summary-pct-fill ${meta.fill}" style="width:0%" data-target="${pct}%"></div>
        </div>
        <span class="summary-pct-label">${pct}%</span>
      </div>
    </div>`;
  }).join('');

  // animate percentage bars after paint
  requestAnimationFrame(() => setTimeout(() => {
    document.querySelectorAll('.summary-pct-fill').forEach(el => {
      el.style.width = el.dataset.target;
    });
  }, 80));

  document.getElementById('audienceSubtitle').textContent =
    `Based on ${totalCount} comments · ${items.length} key insights extracted`;
  document.getElementById('audienceFooter').innerHTML =
    `Generated by <strong>OpenRouter</strong> · ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`;
  document.getElementById('audienceLoading').style.display = 'none';
  document.getElementById('audienceContent').style.display = 'flex';
}

// ══ 4. TOPIC IDENTIFICATION ══
async function runTopicIdentification(texts,total){
  document.getElementById("topicSection").style.display="block";
  document.getElementById("topicLoading").style.display="flex";
  document.getElementById("topicContent").style.display="none";
  try{
    const raw=await callAI(
      `Analyze these ${texts.length} social media comments and identify the main topics being discussed.\n\nComments:\n${texts.slice(0,200).map((t,i)=>`${i+1}. ${t.slice(0,150)}`).join("\n")}\n\nRespond ONLY valid JSON:\n{"headline":"ONE punchy sentence under 30 words summarizing what viewers are talking about overall","description":"A 100-word paragraph describing the emotional expression, tone, and what drives the audience reaction in these comments","tags":[{"label":"topic name","count":42}]}\n\nProvide 6-8 tags with estimated comment counts.`,
      0.3
    );
    renderTopicSection(parseJSON(raw),total);
  }catch(err){
    document.getElementById("topicLoading").innerHTML=`<p style="color:#833ab4;font-family:'Segoe UI',sans-serif">⚠️ ${err.message}</p>`;
  }
}

function renderTopicSection(result,total){
  document.getElementById("topicCommentCount").textContent=total;
  document.getElementById("topicHeadline").innerHTML=result.headline||"";
  document.getElementById("topicDescription").textContent=result.description||"";
  const tagClasses=["tag-1","tag-2","tag-3","tag-4","tag-5","tag-6","tag-7","tag-8"];
  document.getElementById("topicTags").innerHTML=(result.tags||[]).map((t,i)=>
    `<span class="topic-tag ${tagClasses[i%8]}" style="animation-delay:${0.1+(i*0.06)}s">
      ${t.label} <strong>·</strong> ${t.count}
    </span>`
  ).join("");
  document.getElementById("topicLoading").style.display="none";
  document.getElementById("topicContent").style.display="flex";
}

// ══ 5. PROFILE INSIGHTS ══
async function runProfileInsights(texts,total,platform){
  document.getElementById("profileSection").style.display="block";
  document.getElementById("profileLoading").style.display="flex";
  document.getElementById("profileContent").style.display="none";
  try{
    const raw=await callAI(
      `You are an expert audience analyst. Analyze these ${texts.length} ${platform==="yt"?"YouTube":"Instagram"} comments and identify 4-6 distinct viewer profiles/archetypes based on comment patterns.\n\nComments:\n${texts.slice(0,200).map((t,i)=>`${i+1}. ${t.slice(0,150)}`).join("\n")}\n\nFor each profile provide:\n- A catchy profile name\n- An emoji avatar\n- A 1-2 sentence description\n- 3-4 bullet points of their typical opinions\n- Estimated percentage share of comments (must total ~100%)\n- Estimated comment count\n\nRespond ONLY valid JSON:\n{"profiles":[{"name":"Profile Name","emoji":"🎯","description":"Who they are.","opinions":["Opinion 1","Opinion 2","Opinion 3"],"sharePercent":35,"commentCount":70}],"totalAnalyzed":${total}}`,
      0.3
    );
    renderProfileInsights(parseJSON(raw),total);
  }catch(err){
    document.getElementById("profileLoading").innerHTML=`<p style="color:#818cf8;font-family:'Segoe UI',sans-serif">⚠️ ${err.message}</p>`;
  }
}

function renderProfileInsights(result,total){
  const profiles=result.profiles||[];
  document.getElementById("profilesGrid").innerHTML=profiles.map(p=>`
    <div class="profile-card">
      <div class="profile-card-top">
        <div class="profile-avatar">${p.emoji||"👤"}</div>
        <div>
          <div class="profile-name">${p.name||"Viewer"}</div>
          <div class="profile-share">
            <span class="profile-share-bar" style="width:${Math.min(p.sharePercent||0,100)*0.6}px"></span>
            ${p.sharePercent||0}% of audience
          </div>
        </div>
      </div>
      <div class="profile-desc">${p.description||""}</div>
      <ul class="profile-opinions">${(p.opinions||[]).map(o=>`<li>${o}</li>`).join("")}</ul>
      <div class="profile-count-badge">💬 ~${p.commentCount||0} comments</div>
    </div>`
  ).join("");
  document.getElementById("profileSubtitle").textContent=
    `${profiles.length} viewer archetypes identified from ${total} comments`;
  document.getElementById("profileFooter").innerHTML=
    `Powered by <strong>OpenRouter hunter-alpha</strong> • ${new Date().toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}`;
  document.getElementById("profileLoading").style.display="none";
  document.getElementById("profileContent").style.display="flex";
}

// ══ CHAT ══
function initChat(jsonPayload,platform){
  const stripped=JSON.parse(JSON.stringify(jsonPayload));
  if(stripped.comments)stripped.comments.forEach(c=>delete c._raw);
  if(stripped.commentThreads)stripped.commentThreads.forEach(t=>delete t._raw);
  const dataStr=JSON.stringify(stripped,null,1);
  systemPrompt=
    `You are an expert social media analyst. You have the COMPLETE comments data from a ${platform==="yt"?"YouTube video":"Instagram post"}.\nFull data:\n${dataStr}\nAnswer questions concisely, use bullet points.`;
  chatHistory=[];
  document.getElementById("chatPlaceholder").style.display="none";
  const ca=document.getElementById("chatArea");ca.style.display="flex";ca.style.flexDirection="column";
  document.getElementById("chatInput").disabled=false;
  document.getElementById("sendBtn").disabled=false;
  document.getElementById("chatMessages").innerHTML="";
  document.getElementById("statusDot").className="chat-status-dot ready";
  document.getElementById("statusText").textContent="Ready";
  document.getElementById("dataLoadedBadge").style.display="flex";
  const count=stripped.comments?.length||stripped.commentThreads?.length||0;
  document.getElementById("dataLoadedText").textContent=`${count} comments loaded`;
  const chips=platform==="yt"
    ?["Overall sentiment?","Top liked?","Trending topics?","Toxic comments?","Summarize","Most active user?"]
    :["Overall sentiment?","Most liked?","Any spam?","Trending topics?","Top commenters?","Summarize all"];
  const cls=platform==="yt"?"suggestion-chip yt-chip":"suggestion-chip";
  document.getElementById("suggestions").innerHTML=chips.map(c=>`<button class="${cls}" onclick="askSuggestion('${c}')">${c}</button>`).join("");
  document.getElementById("tokenInfo").innerHTML=
    `Context: ~<strong>${Math.round(dataStr.length/4).toLocaleString()}</strong> tokens`;
  appendMessage("ai",`👋 **${count} comments** loaded! Ask anything.`);
}

function askSuggestion(text){document.getElementById("chatInput").value=text;sendMessage();}
function handleKey(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}
function autoResize(el){el.style.height="auto";el.style.height=Math.min(el.scrollHeight,100)+"px";}

function markdownLite(text){
  return text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,"<em>$1</em>")
    .replace(/`(.+?)`/g,"<code>$1</code>")
    .replace(/^[-•] (.+)$/gm,"<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s,"<ul>$1</ul>")
    .replace(/\n/g,"<br>");
}

function appendMessage(role,text){
  const msgs=document.getElementById("chatMessages");
  const time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  const div=document.createElement("div");div.className=`msg ${role}`;
  div.innerHTML=
    `<div class="msg-avatar">${role==="user"?"U":"AI"}</div>
     <div><div class="msg-bubble">${markdownLite(text)}</div><div class="msg-time">${time}</div></div>`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function appendTyping(){
  const msgs=document.getElementById("chatMessages");
  const div=document.createElement("div");div.className="msg ai";div.id="typingIndicator";
  div.innerHTML=`<div class="msg-avatar">AI</div><div class="typing-bubble"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){const t=document.getElementById("typingIndicator");if(t)t.remove();}

async function sendMessage(){
  const input=document.getElementById("chatInput");const text=input.value.trim();
  if(!text||!systemPrompt)return;
  input.value="";input.style.height="auto";
  document.getElementById("sendBtn").disabled=true;
  document.getElementById("statusDot").className="chat-status-dot thinking";
  document.getElementById("statusText").textContent="Thinking...";
  appendMessage("user",text);chatHistory.push({role:"user",content:text});appendTyping();
  try{
    const res=await fetch("https://openrouter.ai/api/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${getORKey()}`},
      body:JSON.stringify({
        model:"openrouter/hunter-alpha",
        messages:[{role:"system",content:systemPrompt},...chatHistory],
        reasoning:{enabled:true}
      })
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error?.message||`HTTP ${res.status}`);
    const choice=data.choices?.[0];
    const reply=choice?.message?.content||"No response.";
    const reasoning=choice?.message?.reasoning;
    chatHistory.push({role:"assistant",content:reply});
    removeTyping();
    if(reasoning){
      const msgs=document.getElementById("chatMessages");
      const time=new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
      const div=document.createElement("div");div.className="msg ai";
      div.innerHTML=
        `<div class="msg-avatar">AI</div>
         <div>
           <div class="msg-bubble">
             <details style="margin-bottom:8px;font-size:0.78rem;color:#888;">
               <summary style="cursor:pointer;font-weight:600;">🧠 View Reasoning</summary>
               <pre style="white-space:pre-wrap;margin-top:6px;padding:8px;background:#f9f9f9;border-radius:8px;font-size:0.75rem;line-height:1.4;">${reasoning.replace(/</g,"&lt;")}</pre>
             </details>
             ${markdownLite(reply)}
           </div>
           <div class="msg-time">${time}</div>
         </div>`;
      msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
    }else{
      appendMessage("ai",reply);
    }
    if(data.usage){
      document.getElementById("tokenInfo").innerHTML=
        `Last: <strong>${data.usage.prompt_tokens}</strong>+<strong>${data.usage.completion_tokens}</strong>=<strong>${data.usage.total_tokens}</strong> tokens`;
    }
  }catch(err){
    removeTyping();
    appendMessage("ai",`⚠️ **Error:** ${err.message}`);
  }
  document.getElementById("sendBtn").disabled=false;
  document.getElementById("statusDot").className="chat-status-dot ready";
  document.getElementById("statusText").textContent="Ready";
}

// ══ MAIN ROUTER ══
function fetchComments(){
  document.getElementById("results").innerHTML="";
  document.getElementById("saveBanner").style.display="none";
  ["sentimentSection","audienceSummarySection","topicSection","profileSection","countrySection","spamSection","summarySection","personaSection","predictionSection"]
.forEach(id => document.getElementById(id).style.display = "none");

  if(!currentPlatform){
    detectPlatform();
    if(!currentPlatform)return setStatus("❌ Please paste a valid Instagram or YouTube URL.");
  }
  currentPlatform==="insta"?fetchInstagram():fetchYouTube();
}

function getCommentTexts(payload,platform){
  if(platform==="insta")return (payload.comments||[]).map(c=>c.text).filter(Boolean);
  return (payload.commentThreads||[]).map(t=>t.topLevelComment?.text||t.topLevelComment?.textDisplay||"").filter(Boolean);
}

// ══ TOP DISCUSSION COMPUTE ══
function computeTopDiscussionThread(payload, platform) {
  let threads = [];

  if (platform === "insta") {
      document.getElementById("discussionSection").style.visibility = "hidden";
    threads = (payload.comments || [])
      .map(c => ({
        platform: "insta",
        id: c.id || "",
        author: c.ownerUsername || "User",
        avatar: c.ownerProfilePicUrl || "",
        text: c.text || "",
        timestamp: c.timestamp || null,
        likes: c.likesCount || 0,
        replyCount: c.repliesCount || (c.replies?.length || 0),
        replies: (c.replies || []).map(r => ({
          author: r.ownerUsername || "User",
          avatar: "",
          text: r.text || "",
          timestamp: r.timestamp || null,
          likes: r.likesCount || 0
        }))
      }))
      .filter(t => t.replies.length > 0);
  } else {
    threads = (payload.commentThreads || [])
      .map(t => {
        const top = t.topLevelComment || {};
        return {
          platform: "yt",
          id: t.threadId || t.id || "",
          author: top.authorDisplayName || "User",
          avatar: top.authorProfileImageUrl || "",
          text: top.textDisplay || top.textOriginal || "",
          timestamp: top.publishedAt || null,
          likes: top.likeCount || 0,
          replyCount: t.totalReplyCount || (t.replies?.length || 0),
          replies: (t.replies || []).map(r => ({
            author: r.authorDisplayName || "User",
            avatar: r.authorProfileImageUrl || "",
            text: r.text || r.textDisplay || "",
            timestamp: r.publishedAt || null,
            likes: r.likeCount || 0
          }))
        };
      })
      .filter(t => t.replies.length > 0);
  }

  if (!threads.length) {
    document.getElementById("discussionSection").style.display = "block";
    document.getElementById("discussionThread").style.display = "none";
    document.getElementById("discussionEmpty").style.display = "block";
    _topDiscussionSnapshot = null;
    return;
  }

  threads.sort((a,b)=>{
    if(b.replies.length!==a.replies.length)return b.replies.length-a.replies.length;
    return b.likes-a.likes;
  });
  const best = threads[0];

  _topDiscussionSnapshot = {
    platform: best.platform,
    id: best.id,
    author: best.author,
    text: best.text,
    timestamp: best.timestamp,
    likes: best.likes,
    replyCount: best.replies.length,
    replies: best.replies
  };

  renderDiscussionThread(best);
}

function renderDiscussionThread(thread) {
  document.getElementById("discussionSection").style.display = "block";
  document.getElementById("discussionEmpty").style.display = "none";
  document.getElementById("discussionThread").style.display = "block";

  const isInsta = thread.platform === "insta";

  document.getElementById("discussionMetaSmall").textContent =
    `${thread.replies.length} replies • ${formatDate(thread.timestamp) || "time unknown"}`;

  const platformPillClass = isInsta ? "platform-pill-insta" : "platform-pill-yt";
  const platformLabel = isInsta ? "Instagram" : "YouTube";

  const oldMeta=document.querySelector(".discussion-meta");
  if(oldMeta)oldMeta.remove();
  const meta=document.createElement("div");
  meta.className="discussion-meta";
  meta.innerHTML =
    `<div class="discussion-meta-left">
      <span class="platform-pill ${platformPillClass}">${platformLabel}</span>
      <span>${thread.replyCount} replies • Top discussion</span>
    </div>
    <div class="discussion-meta-right">
      <span>Top comment likes: <strong>${thread.likes}</strong></span>
    </div>`;
  const header=document.querySelector(".discussion-header");
  header.insertAdjacentElement("afterend",meta);

  const main=document.getElementById("discussionMain");
  const avatarHTML = thread.avatar
    ? `<div class="discussion-avatar"><img src="${thread.avatar}" alt=""></div>`
    : `<div class="discussion-avatar">${(thread.author || "U").slice(0,2).toUpperCase()}</div>`;

  main.innerHTML =
    `<div class="discussion-main-header">
      ${avatarHTML}
      <div>
        <div class="discussion-author">${thread.author}</div>
        <div class="discussion-meta-line">${formatDate(thread.timestamp) || ""}</div>
      </div>
    </div>
    <div class="discussion-text">${thread.text}</div>
    <div class="discussion-main-footer">
      <span>👍 ${thread.likes}</span>
      <span>💬 ${thread.replyCount} replies</span>
    </div>`;

  const repliesBox=document.getElementById("discussionReplies");
  document.getElementById("discussionReplyCount").textContent =
    `${thread.replyCount} repl${thread.replyCount === 1 ? "y" : "ies"}`;

  repliesBox.innerHTML = thread.replies.map(r=>{
    const av = r.avatar
      ? `<div class="discussion-reply-avatar"><img src="${r.avatar}" alt=""></div>`
      : `<div class="discussion-reply-avatar">${(r.author || "U").slice(0,2).toUpperCase()}</div>`;
    return `<div class="discussion-reply">
      ${av}
      <div class="discussion-reply-body">
        <div class="discussion-reply-top">
          <strong>${r.author}</strong>
          <span>${formatDate(r.timestamp) || ""}</span>
        </div>
        <div class="discussion-reply-text">${r.text}</div>
        <div class="discussion-reply-meta">👍 ${r.likes || 0}</div>
      </div>
    </div>`;
  }).join("");
}

// ══ COUNTRY FLAG MAP ══
const FLAG_MAP={
  "india":"🇮🇳","united states":"🇺🇸","usa":"🇺🇸","uk":"🇬🇧","united kingdom":"🇬🇧","england":"🇬🇧",
  "canada":"🇨🇦","australia":"🇦🇺","germany":"🇩🇪","france":"🇫🇷","italy":"🇮🇹","spain":"🇪🇸",
  "pakistan":"🇵🇰","bangladesh":"🇧🇩","nepal":"🇳🇵","sri lanka":"🇱🇰","uae":"🇦🇪","dubai":"🇦🇪",
  "saudi arabia":"🇸🇦","qatar":"🇶🇦","oman":"🇴🇲","kuwait":"🇰🇼","bahrain":"🇧🇭","russia":"🇷🇺",
  "china":"🇨🇳","japan":"🇯🇵","south korea":"🇰🇷","brazil":"🇧🇷","mexico":"🇲🇽","indonesia":"🇮🇩",
  "philippines":"🇵🇭","turkey":"🇹🇷","nigeria":"🇳🇬","south africa":"🇿🇦","argentina":"🇦🇷"
};
function getFlag(country){
  if(!country)return"🌍";
  const key=country.toLowerCase().trim();
  return FLAG_MAP[key]||"🌍";
}

// ══ COUNTRY OPINION MAP (AI) ══
async function runCountryOpinionMap(texts, dummy, total){
  document.getElementById("countrySection").style.display="block";
  document.getElementById("countryLoading").style.display="flex";
  document.getElementById("countryContent").style.display="none";

  const stepsBox=document.getElementById("countryLoadingSteps");
  const loadingSteps=[
    "Extracting country hints from usernames and text...",
    "Normalizing locations and grouping by country...",
    "Calculating positive vs negative share per country...",
    "Preparing stunning cards and stats..."
  ];
  let step=0;
  const timer=setInterval(()=>{
    if(step<loadingSteps.length){
      stepsBox.innerHTML=loadingSteps.slice(0,step+1).map(s=>"• "+s).join("<br>");
      step++;
    }else clearInterval(timer);
  },2200);

  const combined=texts.map((t,i)=>`[user:${_authorNames[i]||"unknown"}] ${t}`).slice(0,200);

  try{
    const raw=await callAI(
      `You are mapping where Instagram/YouTube commenters are from.\n\nYou get a list of comments with approximate usernames, many will be Indian.\nInfer each commenter's likely country using language, slang, references, and user hint.\n\nComments with hint:\n${combined.map((t,i)=>`${i+1}. ${t.slice(0,200)}`).join("\n")}\n\nReturn ONLY JSON:\n{\n  "countries": {\n    "India": {"pos": 0, "neg": 0, "neu": 0, "examples": ["short example 1"]},\n    "United States": {...}\n  },\n  "unknownCount": 0,\n  "notes": "1-2 sentence summary"\n}`,
      0.2
    );
    const result=parseJSON(raw);
    buildCountryMap(result, total);
  }catch(err){
    clearInterval(timer);
    document.getElementById("countryLoading").innerHTML=
      `<p style="color:#38bdf8;font-family:'Segoe UI',sans-serif">⚠️ Country map error: ${err.message}</p>`;
  }
}

function buildCountryMap(result,total){
  const countriesObj=result.countries||{};
  const unknownCount=result.unknownCount||0;
  const entries=Object.entries(countriesObj).map(([name,data])=>{
    const pos=data.pos||0,neg=data.neg||0,neu=data.neu||0;
    const tot=pos+neg+neu||1;
    return [name,{...data,pos,neg,neu,total:tot}];
  });
  const sorted=entries.sort((a,b)=>b[1].total-a[1].total);
  const countriesFound=sorted.length;
  const totalClassified=sorted.reduce((a,[,d])=>a+d.total,0);
  const totalComments=total||totalClassified+unknownCount;

  const topCountry=sorted[0]?.[0]||"Unknown";
  const posLeader=sorted.slice().sort((a,b)=>b[1].pos-a[1].pos)[0]||["Unknown",{pos:0,total:1}];

  document.getElementById("countryStatsRow").innerHTML =
    `<div class="country-stat-pill">
       <div class="stat-num">${totalComments}</div>
       <div class="stat-label">Total Comments</div>
     </div>
     <div class="country-stat-pill">
       <div class="stat-num">${countriesFound}</div>
       <div class="stat-label">Countries</div>
     </div>
     <div class="country-stat-pill">
       <div class="stat-num">${getFlag(topCountry)}</div>
       <div class="stat-label">Top: ${topCountry}</div>
     </div>
     <div class="country-stat-pill">
       <div class="stat-num">${getFlag(posLeader[0])}</div>
       <div class="stat-label">Most Positive: ${posLeader[0]}</div>
     </div>`;

  document.getElementById("countryGrid").innerHTML=sorted.map(([country,d],idx)=>{
    const flag=getFlag(country);
    const posP=Math.round(d.pos/d.total*100);
    const negP=Math.round(d.neg/d.total*100);
    const neuP=100-posP-negP;
    const share=Math.round(d.total/Math.max(totalClassified,1)*100);
    const dominant=d.pos>=d.neg&&d.pos>=d.neu
      ?{cls:"mood-dom-pos",label:"😊 Mostly Positive"}
      :d.neg>d.pos&&d.neg>=d.neu
        ?{cls:"mood-dom-neg",label:"😤 Mostly Negative"}
        :{cls:"mood-dom-neu",label:"😐 Mostly Neutral"};
    return `<div class="country-card">
      <div class="country-rank">#${idx+1} · ${share}%</div>
      <div class="country-card-top">
        <div class="country-flag">${flag}</div>
        <div class="country-name-block">
          <div class="country-name">${country}</div>
          <div class="country-comment-count">💬 ${d.total} comment${d.total>1?"s":""}</div>
        </div>
      </div>
      <div class="country-sentiment-bar">
        <div class="csb-pos" style="width:${posP}%"></div>
        <div class="csb-neg" style="width:${negP}%"></div>
        <div class="csb-neu" style="width:${neuP}%"></div>
      </div>
      <div class="country-sentiment-pills">
        <span class="cs-pill cs-pill-pos">😊 ${posP}% Positive</span>
        <span class="cs-pill cs-pill-neg">😤 ${negP}% Negative</span>
        <span class="cs-pill cs-pill-neu">😐 ${neuP}% Neutral</span>
      </div>
      <div class="country-mood ${dominant.cls}">${dominant.label}</div>
      ${d.examples?.length?`<div style="margin-top:10px;font-size:0.78rem;color:#94a3b8;">"${d.examples[0]}"</div>`:""}
    </div>`;
  }).join("");

  if(unknownCount>0){
    document.getElementById("unknownStrip").innerHTML=
      `<div class="unknown-strip">
        <span>🌐 <strong>${unknownCount}</strong> comments had unidentifiable origin (generic usernames, numbers, etc.)</span>
        <span style="font-size:0.72rem;color:#334155">${Math.round(unknownCount/Math.max(totalComments,1)*100)}% of total</span>
      </div>`;
  }else{
    document.getElementById("unknownStrip").innerHTML="";
  }

  document.getElementById("countrySubtitle").textContent=
    `${countriesFound} countries detected across ${totalClassified} comments`;
  document.getElementById("countryFooter").innerHTML=
    `<div class="cerebras-badge">Powered by Cerebras llama-3.3-70b · Ultra-fast inference</div>
     <span style="color:#1e293b">${new Date().toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</span>`;

  document.getElementById("countryLoading").style.display="none";
  document.getElementById("countryContent").style.display="flex";

  _countryMapSnapshot = {
    generatedAt: new Date().toISOString(),
    totalComments,
    totalClassified,
    unknownCount,
    countries: sorted.map(([name,d])=>({
      country: name,
      pos: d.pos,
      neg: d.neg,
      neu: d.neu,
      total: d.total,
      examples: d.examples||[]
    }))
  };

  const hateCountries = sorted
    .filter(([,d])=>d.neg>0)
    .map(([country,d])=>({
      country,
      flag:getFlag(country),
      neg:d.neg,
      total:d.total
    }));
  const totalNegAll = hateCountries.reduce((a,c)=>a+c.neg,0)||1;
  hateCountries.forEach(c=>{c.shareOfGlobalNeg=+(c.neg/totalNegAll*100).toFixed(1);});
  _hateSourceSnapshot = {
    generatedAt:new Date().toISOString(),
    totalNegativeComments: totalNegAll,
    countries: hateCountries
  };

  renderHatePie(sorted);
  saveCountryAndHateJSON();
}

function renderHatePie(sorted){
  document.getElementById("hatePieSection").style.display="block";
  document.getElementById("hatePieLoading").style.display="flex";
  document.getElementById("hatePieContent").style.display="none";

  const hateData=sorted
    .filter(([,d])=>d.neg>0)
    .map(([country,d])=>({
      country,
      flag:getFlag(country),
      neg:d.neg,
      total:d.total,
      negPct:Math.round(d.neg/Math.max(d.total,1)*100)
    }))
    .sort((a,b)=>b.neg-a.neg)
    .slice(0,8);

  if(!hateData.length){
    document.getElementById("hatePieLoading").innerHTML=
      `<p style="color:#34d399;font-family:'Segoe UI',sans-serif;font-size:1.1rem;">🎉 No significant hate found!</p>`;
    return;
  }

  const totalHate=hateData.reduce((a,d)=>a+d.neg,0);
  const topHater=hateData[0];
  const COLORS=["#dc2626","#ef4444","#f87171","#b91c1c","#fb923c","#f97316","#fca5a5","#fbbf24"];

  document.getElementById("hateStatsRow").innerHTML=
    `<div class="hate-stat-pill">
       <div class="stat-num">${totalHate}</div>
       <div class="stat-label">Total Hate</div>
     </div>
     <div class="hate-stat-pill">
       <div class="stat-num">${hateData.length}</div>
       <div class="stat-label">Countries</div>
     </div>
     <div class="hate-stat-pill">
       <div class="stat-num">${topHater.flag}</div>
       <div class="stat-label">Top Source: ${topHater.country}</div>
     </div>
     <div class="hate-stat-pill">
       <div class="stat-num">${Math.round(topHater.neg/totalHate*100)}%</div>
       <div class="stat-label">Max Share</div>
     </div>`;

  document.getElementById("pieCenterBig").textContent=totalHate;

  const cx=160,cy=160,r=130,inner=68;
  let startAngle=-Math.PI/2;
  const svg=document.getElementById("hatePieSVG");
  svg.innerHTML="";

  hateData.forEach((d,i)=>{
    const sliceAngle=d.neg/totalHate*2*Math.PI;
    const endAngle=startAngle+sliceAngle;
    const midAngle=startAngle+sliceAngle/2;

    const x1=cx+r*Math.cos(startAngle);
    const y1=cy+r*Math.sin(startAngle);
    const x2=cx+r*Math.cos(endAngle);
    const y2=cy+r*Math.sin(endAngle);
    const ix1=cx+inner*Math.cos(startAngle);
    const iy1=cy+inner*Math.sin(startAngle);
    const ix2=cx+inner*Math.cos(endAngle);
    const iy2=cy+inner*Math.sin(endAngle);
    const largeArc=sliceAngle>Math.PI?1:0;

    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",
      `M ${ix1} ${iy1} L ${x1} ${y1}
       A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
       L ${ix2} ${iy2}
       A ${inner} ${inner} 0 ${largeArc} 0 ${ix1} ${iy1} Z`);
    path.setAttribute("fill",COLORS[i%COLORS.length]);
    path.setAttribute("stroke","#1a0000");
    path.setAttribute("stroke-width","2");
    path.setAttribute("class","pie-slice");

    const title=document.createElementNS("http://www.w3.org/2000/svg","title");
    title.textContent=`${d.flag} ${d.country}: ${d.neg} hate comments (${Math.round(d.neg/totalHate*100)}%)`;
    path.appendChild(title);

    path.addEventListener("mouseenter",()=>{
      document.querySelectorAll(".pie-legend-item").forEach((el,j)=>{
        el.style.opacity=j===i?"1":"0.4";
      });
    });
    path.addEventListener("mouseleave",()=>{
      document.querySelectorAll(".pie-legend-item").forEach(el=>{el.style.opacity="1";});
    });

    svg.appendChild(path);

    const pct=Math.round(d.neg/totalHate*100);
    if(pct>=6){
      const lx=cx+r*0.68*Math.cos(midAngle);
      const ly=cy+r*0.68*Math.sin(midAngle);
      const text=document.createElementNS("http://www.w3.org/2000/svg","text");
      text.setAttribute("x",lx);
      text.setAttribute("y",ly);
      text.setAttribute("text-anchor","middle");
      text.setAttribute("dominant-baseline","middle");
      text.setAttribute("fill","#fff");
      text.setAttribute("font-size","11");
      text.setAttribute("font-weight","800");
      text.setAttribute("font-family","Segoe UI, sans-serif");
      text.textContent=`${pct}%`;
      svg.appendChild(text);
    }

    startAngle=endAngle;
  });

  document.getElementById("pieLegend").innerHTML=hateData.map((d,i)=>{
    const share=Math.round(d.neg/totalHate*100);
    return `<div class="pie-legend-item" onmouseenter="highlightSlice(${i})" onmouseleave="resetSlices()">
      <div class="pie-legend-dot" style="background:${COLORS[i%COLORS.length]}"></div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="pie-legend-flag">${d.flag}</span>
          <span class="pie-legend-name">${d.country}</span>
          <span class="pie-legend-pct">${share}%</span>
        </div>
        <div class="pie-legend-count">${d.neg} hate comment${d.neg>1?"s":""} · ${d.negPct}% of their total</div>
      </div>
    </div>`;
  }).join("");

  document.getElementById("hatePieSubtitle").textContent=
    `${totalHate} negative comments across ${hateData.length} countries`;
  document.getElementById("hatePieFooter").innerHTML=
    `<div class="cerebras-badge" style="background:rgba(248,113,113,0.08);border-color:rgba(248,113,113,0.2);color:#f87171;">
       📊 Data sourced from Country Opinion Map • Section 6
     </div>
     <span style="color:#3b0a0a">
       ${new Date().toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}
     </span>`;

  document.getElementById("hatePieLoading").style.display="none";
  document.getElementById("hatePieContent").style.display="flex";

  const allSlices=svg.querySelectorAll(".pie-slice");
  allSlices.forEach((s,i)=>{
    s.style.opacity="0";
    s.style.transform="scale(0.7)";
    setTimeout(()=>{
      s.style.transition=
        `opacity 0.4s ${i*0.08}s ease, transform 0.4s ${i*0.08}s cubic-bezier(0.34,1.56,0.64,1)`;
      s.style.opacity="1";
      s.style.transform="scale(1)";
    },50);
  });
}
function highlightSlice(idx){
  const slices=document.querySelectorAll(".pie-slice");
  slices.forEach((s,i)=>{s.style.opacity=i===idx?"1":"0.35";});
}
function resetSlices(){
  document.querySelectorAll(".pie-slice").forEach(s=>{s.style.opacity="1";});
}

function saveCountryAndHateJSON(){
  if(!_countryMapSnapshot || !_hateSourceSnapshot)return;
  const ts=new Date().toISOString().slice(0,19).replace(/:/g,"-");
  const combined={
    countryOpinionMap: _countryMapSnapshot,
    hateSourceByCountry: _hateSourceSnapshot,
    topDiscussionThread: _topDiscussionSnapshot || null
  };
  const filename=`country_hate_discussion_${ts}.json`;
  saveJSON(combined,filename);
}

// ══ HELPER: format number ══
function fmtNum(n) {
n = parseInt(n) || 0;
if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
return n.toString();
}

// ══ HELPER: parse ISO 8601 duration ══
function parseDuration(d) {
if (!d) return '';
const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
if (!m) return '';
const h = parseInt(m[1]||0), mi = parseInt(m[2]||0), s = parseInt(m[3]||0);
if (h) return `${h}:${String(mi).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
return `${mi}:${String(s).padStart(2,'0')}`;
}

// ══ HELPER: wait for Apify run ══
async function waitApifyRun(runId) {
for (let i = 0; i < 20; i++) {
  await sleep(5000);
  const pollRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${getApifyKey()}`);
  if (!pollRes.ok) {
    if (isRateLimitError(pollRes.status, '') && i < 19) {
      rotateApifyKey(`Poll HTTP ${pollRes.status}`);
      continue;
    }
    throw new Error(`Apify poll failed: HTTP ${pollRes.status}`);
  }
  const s = await pollRes.json();
  const st = s.data.status;
  setStatus(`⏳ Apify: ${st} (${i+1}/20)...`, true);
  if (st === 'SUCCEEDED') return s.data.defaultDatasetId;
  if (['FAILED','ABORTED','TIMED-OUT'].includes(st)) throw new Error(`Apify run ended: ${st}`);
}
throw new Error('Apify timeout');
}

// ══ RENDER YOUTUBE HERO ══
function renderYTHero(meta, videoId) {
const v = meta.videoInfo || {};
const thumb =
  v.thumbnails?.maxres?.url ||
  v.thumbnails?.high?.url ||
  v.thumbnails?.medium?.url ||
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

document.getElementById('ytThumbImg').src = thumb;
document.getElementById('ytThumbImg').onerror = function() {
  this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const dur = parseDuration(v.duration);
if (dur) document.getElementById('ytDuration').textContent = dur;

document.getElementById('ytPlayBtn').onclick = () =>
  window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');

const ch = v.channelTitle || 'Unknown Channel';
document.getElementById('ytChannelName').textContent = ch;
document.getElementById('ytChannelAvatar').textContent = ch[0] || '▶';
if (v.viewCount) {
  document.getElementById('ytChannelSub').textContent =
    `${fmtNum(v.viewCount)} views on this video`;
}

document.getElementById('ytVideoTitle').textContent = v.title || 'YouTube Video';

const stats = [
  { num: fmtNum(v.viewCount), label: 'Views', icon: '👁️' },
  { num: fmtNum(v.likeCount), label: 'Likes', icon: '👍' },
  { num: fmtNum(v.commentCount), label: 'Comments', icon: '💬' },
];
document.getElementById('ytStatsRow').innerHTML = stats.map(s => `
  <div class="yt-stat">
    <div style="font-size:1.3rem;margin-bottom:4px;">${s.icon}</div>
    <div class="yt-stat-num">${s.num}</div>
    <div class="yt-stat-label">${s.label}</div>
  </div>
`).join('');

const desc = v.description || 'No description available.';
document.getElementById('ytDescBox').textContent =
  desc.length > 300 ? desc.slice(0,300)+'… (click to expand)' : desc;
document.getElementById('ytDescBox').title = desc;
document.getElementById('ytDescBox').onclick = function() {
  this.textContent = this.classList.contains('expanded')
    ? (desc.slice(0,300)+'… (click to expand)')
    : desc;
  this.classList.toggle('expanded');
};

const tags = (v.tags || []).slice(0,12);
document.getElementById('ytTagsRow').innerHTML = tags.map(t =>
  `<span class="yt-tag">#${t}</span>`
).join('');

if (v.publishedAt) {
  document.getElementById('ytPublished').innerHTML =
    `📅 Published ${new Date(v.publishedAt).toLocaleDateString('en-IN',{dateStyle:'long'})}`;
}

document.getElementById('postHeroLoading').style.display = 'none';
document.getElementById('ytHero').style.display = 'flex';

setTimeout(() => {
  document.getElementById('ytHero').scrollIntoView({behavior:'smooth',block:'start'});
}, 200);
}

// ══ RENDER INSTAGRAM HERO ══
function renderInstaHero(postData) {
const p = postData || {};

const imgUrl =
  p.displayUrl || p.displayImage || p.thumbnailUrl ||
  p.images?.[0] || p.mediaUrls?.[0] || '';

const imgEl = document.getElementById('instaThumbImg');
if (imgUrl) {
  imgEl.src = imgUrl;
  imgEl.onerror = () => {
    imgEl.parentElement.innerHTML =
      `<div style="width:100%;height:300px;background:linear-gradient(135deg,#833ab4,#fcb045);
       border-radius:20px;display:flex;align-items:center;justify-content:center;
       font-size:4rem;">📸</div>`;
  };
} else {
  imgEl.parentElement.style.display = 'none';
}

const isVideo = p.type === 'Video' || p.isVideo || p.videoUrl;
document.getElementById('instaMediaType').textContent =
  isVideo ? '🎬 VIDEO' : (p.type === 'Sidecar' ? '📎 CAROUSEL' : '📷 IMAGE');
if (isVideo) document.getElementById('instaVideoPlay').style.display = 'flex';

const username = p.ownerUsername || p.username || p.ownerId || 'unknown';
const fullname = p.ownerFullName || p.fullName || '';
const isVerified = p.ownerIsVerified || p.verified || false;
const avatarUrl = p.ownerProfilePicUrl || p.profilePicUrl || '';

document.getElementById('instaUsername').textContent = '@' + username;
document.getElementById('instaFullname').textContent = fullname;

if (isVerified) document.getElementById('instaVerified').style.display = 'inline';

const avatarWrap = document.getElementById('instaAvatarWrap');
if (avatarUrl) {
  avatarWrap.innerHTML = `<img src="${avatarUrl}" alt="avatar"
    onerror="this.parentElement.innerHTML='<div class=insta-profile-avatar-placeholder>${username[0]?.toUpperCase()||'U'}</div>'"
    style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
} else {
  document.getElementById('instaAvatarPlaceholder').textContent =
    username[0]?.toUpperCase() || 'U';
}

const caption = p.caption || p.text || p.description || 'No caption.';
const captEl = document.getElementById('instaCaption');
captEl.textContent = caption.length > 250
  ? caption.slice(0,250) + '… (tap to expand)' : caption;
captEl.onclick = function() {
  this.textContent = this.classList.contains('expanded')
    ? (caption.slice(0,250)+'… (tap to expand)') : caption;
  this.classList.toggle('expanded');
};

const likes = p.likesCount ?? p.likes ?? p.likeCount ?? 0;
const comments = p.commentsCount ?? p.comments ?? p.commentCount ?? 0;
const views = p.videoViewCount ?? p.viewCount ?? p.videoViews ?? 0;
const stats = [
  { num: fmtNum(likes), label: 'Likes', icon: '❤️' },
  { num: fmtNum(comments), label: 'Comments', icon: '💬' },
  ...(views > 0 ? [{ num: fmtNum(views), label: 'Views', icon: '👁️' }] : []),
];
document.getElementById('instaStatsRow').innerHTML = stats.map(s => `
  <div class="insta-stat">
    <div style="font-size:1.2rem;margin-bottom:4px;">${s.icon}</div>
    <div class="insta-stat-num">${s.num}</div>
    <div class="insta-stat-label">${s.label}</div>
  </div>
`).join('');

const tags = p.hashtags || caption.match(/#\w+/g) || [];
document.getElementById('instaHashtags').innerHTML = tags.slice(0,15).map(t =>
  `<span class="insta-hashtag">${t.startsWith('#')?t:'#'+t}</span>`
).join('');

const postUrl = p.url || p.shortCode ? `https://instagram.com/p/${p.shortCode}/` : '';
const timestamp = p.timestamp || p.takenAt || p.taken_at_timestamp;
document.getElementById('instaPostMeta').innerHTML = [
  timestamp ? `<span>📅 ${new Date(timestamp).toLocaleDateString('en-IN',{dateStyle:'long'})}</span>` : '',
  p.locationName ? `<span>📍 ${p.locationName}</span>` : '',
  postUrl ? `<span>🔗 <a href="${postUrl}" target="_blank" style="color:#a78bfa;text-decoration:none;">View on Instagram</a></span>` : '',
].filter(Boolean).join('');

document.getElementById('postHeroLoading').style.display = 'none';
document.getElementById('instaHero').style.display = 'flex';

setTimeout(() => {
  document.getElementById('instaHero').scrollIntoView({behavior:'smooth',block:'start'});
}, 200);
}

// ══ FETCH INSTAGRAM ══
async function fetchInstagram() {
const postUrl = document.getElementById('urlInput').value.trim();
const maxComments = parseInt(document.getElementById('maxComments').value) || 50;
const inclReplies = document.getElementById('includeReplies').value === 'true';
const btn = document.getElementById('fetchBtn');
btn.disabled = true;

document.getElementById('postHeroSection').style.display = 'block';
document.getElementById('postHeroLoading').style.display = 'flex';
document.getElementById('postHeroLoading').classList.add('insta-loading');
document.getElementById('postHeroLoadingText').textContent = '✨ Fetching Instagram post details...';
document.getElementById('instaHero').style.display = 'none';
document.getElementById('ytHero').style.display = 'none';

try {
  setStatus('🚀 Starting apify/instagram-scraper...', true);
  const postRunRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${getApifyKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: [postUrl],
        resultsType: 'posts',
        resultsLimit: 1,
        addParentData: false,
      })
    }
  );
  if (!postRunRes.ok) throw new Error(`Instagram scraper failed: ${postRunRes.status}`);
  const postRunData = await postRunRes.json();
  const postRunId = postRunData.data.id;

  const postDsId = await waitApifyRun(postRunId);
  const postItems = await (await fetch(
    `https://api.apify.com/v2/datasets/${postDsId}/items?token=${getApifyKey()}&limit=1`
  )).json();

  if (postItems?.length > 0) {
    renderInstaHero(postItems[0]);
  } else {
    document.getElementById('postHeroLoading').style.display = 'none';
  }

  setStatus('💬 Fetching comments...', true);
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_ACTOR}/runs?token=${getApifyKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: [postUrl],
        resultsLimit: maxComments,
        includeNestedComments: inclReplies,
      })
    }
  );
  if (!runRes.ok) { const e = await runRes.json(); throw new Error(e.error?.message || `HTTP ${runRes.status}`); }
  const data = await runRes.json();
  const { id: runId, defaultDatasetId: dsId } = data;

  let status = 'RUNNING', attempts = 0;
  while (['RUNNING','READY'].includes(status) && attempts < 60) {
    await sleep(4000); attempts++;
    const s = await (await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR}/runs/${runId}?token=${getApifyKey()}`)).json();
    status = s.data.status;
    setStatus(`Status: ${status} ${attempts * 4}s...`, true);
    if (status !== 'SUCCEEDED') throw new Error(`Run ended: ${status}`);
  }

  setStatus('Loading comments...', true);
  const rawComments = await (await fetch(
    `https://api.apify.com/v2/datasets/${dsId}/items?token=${getApifyKey()}&limit=${maxComments}`
  )).json();

  if (!rawComments?.length) return setStatus('No comments found or post is private.');

  const postId = postUrl.match(/\/p\/([^/?]+)/)?.[1] || 'unknown';
  const jsonPayload = {
    meta: {
      platform: 'instagram', source: 'Apify', actorId: APIFY_ACTOR,
      runId, datasetId: dsId, postUrl, postId,
      fetchedAt: new Date().toISOString(),
      totalFetched: rawComments.length,
    },
    postDetails: postItems?.[0] || null,
    summary: {
      totalComments: rawComments.length,
      totalLikes: rawComments.reduce((a,c) => a + (c.likesCount||0), 0),
      totalReplies: rawComments.reduce((a,c) => a + (c.repliesCount||0), 0),
      uniqueUsers: [...new Set(rawComments.map(c => c.ownerUsername).filter(Boolean))].length,
    },
    comments: rawComments.map(c => ({
      id: c.id||null, text: c.text||null, timestamp: c.timestamp||null,
      ownerUsername: c.ownerUsername||null, ownerFullName: c.ownerFullName||null,
      ownerProfilePicUrl: c.ownerProfilePicUrl||null,
      ownerIsVerified: c.ownerIsVerified??null,
      likesCount: c.likesCount??0, repliesCount: c.repliesCount??0,
      replies: (c.replies||[]).map(r => ({
        id: r.id||null, text: r.text||null, timestamp: r.timestamp||null,
        ownerUsername: r.ownerUsername||null, likesCount: r.likesCount??0,
      }))
    }))
  };

  const ts = new Date().toISOString().slice(0,19).replace(/\D/g,'-');
  saveJSON(jsonPayload, `instagram-comments-${postId}-${ts}.json`);
  setStatus('');

  const { totalComments, totalLikes, totalReplies, uniqueUsers } = jsonPayload.summary;
  document.getElementById('results').innerHTML = `
    <div class="stats-bar">
      <span><strong>Instagram</strong></span>
      <span><strong>${totalComments}</strong> comments</span>
      <span><strong>${totalLikes}</strong> likes</span>
      <span><strong>${totalReplies}</strong> replies</span>
      <span><strong>${uniqueUsers}</strong> users</span>
      <button class="toggle-comments-btn" onclick="toggleComments(this)">Show Comments</button>
    </div>
    <div id="commentsContainer">${rawComments.map(c => buildInstaCard(c, false)).join('')}</div>`;

  runAITasks(jsonPayload, 'insta');

} catch(err) {
  document.getElementById('results').innerHTML =
    `<div class="error-box"><strong>Error</strong> ${err.message}</div>`;
  setStatus('');
  document.getElementById('postHeroLoading').style.display = 'none';
} finally {
  btn.disabled = false;
}
}

// ══ FETCH YOUTUBE ══
async function fetchYouTube() {
const rawInput = document.getElementById('urlInput').value.trim();
const maxResults = parseInt(document.getElementById('maxComments').value) || 50;
const inclReplies = document.getElementById('includeReplies').value === 'true';
const order = document.getElementById('ytSort').value;
const lang = document.getElementById('ytLang').value.trim();
const btn = document.getElementById('fetchBtn');
btn.disabled = true;

const videoId = extractYouTubeId(rawInput);
if (!videoId) { setStatus('Could not extract YouTube Video ID.'); btn.disabled = false; return; }

document.getElementById('postHeroSection').style.display = 'block';
document.getElementById('postHeroLoading').style.display = 'flex';
document.getElementById('postHeroLoading').classList.remove('insta-loading');
document.getElementById('postHeroLoadingText').textContent = '▶ Fetching YouTube video details...';
document.getElementById('ytHero').style.display = 'none';
document.getElementById('instaHero').style.display = 'none';

try {
  setStatus('🚀 Starting streamers/youtube-scraper...', true);
  const ytScraperRes = await fetch(
    `https://api.apify.com/v2/acts/streamers~youtube-scraper/runs?token=${getApifyKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url: `https://www.youtube.com/watch?v=${videoId}` }],
        maxVideos: 1,
      })
    }
  );
  if (!ytScraperRes.ok) throw new Error(`YT scraper failed: ${ytScraperRes.status}`);
  const ytRunData = await ytScraperRes.json();
  const ytRunId = ytRunData.data.id;

  const ytDetailsPromise = waitApifyRun(ytRunId).then(dsId =>
    fetch(`https://api.apify.com/v2/datasets/${dsId}/items?token=${getApifyKey()}&limit=1`)
      .then(r => r.json())
  ).catch(() => null);

  setStatus('💬 Fetching comments via YouTube API...', true);
  let allThreads = [], pageToken, totalApiCalls = 0;
  while (allThreads.length < maxResults) {
    const part = inclReplies ? 'snippet,replies' : 'snippet';
    let url = `https://www.googleapis.com/youtube/v3/commentThreads?part=${part}&videoId=${videoId}&maxResults=${Math.min(maxResults,100)}&order=${order}&key=${getYTKey()}`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    if (lang) url += `&relevanceLanguage=${lang}`;
    let res, d;
    // retry with key rotation on quota/auth errors
    for (let attempt = 0; attempt < _YT_KEYS.length; attempt++) {
      const tryUrl = url.replace(/key=[^&]+/, `key=${getYTKey()}`);
      res = await fetch(tryUrl);
      d = await res.json(); totalApiCalls++;
      if (!res.ok) {
        const msg = d.error?.message || `HTTP ${res.status}`;
        if (isRateLimitError(res.status, msg) && attempt < _YT_KEYS.length - 1) {
          rotateYTKey(`${res.status} – ${msg}`);
          await sleep(500);
          continue;
        }
        throw new Error(msg);
      }
      break; // success
    }
    if (!res.ok) throw new Error(d?.error?.message || 'YouTube API failed after all key rotations');
    allThreads = allThreads.concat(d.items);
    pageToken = d.nextPageToken;
    setStatus(`Fetched ${allThreads.length} comments...`, true);
    if (!pageToken || allThreads.length >= maxResults) break;
  }
  allThreads = allThreads.slice(0, maxResults);
  if (!allThreads.length) { setStatus('No comments found.'); return; }

  setStatus('🎨 Loading video details...', true);
  const ytItems = await ytDetailsPromise;
  const scraperData = ytItems?.[0] || null;

  let videoMeta = {};
  try {
    let vdRes, vdData;
    for (let attempt = 0; attempt < _YT_KEYS.length; attempt++) {
      vdRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${getYTKey()}`
      );
      vdData = await vdRes.json();
      if (!vdRes.ok) {
        const msg = vdData?.error?.message || `HTTP ${vdRes.status}`;
        if (isRateLimitError(vdRes.status, msg) && attempt < _YT_KEYS.length - 1) {
          rotateYTKey(`Video meta: ${msg}`);
          await sleep(400);
          continue;
        }
        break; // non-quota error, just skip meta
      }
      break;
    }
    if (vdData?.items?.[0]) videoMeta = vdData.items[0];
  } catch(e) {}

  const mergedMeta = {
    videoInfo: {
      title: scraperData?.title || videoMeta.snippet?.title || 'YouTube Video',
      description: scraperData?.description || videoMeta.snippet?.description || '',
      channelTitle: scraperData?.channelName || videoMeta.snippet?.channelTitle || '',
      channelId: scraperData?.channelId || videoMeta.snippet?.channelId || '',
      publishedAt: scraperData?.date || videoMeta.snippet?.publishedAt || '',
      tags: scraperData?.hashtags || videoMeta.snippet?.tags || [],
      thumbnails: {
        maxres: { url: scraperData?.thumbnailUrl || '' },
        high: { url: videoMeta.snippet?.thumbnails?.high?.url || '' },
        medium: { url: videoMeta.snippet?.thumbnails?.medium?.url || '' },
      },
      viewCount: scraperData?.viewCount || videoMeta.statistics?.viewCount || 0,
      likeCount: scraperData?.likes || videoMeta.statistics?.likeCount || 0,
      commentCount: scraperData?.numberOfComments || videoMeta.statistics?.commentCount || 0,
      duration: scraperData?.duration || videoMeta.contentDetails?.duration || '',
    }
  };

  renderYTHero(mergedMeta, videoId);

  const jsonPayload = {
    meta: {
      platform: 'youtube', source: 'YouTube Data API v3 + streamers/youtube-scraper',
      videoId, videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      fetchedAt: new Date().toISOString(), totalFetched: allThreads.length,
      includeReplies: inclReplies, sortOrder: order, languageFilter: lang || null,
      requestedMax: maxResults, apiCallsMade: totalApiCalls + 1,
    },
    postDetails: scraperData,
    videoInfo: mergedMeta.videoInfo,
    summary: {
      totalThreadsFetched: allThreads.length,
      totalTopLevelLikes: allThreads.reduce((a,t) => a + (t.snippet?.topLevelComment?.snippet?.likeCount||0), 0),
      totalReplies: allThreads.reduce((a,t) => a + (t.snippet?.totalReplyCount||0), 0),
      uniqueAuthors: [...new Set(allThreads.map(t => t.snippet?.topLevelComment?.snippet?.authorChannelId?.value).filter(Boolean))].length,
    },
    commentThreads: allThreads.map(thread => {
      const top = thread.snippet?.topLevelComment?.snippet;
      return {
        threadId: thread.id || null,
        canReply: thread.snippet?.canReply ?? null,
        totalReplyCount: thread.snippet?.totalReplyCount ?? 0,
        topLevelComment: {
          commentId: thread.snippet?.topLevelComment?.id || null,
          text: top?.textDisplay || null,
          authorDisplayName: top?.authorDisplayName || null,
          authorProfileImageUrl: top?.authorProfileImageUrl || null,
          likeCount: top?.likeCount ?? 0,
          publishedAt: top?.publishedAt || null,
          updatedAt: top?.updatedAt || null,
        },
        replies: (thread.replies?.comments || []).map(r => ({
          commentId: r.id || null,
          text: r.snippet?.textDisplay || null,
          authorDisplayName: r.snippet?.authorDisplayName || null,
          authorProfileImageUrl: r.snippet?.authorProfileImageUrl || null,
          likeCount: r.snippet?.likeCount ?? 0,
          publishedAt: r.snippet?.publishedAt || null,
        }))
      };
    })
  };

  const shortTitle = mergedMeta.videoInfo.title || videoId;
  const ts = new Date().toISOString().slice(0,19).replace(/\D/g,'-');
  saveJSON(jsonPayload, `youtube-comments-${slugify(shortTitle)}-${ts}.json`);
  setStatus('');

  const { totalThreadsFetched, totalTopLevelLikes, totalReplies, uniqueAuthors } = jsonPayload.summary;
  document.getElementById('results').innerHTML = `
    <div class="stats-bar yt">
      <span><strong>${shortTitle.slice(0,36)}</strong></span>
      <span><strong>${totalThreadsFetched}</strong> comments</span>
      <span><strong>${totalTopLevelLikes}</strong> likes</span>
      <span><strong>${totalReplies}</strong> replies</span>
      <span><strong>${uniqueAuthors}</strong> authors</span>
      <button class="toggle-comments-btn" onclick="toggleComments(this)">Show Comments</button>
    </div>
    <div id="commentsContainer">${allThreads.map(t => buildYTCard(t, inclReplies)).join('')}</div>`;

  runAITasks(jsonPayload, 'yt');

} catch(err) {
  document.getElementById('results').innerHTML =
    `<div class="error-box"><strong>Error</strong> ${err.message}</div>`;
  setStatus('');
  document.getElementById('postHeroLoading').style.display = 'none';
} finally {
  btn.disabled = false;
}
}

// ══ BUILD CARDS ══
function toggleComments(btn){
  const c=document.getElementById("commentsContainer");
  const show=c.style.display==="none"||!c.style.display;
  c.style.display=show?"block":"none";
  btn.textContent=show?"🙈 Hide Comments":"👁 Show Comments";
}

function avatar(url,initial,cls){
  if(url){
    return `<img src="${url}" alt="pfp" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="default-avatar ${cls}" style="display:none">${initial}</div>`;
  }
  return `<div class="default-avatar ${cls}">${initial}</div>`;
}

function buildInstaCard(c,isReply=false){
  const init=(c.ownerUsername||"U")[0].toUpperCase();
  const repliesHtml=(!isReply&&c.replies?.length)
    ? `<button class="toggle-replies" style="color:#833ab4" onclick="toggleReplies(this)">
         ▶ View ${c.replies.length} repl${c.replies.length>1?"ies":"y"}
       </button>
       <div class="replies-container" style="display:none">
         ${c.replies.map(r=>buildInstaCard(r,true)).join("")}
       </div>`
    : "";
  return `<div class="${isReply?"reply-card":"comment-card insta-card"}">
    <div class="comment-header">
      ${avatar(c.ownerProfilePicUrl,init,"insta-av")}
      <div>
        <div class="username">@${c.ownerUsername||"unknown"}${!isReply?'<span class="platform-badge b-insta">Instagram</span>':""}${c.ownerIsVerified?" ✔️":""}</div>
        <div class="meta">${formatDate(c.timestamp)}</div>
      </div>
    </div>
    <div class="comment-text">${c.text||""}</div>
    <div class="comment-footer">
      <span>❤️ ${c.likesCount||0}</span>
      ${!isReply?`<span>💬 ${c.repliesCount||0}</span>`:""}
    </div>
    ${repliesHtml}
  </div>`;
}

function buildYTCard(thread,inclReplies){
  const top=thread.snippet.topLevelComment.snippet;
  const rList=(inclReplies&&thread.replies?.comments)?thread.replies.comments:[];
  const init=(top.authorDisplayName||"U")[0].toUpperCase();
  const repliesHtml=rList.length
    ? `<button class="toggle-replies" style="color:#cc0000" onclick="toggleReplies(this)">
         ▶ View ${rList.length} repl${rList.length>1?"ies":"y"}
       </button>
       <div class="replies-container" style="display:none">
         ${rList.map(r=>buildYTReply(r)).join("")}
       </div>`
    : "";
  return `<div class="comment-card yt-card">
    <div class="comment-header">
      ${avatar(top.authorProfileImageUrl,init,"yt-av")}
      <div>
        <div class="username">${top.authorDisplayName||"Unknown"}<span class="platform-badge b-yt">YouTube</span></div>
        <div class="meta">
          ${formatDate(top.publishedAt)}
          ${top.updatedAt!==top.publishedAt?" · ✏️ Edited":""}
        </div>
      </div>
    </div>
    <div class="comment-text">${top.textDisplay||""}</div>
    <div class="comment-footer">
      <span>👍 ${top.likeCount||0}</span>
      <span>💬 ${thread.snippet.totalReplyCount||0} replies</span>
    </div>
    ${repliesHtml}
  </div>`;
}

function buildYTReply(r){
  const s=r.snippet;
  const init=(s.authorDisplayName||"U")[0].toUpperCase();
  return `<div class="reply-card">
    <div class="comment-header">
      ${avatar(s.authorProfileImageUrl,init,"yt-av")}
      <div>
        <div class="username" style="font-size:0.83rem">${s.authorDisplayName||"Unknown"}</div>
        <div class="meta">${formatDate(s.publishedAt)}</div>
      </div>
    </div>
    <div class="comment-text" style="font-size:0.86rem">${s.textDisplay||""}</div>
    <div class="comment-footer"><span>👍 ${s.likeCount||0}</span></div>
  </div>`;
}

function toggleReplies(btn){
  const c=btn.nextElementSibling;
  const show=c.style.display==="none"||!c.style.display;
  c.style.display=show?"block":"none";
  btn.textContent=show
    ? btn.textContent.replace("▶","▼").replace("View","Hide")
    : btn.textContent.replace("▼","▶").replace("Hide","View");
}

// ══ AI TASKS PIPELINE ══
async function runAITasks(jsonPayload, platform) {
const texts = getCommentTexts(jsonPayload, platform);
const total = texts.length;

if (platform === 'insta') {
  _authorNames = jsonPayload.comments.map(c => c.ownerUsername);
} else {
  _authorNames = jsonPayload.commentThreads.map(t => t.topLevelComment?.authorDisplayName);
}

computeTopDiscussionThread(jsonPayload, platform);
computeCommentStorm(jsonPayload, platform);

const sectionIds = [
  'sentimentSection','audienceSummarySection','topicSection',
  'profileSection','countrySection','hatePieSection',
  'spamSection','summarySection','personaSection','predictionSection','stormSection'
];
sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
});

['sentimentLoading','audienceLoading','topicLoading','profileLoading',
 'countryLoading','spamLoading','summaryLoading','personaLoading','predictionLoading'].forEach(id => {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'flex'; }
});
['sentimentContent','audienceContent','topicContent','profileContent',
 'countryContent','spamContent','summaryInnerContent','personaInnerContent','predictionContent',
 'hatePieContent'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
});

setTimeout(() => {
  document.getElementById('sentimentSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}, 400);

initChat(jsonPayload, platform);

const sample200 = texts.slice(0, 200).map((t, i) => `${i+1}. ${t.slice(0, 150)}`).join('\n');
const platformLabel = platform === 'yt' ? 'YouTube' : 'Instagram';

const combined = texts.map((t, i) => `user:${_authorNames[i] || 'unknown'} ${t.slice(0, 200)}`);
const countryHints = combined.slice(0, 200).map((t, i) => `${i+1}. ${t.slice(0, 200)}`).join('\n');

const megaPrompt = `You are an expert social media analyst. Analyze these ${total} ${platformLabel} comments and return ALL sections in ONE JSON object.

COMMENTS:
${sample200}

Return ONLY this exact JSON structure (no markdown, no explanation):

{
"sentiment": {
  "counts": {
    "Happy": 0, "Love": 0, "Excited": 0, "Angry": 0,
    "Sad": 0, "Toxic": 0, "Neutral": 0, "Sarcasm": 0
  },
  "overallMood": "Positive|Negative|Mixed|Neutral",
  "insight": "2-3 sentence summary of overall tone"
},
"audience": {
  "items": [
    {
      "rank": 1, "icon": "🔥", "category": "positive|negative|concern|suggestion|highlight|general",
      "title": "Short title max 6 words", "description": "1-2 sentences.",
      "commentCount": 42
    }
  ]
},
"topic": {
  "headline": "ONE punchy sentence under 30 words summarizing what viewers talk about",
  "description": "100-word paragraph describing emotional expression, tone, and what drives audience reaction",
  "tags": [
    { "label": "Topic Name", "count": 42 }
  ]
},
"profiles": {
  "profiles": [
    {
      "name": "Profile Name", "emoji": "🎯",
      "description": "Who they are in 1-2 sentences.",
      "opinions": ["Opinion 1", "Opinion 2", "Opinion 3"],
      "sharePercent": 35, "commentCount": 70
    }
  ]
},
"country": {
  "countries": {
    "India": { "pos": 0, "neg": 0, "neu": 0, "examples": ["example comment"] },
    "United States": { "pos": 0, "neg": 0, "neu": 0, "examples": ["example comment"] }
  },
  "unknownCount": 0,
  "notes": "1-2 sentence summary of geographic distribution"
},
"spam": {
  "spam":       { "count": 0, "pct": 0, "examples": ["example1"] },
  "bots":       { "count": 0, "pct": 0, "examples": ["bot1"] },
  "suspicious": { "count": 0, "pct": 0, "examples": ["sus1"] },
  "legit":      { "count": 0, "pct": 80 },
  "total": ${total},
  "riskLevel": "LOW|MEDIUM|HIGH",
  "recommendation": "1-sentence advice"
},
"summary": {
  "dimensions": [
    {
      "icon": "😊",
      "iconBg": "#e8ede9",
      "labelColor": "#2c4a3e",
      "label": "Overall Sentiment",
      "word": "Excited",
      "desc": "Short description of what the data says about this dimension.",
      "pill": "Positive",
      "pillClass": "owp-pos"
    },
    {
      "icon": "🚫",
      "iconBg": "#f5e8e8",
      "labelColor": "#8b2b2b",
      "label": "Top Complaint",
      "word": "Audio",
      "desc": "Main point of criticism raised across the comments.",
      "pill": "Negative",
      "pillClass": "owp-neg"
    },
    {
      "icon": "⭐",
      "iconBg": "#fef9c3",
      "labelColor": "#92400e",
      "label": "Top Praise",
      "word": "Editing",
      "desc": "What the audience most consistently celebrated.",
      "pill": "Positive",
      "pillClass": "owp-pos"
    },
    {
      "icon": "🎭",
      "iconBg": "#ede9fe",
      "labelColor": "#5b21b6",
      "label": "Dominant Emotion",
      "word": "Hype",
      "desc": "Prevailing emotional register across the comment section.",
      "pill": "Positive",
      "pillClass": "owp-pos"
    },
    {
      "icon": "💡",
      "iconBg": "#e0f2fe",
      "labelColor": "#075985",
      "label": "Suggested Action",
      "word": "Consistency",
      "desc": "What commenters most frequently asked for or suggested.",
      "pill": "Neutral",
      "pillClass": "owp-neu"
    }
  ]
},
"personas": {
  "personas": [
    {
      "name": "The Analyst",
      "emoji": "🎓",
      "share": 28,
      "desc": "Writes long structured critiques. References data, breaks arguments into points.",
      "traits": ["Evidence-driven", "Verbose", "Constructive", "Thread-starter"],
      "avgLines": "4.8",
      "replyRate": "62%",
      "sentiment": "Neutral"
    },
    {
      "name": "The Loyalist",
      "emoji": "💚",
      "share": 24,
      "desc": "Long-time fan. Defends creator passionately, remembers past videos.",
      "traits": ["Long-time fan", "Protective", "Community-first", "Warm tone"],
      "avgLines": "2.6",
      "replyRate": "44%",
      "sentiment": "Positive"
    },
    {
      "name": "The Hater",
      "emoji": "🔥",
      "share": 17,
      "desc": "Short punchy angry comments. Arrives ready to fight.",
      "traits": ["Reactionary", "Short-form", "High-trigger", "Negative bias"],
      "avgLines": "1.2",
      "replyRate": "81%",
      "sentiment": "Negative"
    },
    {
      "name": "The Comedian",
      "emoji": "😂",
      "share": 14,
      "desc": "Here to make people laugh. Memes, inside jokes, perfectly timed callbacks.",
      "traits": ["Meme-fluent", "High-likes", "Playful", "Low depth"],
      "avgLines": "0.8",
      "replyRate": "29%",
      "sentiment": "Positive"
    }
  ]
},
"prediction": {
  "like": 78,
  "dislike": 22,
  "net": 56,
  "confidence": "HIGH"
}
}

RULES:
- audience.items: exactly 10 items
- profiles.profiles: 4-6 profiles, sharePercent must total 100
- personas.personas: exactly 4, share must total 100
- summary.dimensions: exactly 5 items
- topic.tags: 6-8 tags
- country: detect from language/slang/references
- Return ONLY valid JSON. No text before or after.
COUNTRY HINTS (username + comment):
${countryHints}`;

setStatus('🧠 Running unified AI analysis...', true);

try {
  const raw = await callAI(megaPrompt, 0.2);
  const result = parseJSON(raw);

  setStatus('✅ Analysis complete!', false);
  setTimeout(() => setStatus(''), 2000);

  if (result.sentiment)  renderSentimentChart(result.sentiment, total);
  if (result.audience)   renderAudienceSummary({ items: result.audience.items }, total);
  if (result.topic)      renderTopicSection(result.topic, total);
  if (result.profiles)   renderProfileInsights(result.profiles, total);
  if (result.country)    buildCountryMap(result.country, total);
  if (result.spam)       renderSpamPie(result.spam);
  if (result.summary)    renderSummaryCards(result.summary);
  if (result.personas)   renderPersonas(result.personas.personas);
  if (result.prediction) renderPrediction(result.prediction.like ?? 78, result.prediction.dislike ?? 22);

} catch (err) {
  console.error('Unified AI failed:', err);
  setStatus(`❌ AI Error: ${err.message}`, false);

  ['sentimentLoading','audienceLoading','topicLoading','profileLoading',
   'countryLoading','spamLoading','summaryLoading','personaLoading','predictionLoading']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<p style="color:#f87171;font-family:'Segoe UI',sans-serif;text-align:center;padding:20px;">⚠️ ${err.message}</p>`;
    });
}
}

// ══ SPAM PIE ══
function renderSpamPie(data) {
const total = data.total || 0;
const slices = [
  {key:"legit", color:"#10b981", label:"✅ Legit", pct:data.legit?.pct||80},
  {key:"spam", color:"#ef4444", label:"🚫 Spam", pct:data.spam?.pct||12},
  {key:"bots", color:"#a78bfa", label:"🤖 Bots", pct:data.bots?.pct||6},
  {key:"suspicious", color:"#f59e0b", label:"⚠️ Suspicious", pct:data.suspicious?.pct||2}
].filter(s => s.pct > 0);

const svg = document.getElementById("spamPieSVG");
svg.innerHTML = "";
let startAngle = -Math.PI/2;

slices.forEach((slice) => {
  const angle = (slice.pct / 100) * 2 * Math.PI;
  const endAngle = startAngle + angle;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", describeArc(190,190,160, startAngle, endAngle));
  path.setAttribute("fill", slice.color);
  path.setAttribute("stroke", "#0a0a1a");
  path.setAttribute("stroke-width", "3");
  path.classList.add("pie-slice");
  svg.appendChild(path);
  startAngle = endAngle;
});

document.getElementById("spamStats").innerHTML = `
  <div class="spam-stat-pill">
    <div class="stat-num">${data.legit?.count || total}</div>
    <div class="stat-label">Legit Users</div>
  </div>
  <div class="spam-stat-pill">
    <div class="stat-num">${data.spam?.count || 0}</div>
    <div class="stat-label">Spam Detected</div>
  </div>
  <div class="spam-stat-pill">
    <div class="stat-num">${data.riskLevel || data.risk_level || "LOW"}</div>
    <div class="stat-label">Risk Level</div>
  </div>`;

document.getElementById("spamSubtitle").textContent = `${data.recommendation || "Low spam detected"}`;
document.getElementById("spamFooter").innerHTML = `<div style="background:rgba(220,38,38,0.1);border-color:rgba(220,38,38,0.3);color:#dc2626;">🤖 Detected by OpenRouter AI</div>`;

document.getElementById("spamLoading").style.display = "none";
document.getElementById("spamContent").style.display = "flex";
}

function describeArc(x, y, radius, startAngle, endAngle) {
const innerRadius = 70;
const startX = x + radius * Math.cos(startAngle);
const startY = y + radius * Math.sin(startAngle);
const endX = x + radius * Math.cos(endAngle);
const endY = y + radius * Math.sin(endAngle);
const innerStartX = x + innerRadius * Math.cos(startAngle);
const innerStartY = y + innerRadius * Math.sin(startAngle);
const innerEndX = x + innerRadius * Math.cos(endAngle);
const innerEndY = y + innerRadius * Math.sin(endAngle);
const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
return `M ${innerStartX} ${innerStartY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY} Z`;
}

// ══════════════════════════════════════════════════
//  10. ONE-WORD SUMMARY  (redesigned)
// ══════════════════════════════════════════════════
function renderSummaryCards(data) {
// data.dimensions is an array from the AI
// Fallback to old flat object if AI returns old format
let dims = data.dimensions;

if (!dims || !Array.isArray(dims)) {
  // Legacy flat format fallback
  dims = [
    {
      icon: "😊", iconBg: "#e8ede9", labelColor: "#2c4a3e",
      label: "Overall Sentiment", word: data.sentiment || "Positive",
      desc: "The dominant emotional register across comments.",
      pill: "Positive", pillClass: "owp-pos"
    },
    {
      icon: "🚫", iconBg: "#f5e8e8", labelColor: "#8b2b2b",
      label: "Top Complaint", word: data.topComplaint || "Audio",
      desc: "Main recurring criticism in the comments.",
      pill: "Negative", pillClass: "owp-neg"
    },
    {
      icon: "⭐", iconBg: "#fef9c3", labelColor: "#92400e",
      label: "Top Praise", word: data.topPraise || "Editing",
      desc: "Most celebrated aspect by the audience.",
      pill: "Positive", pillClass: "owp-pos"
    },
    {
      icon: "🎭", iconBg: "#ede9fe", labelColor: "#5b21b6",
      label: "Dominant Emotion", word: data.emotion || "Excitement",
      desc: "Prevailing feeling across the comment section.",
      pill: "Positive", pillClass: "owp-pos"
    },
    {
      icon: "💡", iconBg: "#e0f2fe", labelColor: "#075985",
      label: "Suggested Action", word: data.action || "Improve",
      desc: "What commenters most frequently requested.",
      pill: "Neutral", pillClass: "owp-neu"
    }
  ];
}

const grid = document.getElementById("summaryContent");
grid.innerHTML = dims.map(d => `
  <div class="one-word-card">
    <div class="one-word-icon-wrap" style="background:${d.iconBg || '#f4f1eb'};">${d.icon}</div>
    <div class="one-word-label" style="color:${d.labelColor || 'var(--ink-4)'};">${d.label}</div>
    <div class="one-word-word">${d.word}</div>
    <div class="one-word-desc">${d.desc}</div>
    <span class="one-word-pill ${d.pillClass || 'owp-neu'}">${d.pill}</span>
  </div>
`).join("");

document.getElementById("summaryLoading").style.display = "none";
document.getElementById("summaryInnerContent").style.display = "flex";
}

// ══════════════════════════════════════════════════
//  11. AUDIENCE PERSONA PROFILES  (redesigned)
// ══════════════════════════════════════════════════
function renderPersonas(personas) {
if (!personas || !personas.length) return;

// Normalise share so it always totals 100
let totalShare = personas.reduce((s, p) => s + (p.share || 0), 0) || 100;

const sentimentColor = {
  Positive: "#6ee7b7",
  Negative: "#fca5a5",
  Neutral:  "#d1d5db",
  Mixed:    "#fde68a"
};

const html = personas.slice(0, 6).map(p => {
  const pct     = Math.round(((p.share || 0) / totalShare) * 100);
  const traits  = Array.isArray(p.traits) ? p.traits : [];
  const avgLines   = p.avgLines   || "—";
  const replyRate  = p.replyRate  || "—";
  const sentiment  = p.sentiment  || "Neutral";
  const sentColor  = sentimentColor[sentiment] || "#d1d5db";

  return `
  <div class="persona-card">
    <div class="persona-band"></div>
    <div class="persona-body">
      <div class="persona-top">
        <div class="persona-emoji-wrap">${p.emoji || "👤"}</div>
        <div class="persona-meta">
          <div class="persona-name">${p.name || "Viewer"}</div>
          <div class="persona-share-row">
            <span class="persona-share-pct">${pct}%</span>
            <div class="persona-share-track">
              <div class="persona-share-fill" style="width:${Math.min(pct,100)}%"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="persona-desc">${p.desc || p.description || ""}</div>
      <div class="persona-traits">
        ${traits.map(t => `<span class="persona-trait">${t}</span>`).join("")}
      </div>
    </div>
    <div class="persona-engagement">
      <div class="engage-item">
        <span class="engage-num">${avgLines}</span>
        <span class="engage-label">Avg lines</span>
      </div>
      <div class="engage-divider"></div>
      <div class="engage-item">
        <span class="engage-num">${replyRate}</span>
        <span class="engage-label">Gets replies</span>
      </div>
      <div class="engage-divider"></div>
      <div class="engage-item">
        <span class="engage-num" style="color:${sentColor};font-size:12px;">${sentiment}</span>
        <span class="engage-label">Sentiment</span>
      </div>
    </div>
  </div>`;
}).join("");

document.getElementById("personaContent").innerHTML = html;
document.getElementById("personaLoading").style.display = "none";
document.getElementById("personaInnerContent").style.display = "flex";
}

// ══ PREDICTION BARS ══
function renderPrediction(likePct, dislikePct) {
const net = likePct - dislikePct;
document.getElementById("predScore").textContent = net > 0 ? `+${net}%` : `${net}%`;
document.getElementById("predScore").style.color = net > 0 ? "#10b981" : "#ef4444";

document.getElementById("predBars").innerHTML = `
  <div class="pred-bar-group">
    <div class="pred-bar-label">👍 Audience Like Prediction</div>
    <div class="pred-bar-container">
      <div class="pred-bar-fill pred-like" style="width:${likePct}%" data-label="${likePct}%"></div>
    </div>
  </div>
  <div class="pred-bar-group">
    <div class="pred-bar-label">👎 Potential Dislike</div>
    <div class="pred-bar-container">
      <div class="pred-bar-fill pred-dislike" style="width:${dislikePct}%" data-label="${dislikePct}%"></div>
    </div>
  </div>
`;

document.getElementById("predictionLoading").style.display = "none";
document.getElementById("predictionContent").style.display = "flex";
}


// ══════════════════════════════════════════════════
//  COMMENT STORM DETECTED  (pure JS, no AI needed)
// ══════════════════════════════════════════════════
function computeCommentStorm(jsonPayload, platform) {
document.getElementById('stormSection').style.display = 'block';
document.getElementById('stormLoading').style.display = 'flex';
document.getElementById('stormContent').style.display = 'none';

// ── collect timestamps ──────────────────────────
const entries = []; // { ts: Date, likes: number }

if (platform === 'insta') {
  (jsonPayload.comments || []).forEach(c => {
    if (c.timestamp) entries.push({ ts: new Date(c.timestamp), likes: c.likesCount || 0 });
  });
} else {
  (jsonPayload.commentThreads || []).forEach(t => {
    const pub = t.topLevelComment?.publishedAt;
    if (pub) entries.push({ ts: new Date(pub), likes: t.topLevelComment?.likeCount || 0 });
  });
}

if (!entries.length) {
  document.getElementById('stormLoading').innerHTML =
    '<p style="color:#475569;font-size:0.9rem;">⚠️ No timestamps found in this data set.</p>';
  return;
}

// ── aggregate ──────────────────────────────────
const byDate  = {};   // "2024-03-15" → count
const byHour  = Array(24).fill(0);   // 0-23 → count
const byDayHour = {};  // "Mon|14" → count
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
////////////////////////////////////////////////////////////////////////////////////
entries.forEach(({ ts }) => {
  const dateKey = ts.toISOString().slice(0, 10);
  byDate[dateKey] = (byDate[dateKey] || 0) + 1;
  byHour[ts.getHours()]++;
  const dhKey = DAYS[ts.getDay()] + '|' + ts.getHours();
  byDayHour[dhKey] = (byDayHour[dhKey] || 0) + 1;
});

const sortedDates = Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0]));
const peakDateEntry = sortedDates.reduce((m,e)=>e[1]>m[1]?e:m, sortedDates[0]);
const peakHour = byHour.indexOf(Math.max(...byHour));
const peakDay  = DAYS[Object.entries(
    Object.fromEntries(DAYS.map(d=>([d, DAYS.filter(dd=>dd===d).reduce(
      (s,_,i)=>s+Array.from({length:24},(_,h)=>byDayHour[d+'|'+h]||0).reduce((a,b)=>a+b,0), 0)])))
  ).sort((a,b)=>b[1]-a[1])[0]?.at(0) || 'Unknown'];

// day total for day-label
const dayTotals = {};
DAYS.forEach(d => {
  dayTotals[d] = Array.from({length:24},(_,h)=>byDayHour[d+'|'+h]||0).reduce((a,b)=>a+b,0);
});
const peakDayName = Object.entries(dayTotals).sort((a,b)=>b[1]-a[1])[0]?.[0] || '';

const total = entries.length;
const spanDays = Math.max(1, Math.ceil(
  (Math.max(...entries.map(e=>e.ts.getTime())) - Math.min(...entries.map(e=>e.ts.getTime())))
  / 86400000
));
const avgPerDay = (total / spanDays).toFixed(1);

// ── KPI ────────────────────────────────────────
document.getElementById('stormKpiRow').innerHTML = [
  { num: total,                       label: 'Comments Mapped' },
  { num: sortedDates.length,          label: 'Active Days' },
  { num: peakDateEntry?.[1] || '—',   label: 'Peak Day Count' },
  { num: fmtHour(peakHour),           label: 'Busiest Hour' },
  { num: peakDayName,                 label: 'Busiest Weekday' },
  { num: avgPerDay,                   label: 'Avg / Day' },
].map(k=>`
  <div class="storm-kpi">
    <div class="storm-kpi-num">${k.num}</div>
    <div class="storm-kpi-label">${k.label}</div>
  </div>`).join('');

// ── Peak highlight ─────────────────────────────
const peakDateFormatted = peakDateEntry
  ? new Date(peakDateEntry[0]+'T12:00:00').toLocaleDateString('en-IN',{dateStyle:'long'})
  : '—';
document.getElementById('stormPeakHighlight').innerHTML = `
  <div class="storm-peak-icon">⚡</div>
  <div class="storm-peak-body">
    <div class="storm-peak-kicker">Peak Activity Day</div>
    <div class="storm-peak-date">${peakDateFormatted}</div>
    <div class="storm-peak-meta">${peakDateEntry?.[1] || 0} comments · ${Math.round((peakDateEntry?.[1]||0)/total*100)}% of all activity on this single day</div>
  </div>
  <div style="margin-left:auto;text-align:right;flex-shrink:0;">
    <div class="storm-peak-kicker">Peak Hour</div>
    <div class="storm-peak-date">${fmtHour(peakHour)}</div>
    <div class="storm-peak-meta">${byHour[peakHour]} comments at this hour</div>
  </div>`;

// ── Date bars (top 8 dates) ────────────────────
const topDates = sortedDates.slice().sort((a,b)=>b[1]-a[1]).slice(0,8);
const maxDateCount = topDates[0]?.[1] || 1;
document.getElementById('stormDateBars').innerHTML = topDates.map((e,i)=>{
  const pct = Math.round(e[1]/maxDateCount*100);
  const label = new Date(e[0]+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  return `<div class="storm-bar-row" style="animation-delay:${i*0.07}s">
    <div class="storm-bar-label">${label}</div>
    <div class="storm-bar-track">
      <div class="storm-bar-fill storm-bar-peak" style="width:${pct}%">
        <span class="storm-bar-fill-val">${e[1]}</span>
      </div>
    </div>
  </div>`;
}).join('');

// ── Hour bars ──────────────────────────────────
const maxHourCount = Math.max(...byHour, 1);
const hourGroups = [
  { label:'12a–4a', hours:[0,1,2,3] },
  { label:'4a–8a',  hours:[4,5,6,7] },
  { label:'8a–12p', hours:[8,9,10,11] },
  { label:'12p–4p', hours:[12,13,14,15] },
  { label:'4p–8p',  hours:[16,17,18,19] },
  { label:'8p–12a', hours:[20,21,22,23] },
];
document.getElementById('stormHourBars').innerHTML = hourGroups.map((g,i)=>{
  const cnt = g.hours.reduce((s,h)=>s+byHour[h],0);
  const pct = Math.round(cnt/Math.max(...hourGroups.map(gg=>gg.hours.reduce((s,h)=>s+byHour[h],0)),1)*100);
  return `<div class="storm-bar-row" style="animation-delay:${i*0.07}s">
    <div class="storm-bar-label">${g.label}</div>
    <div class="storm-bar-track">
      <div class="storm-bar-fill storm-bar-hour" style="width:${pct}%">
        <span class="storm-bar-fill-val">${cnt}</span>
      </div>
    </div>
  </div>`;
}).join('');

// ── Heatmap: 7 rows (days) × 24 cols (hours) ──
const maxCell = Math.max(...Object.values(byDayHour), 1);
const heatHtml = [];
// header row
heatHtml.push('<div class="shm-corner"></div>');
for(let h=0;h<24;h++) heatHtml.push(`<div class="shm-hour-label">${h===0?'12a':h<12?h+'a':h===12?'12p':(h-12)+'p'}</div>`);
// data rows
DAYS.forEach(day => {
  heatHtml.push(`<div class="shm-day-label">${day}</div>`);
  for(let h=0;h<24;h++){
    const cnt = byDayHour[day+'|'+h] || 0;
    const intensity = cnt / maxCell;
    const bg = heatColor(intensity);
    const tip = `${day} ${fmtHour(h)}: ${cnt} comment${cnt!==1?'s':''}`;
    heatHtml.push(`<div class="shm-cell" style="background:${bg}" data-tip="${tip}"></div>`);
  }
});
document.getElementById('stormHeatmap').innerHTML = heatHtml.join('');

document.getElementById('stormSubtitle').textContent =
  `${total} comments mapped across ${sortedDates.length} days`;
document.getElementById('stormFooterNote').textContent =
  `Times are in your local timezone · ${new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}`;

document.getElementById('stormLoading').style.display = 'none';
document.getElementById('stormContent').style.display = 'flex';

// animate bars after paint
setTimeout(()=>{
  document.querySelectorAll('.storm-bar-fill').forEach(el=>{
    const target = el.style.width;
    el.style.width = '0';
    requestAnimationFrame(()=>setTimeout(()=>{ el.style.width = target; }, 60));
  });
}, 100);
}

function fmtHour(h) {
if(h===0)  return '12 AM';
if(h<12)   return h+' AM';
if(h===12) return '12 PM';
return (h-12)+' PM';
}

function heatColor(intensity) {
if(intensity<=0)   return 'rgba(56,189,248,0.05)';
if(intensity<0.15) return 'rgba(56,189,248,0.12)';
if(intensity<0.30) return 'rgba(56,189,248,0.25)';
if(intensity<0.50) return 'rgba(56,189,248,0.45)';
if(intensity<0.75) return 'rgba(56,189,248,0.68)';
return '#38bdf8';
}

// ── Expose functions needed by inline HTML attributes ────────────
window.detectPlatform   = detectPlatform;
window.fetchComments    = fetchComments;
window.toggleComments   = toggleComments;
window.toggleReplies    = toggleReplies;
window.askSuggestion    = askSuggestion;
window.sendMessage      = sendMessage;
window.handleKey        = handleKey;
window.autoResize       = autoResize;
window.highlightSlice   = highlightSlice;
window.resetSlices      = resetSlices;
window.reDownload       = reDownload;
