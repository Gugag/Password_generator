// Strong Password Generator — offline & secure
(function(){
  const $ = (s)=>document.querySelector(s);
  const els = {
    themeToggle: $('#themeToggle'),
    lengthNum: $('#passwordLength'),
    lengthRange: $('#passwordLengthRange'),
    chkU: $('#uppercaseCheckbox'),
    chkL: $('#lowercaseCheckbox'),
    chkN: $('#numericCheckbox'),
    chkS: $('#specialCheckbox'),
    avoidAmb: $('#avoidAmbiguous'),
    prefix: $('#prefix'),
    suffix: $('#suffix'),
    generateBtn: $('#generateBtn'),
    copyBtn: $('#copyBtn'),
    resetBtn: $('#resetBtn'),
    output: $('#passwordOutput'),
    entropy: $('#entropyLabel'),
    strength: $('#strengthLabel'),
    bar: $('#strengthBar'),
    form: $('#pwForm')
  };

  // Theme
  (function initTheme(){
    const saved = localStorage.getItem('pw-theme');
    if(saved === 'light') document.documentElement.classList.add('light');
    els.themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️';
  })();
  els.themeToggle.addEventListener('click', ()=>{
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('pw-theme', isLight ? 'light' : 'dark');
    els.themeToggle.textContent = isLight ? '🌙' : '☀️';
  });

  // Sync length inputs
  function syncLength(v){
    const val = Math.max(4, Math.min(64, v|0));
    els.lengthNum.value = val;
    els.lengthRange.value = val;
    return val;
  }
  els.lengthNum.addEventListener('input', ()=> syncLength(parseInt(els.lengthNum.value,10)||12));
  els.lengthRange.addEventListener('input', ()=> syncLength(parseInt(els.lengthRange.value,10)||12));

  // Toggle pill buttons
  document.querySelectorAll('.check-btn').forEach(btn=>{
    const target = btn.querySelector('input[type="checkbox"]');
    const update = ()=>{
      const checked = target.checked;
      btn.classList.toggle('active', checked);
      btn.setAttribute('aria-checked', String(checked));
    };
    btn.addEventListener('click', ()=>{ target.checked = !target.checked; update(); });
    btn.addEventListener('keydown', (e)=>{
      if(e.key===' '||e.key==='Enter'){ e.preventDefault(); target.checked = !target.checked; update(); }
    });
    update();
  });

  // Charsets
  const CH = {
    U: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    L: 'abcdefghijklmnopqrstuvwxyz',
    N: '0123456789',
    S: '!@#$%^&*()-_=+[]{};:,.?/~`|<>'
  };
  const AMBIG = new Set('0O1lI|`\'\"{}[]()<>');
  function charset(opts){
    let s = '';
    if(opts.U) s += CH.U;
    if(opts.L) s += CH.L;
    if(opts.N) s += CH.N;
    if(opts.S) s += CH.S;
    if(opts.avoid){
      s = [...s].filter(c=>!AMBIG.has(c)).join('');
    }
    return s;
  }

  // crypto-random index with rejection sampling to avoid modulo bias
  function randIndex(max){
    if(max<=0) return 0;
    const u32 = new Uint32Array(1);
    const limit = Math.floor(0xFFFFFFFF / max) * max;
    let x;
    do{
      crypto.getRandomValues(u32);
      x = u32[0] >>> 0;
    }while(x >= limit);
    return x % max;
  }

  function generate(){
    const len = syncLength(parseInt(els.lengthNum.value,10)||12);
    const opts = {
      U: els.chkU.checked,
      L: els.chkL.checked,
      N: els.chkN.checked,
      S: els.chkS.checked,
      avoid: els.avoidAmb.checked
    };
    const pool = charset(opts);
    if(!pool){
      showStrength(0, 0);
      els.output.value = '';
      alert('Pick at least one character set.');
      return;
    }

    // Ensure at least one from each selected group
    const required = [];
    if(opts.U) required.push(pick(CH.U, opts.avoid));
    if(opts.L) required.push(pick(CH.L, opts.avoid));
    if(opts.N) required.push(pick(CH.N, opts.avoid));
    if(opts.S) required.push(pick(CH.S, opts.avoid));

    const out = new Array(len);
    // place required at random positions
    const positions = shuffle([...Array(len).keys()]).slice(0, required.length);
    positions.forEach((pos,i)=> out[pos] = required[i]);

    for(let i=0;i<len;i++){
      if(!out[i]) out[i] = pool[randIndex(pool.length)];
    }
    const withPrefix = (els.prefix.value || '') + out.join('') + (els.suffix.value || '');
    els.output.value = withPrefix;
    els.copyBtn.disabled = withPrefix.length === 0;

    // Strength
    const bits = Math.round(len * Math.log2(pool.length));
    showStrength(bits, pool.length);
    saveState();
  }

  function pick(set, avoid){
    let s = set;
    if(avoid) s = [...s].filter(c=>!AMBIG.has(c)).join('');
    return s[randIndex(s.length)];
  }

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = randIndex(i+1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showStrength(bits){
    els.entropy.textContent = String(bits);
    let pct = Math.min(100, Math.max(0, (bits / 128) * 100));
    els.bar.style.width = pct + '%';
    let label = 'Weak';
    if(bits >= 80) label = 'Strong';
    if(bits >= 100) label = 'Very strong';
    if(bits < 50) label = 'Very weak';
    els.strength.textContent = label;
  }

  async function copy(){
    try{
      await navigator.clipboard.writeText(els.output.value);
      const old = els.copyBtn.textContent;
      els.copyBtn.textContent = 'Copied!';
      setTimeout(()=> els.copyBtn.textContent = old, 1000);
    }catch{ alert('Copy failed.'); }
  }

  function reset(){
    syncLength(12);
    ['chkU','chkL','chkN','chkS'].forEach(id => els[id].checked = true);
    document.querySelectorAll('.check-btn').forEach(btn=>{btn.classList.add('active'); btn.setAttribute('aria-checked','true');});
    els.avoidAmb.checked = false;
    els.prefix.value = '';
    els.suffix.value = '';
    els.output.value = '';
    els.copyBtn.disabled = true;
    showStrength(0);
    saveState();
  }

  function saveState(){
    const state = {
      len: parseInt(els.lengthNum.value,10)||12,
      U: els.chkU.checked, L: els.chkL.checked, N: els.chkN.checked, S: els.chkS.checked,
      avoid: els.avoidAmb.checked, pre: els.prefix.value, suf: els.suffix.value
    };
    localStorage.setItem('pw-state', JSON.stringify(state));
  }
  function restore(){
    try{
      const s = JSON.parse(localStorage.getItem('pw-state')||'{}');
      if(s.len) syncLength(s.len);
      if('U' in s) els.chkU.checked = !!s.U;
      if('L' in s) els.chkL.checked = !!s.L;
      if('N' in s) els.chkN.checked = !!s.N;
      if('S' in s) els.chkS.checked = !!s.S;
      if('avoid' in s) els.avoidAmb.checked = !!s.avoid;
      if('pre' in s) els.prefix.value = s.pre || '';
      if('suf' in s) els.suffix.value = s.suf || '';
      document.querySelectorAll('.check-btn').forEach(btn=>{
        const cb = btn.querySelector('input[type="checkbox"]');
        btn.classList.toggle('active', cb.checked);
        btn.setAttribute('aria-checked', String(cb.checked));
      });
    }catch{}
  }

  els.generateBtn.addEventListener('click', generate);
  els.copyBtn.addEventListener('click', copy);
  els.resetBtn.addEventListener('click', reset);
  window.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey) && e.key==='Enter') generate(); });

  restore();
  showStrength(0);
})();
