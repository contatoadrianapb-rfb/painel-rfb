:root{
  --p:#7F77DD;--pl:#EEEDFE;--pd:#3C3489;
  --t:#1D9E75;--tl:#E1F5EE;--td:#085041;
  --am:#BA7517;--al:#FAEEDA;
  --r:#E24B4A;--rl:#FCEBEB;--rd:#791F1F;
  --g:#639922;--gl:#EAF3DE;--gd:#27500A;
  --tx:#1a1a18;--t2:#5F5E5A;--t3:#888780;
  --bo:rgba(0,0,0,.10);--bm:rgba(0,0,0,.18);
  --bg:#FAFAF8;--cb:#FFFFFF;--ra:12px;--rs:8px;
}
@media(prefers-color-scheme:dark){
  :root{
    --bg:#18181A;--cb:#222224;--tx:#F0EFE8;--t2:#A8A7A0;--t3:#666662;
    --bo:rgba(255,255,255,.08);--bm:rgba(255,255,255,.14);
    --pl:#2A2840;--tl:#1A2E28;--al:#2E2210;--rl:#2E1818;--gl:#1A2610;
  }
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;line-height:1.6}

/* Header */
.hdr{border-bottom:1px solid var(--bo);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:56px;background:var(--cb);position:sticky;top:0;z-index:10;flex-wrap:wrap;gap:8px}
.hl{display:flex;align-items:center;gap:12px}
.lm{width:28px;height:28px;border-radius:8px;background:var(--p);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ht{font-size:14px;font-weight:600;letter-spacing:-.01em}
.hs{font-size:11px;color:var(--t3)}

/* Aviso global de edital desatualizado */
.edital-banner{background:var(--al);border-bottom:1px solid var(--bo);padding:8px 2rem;font-size:12px;color:var(--am);display:none;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.edital-banner.show{display:flex}
.edital-banner button{font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid var(--am);background:transparent;color:var(--am);cursor:pointer}

.main{max-width:980px;margin:0 auto;padding:1.5rem 1.5rem 4rem}

/* Tabs */
.tabs{display:flex;gap:4px;margin-bottom:1.5rem;border-bottom:1px solid var(--bo);overflow-x:auto;scrollbar-width:thin}
.tab{font-size:13px;padding:8px 14px;border:none;background:none;color:var(--t3);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;font-weight:500;transition:color .15s,border-color .15s;white-space:nowrap;display:flex;align-items:center;gap:6px}
.tab:hover{color:var(--tx)}
.tab.active{color:var(--pd);border-bottom-color:var(--p)}
.tab-badge{background:var(--r);color:#fff;font-size:10px;font-weight:700;border-radius:20px;padding:1px 6px;line-height:1.4}
.view{display:none}.view.active{display:block}

/* Metric cards */
.mg{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px;margin-bottom:1.5rem}
.mc{background:var(--cb);border:1px solid var(--bo);border-radius:var(--rs);padding:14px 16px}
.ml{font-size:11px;color:var(--t3);font-weight:500;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}
.mv{font-size:24px;font-weight:700;letter-spacing:-.02em;line-height:1}
.ms{font-size:11px;color:var(--t3);margin-top:4px}

/* Generic card */
.card{background:var(--cb);border:1px solid var(--bo);border-radius:var(--ra);padding:18px 20px;margin-bottom:14px}
.ct{font-size:13px;font-weight:600;margin-bottom:14px}

/* Forms */
.fr{display:grid;gap:8px;margin-bottom:10px;grid-template-columns:2fr 1.9fr .75fr .75fr .85fr auto;align-items:center}
@media(max-width:700px){.fr{grid-template-columns:1fr 1fr}}
select,input[type=text],input[type=number],textarea{width:100%;border:1px solid var(--bm);border-radius:var(--rs);background:var(--bg);color:var(--tx);font-size:13px;padding:0 10px;outline:none;transition:border-color .15s;font-family:inherit}
select,input[type=text],input[type=number]{height:36px}
textarea{padding:10px;min-height:70px;resize:vertical;line-height:1.5}
select:focus,input:focus,textarea:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(127,119,221,.12)}
label{font-size:12px;color:var(--t2);font-weight:500;display:block;margin-bottom:5px}
.field{margin-bottom:12px}

.btn{height:36px;padding:0 16px;border-radius:var(--rs);border:1px solid var(--bm);font-size:13px;font-weight:500;cursor:pointer;background:var(--cb);color:var(--tx);white-space:nowrap;transition:background .15s}
.btn:hover{background:rgba(0,0,0,.03)}
.btn-p{background:var(--p);border-color:var(--p);color:#fff}
.btn-p:hover{background:var(--pd)}
.btn-danger{color:var(--rd);border-color:var(--r)}
.btn-danger:hover{background:var(--rl)}
.btn-sm{height:28px;padding:0 10px;font-size:12px}
.hint{font-size:11px;color:var(--t3);margin-bottom:1rem;line-height:1.5}

/* Alerts */
.alert{border-left:3px solid var(--r);background:var(--rl);border-radius:0 var(--rs) var(--rs) 0;padding:10px 14px;margin-bottom:1rem;display:none}
.alert p{font-size:12px;color:var(--rd);line-height:1.5}
.succ{border-left:3px solid var(--g);background:var(--gl);border-radius:0 var(--rs) var(--rs) 0;padding:10px 14px;margin-bottom:1rem;display:none}
.succ p{font-size:12px;color:var(--gd)}
.warn-box{border-left:3px solid var(--am);background:var(--al);border-radius:0 var(--rs) var(--rs) 0;padding:12px 14px;margin-bottom:1rem}
.warn-box p{font-size:12px;color:var(--am);line-height:1.5}
.warn-box .actions{margin-top:8px;display:flex;gap:8px}

/* Tables */
table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}
th{font-size:11px;font-weight:600;color:var(--t3);text-align:left;padding:6px 8px;border-bottom:1px solid var(--bo);text-transform:uppercase;letter-spacing:.03em}
td{padding:8px 8px;border-bottom:1px solid var(--bo);color:var(--tx);vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(0,0,0,.02)}

/* Progress bars */
.bw{display:flex;align-items:center;gap:8px}
.bb{flex:1;height:6px;background:var(--bo);border-radius:3px;overflow:hidden;position:relative;min-width:30px}
.bf{height:100%;border-radius:3px;transition:width .4s ease}
.bp{font-size:12px;font-weight:600;min-width:36px;text-align:right}
.badge{font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;white-space:nowrap}
.bok{background:var(--gl);color:var(--gd)}
.bwn{background:var(--al);color:var(--am)}
.bda{background:var(--rl);color:var(--rd)}
.del-btn{background:none;border:none;cursor:pointer;color:var(--t3);font-size:18px;padding:0 4px;line-height:1}
.del-btn:hover{color:var(--r)}

.mr2{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.mn{font-size:12px;min-width:180px;flex-shrink:0}
.mb2{flex:1;height:8px;background:var(--bo);border-radius:4px;overflow:hidden;position:relative}
.mf{height:100%;border-radius:4px;transition:width .4s ease}
.mp{font-size:12px;font-weight:600;min-width:38px;text-align:right}
.mq{font-size:11px;color:var(--t3);min-width:42px;text-align:right}

/* Cronograma blocks */
.cb2{border-left:3px solid var(--p);background:var(--pl);border-radius:0 var(--rs) var(--rs) 0;padding:10px 14px;margin-bottom:8px}
.cd{font-size:11px;font-weight:700;color:var(--pd);margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em}
.ck{font-size:13px;font-weight:500;margin-bottom:2px}
.ci{font-size:12px;color:var(--t2)}

.wr{display:flex;align-items:center;gap:10px;margin-bottom:1.2rem;flex-wrap:wrap}
.wr select{max-width:220px}
.sep{height:1px;background:var(--bo);margin:1.2rem 0}
.rt{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--t3);margin-bottom:10px}
.sr{display:flex;align-items:flex-start;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bo);font-size:13px;gap:8px}
.sr:last-child{border-bottom:none}
.ttag{display:inline-block;font-size:10px;padding:2px 7px;border-radius:20px;background:var(--rl);color:var(--rd);font-weight:500;margin:2px 3px 2px 0}
.empty{text-align:center;padding:2rem;color:var(--t3);font-size:13px}

/* Flashcards */
.fc-card{background:var(--cb);border:1px solid var(--bo);border-radius:var(--ra);padding:20px;margin-bottom:14px}
.fc-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;gap:10px}
.fc-tag{font-size:11px;color:var(--pd);background:var(--pl);padding:3px 9px;border-radius:20px;font-weight:500}
.fc-question{font-size:15px;font-weight:600;margin-bottom:14px;line-height:1.5}
.fc-reveal-btn{margin-bottom:12px}
.fc-answer{background:var(--bg);border-radius:var(--rs);padding:14px;margin-bottom:10px;display:none}
.fc-answer.show{display:block}
.fc-answer-label{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}
.fc-answer-text{font-size:14px;margin-bottom:10px;line-height:1.5}
.fc-explain{font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:8px}
.fc-link{font-size:12px;color:var(--p);text-decoration:none}
.fc-link:hover{text-decoration:underline}
.fc-actions{display:flex;gap:10px;margin-top:14px}
.fc-btn-acertei{flex:1;background:var(--gl);color:var(--gd);border:1px solid var(--g);border-radius:var(--rs);padding:10px;font-size:13px;font-weight:600;cursor:pointer}
.fc-btn-acertei:hover{background:var(--g);color:#fff}
.fc-btn-errei{flex:1;background:var(--rl);color:var(--rd);border:1px solid var(--r);border-radius:var(--rs);padding:10px;font-size:13px;font-weight:600;cursor:pointer}
.fc-btn-errei:hover{background:var(--r);color:#fff}
.fc-status-row{display:flex;gap:10px;font-size:11px;color:var(--t3);margin-top:10px;flex-wrap:wrap}
.fc-status-pill{padding:2px 8px;border-radius:20px;font-weight:500}
.status-novo{background:var(--pl);color:var(--pd)}
.status-em_repeticao{background:var(--al);color:var(--am)}
.status-maduro{background:var(--gl);color:var(--gd)}

.fc-list-item{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bo);gap:10px}
.fc-list-item:last-child{border-bottom:none}
.fc-list-info{flex:1;min-width:0}
.fc-list-q{font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fc-list-meta{font-size:11px;color:var(--t3);margin-top:2px}

/* Admin */
.admin-materia{border:1px solid var(--bo);border-radius:var(--rs);margin-bottom:10px;overflow:hidden}
.admin-materia-header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--bg);cursor:pointer}
.admin-materia-title{font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}
.admin-materia-body{padding:12px 14px;display:none}
.admin-materia-body.open{display:block}
.admin-topico-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.admin-topico-row input{flex:1}
.chevron{transition:transform .2s;font-size:11px;color:var(--t3)}
.chevron.open{transform:rotate(90deg)}

.empty-icon{font-size:32px;margin-bottom:8px;opacity:.4}
