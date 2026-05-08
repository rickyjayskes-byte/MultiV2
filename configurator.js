'use strict';

// ── State ────────────────────────────────────────────────
var productType = null;
var step = 0, valveType = null, model = null, mat = null, conn = null;
var iface = null, oper = null, outputConn = null;
var extras = new Set();
var qty = 1, remarks = '';
var contact = { name: '', company: '', phone: '', email: '' };
var submitted = false, sending = false, sendError = '';
var quoteList = [];

// ── Product data ─────────────────────────────────────────
var MODELS3 = [
  { code: 'MD31D', name: 'Direct mount',      sub: 'Threaded process connections & impulse piping',           schema: 'iso-eq-iso',      iface: ['ISO','IM'], extraConn: [],              extras: ['TST'],                outputConn: [] },
  { code: 'MD31F', name: 'Flat model',        sub: 'Flat body, DIN19213 pt.2 or Rosemount IM; for cabinets', schema: 'iso-eq-iso',      iface: ['ISO','IM'], extraConn: ['BW03'],         extras: ['TST','TC','FC'],      outputConn: [] },
  { code: 'MD31H', name: 'H-model',           sub: 'H-body, DIN19213 pt.2 interface',                        schema: 'iso-eq-iso',      iface: ['ISO'],      extraConn: [],              extras: ['TST','BP','TC','FC'], outputConn: [] },
  { code: 'MD31R', name: 'Remote mount',      sub: 'Remote mount, threaded instrument connection',            schema: 'iso-eq-iso',      iface: null,         extraConn: [],              extras: [],                     outputConn: [] },
  { code: 'MD31T', name: 'T-model',           sub: 'Rosemount 2051CD/3051CD integral mounted',                schema: 'iso-eq-iso',      iface: ['IM'],       extraConn: ['ISOC','BW03'], extras: ['TST','BP','TC','FC'], outputConn: [] },
  { code: 'MD32F', name: 'Flat model (MD32)', sub: 'Flat body, DIN19213 pt.2 or Rosemount IM',               schema: 'iso-eq-iso',      iface: ['ISO','IM'], extraConn: ['BW03'],         extras: ['TST','TC','FC'],      outputConn: [] },
  { code: 'MD32H', name: 'H-model (MD32)',    sub: 'H-body design, DIN19213 pt.2 interface',                  schema: 'iso-eq-iso',      iface: ['ISO'],      extraConn: [],              extras: ['TST','BP','TC','FC'], outputConn: [] },
  { code: 'MD33F', name: 'Flat model (MD33)', sub: 'Flat body, DIN19213 pt.2 or Rosemount IM',               schema: 'iso-eq-iso',      iface: ['ISO','IM'], extraConn: ['BW03'],         extras: ['TST','TC','FC'],      outputConn: [] },
];
var MODELS4 = [
  { code: 'MD41D', name: 'Direct mount',        sub: 'Direct mount — Vent + 2x Isolate + Equalize',                  schema: 'v-iso-eq-iso', iface: ['ISO','IM'], extraConn: [],              extras: [],                     outputConn: ['03N'] },
  { code: 'MD41F', name: 'Flat model',          sub: 'Flat body — Vent + 2x Isolate + Equalize',                     schema: 'v-iso-eq-iso', iface: ['ISO','IM'], extraConn: ['BW03'],         extras: ['TST','TC','FC'],      outputConn: [] },
  { code: 'MD41H', name: 'H-model',             sub: 'H-body — Vent + 2x Isolate + Equalize, DIN19213 pt.2',         schema: 'v-iso-eq-iso', iface: ['ISO'],      extraConn: [],              extras: ['XS','TST','BP'],      outputConn: [] },
  { code: 'MD42T', name: 'T-model',             sub: 'T-model — 2x Isolate + 2x Vent, Rosemount 2051CD/3051CD',      schema: 'iso-2v-iso',   iface: ['IM'],       extraConn: ['ISOC','BW03'], extras: ['TST','BP','TC','FC'], outputConn: [] },
  { code: 'MD42H', name: 'H-model (level)',     sub: 'H-body level — 2x Isolate + 2x Vent, DIN19213 pt.2',          schema: 'iso-2v-iso',   iface: ['ISO'],      extraConn: [],              extras: ['TST','BP','TC','FC'], outputConn: [] },
  { code: 'MD44H', name: 'H-model (lv. 44)',    sub: 'H-body level — 2x Isolate + 2x Vent, DIN19213 pt.2',          schema: 'iso-2v-iso',   iface: ['ISO'],      extraConn: [],              extras: ['TST','BP','TC','FC'], outputConn: [] },
];
var MODELS5 = [
  { code: 'MD51D', name: 'Direct mount',        sub: 'Direct mount — 2x Isolate + Equalize + 2x Vent',              schema: 'iso-v-eq-v-iso',  iface: ['ISO','IM'], extraConn: [],              extras: [],                        outputConn: ['03N'] },
  { code: 'MD51H', name: 'H-model',             sub: 'H-body — 2x Isolate + Equalize + 2x Vent, DIN19213 pt.2',    schema: 'iso-v-eq-v-iso',  iface: ['ISO'],      extraConn: ['ISOC'],         extras: ['TST','BP','TC','FC'],     outputConn: [] },
  { code: 'MD52F', name: 'Flat model',          sub: 'Flat body — 2x Isolate + Equalize + 2x Vent, 80mm pitch',    schema: 'iso-v-eq-v-iso',  iface: ['ISO','IM'], extraConn: ['BW03'],         extras: ['TST','xTST','TC','FC'],   outputConn: ['03N','03BP'] },
  { code: 'MD52H', name: 'H-model (MD52)',      sub: 'H-body — 2x Isolate + Equalize + 2x Vent, 80mm pitch',       schema: 'iso-v-eq-v-iso',  iface: ['ISO'],      extraConn: [],              extras: ['TST','BP','TC','FC'],     outputConn: [] },
  { code: 'MD52T', name: 'T-model',             sub: 'T-model — 2x Isolate + Equalize + 2x Vent, Rosemount',       schema: 'iso-v-eq-v-iso',  iface: ['IM'],       extraConn: ['ISOC','BW03'], extras: ['TST','BP','TC','FC'],     outputConn: [] },
  { code: 'MD53F', name: 'Flat model (MD53)',   sub: 'Flat body — 2x Isolate + Equalize + 2x Vent, 80mm pitch',    schema: 'iso-v-eq-v-iso',  iface: ['ISO','IM'], extraConn: ['BW03'],         extras: ['TST','TC','FC'],          outputConn: [] },
  { code: 'MD55D', name: 'Direct mount (55)',   sub: 'Direct mount — 2x Isolate + 2x Equalize + Vent',             schema: 'iso-eq-v-eq-iso', iface: ['ISO','IM'], extraConn: [],              extras: [],                        outputConn: ['03N'] },
  { code: 'MD55F', name: 'Flat model (55)',     sub: 'Flat body — 2x Isolate + 2x Equalize + Vent, 54mm pitch',   schema: 'iso-eq-v-eq-iso', iface: ['ISO','IM'], extraConn: ['BW03'],         extras: ['xTST','TC','FC'],         outputConn: ['01N','03N'] },
  { code: 'MD55H', name: 'H-model (55)',        sub: 'H-body — 2x Isolate + 2x Equalize + Vent, 54mm pitch',      schema: 'iso-eq-v-eq-iso', iface: ['ISO'],      extraConn: [],              extras: ['TST','BP','TC','FC'],     outputConn: [] },
  { code: 'MD55R', name: 'Remote mount',        sub: 'Remote mount — 2x Isolate + 2x Equalize + Vent',            schema: 'iso-eq-v-eq-iso', iface: null,         extraConn: [],              extras: ['DT'],                     outputConn: ['01N','02N','03N','01BP','02BP','03BP'] },
  { code: 'MD55T', name: 'T-model (55)',        sub: 'T-model — 2x Isolate + 2x Equalize + Vent, Rosemount',      schema: 'iso-eq-v-eq-iso', iface: ['IM'],       extraConn: ['ISOC','BW03'], extras: ['TST','BP','TC','FC'],     outputConn: [] },
  { code: 'MD56F', name: 'Flat model (56)',     sub: 'Flat body — 2x Isolate + 2x Equalize + Vent, IM or DIN19213', schema: 'iso-eq-v-eq-iso', iface: ['ISO','IM'], extraConn: ['BW03'],       extras: ['TST','TC','FC'],          outputConn: [] },
];
var MATERIALS = [
  { code: 'SG',     name: 'AISI 316/L NACE',       sub: 'Standard stainless steel' },
  { code: 'M',      name: 'Alloy 400 (Monel)',      sub: 'Salt water, hydrofluoric acid' },
  { code: 'H',      name: 'Alloy C276 (Hastelloy)', sub: 'Aggressive chemical service' },
  { code: 'INC825', name: 'Alloy 825',              sub: 'Sour oil & gas service' },
  { code: 'INC625', name: 'Alloy 625',              sub: 'High strength, seawater' },
  { code: 'D',      name: 'Duplex',                 sub: 'High strength + corrosion resistance' },
  { code: 'SD',     name: 'Super Duplex',           sub: 'Enhanced corrosion resistance' },
  { code: '6M0',    name: '254SMO / 6Mo',           sub: 'Chloride resistance' },
  { code: 'Ti',     name: 'Titanium Gr 2',          sub: 'Extreme corrosion resistance' },
];
var BASE_CONN = [
  { code: 'N01',  name: '1/4" NPT female',  sub: 'NPT 1/4"' },
  { code: 'N02',  name: '3/8" NPT female',  sub: 'NPT 3/8"' },
  { code: 'N03',  name: '1/2" NPT female',  sub: 'NPT 1/2" — most common' },
  { code: 'BP01', name: '1/4" BSP.P female', sub: 'G1/4" parallel' },
  { code: 'BP02', name: '3/8" BSP.P female', sub: 'G3/8" parallel' },
  { code: 'BP03', name: '1/2" BSP.P female', sub: 'G1/2" parallel' },
];
var EXTRA_CONN = {
  BW03: { code: 'BW03', name: '1/2" Buttweld pipe',          sub: 'sch160, L=100/200mm' },
  ISOC: { code: 'ISOC', name: 'Contra DIN/IEC-Kidney flange', sub: 'Rosemount 3051 specific' },
};
var OUTPUT_CONN = {
  '03N':  { code: '03N',  name: '1/2" NPT female output',   sub: 'Output connector' },
  '01N':  { code: '01N',  name: '1/4" NPT female output',   sub: 'Output connector' },
  '02N':  { code: '02N',  name: '3/8" NPT female output',   sub: 'Output connector' },
  '03BP': { code: '03BP', name: '1/2" BSP.P female output', sub: 'Output connector' },
  '01BP': { code: '01BP', name: '1/4" BSP.P female output', sub: 'Output connector' },
  '02BP': { code: '02BP', name: '3/8" BSP.P female output', sub: 'Output connector' },
};
var IFACE = [
  { code: 'ISO', name: 'DIN 19213 part 2',    sub: 'Standard ISO mounting' },
  { code: 'IM',  name: 'Integral Mounted',    sub: 'Direct mount on transmitter' },
];
var OPER = [
  { code: 'YP', name: 'Mixed + PTFE',           sub: 'Isolate: T-bar | Eq/Vent: Anti-tamper | PTFE' },
  { code: 'YG', name: 'Mixed + Graphite',       sub: 'Isolate: T-bar | Eq/Vent: Anti-tamper | Graphite' },
  { code: 'TP', name: 'All T-bar + PTFE',       sub: 'All valves T-bar | PTFE seal' },
  { code: 'TG', name: 'All T-bar + Graphite',   sub: 'All valves T-bar | Graphite seal' },
  { code: 'AP', name: 'All Anti-tamper + PTFE', sub: 'All valves anti-tamper | PTFE seal' },
  { code: 'AG', name: 'All Anti-tamper + Graphite', sub: 'All valves anti-tamper | Graphite seal' },
];
var EXTRA_OPTS = {
  TST:  { code: 'TST',   name: 'Extra test port',             sub: 'Default 1/4" female' },
  xTST: { code: '2xTST', name: '2x extra test ports',        sub: 'Two 1/4" test ports' },
  BP:   { code: 'BP',    name: 'Plugged test port',           sub: 'Test port plugged' },
  TC:   { code: 'TC',    name: 'Test connector',              sub: 'Includes test port' },
  FC:   { code: 'FC',    name: 'Non-return filling connector', sub: 'Includes test port' },
  XS:   { code: 'XS',    name: 'Compact model',               sub: '100mm compact version' },
  DT:   { code: 'DT',    name: 'Delrin tip valve heads',      sub: 'Valve heads with Delrin tip' },
};

// ── P&ID Valve Schema SVGs ────────────────────────────────
var C_ISO  = '#1a4db8';
var C_EQ   = '#0e8a65';
var C_VENT = '#C0202A';

// Gate/globe valve symbol: two filled triangles meeting at center
// type: 'iso' | 'eq' | 'vent'
// orient: 'v' (vertical, default) | 'h' (horizontal)
function valveSym(x, y, type, orient) {
  var c = type === 'iso' ? C_ISO : type === 'eq' ? C_EQ : C_VENT;
  var pts1, pts2, cap1x1, cap1y1, cap1x2, cap1y2, cap2x1, cap2y1, cap2x2, cap2y2;
  if (orient === 'h') {
    // Horizontal: triangles point left/right
    pts1 = (x-6)+','+(y-7)+' '+(x-6)+','+(y+7)+' '+x+','+y;
    pts2 = (x+6)+','+(y-7)+' '+(x+6)+','+(y+7)+' '+x+','+y;
    cap1x1=x-6; cap1y1=y-7; cap1x2=x-6; cap1y2=y+7;
    cap2x1=x+6; cap2y1=y-7; cap2x2=x+6; cap2y2=y+7;
  } else {
    // Vertical: triangles point up/down
    pts1 = (x-7)+','+(y-6)+' '+(x+7)+','+(y-6)+' '+x+','+y;
    pts2 = (x-7)+','+(y+6)+' '+(x+7)+','+(y+6)+' '+x+','+y;
    cap1x1=x-7; cap1y1=y-6; cap1x2=x+7; cap1y2=y-6;
    cap2x1=x-7; cap2y1=y+6; cap2x2=x+7; cap2y2=y+6;
  }
  return [
    '<line x1="'+cap1x1+'" y1="'+cap1y1+'" x2="'+cap1x2+'" y2="'+cap1y2+'" stroke="'+c+'" stroke-width="1.5"/>',
    '<polygon points="'+pts1+'" fill="'+c+'" opacity="0.88"/>',
    '<polygon points="'+pts2+'" fill="'+c+'" opacity="0.88"/>',
    '<line x1="'+cap2x1+'" y1="'+cap2y1+'" x2="'+cap2x2+'" y2="'+cap2y2+'" stroke="'+c+'" stroke-width="1.5"/>',
  ].join('');
}

// Vent-to-atmosphere symbol (small arrow pointing out)
function ventAtm(x, y, dir) {
  // dir: 'up' | 'right'
  if (dir === 'right') {
    return '<polyline points="'+(x+10)+','+(y)+' '+(x+17)+','+y+'" stroke="'+C_VENT+'" stroke-width="1.5" fill="none"/>'+
           '<polyline points="'+(x+14)+','+(y-3)+' '+(x+17)+','+y+' '+(x+14)+','+(y+3)+'" stroke="'+C_VENT+'" stroke-width="1.5" fill="none"/>';
  }
  return '<polyline points="'+x+','+(y-10)+' '+x+','+(y-17)+'" stroke="'+C_VENT+'" stroke-width="1.5" fill="none"/>'+
         '<polyline points="'+(x-3)+','+(y-14)+' '+x+','+(y-17)+' '+(x+3)+','+(y-14)+'" stroke="'+C_VENT+'" stroke-width="1.5" fill="none"/>';
}

// Small process connection symbol (filled square rotated 45°)
function procConn(x, y, label, labelSide) {
  var s = '<rect x="'+(x-4)+'" y="'+(y-4)+'" width="8" height="8" rx="1" fill="#888" transform="rotate(45,'+x+','+y+')"/>';
  var tx = labelSide === 'right' ? x+7 : x-7;
  var anchor = labelSide === 'right' ? 'start' : 'end';
  s += '<text x="'+tx+'" y="'+(y+3)+'" font-size="7.5" font-weight="700" fill="#555" font-family="Arial,sans-serif" text-anchor="'+anchor+'">'+label+'</text>';
  return s;
}

// Instrument connection symbol (dashed horizontal line)
function instrConn(cx, y, w) {
  var x1 = cx - w/2, x2 = cx + w/2;
  return [
    '<line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" stroke="#777" stroke-width="1.5" stroke-dasharray="4,3"/>',
    '<text x="'+cx+'" y="'+(y+9)+'" font-size="7" fill="#999" font-family="Arial,sans-serif" text-anchor="middle">DP transmitter</text>',
  ].join('');
}

// Pipe line segment
function pipe(x1, y1, x2, y2, color, dashed) {
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(color||'#bbb')+'" stroke-width="1.5"'+(dashed?' stroke-dasharray="3,2"':'')+'/>';
}

// Text label
function txt(x, y, s, size, color, anchor) {
  return '<text x="'+x+'" y="'+y+'" font-size="'+(size||8)+'" fill="'+(color||'#888')+'" font-family="Arial,sans-serif" text-anchor="'+(anchor||'middle')+'">'+s+'</text>';
}

function wrapSvg(W, H, content) {
  return '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">'+content+'</svg>';
}

// ── Schema: iso-eq-iso (3-valve) ──────────────────────────
// Layout: HP and LP process → ISO valves → manifold body → EQ valve → instrument
function drawIsoEqIso() {
  var W = 200, H = 116;
  var hpx = 58, lpx = 142;
  var procY = 14;
  var isoY = 44;     // ISO valve center y
  var bodyY = 70;    // manifold body y
  var instrY = 100;  // instrument connection y
  var eqX = 100;     // EQ valve x

  var s = '';

  // Process connection labels & symbols
  s += procConn(hpx, procY, 'HP', 'right');
  s += procConn(lpx, procY, 'LP', 'left');

  // Vertical stems process → ISO valves
  s += pipe(hpx, procY+6, hpx, isoY-7);
  s += pipe(lpx, procY+6, lpx, isoY-7);

  // ISO valves (vertical orientation, flow top→bottom)
  s += valveSym(hpx, isoY, 'iso', 'v');
  s += valveSym(lpx, isoY, 'iso', 'v');

  // Stems ISO → manifold body
  s += pipe(hpx, isoY+7, hpx, bodyY);
  s += pipe(lpx, isoY+7, lpx, bodyY);

  // Manifold body (horizontal)
  s += pipe(hpx, bodyY, lpx, bodyY, '#aaa');

  // EQ valve (horizontal, on body, flow left→right)
  s += valveSym(eqX, bodyY, 'eq', 'h');

  // Stem body → instrument
  s += pipe(eqX, bodyY+1, eqX, instrY-2, '#bbb', true);

  // Instrument
  s += instrConn(eqX, instrY, 80);

  return wrapSvg(W, H, s);
}

// ── Schema: v-iso-eq-iso (4-valve MD41) ──────────────────
// VENT on HP side, 2x ISO, 1 EQ
function drawVIsoEqIso() {
  var W = 200, H = 116;
  var hpx = 58, lpx = 142;
  var ventX = 28;
  var procY = 14;
  var isoY = 44;
  var bodyY = 70;
  var instrY = 100;
  var eqX = 100;

  var s = '';

  s += procConn(hpx, procY, 'HP', 'right');
  s += procConn(lpx, procY, 'LP', 'left');

  // Stems process → ISO valves
  s += pipe(hpx, procY+6, hpx, isoY-7);
  s += pipe(lpx, procY+6, lpx, isoY-7);

  // ISO valves
  s += valveSym(hpx, isoY, 'iso', 'v');
  s += valveSym(lpx, isoY, 'iso', 'v');

  // Stems ISO → body
  s += pipe(hpx, isoY+7, hpx, bodyY);
  s += pipe(lpx, isoY+7, lpx, bodyY);

  // Manifold body
  s += pipe(ventX, bodyY, lpx, bodyY, '#aaa');

  // EQ valve (horizontal)
  s += valveSym(eqX, bodyY, 'eq', 'h');

  // VENT valve (on left end of body, venting up)
  s += valveSym(ventX, bodyY, 'vent', 'v');
  s += ventAtm(ventX, bodyY, 'up');
  s += txt(ventX, bodyY+15, 'VENT', 7, C_VENT);

  // Stem body → instrument
  s += pipe(eqX, bodyY+1, eqX, instrY-2, '#bbb', true);
  s += instrConn(eqX, instrY, 80);

  return wrapSvg(W, H, s);
}

// ── Schema: iso-2v-iso (4-valve MD42/44) ─────────────────
// 2x ISO process valves, 2x VENT on body (level measurement)
function drawIso2VIso() {
  var W = 200, H = 116;
  var hpx = 52, lpx = 148;
  var procY = 14;
  var isoY = 44;
  var bodyY = 70;
  var instrY = 100;
  var vent1X = 82, vent2X = 118;
  var s = '';

  s += procConn(hpx, procY, 'HP', 'right');
  s += procConn(lpx, procY, 'LP', 'left');

  s += pipe(hpx, procY+6, hpx, isoY-7);
  s += pipe(lpx, procY+6, lpx, isoY-7);

  s += valveSym(hpx, isoY, 'iso', 'v');
  s += valveSym(lpx, isoY, 'iso', 'v');

  s += pipe(hpx, isoY+7, hpx, bodyY);
  s += pipe(lpx, isoY+7, lpx, bodyY);

  // Manifold body
  s += pipe(hpx, bodyY, lpx, bodyY, '#aaa');

  // 2x VENT on body
  s += valveSym(vent1X, bodyY, 'vent', 'v');
  s += ventAtm(vent1X, bodyY, 'up');
  s += valveSym(vent2X, bodyY, 'vent', 'v');
  s += ventAtm(vent2X, bodyY, 'up');

  // Instrument between the two vents
  s += pipe(100, bodyY+1, 100, instrY-2, '#bbb', true);
  s += instrConn(100, instrY, 80);

  return wrapSvg(W, H, s);
}

// ── Schema: iso-v-eq-v-iso (5-valve MD51/52) ─────────────
// 2x ISO, 1 EQ, 2x VENT on body
function drawIsoVEqVIso() {
  var W = 200, H = 116;
  var hpx = 44, lpx = 156;
  var procY = 14;
  var isoY = 44;
  var bodyY = 70;
  var instrY = 100;
  var vent1X = 74, eqX = 100, vent2X = 126;
  var s = '';

  s += procConn(hpx, procY, 'HP', 'right');
  s += procConn(lpx, procY, 'LP', 'left');

  s += pipe(hpx, procY+6, hpx, isoY-7);
  s += pipe(lpx, procY+6, lpx, isoY-7);

  s += valveSym(hpx, isoY, 'iso', 'v');
  s += valveSym(lpx, isoY, 'iso', 'v');

  s += pipe(hpx, isoY+7, hpx, bodyY);
  s += pipe(lpx, isoY+7, lpx, bodyY);

  s += pipe(hpx, bodyY, lpx, bodyY, '#aaa');

  // 2x VENT + 1 EQ on body
  s += valveSym(vent1X, bodyY, 'vent', 'v');
  s += ventAtm(vent1X, bodyY, 'up');
  s += valveSym(eqX, bodyY, 'eq', 'h');
  s += valveSym(vent2X, bodyY, 'vent', 'v');
  s += ventAtm(vent2X, bodyY, 'up');

  s += pipe(eqX, bodyY+1, eqX, instrY-2, '#bbb', true);
  s += instrConn(eqX, instrY, 90);

  return wrapSvg(W, H, s);
}

// ── Schema: iso-eq-v-eq-iso (5-valve MD55) ───────────────
// 2x ISO, 2x EQ, 1x VENT (center) on body
function drawIsoEqVEqIso() {
  var W = 200, H = 116;
  var hpx = 44, lpx = 156;
  var procY = 14;
  var isoY = 44;
  var bodyY = 70;
  var instrY = 100;
  var eq1X = 74, ventX = 100, eq2X = 126;
  var s = '';

  s += procConn(hpx, procY, 'HP', 'right');
  s += procConn(lpx, procY, 'LP', 'left');

  s += pipe(hpx, procY+6, hpx, isoY-7);
  s += pipe(lpx, procY+6, lpx, isoY-7);

  s += valveSym(hpx, isoY, 'iso', 'v');
  s += valveSym(lpx, isoY, 'iso', 'v');

  s += pipe(hpx, isoY+7, hpx, bodyY);
  s += pipe(lpx, isoY+7, lpx, bodyY);

  s += pipe(hpx, bodyY, lpx, bodyY, '#aaa');

  // 2x EQ + 1 VENT center on body
  s += valveSym(eq1X, bodyY, 'eq', 'h');
  s += valveSym(ventX, bodyY, 'vent', 'v');
  s += ventAtm(ventX, bodyY, 'up');
  s += valveSym(eq2X, bodyY, 'eq', 'h');

  // Instrument from center (but center is occupied by vent, so offset slightly)
  // Instrument connects from one of the EQ valves
  s += pipe(eq1X, bodyY+1, eq1X, instrY-2, '#bbb', true);
  s += instrConn(eq1X, instrY, 90);

  return wrapSvg(W, H, s);
}

function svgSchema(key) {
  var map = {
    'iso-eq-iso':      drawIsoEqIso,
    'v-iso-eq-iso':    drawVIsoEqIso,
    'iso-2v-iso':      drawIso2VIso,
    'iso-v-eq-v-iso':  drawIsoVEqVIso,
    'iso-eq-v-eq-iso': drawIsoEqVEqIso,
  };
  return (map[key] || drawIsoEqIso)();
}

// ── Helpers ───────────────────────────────────────────────
function AM() { return valveType === 3 ? MODELS3 : valveType === 4 ? MODELS4 : MODELS5; }

function esc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function hasAT() { return ['YP','YG','AP','AG'].indexOf(oper) >= 0; }

function getSteps() {
  var m = AM().find(function(x){ return x.code === model; });
  var s = [{ id: 'valveType' },{ id: 'model' },{ id: 'mat' },{ id: 'conn' }];
  if (m && m.iface && m.iface.length > 1) s.push({ id: 'iface' });
  s.push({ id: 'oper' });
  if (m && m.extras && m.extras.length > 0) s.push({ id: 'extras' });
  if (m && m.outputConn && m.outputConn.length > 0) s.push({ id: 'outputConn' });
  s.push({ id: 'quote' });
  return s;
}

function buildCode() {
  var m = AM().find(function(x){ return x.code === model; });
  if (!m) return '--';
  var p = [model, mat, conn];
  if (m.iface) {
    if (m.iface.length > 1 && iface) p.push(iface);
    else if (m.iface.length === 1) p.push(m.iface[0]);
  }
  if (oper) p.push(oper);
  if (outputConn) p.push(outputConn);
  var skip = ['ATK','BRK'];
  var extStr = Array.from(extras).filter(function(c){ return skip.indexOf(c) < 0; }).map(function(c){ return '.' + c; }).join('');
  return p.filter(Boolean).join('.') + extStr;
}

function buildLabel() {
  var m = AM().find(function(x){ return x.code === model; });
  return (m ? m.name : model) + ' (' + valveType + '-valve)';
}

function buildDetails() {
  var m = AM().find(function(x){ return x.code === model; });
  var allConn = BASE_CONN.concat(Object.values(EXTRA_CONN));
  var ifL = 'N/A';
  if (m && m.iface) {
    if (m.iface.length > 1) ifL = iface || (IFACE[0] || {}).code;
    else ifL = m.iface[0];
  }
  var skip = ['ATK','BRK'];
  var extStr = Array.from(extras).filter(function(c){ return skip.indexOf(c) < 0; }).join(', ') || 'None';
  return {
    valveType: valveType + '-valve',
    model: model, modelName: (m || {}).name || '',
    material: mat, materialName: ((MATERIALS.find(function(x){ return x.code === mat; }) || {}).name || ''),
    conn: conn, connName: ((allConn.find(function(x){ return x.code === conn; }) || {}).name || ''),
    iface: ifL, oper: oper, operName: ((OPER.find(function(x){ return x.code === oper; }) || {}).name || ''),
    extras: extStr, outputConn: outputConn || 'None',
    atk: extras.has('ATK'), brk: extras.has('BRK'), remarks: remarks,
  };
}

function canNext() {
  var steps = getSteps(), s = steps[step];
  if (!s) return false;
  if (s.id === 'valveType')  return valveType !== null;
  if (s.id === 'model')      return !!model;
  if (s.id === 'mat')        return !!mat;
  if (s.id === 'conn')       return !!conn;
  if (s.id === 'iface')      return !!iface;
  if (s.id === 'oper')       return !!oper;
  if (s.id === 'extras' || s.id === 'outputConn') return true;
  if (s.id === 'quote')      return !!(contact.name && contact.email && contact.company);
  return false;
}

var STEP_TITLES = {
  valveType: 'Valve count', model: 'Model', mat: 'Material',
  conn: 'Process connector', iface: 'Instrument interface',
  oper: 'Valve operation', extras: 'Options',
  outputConn: 'Output connector', quote: 'Review & quote',
};

// ── Render ────────────────────────────────────────────────
function render() {
  var prog  = document.getElementById('prog');
  var lbl   = document.getElementById('prog-label');
  var pill  = document.getElementById('code-pill');
  var ct    = document.getElementById('ct');

  if (productType === null) {
    prog.innerHTML = ''; lbl.textContent = ''; pill.style.opacity = '0';
    renderLanding(ct); return;
  }
  if (productType !== 'manifold') {
    prog.innerHTML = ''; lbl.textContent = ''; pill.style.opacity = '0';
    renderComingSoon(ct); return;
  }

  var steps = getSteps();
  prog.innerHTML = steps.map(function(_, i) {
    var c = 'ps' + (i < step ? ' done' : i === step ? ' active' : '');
    return '<div class="' + c + '"></div>';
  }).join('');

  if (step < steps.length) {
    lbl.textContent = 'Step ' + (step+1) + ' of ' + steps.length + '  —  ' + (STEP_TITLES[steps[step].id] || '');
    var c = buildCode();
    if (c !== '--' && step > 1) { pill.textContent = c; pill.style.opacity = '1'; }
    else pill.style.opacity = '0';
  } else {
    lbl.textContent = ''; pill.style.opacity = '0';
  }

  if (submitted) { renderDone(ct); return; }
  var s = steps[step];
  if (!s) { renderQuotePage(ct); return; }
  var fns = {
    valveType: renderValveType, model: renderModel, mat: renderMat,
    conn: renderConn, iface: renderIface, oper: renderOper,
    extras: renderExtras, outputConn: renderOutputConn, quote: renderQuotePage,
  };
  (fns[s.id] || renderValveType)(ct);
}

function navHtml(backOff, nextLabel, nextOff) {
  return '<div class="nav">' +
    '<button class="btn" onclick="goBack()" ' + (backOff ? 'disabled' : '') + '>&#8592; Back</button>' +
    '<button class="btn pri" onclick="goNext()" ' + (nextOff ? 'disabled' : '') + '>' + nextLabel + '</button>' +
  '</div>';
}

// ── Landing ───────────────────────────────────────────────
function renderLanding(ct) {
  var items = [
    { id: 'isovent',    icon: '&#x1F527;', name: 'Isovent',       sub: 'Isolation & vent valves' },
    { id: 'needlevalve',icon: '&#x1F39A;', name: 'Needle valve',   sub: 'Flow control needle valves' },
    { id: 'multiport',  icon: '&#x1F500;', name: 'Multiport',      sub: 'Multiport valve assemblies' },
    { id: 'manifold',   icon: '&#x2699;&#xFE0F;', name: 'Manifold', sub: '3, 4 & 5 valve manifolds', live: true },
    { id: 'monoflange', icon: '&#x1F529;', name: 'Monoflange',     sub: 'Single block & bleed valves' },
    { id: 'other',      icon: '&#x1F4AC;', name: 'Something else', sub: 'Other products & custom solutions' },
  ];
  var cards = items.map(function(p) {
    var badge = p.live ? '<div class="live-badge">LIVE</div>' : '';
    return '<div class="lcard" onclick="selProduct(\'' + p.id + '\')">' +
      '<div class="licon">' + p.icon + '</div>' +
      '<div class="lname">' + p.name + '</div>' +
      '<div class="lsub">' + p.sub + '</div>' + badge + '</div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">What would you like to configure?</div>' +
    '<div class="sdesc">Select a product category to get started with the configurator.</div>' +
    '<div class="landing-grid">' + cards + '</div></div>';
}

function renderComingSoon(ct) {
  var names = { isovent: 'Isovent', needlevalve: 'Needle valve', multiport: 'Multiport', monoflange: 'Monoflange' };
  if (productType === 'other') {
    ct.innerHTML = '<div class="card">' +
      '<div class="stitle">Product enquiry</div>' +
      '<div class="sdesc">Describe what you are looking for and our team will recommend the right solution.</div>' +
      '<div class="form-group"><label>Your enquiry</label>' +
        '<textarea id="other-remarks" placeholder="e.g. I am looking for a custom valve assembly..." style="min-height:120px;" oninput="remarks=this.value">' + esc(remarks) + '</textarea>' +
      '</div>' +
      '<div class="sec-title" style="margin-top:.5rem;">Contact details</div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Full name *</label><input placeholder="John Smith" value="' + esc(contact.name) + '" oninput="upC(\'name\',this.value)"></div>' +
        '<div class="form-group"><label>Company *</label><input placeholder="Company B.V." value="' + esc(contact.company) + '" oninput="upC(\'company\',this.value)"></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Phone</label><input placeholder="+31 6 12345678" value="' + esc(contact.phone) + '" oninput="upC(\'phone\',this.value)"></div>' +
        '<div class="form-group"><label>Email *</label><input type="email" placeholder="you@company.com" value="' + esc(contact.email) + '" oninput="upC(\'email\',this.value)"></div>' +
      '</div>' +
      (sendError ? '<div class="err-msg">' + sendError + '</div>' : '') +
      '<div class="nav">' +
        '<button class="btn" onclick="selProduct(null)">&#8592; Back</button>' +
        '<button class="btn pri" onclick="sendOtherEnquiry()" id="send-other-btn" ' +
          ((contact.name && contact.email && contact.company && remarks) ? '' : 'disabled') + '>Send enquiry</button>' +
      '</div></div>';
    return;
  }
  var nm = names[productType] || 'This product';
  ct.innerHTML = '<div class="card" style="text-align:center;padding:2.5rem 1.5rem;">' +
    '<div style="font-size:40px;margin-bottom:1rem;">&#x1F6A7;</div>' +
    '<div class="stitle" style="margin-bottom:.5rem;">' + nm + ' configurator coming soon</div>' +
    '<p style="font-size:13px;color:#666;margin-bottom:1.5rem;line-height:1.6;">Contact us directly and we\'ll help you configure the right product.</p>' +
    '<div style="display:flex;gap:10px;justify-content:center;">' +
    '<button class="btn" onclick="selProduct(null)">&#8592; Back</button>' +
    '<a href="mailto:ricky.jongenelen@multi-instruments.com" style="text-decoration:none;"><button class="btn pri">Contact us</button></a>' +
    '</div></div>';
}

// ── Step renderers ────────────────────────────────────────
function renderValveType(ct) {
  var items = [
    { n: 3, sub: 'Double isolate + equalize' },
    { n: 4, sub: 'Isolate + equalize + vent' },
    { n: 5, sub: 'Double equalize/vent' },
  ];
  var cards = items.map(function(t) {
    return '<div class="tcard' + (valveType === t.n ? ' sel' : '') + '" onclick="selVT(' + t.n + ')">' +
      '<div class="tc-num">' + t.n + '</div>' +
      '<div class="tc-label">' + t.n + '-valve</div>' +
      '<div class="tc-sub">' + t.sub + '</div></div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Select valve count</div>' +
    '<div class="sdesc">Choose the number of valves your application requires.</div>' +
    '<div class="type-grid">' + cards + '</div>' + navHtml(false, 'Next &#8594;', !canNext()) + '</div>';
}

function renderModel(ct) {
  var legend = '<div class="legend">' +
    '<span style="font-size:12px;color:#555;font-weight:600;">Valve legend:</span>' +
    '<span class="legend-item"><span class="legend-dot" style="background:'+C_ISO+'"></span>Isolate</span>' +
    '<span class="legend-item"><span class="legend-dot" style="background:'+C_EQ+'"></span>Equalize</span>' +
    '<span class="legend-item"><span class="legend-dot" style="background:'+C_VENT+'"></span>Vent</span>' +
  '</div>';
  var cards = AM().map(function(m) {
    return '<div class="oc' + (model === m.code ? ' sel' : '') + '" onclick="selModel(\'' + m.code + '\')">' +
      '<div class="cc">' + m.code + '</div><div class="cdiv"></div>' +
      '<div class="cn">' + m.name + '</div>' +
      '<div class="cs">' + m.sub + '</div>' +
      '<div class="valve-schema">' + svgSchema(m.schema) + '</div>' +
    '</div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Select model</div>' +
    legend + '<div class="og">' + cards + '</div>' + navHtml(false, 'Next &#8594;', !canNext()) + '</div>';
}

function renderMat(ct) {
  var cards = MATERIALS.map(function(o) {
    return '<div class="oc2' + (mat === o.code ? ' sel' : '') + '" onclick="selMat(\'' + o.code + '\')">' +
      '<div class="cc">' + o.code + '</div><div class="cn">' + o.name + '</div><div class="cs">' + o.sub + '</div></div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Select material</div>' +
    '<div class="sdesc">Wetted parts material. All materials NACE MR01-75 compliant.</div>' +
    '<div class="og2">' + cards + '</div>' + navHtml(false, 'Next &#8594;', !canNext()) + '</div>';
}

function renderConn(ct) {
  var m = AM().find(function(x){ return x.code === model; });
  var all = BASE_CONN.concat((m.extraConn || []).map(function(c){ return EXTRA_CONN[c]; }));
  var cards = all.map(function(o) {
    return '<div class="oc2' + (conn === o.code ? ' sel' : '') + '" onclick="selConn(\'' + o.code + '\')">' +
      '<div class="cc">' + o.code + '</div><div class="cn">' + o.name + '</div><div class="cs">' + o.sub + '</div></div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Select process connector</div>' +
    '<div class="sdesc">Connection type and size for the process side.</div>' +
    '<div class="og2">' + cards + '</div>' + navHtml(false, 'Next &#8594;', !canNext()) + '</div>';
}

function renderIface(ct) {
  var m = AM().find(function(x){ return x.code === model; });
  var opts = IFACE.filter(function(o){ return m.iface.indexOf(o.code) >= 0; });
  var cards = opts.map(function(o) {
    return '<div class="oc2' + (iface === o.code ? ' sel' : '') + '" onclick="selIface(\'' + o.code + '\')">' +
      '<div class="cc">' + o.code + '</div><div class="cn">' + o.name + '</div><div class="cs">' + o.sub + '</div></div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Select transmitter interface</div>' +
    '<div class="sdesc">Mounting interface on the instrument side.</div>' +
    '<div class="og2">' + cards + '</div>' + navHtml(false, 'Next &#8594;', !canNext()) + '</div>';
}

function renderOper(ct) {
  var cards = OPER.map(function(o) {
    return '<div class="oc2' + (oper === o.code ? ' sel' : '') + '" onclick="selOper(\'' + o.code + '\')">' +
      '<div class="cc">' + o.code + '</div><div class="cn">' + o.name + '</div><div class="cs">' + o.sub + '</div></div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Valve operation & packing</div>' +
    '<div class="sdesc">Mixed mode: isolate valves are T-bar, equalize/vent valves are Anti-tamper.</div>' +
    '<div class="note">PTFE: max 200°C &nbsp;|&nbsp; Graphite: max 450°C &nbsp;|&nbsp; Max pressure: 420 Bar (316SS), up to 680 Bar with HP option</div>' +
    '<div class="og2">' + cards + '</div>' + navHtml(false, 'Next &#8594;', !canNext()) + '</div>';
}

function renderExtras(ct) {
  var m = AM().find(function(x){ return x.code === model; });
  var opts = (m.extras || []).map(function(c){ return EXTRA_OPTS[c]; }).filter(Boolean);
  var rows = opts.map(function(o) {
    return '<div class="chk-row' + (extras.has(o.code) ? ' sel' : '') + '" onclick="togExtra(\'' + o.code + '\')">' +
      '<div class="chkbox"></div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#111;">' + o.name +
        '<span class="chk-code">' + o.code + '</span></div>' +
        '<div style="font-size:11px;color:#888;margin-top:2px;">' + o.sub + '</div>' +
      '</div></div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Additional options</div>' +
    '<div class="sdesc">All options are optional. Filling/test connectors include the test port.</div>' +
    rows + '<div style="height:.75rem;"></div>' + navHtml(false, 'Next &#8594;', false) + '</div>';
}

function renderOutputConn(ct) {
  var m = AM().find(function(x){ return x.code === model; });
  var opts = (m.outputConn || []).map(function(c){ return OUTPUT_CONN[c]; }).filter(Boolean);
  var rows = opts.map(function(o) {
    return '<div class="chk-row' + (outputConn === o.code ? ' sel' : '') + '" onclick="togOut(\'' + o.code + '\')">' +
      '<div class="chkbox"></div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#111;">' + o.name +
        '<span class="chk-code">' + o.code + '</span></div>' +
        '<div style="font-size:11px;color:#888;margin-top:2px;">' + o.sub + '</div>' +
      '</div></div>';
  }).join('');
  ct.innerHTML = '<div class="card"><div class="stitle">Output connector <span style="font-size:12px;font-weight:400;color:#888;">(optional)</span></div>' +
    '<div class="sdesc">Select an output connector for the instrument side, or skip to continue.</div>' +
    rows + '<div style="height:.75rem;"></div>' + navHtml(false, 'Next &#8594;', false) + '</div>';
}

function renderQuotePage(ct) {
  var code = buildCode();
  var m = AM().find(function(x){ return x.code === model; });
  var allConn = BASE_CONN.concat(Object.values(EXTRA_CONN));
  var ifL = 'N/A — remote mount';
  if (m && m.iface) {
    if (m.iface.length > 1) ifL = iface ? ((IFACE.find(function(x){ return x.code === iface; }) || {}).name || iface) : '--';
    else ifL = ((IFACE.find(function(x){ return m.iface && x.code === m.iface[0]; }) || {}).name || '');
  }
  var skip = ['ATK','BRK'];
  var bp = [model, mat, conn];
  if (m && m.iface) {
    if (m.iface.length > 1 && iface) bp.push(iface);
    else if (m.iface && m.iface.length === 1) bp.push(m.iface[0]);
  }
  if (oper) bp.push(oper);
  if (outputConn) bp.push(outputConn);
  var segs = bp.filter(Boolean).map(function(p){ return '<span class="seg">' + p + '</span>'; }).join('');
  extras.forEach(function(c){ if (skip.indexOf(c) < 0) segs += '<span class="seg o">' + c + '</span>'; });
  var extStr = Array.from(extras).filter(function(c){ return skip.indexOf(c) < 0; }).join(', ') || 'None';
  var rows = [
    ['Valve type', valveType + '-valve manifold'],
    ['Model', model + ' — ' + ((m || {}).name || '')],
    ['Material', ((MATERIALS.find(function(x){ return x.code === mat; }) || {}).name || '--')],
    ['Process connection', ((allConn.find(function(x){ return x.code === conn; }) || {}).name || '--')],
    ['Instrument interface', ifL],
    ['Valve operation', ((OPER.find(function(x){ return x.code === oper; }) || {}).name || '--')],
    ['Additional options', extStr],
    ['Output connector', outputConn || 'None'],
  ].map(function(r){ return '<tr><td>' + r[0] + '</td><td style="font-weight:600">' + r[1] + '</td></tr>'; }).join('');

  var listHtml = '';
  if (quoteList.length > 0) {
    var items = quoteList.map(function(item, i) {
      return '<div class="quote-item">' +
        '<div class="quote-item-num">' + (i+1) + '</div>' +
        '<div style="flex:1">' +
          '<div class="quote-item-code">' + item.code + '</div>' +
          '<div style="font-size:11px;color:#888;">' + item.label + ' &nbsp;&bull;&nbsp; qty: ' + item.qty + '</div>' +
        '</div>' +
        '<button class="quote-item-del" onclick="removeItem(' + i + ')" title="Remove">&#10005;</button>' +
      '</div>';
    }).join('');
    listHtml = '<div class="sec-title">Items already in quote (' + quoteList.length + ')</div>' +
      '<div class="quote-list">' + items + '</div>';
  }

  var atkRow = hasAT()
    ? '<div class="chk-row' + (extras.has('ATK') ? ' sel' : '') + '" onclick="togExtra(\'ATK\')">' +
        '<div class="chkbox"></div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:#111;">Anti-tamper key' +
        '<span class="chk-code">ATK</span></div><div style="font-size:11px;color:#888;margin-top:2px;">Key to operate anti-tamper valves</div></div></div>'
    : '<p style="font-size:12px;color:#aaa;font-style:italic;margin-bottom:8px;">Anti-tamper key not applicable for TP / TG valve operation.</p>';
  var brkRow = '<div class="chk-row' + (extras.has('BRK') ? ' sel' : '') + '" onclick="togExtra(\'BRK\')">' +
    '<div class="chkbox"></div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:#111;">Mounting bracket' +
    '<span class="chk-code">BRK</span></div><div style="font-size:11px;color:#888;margin-top:2px;">Bracket model TBD — confirmed in quote</div></div></div>';

  ct.innerHTML =
    listHtml +
    '<div class="result-card">' +
      '<div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:.5rem;">Model code</div>' +
      '<div class="rcode">' + code + '</div>' +
      '<div class="segs">' + segs + '</div>' +
      '<table class="st">' + rows + '</table>' +
    '</div>' +
    '<div class="card">' +
      '<div class="sec-title">Quantity</div>' +
      '<div class="qty-row">' +
        '<button class="qty-btn" onclick="chgQty(-1)">&#8722;</button>' +
        '<input class="qty-input" id="qty-inp" type="number" min="1" value="' + qty + '" oninput="setQty(this.value)">' +
        '<button class="qty-btn" onclick="chgQty(1)">+</button>' +
        '<span style="font-size:13px;color:#888;">pieces</span>' +
      '</div>' +
      '<div class="sec-title">Accessories</div>' +
      atkRow + brkRow +
      '<div style="height:.75rem;"></div>' +
      '<div class="sec-title">Contact details</div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Full name *</label><input placeholder="John Smith" value="' + esc(contact.name) + '" oninput="upC(\'name\',this.value)"></div>' +
        '<div class="form-group"><label>Company *</label><input placeholder="Company B.V." value="' + esc(contact.company) + '" oninput="upC(\'company\',this.value)"></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="form-group"><label>Phone</label><input placeholder="+31 6 12345678" value="' + esc(contact.phone) + '" oninput="upC(\'phone\',this.value)"></div>' +
        '<div class="form-group"><label>Email *</label><input type="email" placeholder="you@company.com" value="' + esc(contact.email) + '" oninput="upC(\'email\',this.value)"></div>' +
      '</div>' +
      '<div class="form-group"><label>Remarks / questions</label>' +
        '<textarea placeholder="Specific requirements, questions or remarks..." oninput="remarks=this.value">' + esc(remarks) + '</textarea>' +
      '</div>' +
      (sendError ? '<div class="err-msg">' + sendError + '</div>' : '') +
      '<div class="nav">' +
        '<button class="btn" onclick="goBack()">&#8592; Back</button>' +
        '<button class="btn pri" id="send-btn" onclick="sendQuote()" ' + (canNext() && !sending ? '' : 'disabled') + '>' +
          (sending ? 'Sending…' : 'Send quote request') +
        '</button>' +
        '<button class="btn" onclick="addAndConfigure()">+ Add another model</button>' +
        '<button class="btn danger" onclick="reset()">Start over</button>' +
      '</div>' +
    '</div>';
}

function renderDone(ct) {
  var listHtml = '';
  if (quoteList.length > 0) {
    var items = quoteList.map(function(item, i) {
      return '<div class="quote-item">' +
        '<div class="quote-item-num">' + (i+1) + '</div>' +
        '<div style="flex:1">' +
          '<div class="quote-item-code">' + item.code + '</div>' +
          '<div style="font-size:11px;color:#888;">' + item.label +
            ' &nbsp;&bull;&nbsp; qty: ' + item.qty +
            (item.details.atk ? ' &nbsp;&bull;&nbsp; ATK' : '') +
            (item.details.brk ? ' &nbsp;&bull;&nbsp; BRK' : '') +
          '</div>' +
        '</div></div>';
    }).join('');
    listHtml = '<div class="sec-title" style="margin-bottom:.75rem;">Items in this quote (' + quoteList.length + ')</div>' +
      '<div class="quote-list">' + items + '</div>';
  }
  ct.innerHTML = '<div class="card"><div class="success-wrap">' +
    '<div class="success-icon"></div>' +
    '<h3>Quote request sent!</h3>' +
    '<p>Your request has been sent to Multi Instruments.<br>We will reach out to <strong>' + esc(contact.email) + '</strong> shortly.</p>' +
    '</div>' + listHtml +
    '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding-bottom:1rem;">' +
    '<button class="btn pri" onclick="reset()">Start over</button>' +
    '<button class="btn" onclick="configureAnother()">+ Configure another</button>' +
    '</div></div>';
}

// ── Actions ───────────────────────────────────────────────
function sendOtherEnquiry() {
  if (!contact.name || !contact.email || !contact.company || !remarks) return;
  sending = true; sendError = ''; render();
  setTimeout(function(){ sending = false; submitted = true; render(); }, 900);
}

function sendQuote() {
  if (!canNext() || sending) return;
  quoteList.push({ code: buildCode(), label: buildLabel(), qty: qty, details: buildDetails() });
  sending = true; sendError = ''; render();
  setTimeout(function(){ sending = false; submitted = true; render(); }, 900);
}

function addAndConfigure() {
  quoteList.push({ code: buildCode(), label: buildLabel(), qty: qty, details: buildDetails() });
  step = 0; valveType = null; model = null; mat = null; conn = null;
  iface = null; oper = null; qty = 1; outputConn = null;
  extras = new Set(); remarks = ''; submitted = false; sending = false; sendError = '';
  render();
}

function removeItem(idx) { quoteList.splice(idx, 1); render(); }

function reset() {
  productType = null; step = 0; valveType = null; model = null; mat = null;
  conn = null; iface = null; oper = null; qty = 1; outputConn = null;
  extras = new Set(); remarks = '';
  contact = { name: '', company: '', phone: '', email: '' };
  submitted = false; sending = false; sendError = ''; quoteList = [];
  render();
}

function configureAnother() {
  step = 0; valveType = null; model = null; mat = null; conn = null;
  iface = null; oper = null; qty = 1; outputConn = null;
  extras = new Set(); remarks = ''; submitted = false; sending = false; sendError = '';
  render();
}

function selProduct(id) {
  productType = id;
  if (id === 'manifold') {
    step = 0; valveType = null; model = null; mat = null; conn = null;
    iface = null; oper = null; qty = 1; outputConn = null; extras = new Set(); remarks = '';
  }
  render();
}
function selVT(v) { valveType = v; model = null; mat = null; conn = null; iface = null; oper = null; outputConn = null; extras = new Set(); render(); }
function selModel(c) {
  model = c; mat = null; conn = null; iface = null; oper = null; outputConn = null; extras = new Set();
  var m = AM().find(function(x){ return x.code === c; });
  if (m && m.iface && m.iface.length === 1) iface = m.iface[0];
  render();
}
function selMat(c)   { mat   = c; render(); }
function selConn(c)  { conn  = c; render(); }
function selIface(c) { iface = c; render(); }
function selOper(c)  { oper  = c; render(); }
function togExtra(c) { if (extras.has(c)) extras.delete(c); else extras.add(c); render(); }
function togOut(c)   { outputConn = outputConn === c ? null : c; render(); }
function chgQty(d)   { qty = Math.max(1, qty + d); var el = document.getElementById('qty-inp'); if (el) el.value = qty; }
function setQty(v)   { qty = Math.max(1, parseInt(v) || 1); }

function upC(k, v) {
  contact[k] = v;
  var b = document.getElementById('send-btn');
  if (b) b.disabled = !canNext() || sending;
  var b2 = document.getElementById('send-other-btn');
  if (b2) b2.disabled = !(contact.name && contact.email && contact.company && remarks);
}

function goNext() {
  var steps = getSteps(), s = steps[step];
  if (canNext() || s.id === 'extras' || s.id === 'outputConn') { step++; render(); }
}
function goBack() { if (step > 0) { step--; render(); } }
