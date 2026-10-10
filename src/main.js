import './style.css';
import { MODES, localBrainReply, cloudBrainReply, jarvisLocal, jarvisBn, isBangla, quoteOf, BN_CHIPS, BN_QUOTES } from './brain.js';

const $ = (id) => document.getElementById(id);
const els = {
  mic: $('micBtn'), statusBar: $('statusBar'), statusText: $('statusText'),
  interim: $('interim'), transcript: $('transcript'), composer: $('composer'),
  textInput: $('textInput'), persona: $('personaSelect'), personaDesc: $('personaDesc'),
  chips: $('chips'), lang: $('langSelect'), voice: $('voiceSelect'), rate: $('rate'),
  pitch: $('pitch'), rateVal: $('rateVal'), pitchVal: $('pitchVal'),
  autoSpeak: $('autoSpeak'), handsfree: $('handsfree'), bargeIn: $('bargeIn'),
  continuous: $('continuousTalk'), apiBase: $('apiBase'), apiModel: $('apiModel'),
  apiKey: $('apiKey'), stt: $('sttSupport'), level: document.querySelector('#levelMeter span'),
  dialog: $('settingsDialog'), clock: $('clock'), quote: $('quoteText'),
  reminders: $('remindersList'), deck: $('deck'), viz: $('viz'),
  statTime: $('statTime'), statRem: $('statRem'), statTurns: $('statTurns'), statSys: $('statSys'),
  hudClock: $('hudClock'), boot: $('boot'), bootFill: $('bootFill'), bootMsg: $('bootMsg'),
  barCore: $('barCore'), barPwr: $('barPwr'), barNet: $('barNet'), reactor: $('reactor')
};

const store = {
  load(k, fb) { try { const v = localStorage.getItem('advisorvoice:' + k); return v == null ? fb : JSON.parse(v); } catch { return fb; } },
  save(k, v) { try { localStorage.setItem('advisorvoice:' + k, JSON.stringify(v)); } catch {} }
};

const state = {
  mode: store.load('mode', 'jarvis'),
  persona: store.load('persona', null),
  history: store.load('history', []), // {role, content}
  reminders: store.load('reminders', []),
  notes: store.load('notes', []),
  listening: false,
  speaking: false,
  thinking: false,
  recog: null,
  finalBuf: '',
  silenceTimer: null,
  audioCtx: null, analyser: null, micStream: null, raf: 0,
  voices: []
};

// ---------- Modes / personas / chips ----------
function currentMode() { return MODES[state.mode] ?? MODES.jarvis; }
function currentPersona() {
  const m = currentMode();
  return m.personas.find((p) => p.id === state.persona) ?? m.personas[0];
}
function renderModes() {
  document.querySelectorAll('.mode-card').forEach((b) => {
    const on = b.dataset.mode === state.mode;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  const m = currentMode();
  els.persona.innerHTML = m.personas.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  if (!m.personas.some((p) => p.id === state.persona)) state.persona = m.personas[0].id;
  els.persona.value = state.persona;
  els.personaDesc.textContent = currentPersona().desc;
  els.chips.innerHTML = '';
  const bnUi = (els.lang.value || '').startsWith('bn');
  const chipList = (state.mode === 'jarvis' && bnUi) ? BN_CHIPS : m.chips;
  chipList.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = '🎙 ' + c;
    b.onclick = () => handleUserText(c);
    els.chips.appendChild(b);
  });
  store.save('mode', state.mode); store.save('persona', state.persona);
  document.body.dataset.mode = state.mode;
  renderReminders();
}
function modeGreeting() {
  const bnUi = (els.lang.value || '').startsWith('bn');
  if (state.mode === 'jarvis' && bnUi) return `সিস্টেম অনলাইন, বস। আমি জার্ভিস — ${currentPersona().desc} বলো, প্রথম মিশন কী?`;
  if (state.mode === 'jarvis') return `Systems online. I am Jarvis — ${currentPersona().desc} Say "help" for my full menu, or give me our first mission, boss.`;
  return `Switched to ${currentMode().label}. ${currentPersona().desc} What would you like to talk through?`;
}
document.querySelectorAll('.mode-card').forEach((b) => b.onclick = () => { state.mode = b.dataset.mode; state.persona = null; renderModes(); speak(modeGreeting(), true); });
els.persona.onchange = () => { state.persona = els.persona.value; els.personaDesc.textContent = currentPersona().desc; store.save('persona', state.persona); };

// ---------- Transcript ----------
function renderTranscript() {
  els.transcript.innerHTML = '';
  if (!state.history.length) {
    const d = document.createElement('div');
    d.className = 'empty';
    d.innerHTML = '👋 <strong>No conversation yet.</strong><br/>Tap the big mic and speak — or try a quick prompt on the left.';
    els.transcript.appendChild(d);
    return;
  }
  for (const m of state.history) {
    const d = document.createElement('div');
    d.className = 'msg ' + (m.role === 'user' ? 'user' : 'ai');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = m.role === 'user' ? '🧑 You' : `✨ ${currentMode().label}`;
    d.appendChild(who);
    d.appendChild(document.createTextNode(m.content));
    els.transcript.appendChild(d);
  }
  els.transcript.scrollTop = els.transcript.scrollHeight;
}
function pushMsg(role, content) {
  state.history.push({ role, content });
  if (state.history.length > 60) state.history = state.history.slice(-60);
  store.save('history', state.history);
  renderTranscript();
  updateStats();
}
function updateStats() {
  if (els.statRem) els.statRem.textContent = String(state.reminders.length);
  if (els.statTurns) els.statTurns.textContent = String(state.history.filter((m) => m.role === 'user').length);
}

// ---------- Jarvis vault + command deck ----------
const vault = {
  get reminders() { return state.reminders; },
  get notes() { return state.notes; },
  get personaName() { return state.mode === 'jarvis' ? 'Jarvis' : 'AdvisorVoice'; },
  addReminder(t) { state.reminders.push(t); store.save('reminders', state.reminders); renderReminders(); },
  clearReminders() { state.reminders = []; store.save('reminders', state.reminders); renderReminders(); },
  saveNote(t) { state.notes.push(t); store.save('notes', state.notes); }
};
function renderReminders() {
  if (!els.reminders) return;
  els.reminders.innerHTML = '';
  updateStats();
  if (!state.reminders.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'No reminders — say "remind me to…"';
    els.reminders.appendChild(li);
    return;
  }
  state.reminders.forEach((r, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${r} `;
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'mini-btn'; x.textContent = '✓';
    x.title = 'Mark done'; x.setAttribute('aria-label', `Mark reminder ${i + 1} done`);
    x.onclick = () => { state.reminders.splice(i, 1); store.save('reminders', state.reminders); renderReminders(); };
    li.appendChild(x);
    els.reminders.appendChild(li);
  });
}
function tickClock() {
  const bnUi = (els.lang.value || '').startsWith('bn');
  const loc = bnUi ? 'bn-BD' : [];
  const s = new Date().toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  if (els.clock) els.clock.textContent = s;
  if (els.statTime) els.statTime.textContent = s;
  if (els.hudClock) els.hudClock.textContent = s;
}
function renderQuote() {
  if (!els.quote) return;
  const bnUi = (els.lang.value || '').startsWith('bn');
  els.quote.textContent = bnUi
    ? `💡 "${BN_QUOTES[new Date().getDate() % BN_QUOTES.length]}"`
    : `💡 "${quoteOf()}"`;
}
function executeAction(action) {
  if (!action) return;
  if (action.type === 'open' && action.url) {
    window.open(action.url, '_blank', 'noopener');
  } else if (action.type === 'timer') {
    const bnUi = (els.lang.value || '').startsWith('bn');
    setTimeout(() => {
      const msg = bnUi
        ? `বস — ${action.label} টাইমার শেষ! পরের মিশন কী?`
        : `Boss — your ${action.label} timer is up. What is next on the mission list?`;
      pushMsg('assistant', '⏰ ' + msg);
      speak(msg, true);
    }, action.ms);
  }
}

// ---------- Status ----------
function setStatus(kind, text) {
  els.statusBar.className = 'status ' + kind;
  els.statusText.textContent = text;
  els.mic.classList.toggle('live', kind === 'listening');
  els.reactor?.classList.toggle('active', kind === 'listening' || kind === 'speaking');
  els.mic.setAttribute('aria-pressed', String(kind === 'listening'));
  els.mic.querySelector('.orb-core').textContent = kind === 'listening' ? '🛑' : kind === 'speaking' ? '🔊' : kind === 'thinking' ? '💭' : '🎤';
}
function refreshStatus() {
  if (state.thinking) setStatus('thinking', 'Thinking… crafting your answer.');
  else if (state.speaking) setStatus('speaking', 'Speaking — tap mic or start talking to interrupt.');
  else if (state.listening) setStatus('listening', 'Listening… speak now, pause to send.');
  else setStatus('idle', 'Tap the mic and talk — I reply by voice.');
  if (els.statSys) els.statSys.textContent = state.thinking ? 'Thinking' : state.speaking ? 'Speaking' : state.listening ? 'Hearing' : 'Online';
}

// ---------- Speech synthesis ----------
function loadVoices() {
  const all = speechSynthesis?.getVoices?.() ?? [];
  state.voices = all.filter((v) => v.lang?.startsWith('en')).concat(all.filter((v) => !v.lang?.startsWith('en')));
  els.voice.innerHTML = state.voices.map((v, i) => `<option value="${i}">${v.name} (${v.lang})${v.default ? ' ★' : ''}</option>`).join('') || '<option value="">Default voice</option>';
  const saved = store.load('voice', -1);
  if (saved >= 0 && saved < state.voices.length) els.voice.value = String(saved);
}
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}
els.voice.onchange = () => store.save('voice', Number(els.voice.value));
els.rate.oninput = () => { els.rateVal.textContent = Number(els.rate.value).toFixed(2).replace(/0$/, ''); store.save('rate', els.rate.value); };
els.pitch.oninput = () => { els.pitchVal.textContent = Number(els.pitch.value).toFixed(2).replace(/0$/, ''); store.save('pitch', els.pitch.value); };
els.rate.value = store.load('rate', 1); els.pitch.value = store.load('pitch', 1);
els.rateVal.textContent = els.rate.value; els.pitchVal.textContent = els.pitch.value;

function pickVoice() {
  // Prefer a voice matching the recognition language (e.g. বাংলা TTS for bn-BD),
  // otherwise honor the user's explicit voice choice.
  const want = (els.lang.value || 'en-US').split('-')[0].toLowerCase();
  const fam = (l) => (l || '').split('-')[0].toLowerCase();
  const match = state.voices.find((v) => fam(v.lang) === want);
  const chosen = state.voices[Number(els.voice.value)];
  if (chosen && fam(chosen.lang) === want) return chosen;
  return match || chosen || null;
}
function speak(text, force = false) {
  if (!('speechSynthesis' in window)) return;
  if (!els.autoSpeak.checked && !force) return;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = Number(els.rate.value) || 1;
  u.pitch = Number(els.pitch.value) || 1;
  u.onstart = () => { state.speaking = true; refreshStatus(); markLastSpeaking(true); };
  u.onend = u.onerror = () => {
    state.speaking = false; markLastSpeaking(false); refreshStatus();
    if (els.continuous.checked || els.handsfree.checked) startListening();
  };
  state.speaking = true; refreshStatus();
  speechSynthesis.speak(u);
}
function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  state.speaking = false; markLastSpeaking(false);
}
function markLastSpeaking(on) {
  const items = els.transcript.querySelectorAll('.msg.ai');
  const last = items[items.length - 1];
  if (last) last.classList.toggle('speaking', on);
}
$('stopBtn').onclick = () => { stopListening(); stopSpeaking(); refreshStatus(); };
$('repeatBtn').onclick = () => {
  const last = [...state.history].reverse().find((m) => m.role === 'assistant');
  if (last) speak(last.content, true);
  else setStatus('idle', 'Nothing to repeat yet — ask me something first.');
};
$('testVoiceBtn').onclick = () => speak(state.mode === 'jarvis' ? 'Systems check complete, boss. Jarvis voice online, motivation levels at maximum. At your service.' : 'Hello! I am AdvisorVoice, your real-time speech assistant. If you can hear this, your voice is ready.', true);

// ---------- Speech recognition ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) {
  els.stt.textContent = '⚠️ voice input not supported — use Chrome/Edge, or type below';
  els.stt.classList.add('warn');
  els.mic.onclick = () => setStatus('idle', 'Your browser has no speech recognition. Type below — I will still speak replies.');
} else {
  els.stt.textContent = '● mic ready — Chrome/Edge best';
  els.stt.classList.add('ok');
}
function makeRecognizer() {
  const r = new SR();
  r.lang = els.lang.value || 'en-US';
  r.interimResults = true;
  r.continuous = true;
  r.maxAlternatives = 1;
  r.onresult = (e) => {
    let interim = '', finalized = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) finalized += res[0].transcript;
      else interim += res[0].transcript;
    }
    // barge-in: user voice stops AI speech
    if ((interim || finalized) && state.speaking && els.bargeIn.checked) stopSpeaking();
    if (finalized) state.finalBuf += (state.finalBuf ? ' ' : '') + finalized.trim();
    els.interim.textContent = interim ? '“' + interim + '…”' : (state.finalBuf ? '“' + state.finalBuf + '”' : '');
    // silence = end of turn: wait 1.4s after last result, then send
    clearTimeout(state.silenceTimer);
    state.silenceTimer = setTimeout(() => {
      const text = (state.finalBuf + ' ' + els.interim.textContent.replace(/[“”…]/g, '')).trim();
      if (text.length > 1) { state.finalBuf = ''; els.interim.textContent = ''; stopListening(); handleUserText(text); }
    }, 1400);
  };
  r.onend = () => {
    // auto-restart while hands-free and not thinking/speaking
    if (state.listening && !state.thinking && !state.speaking && els.handsfree.checked) {
      try { r.start(); } catch {}
    } else if (state.listening && !els.handsfree.checked) {
      // single-shot mode ends here; flush anything left
      const leftover = state.finalBuf.trim();
      state.finalBuf = '';
      if (leftover && !state.thinking) handleUserText(leftover);
      state.listening = false; refreshStatus(); stopLevel();
    }
  };
  r.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      state.listening = false; refreshStatus(); stopLevel();
      setStatus('idle', 'Microphone blocked — allow mic access in the browser, or type below.');
    }
  };
  return r;
}
function startListening() {
  if (!SR) { setStatus('idle', 'Voice input needs Chrome or Edge. Type below instead.'); return; }
  stopSpeaking();
  if (state.listening) return;
  try {
    state.recog = makeRecognizer();
    state.finalBuf = '';
    state.recog.start();
    state.listening = true;
    refreshStatus(); startLevel();
  } catch { setStatus('idle', 'Could not start mic — try again or type below.'); }
}
function stopListening() {
  state.listening = false;
  clearTimeout(state.silenceTimer);
  try { state.recog?.stop(); } catch {}
  stopLevel();
  if (!state.thinking && !state.speaking) refreshStatus();
}
els.mic.onclick = () => (state.listening ? stopListening() : startListening());

// mic level meter
async function startLevel() {
  try {
    if (!state.micStream) state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    const src = state.audioCtx.createMediaStreamSource(state.micStream);
    state.analyser ??= state.audioCtx.createAnalyser();
    state.analyser.fftSize = 256;
    src.connect(state.analyser);
    const buf = new Uint8Array(state.analyser.frequencyBinCount);
    const tick = () => {
      if (!state.listening) return;
      state.analyser.getByteFrequencyData(buf);
      const avg = buf.reduce((a, b) => a + b, 0) / buf.length / 255;
      if (els.level) els.level.style.width = Math.min(100, Math.round(avg * 320)) + '%';
      state.raf = requestAnimationFrame(tick);
    };
    tick();
  } catch { /* level meter optional */ }
}
function stopLevel() { cancelAnimationFrame(state.raf); if (els.level) els.level.style.width = '0%'; }

// ---------- HUD visualizer (voice waveform / idle arc pulse) ----------
let vizData = null;
function sizeViz() {
  if (!els.viz) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = els.viz.clientWidth || 600;
  els.viz.width = Math.round(w * dpr);
  els.viz.height = Math.round(64 * dpr);
}
function drawViz(now) {
  requestAnimationFrame(drawViz);
  const c = els.viz;
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.clearRect(0, 0, W, H);
  const jarvis = document.body.dataset.mode === 'jarvis';
  const col = jarvis ? '56,225,198' : '108,140,255';
  if (state.analyser && state.listening) {
    vizData ??= new Uint8Array(state.analyser.frequencyBinCount);
    state.analyser.getByteFrequencyData(vizData);
    const n = 48, bw = W / n;
    for (let i = 0; i < n; i++) {
      const v = vizData[Math.floor((i / n) * vizData.length)] / 255;
      const h = Math.max(2, v * H * 0.92);
      ctx.fillStyle = `rgba(${col},${0.35 + v * 0.65})`;
      ctx.fillRect(i * bw + 1, (H - h) / 2, bw - 2, h);
    }
  } else {
    // idle arc pulse
    ctx.lineWidth = Math.max(2, H * 0.04);
    ctx.strokeStyle = `rgba(${col},0.9)`;
    ctx.shadowColor = `rgba(${col},0.8)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 4) {
      const p = x / W;
      const y = H / 2 + Math.sin(p * 6.28 * 2 + now / 700) * H * 0.08
        + Math.sin(p * 6.28 * 5 - now / 430) * H * 0.05
        + (state.speaking ? Math.sin(p * 6.28 * 9 + now / 180) * H * 0.14 : 0);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
window.addEventListener('resize', sizeViz);

// ---------- Answer pipeline ----------
async function handleUserText(text) {
  text = text.trim();
  if (!text) return;
  pushMsg('user', text);
  state.thinking = true; refreshStatus();
  const history = state.history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));
  let reply;
  let action = null;
  const key = els.apiKey.value.trim();
  const bn = isBangla(text);
  const bnUi = (els.lang.value || '').startsWith('bn');
  try {
    if (key) {
      reply = await cloudBrainReply({
        baseUrl: els.apiBase.value.trim() || 'https://api.openai.com/v1',
        model: els.apiModel.value.trim() || 'gpt-4o-mini',
        apiKey: key,
        system: `${currentMode().system} Persona: ${currentPersona().name} — ${currentPersona().desc}${bn || bnUi ? ' Respond in Bengali (Bangla language) using Bengali script.' : ''}`,
        history
      });
    } else if (bn || (bnUi && state.mode === 'jarvis')) {
      await new Promise((r) => setTimeout(r, 400)); // natural beat
      const out = jarvisBn(text, history, vault);
      reply = out.reply;
      action = out.action;
    } else if (state.mode === 'jarvis') {
      await new Promise((r) => setTimeout(r, 400)); // natural beat
      const out = jarvisLocal(text, history, vault);
      reply = out.reply;
      action = out.action;
    } else {
      await new Promise((r) => setTimeout(r, 450)); // natural beat
      reply = localBrainReply(text, state.mode, currentPersona().id, history);
    }
  } catch (err) {
    if (bn || (bnUi && state.mode === 'jarvis')) {
      const out = jarvisBn(text, history, vault);
      reply = out.reply; action = out.action;
    } else if (state.mode === 'jarvis') {
      const out = jarvisLocal(text, history, vault);
      reply = out.reply; action = out.action;
    } else {
      reply = `I hit a snag reaching the cloud AI (${err.message}). Here's a quick take instead:\n` + localBrainReply(text, state.mode, currentPersona().id, history);
    }
  }
  state.thinking = false;
  pushMsg('assistant', reply);
  refreshStatus();
  speak(reply);
  executeAction(action);
}

els.composer.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = els.textInput.value;
  els.textInput.value = '';
  stopListening();
  handleUserText(v);
});

// ---------- Settings / session buttons ----------
$('settingsBtn').onclick = () => els.dialog.showModal();
$('exportBtn').onclick = () => {
  const txt = state.history.map((m) => `${m.role === 'user' ? 'YOU' : 'AI'}: ${m.content}`).join('\n\n') || 'No conversation yet.';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([`AdvisorVoice export — ${new Date().toLocaleString()}\nMode: ${currentMode().label} / ${currentPersona().name}\n\n${txt}`], { type: 'text/plain' }));
  a.download = 'advisorvoice-session.txt';
  a.click();
};
$('copyBtn').onclick = async () => {
  const txt = state.history.map((m) => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n');
  try { await navigator.clipboard.writeText(txt || 'No conversation yet.'); setStatus('idle', 'Transcript copied to clipboard.'); setTimeout(refreshStatus, 1500); } catch {}
};
$('clearBtn').onclick = () => { stopSpeaking(); stopListening(); state.history = []; store.save('history', []); renderTranscript(); refreshStatus(); };

// persist settings
['apiBase', 'apiModel'].forEach((id) => {
  els[id].value = store.load(id, id === 'apiModel' ? 'gpt-4o-mini' : '');
  els[id].oninput = () => store.save(id, els[id].value);
});
els.apiKey.value = store.load('apiKey', '');
els.apiKey.oninput = () => store.save('apiKey', els.apiKey.value);
els.lang.value = store.load('lang', 'en-US');
els.lang.onchange = () => { store.save('lang', els.lang.value); renderModes(); renderQuote(); tickClock(); };
els.autoSpeak.checked = store.load('autoSpeak', true);
els.autoSpeak.onchange = () => store.save('autoSpeak', els.autoSpeak.checked);
els.handsfree.checked = store.load('handsfree', false);
els.handsfree.onchange = () => { store.save('handsfree', els.handsfree.checked); if (els.handsfree.checked) startListening(); };
els.bargeIn.checked = store.load('bargeIn', true);
els.bargeIn.onchange = () => store.save('bargeIn', els.bargeIn.checked);
els.continuous.checked = store.load('continuous', true);
els.continuous.onchange = () => store.save('continuous', els.continuous.checked);

// ---------- Boot sequence + system bars ----------
function runBoot() {
  if (!els.boot) return;
  const bnUi = (els.lang.value || '').startsWith('bn');
  const steps = bnUi
    ? ['কোর চালু হচ্ছে…', 'ভয়েস সিস্টেম অনলাইন…', 'মোটিভেশন মডিউল লোড…', 'স্বাগতম, বস।']
    : ['Initializing core…', 'Voice systems online…', 'Loading motivation module…', 'Welcome back, boss.'];
  let i = 0;
  const step = () => {
    if (i < steps.length) {
      if (els.bootMsg) els.bootMsg.textContent = steps[i];
      if (els.bootFill) els.bootFill.style.width = Math.round(((i + 1) / steps.length) * 100) + '%';
      i++;
      setTimeout(step, 380);
    } else {
      els.boot.classList.add('done');
      setTimeout(() => els.boot.remove(), 800);
    }
  };
  step();
}
function tickBars() {
  const live = state.listening || state.speaking;
  const j = (base, amp) => Math.min(99, Math.round(base + Math.random() * amp + (live ? 3 : 0)));
  if (els.barCore) els.barCore.style.width = j(90, 9) + '%';
  if (els.barPwr) els.barPwr.style.width = j(78, 18) + '%';
  if (els.barNet) els.barNet.style.width = j(70, 25) + '%';
}

// ---------- init ----------
renderModes();
renderTranscript();
renderReminders();
renderQuote();
tickClock();
setInterval(tickClock, 1000);
tickBars();
setInterval(tickBars, 1600);
sizeViz();
requestAnimationFrame(drawViz);
updateStats();
refreshStatus();
runBoot();
if (!state.history.length) {
  const bnUi = (els.lang.value || '').startsWith('bn');
  pushMsg('assistant', state.mode === 'jarvis' && bnUi
    ? `সিস্টেম অনলাইন, বস। আমি জার্ভিস — ${currentPersona().desc} "সাহায্য" বলো, "উৎসাহ দাও" বলো, আর না হলে প্রথম মিশন দাও।`
    : state.mode === 'jarvis'
      ? `Systems online, boss. I am Jarvis — ${currentPersona().desc} Say "help" for everything I can do, "motivate me" for a push, or give me our first mission.`
      : `Welcome to AdvisorVoice! I'm ready to talk. You're in ${currentMode().label} mode (${currentPersona().name}). Tap the microphone and tell me what's on your mind — pricing, hiring, shifts, interviews, growth, or a pay conversation.`);
}
