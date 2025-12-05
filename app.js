(function(){
  const $ = s=>document.querySelector(s);
  const fmt = n=>(typeof n==="number"&&isFinite(n)?Math.round(n*10)/10:n);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)*(x-m))));};
  const now=()=>performance.now();
  const sleep = ms => new Promise(r=>setTimeout(r,ms));

  function show(el){el.classList.remove("hide");}
  function hide(el){el.classList.add("hide");}

  // MODE TOGGLE & APP / ABOUT CARDS
  const modeCard=$("#modeCard"), tmdRoot=$("#tmdRoot"), fratRoot=$("#fratRoot");
  const goTmdBtn=$("#goTmdBtn"), goFratBtn=$("#goFratBtn");
  const tmdHome=$("#tmdHome"), tmdInfoCard=$("#tmdInfoCard");
  const tmdInfoBtn=$("#tmdInfoBtn"), tmdInfoBackBtn=$("#tmdInfoBackBtn");

  const appInfoLink=$("#appInfoLink"), appInfoCard=$("#appInfoCard"), appInfoBackBtn=$("#appInfoBackBtn");
  const aboutAppLink=$("#aboutAppLink"), aboutAppCard=$("#aboutAppCard"), aboutAppBackBtn=$("#aboutAppBackBtn");
  const aboutOstCard=$("#aboutOstCard");
  const aboutOstBackBtn=$("#aboutOstBackBtn");

  function goMain(){
    hide(tmdRoot);
    hide(fratRoot);
    hide(appInfoCard);
    hide(aboutAppCard);
    hide(aboutOstCard);
    show(modeCard);
  }

  goTmdBtn.addEventListener("click",()=>{
    hide(modeCard);
    hide(appInfoCard);
    hide(aboutAppCard);
    hide(aboutOstCard);
    fratRoot.classList.add("hide");
    tmdRoot.classList.remove("hide");
    show(tmdHome);
    hide(tmdInfoCard);
    hide($("#testCard"));
    hide($("#resultCard"));
    hide($("#baselineCard"));
    hide($("#tmdMenu"));
  });

  goFratBtn.addEventListener("click",()=>{
    hide(modeCard);
    hide(appInfoCard);
    hide(aboutAppCard);
    hide(aboutOstCard);
    tmdRoot.classList.add("hide");
    fratRoot.classList.remove("hide");
  });

  $("#backFromFrat").addEventListener("click",goMain);

  appInfoLink.addEventListener("click",()=>{
    hide(modeCard);
    hide(aboutAppCard);
    hide(aboutOstCard);
    show(appInfoCard);
  });
  appInfoBackBtn.addEventListener("click",goMain);

  aboutAppLink.addEventListener("click",()=>{
    hide(modeCard);
    hide(appInfoCard);
    hide(aboutOstCard);
    show(aboutAppCard);
  });
  aboutAppBackBtn.addEventListener("click",goMain);

  aboutOstBackBtn.addEventListener("click",()=>{
    hide(aboutOstCard);
    goMain();
  });

  tmdInfoBtn.addEventListener("click",()=>{
    hide(tmdHome);
    hide($("#tmdMenu"));
    show(tmdInfoCard);
  });
  tmdInfoBackBtn.addEventListener("click",()=>{
    hide(tmdInfoCard);
    show(tmdHome);
  });

  // ---------- Shared helpers ----------
  const lastPress=new WeakMap();
  function onPressPointer(el,fn,db=200){
    function down(e){
      e.preventDefault();
      const t=now(), last=lastPress.get(el)||0;
      if(t-last<db) return;
      lastPress.set(el,t);
      el.classList.add('active');
      fn(e);
    }
    const up=()=>el.classList.remove('active');
    el.addEventListener('pointerdown',down,{passive:false});
    el.addEventListener('pointerup',up,{passive:true});
    el.addEventListener('pointercancel',up,{passive:true});
    el.addEventListener('mouseleave',up,{passive:true});
    return()=>{el.removeEventListener('pointerdown',down);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('mouseleave',up);};
  }

  // =====================================================================
  //                         COGNITION & ACUITY
  // =====================================================================
  const storeKey="flyingm_imsafe_baseline_v2";
  const loadBaseline=()=>{try{return JSON.parse(localStorage.getItem(storeKey)||"[]");}catch{return[];}};
  const saveBaseline=s=>localStorage.setItem(storeKey,JSON.stringify(s||[]));

  const startBtn=$("#startBtn"), addBaselineBtn2=$("#addBaselineBtn2");
  const tmdMenuBtn=$("#tmdMenuBtn"), tmdMenu=$("#tmdMenu");
  const menuAddBaseline=$("#menuAddBaseline"), menuManageBaseline=$("#menuManageBaseline");
  const menuExport=$("#menuExport"), menuMain=$("#menuMain"), menuAboutOst=$("#menuAboutOst");

  const testCard=$("#testCard"), stepName=$("#stepName"), countdown=$("#countdown"), progressBar=$("#progressBar");
  const srtPane=$("#srtPane"), srtTarget=$("#srtTarget");
  const stroopPane=$("#stroopPane"), stroopWord=$("#stroopWord"), btnMatch=$("#btnMatch"), btnMismatch=$("#btnMismatch");
  const betweenPane=$("#betweenPane"), betweenCountdown=$("#betweenCountdown");
  const preNbackPane=$("#preNbackPane"), startNbackBtn=$("#startNbackBtn"), preNbackHint=$("#preNbackHint");
  const nbackPane=$("#nbackPane"), nbackDigit=$("#nbackDigit"), btnTarget=$("#btnTarget"), btnNotTarget=$("#btnNotTarget"), twoBackButtons=$("#twoBackButtons"), groupLabel=$("#groupLabel");
  const resultCard=$("#resultCard"), lightDot=$("#lightDot"), statusText=$("#statusText"), driverText=$("#driverText"), guidanceText=$("#guidanceText"), metricToday=$("#metricToday"), metricBase=$("#metricBase"), againBtn=$("#againBtn");
  const backToMainBtn=$("#backToMainBtn");
  const baselineCard=$("#baselineCard"), baselineList=$("#baselineList"), deleteBaselineBtn=$("#deleteBaselineBtn"), closeBaselineBtn=$("#closeBaselineBtn");

  let baselineSessions=loadBaseline();
  let sessionResult=null;

  function setProgress(p){progressBar.style.width=(p*100).toFixed(1)+"%";}

  tmdMenuBtn.addEventListener("click",()=>{
    if(tmdMenu.classList.contains("hide")) show(tmdMenu); else hide(tmdMenu);
  });

  menuAddBaseline.addEventListener("click",()=>{
    hide(tmdMenu);
    addCurrentToBaseline();
  });

  menuManageBaseline.addEventListener("click",()=>{
    hide(tmdMenu);
    updateBaselineList();
    hide(resultCard);
    hide(testCard);
    hide(tmdInfoCard);
    show(baselineCard);
  });

  menuExport.addEventListener("click",()=>{
    hide(tmdMenu);
    exportPDF();
  });

  menuMain.addEventListener("click",()=>{
    hide(tmdMenu);
    hide(baselineCard);
    hide(testCard);
    hide(resultCard);
    hide(tmdInfoCard);
    tmdRoot.classList.add("hide");
    show(modeCard);
  });

  menuAboutOst.addEventListener("click",()=>{
    hide(tmdMenu);
    hide(tmdHome);
    hide(testCard);
    hide(resultCard);
    hide(baselineCard);
    hide(tmdInfoCard);
    show(aboutOstCard);
  });

  backToMainBtn.addEventListener("click", () => {
    hide(resultCard);
    hide(testCard);
    hide(baselineCard);
    hide(tmdInfoCard);
    tmdRoot.classList.add("hide");
    show(modeCard);
  });

  startBtn.addEventListener('click', runTest);
  againBtn.addEventListener('click', runTest);
  addBaselineBtn2.addEventListener('click', addCurrentToBaseline);
  deleteBaselineBtn.addEventListener('click', ()=>{
    if(confirm("Delete ALL baseline sessions on this device?")){
      baselineSessions=[]; saveBaseline(baselineSessions); updateBaselineList();
    }
  });
  closeBaselineBtn.addEventListener('click', ()=>hide(baselineCard));

  const DUR={warmup:5,srt:30,stroop:45,nbackGroups:12};
  const TOTAL_TIME=DUR.warmup + DUR.srt + DUR.stroop + 15;
  const BASELINE_MIN=3;

  function sectionTimer(name,sec,tick){
    stepName.textContent=name;
    const t0=now(), total=sec*1000;
    return new Promise(res=>{
      function frame(){
        const t=now()-t0;
        const rem=Math.max(0,total-t); const p=clamp(t/total,0,1);
        tick(rem/1000,p);
        if(t<total) requestAnimationFrame(frame); else res();
      }
      requestAnimationFrame(frame);
    });
  }

  async function betweenSegments(label, seconds, elapsedBefore){
    show(betweenPane);
    hide(srtPane); hide(stroopPane); hide(nbackPane); hide(preNbackPane);
    await sectionTimer(label, seconds,(tleft,p)=>{
      countdown.textContent=Math.ceil(tleft)+"s";
      betweenCountdown.textContent=Math.ceil(tleft);
      const elapsed=elapsedBefore + (seconds - tleft);
      setProgress(elapsed / TOTAL_TIME);
    });
    hide(betweenPane);
  }

  async function runTest(){
    sessionResult=null;
    addBaselineBtn2.disabled=true;
    hide(resultCard);
    hide(baselineCard);
    hide(tmdHome);
    hide(tmdInfoCard);
    show(testCard);
    testCard.scrollIntoView({behavior:"auto"});

    // Warm-up — label now "Countdown to start Xs"
    await sectionTimer("Warm-up",DUR.warmup,(t,p)=>{
      const secs=Math.ceil(t);
      stepName.textContent=`Countdown to start ${secs}s`;
      countdown.textContent=" ";
      setProgress((DUR.warmup - t)/TOTAL_TIME);
      srtTarget.textContent="WAIT"; srtTarget.className="tapTarget ready";
      show(srtPane); hide(stroopPane); hide(nbackPane); hide(preNbackPane); hide(betweenPane);
    });

    const srt=await runSRT(DUR.srt);

    // 5-second blank countdown before Stroop
    await betweenSegments("Pause",5, DUR.warmup + DUR.srt);

    const stro=await runStroop(DUR.stroop);

    // 5-second blank countdown before showing the 2-back start button
    await betweenSegments("Pause",5, DUR.warmup + DUR.srt + DUR.stroop);

    const started=await waitForNbackStart(10000);
    hide(preNbackPane);
    if(!started){
      hide(testCard);
      alert("2-back segment was not started within 10 seconds. The assessment has been cancelled. Please run it again for valid results.");
      show(tmdHome);
      return;
    }

    const nb=await runTwoBack(DUR.nbackGroups);
    sessionResult=computeScoring(srt,stro,nb,baselineSessions);
    renderResults(sessionResult,srt,stro,nb,baselineSessions);
    resultCard.scrollIntoView({behavior:"auto"});
  }

  function waitForNbackStart(timeoutMs){
    show(preNbackPane); hide(srtPane); hide(stroopPane); hide(nbackPane); hide(betweenPane);
    preNbackHint.textContent="If you don’t start within about 10 seconds, this run will be cancelled.";
    countdown.textContent="—";
    stepName.textContent="Prepare: 2-back";
    return new Promise(res=>{
      let done=false;
      function finish(ok){
        if(done) return;
        done=true;
        startNbackBtn.removeEventListener('click', onClick);
        clearTimeout(to);
        res(ok);
      }
      function onClick(){finish(true);}
      startNbackBtn.disabled=false;
      startNbackBtn.addEventListener('click', onClick);
      const to=setTimeout(()=>finish(false), timeoutMs);
    });
  }

  function randomGap(){ return 1000 + Math.random()*4500; } // 1.0–5.5 seconds approx

  async function runSRT(sec){
    show(srtPane); hide(stroopPane); hide(nbackPane); hide(preNbackPane); hide(betweenPane);
    return await new Promise(resolve=>{
      let rts=[], falseStarts=0, lapses=0;
      let waiting=true, goTime=0, timeOver=false, finished=false;
      const endAt=now()+sec*1000;
      let offHandler=null;

      function finish(){
        if(finished) return;
        finished=true;
        if(offHandler) offHandler();
        const medianRT=rts.length?rts.slice().sort((a,b)=>a-b)[Math.floor(rts.length/2)]:999;
        resolve({medianRT,lapses,falseStarts,n:rts.length});
      }

      function scheduleNext(){
        if(finished) return;
        waiting=true;
        const delay=randomGap();
        srtTarget.textContent="WAIT"; srtTarget.className="tapTarget ready";
        setTimeout(()=>{
          if(finished) return;
          if(now()>endAt || timeOver){
            waiting=true;
            if(timeOver) finish();
            return;
          }
          srtTarget.textContent="TAP"; srtTarget.className="tapTarget go";
          waiting=false; goTime=now();
        },delay);
      }

      offHandler=onPressPointer(srtTarget,()=>{
        if(finished) return;
        const t=now();
        if(waiting){
          falseStarts++;
          return;
        }
        const rt=t-goTime;
        if(rt>500) lapses++;
        else if(rt>=100) rts.push(rt);
        waiting=true;
        if(t>=endAt || timeOver){
          finish();
        } else {
          scheduleNext();
        }
      });

      scheduleNext();

      sectionTimer("Reaction",sec,(tleft,p)=>{
        countdown.textContent=Math.ceil(tleft)+"s";
        const elapsed=DUR.warmup + (DUR.srt - tleft);
        setProgress(elapsed / TOTAL_TIME);
      }).then(()=>{
        timeOver=true;
        if(waiting && !finished){
          finish();
        }
      });
    });
  }

  async function runStroop(sec){
    show(stroopPane); hide(srtPane); hide(nbackPane); hide(preNbackPane); hide(betweenPane);
    return await new Promise(resolve=>{
      const names=["RED","GREEN","BLUE","YELLOW","ORANGE","WHITE"];
      const colors={
        RED:"#ff1744",
        GREEN:"#00e676",
        BLUE:"#2979ff",
        YELLOW:"#ffeb3b",
        ORANGE:"#ff9100",
        WHITE:"#fafafa"
      };
      let trials=[], tStim=0, awaiting=false, prevWord=null, prevColor=null;
      let timeOver=false, finished=false;
      const endAt=now()+sec*1000;
      const gap=400;
      let offM=null, offMM=null;

      let prevCongruent=null;
      let runLen=0;

      function finish(){
        if(finished) return;
        finished=true;
        if(offM) offM();
        if(offMM) offMM();
        window.removeEventListener('keydown',keyHandler);
        stroopWord.style.visibility="hidden";

        const corrects=trials.filter(t=>t.correct);
        const acc=trials.length?(corrects.length/trials.length)*100:0;
        const cong=trials.filter(t=>t.congruent && t.correct).map(t=>t.rt);
        const incong=trials.filter(t=>!t.congruent && t.correct).map(t=>t.rt);
        const rtCon=cong.length?mean(cong):NaN;
        const rtIncon=incong.length?mean(incong):NaN;
        const raw=(isFinite(rtIncon)&&isFinite(rtCon))?(rtIncon-rtCon):NaN;
        const congruencyCost=isFinite(raw)?Math.max(0,raw):NaN;
        const meanRTCorrect=corrects.length?mean(corrects.map(t=>t.rt)):NaN;
        const stroopScore=acc;
        resolve({acc,meanRTCorrect,congruencyCost,n:trials.length,stroopScore,nCong:cong.length,nIncong:incong.length});
      }

      function nextPair(){
        let wantCong;
        if(prevCongruent===true && runLen>=2){
          wantCong=false;
        }else if(prevCongruent===false && runLen>=2){
          wantCong=true;
        }else{
          wantCong=Math.random()<0.5;
        }

        let wordChoices=names.filter(w=>w!==prevWord);
        if(!wordChoices.length) wordChoices=names.slice();
        let word=wordChoices[Math.floor(Math.random()*wordChoices.length)];

        let colorChoices=names.filter(c=>c!==prevColor);
        if(!colorChoices.length) colorChoices=names.slice();

        let colorName, isCong;
        if(wantCong){
          if(word===prevColor){
            const other=wordChoices.filter(w=>w!==prevColor);
            if(other.length) word=other[Math.floor(Math.random()*other.length)];
          }
          colorName=word;
          isCong=true;
        }else{
          let incongChoices=colorChoices.filter(c=>c!==word);
          if(!incongChoices.length) incongChoices=names.filter(c=>c!==word);
          colorName=incongChoices[Math.floor(Math.random()*incongChoices.length)];
          isCong=false;
        }

        if(prevCongruent===null){
          prevCongruent=isCong;
          runLen=1;
        }else if(prevCongruent===isCong){
          runLen++;
        }else{
          prevCongruent=isCong;
          runLen=1;
        }

        prevWord=word;
        prevColor=colorName;
        return {word,colorName,congruent:isCong};
      }

      let current=null;
      function showTrial(){
        if(finished || timeOver) return;
        current=nextPair();
        stroopWord.textContent=current.word;
        stroopWord.style.color=colors[current.colorName];
        stroopWord.style.visibility="visible";
        tStim=now();
        awaiting=true;
        btnMatch.classList.remove("active");
        btnMismatch.classList.remove("active");
      }

      function queueNext(){
        stroopWord.style.visibility="hidden";
        setTimeout(()=>{
          if(finished) return;
          if(now()>endAt || timeOver){
            timeOver=true;
            if(!awaiting) finish();
          }else{
            showTrial();
          }
        },gap);
      }

      function respond(which){
        if(!awaiting || finished) return;
        awaiting=false;
        const rt=now()-tStim;
        const correct=(current.word===current.colorName && which==="MATCH") ||
                      (current.word!==current.colorName && which==="MISMATCH");
        trials.push({rt,correct,congruent:current.congruent});
        (which==="MATCH"?btnMatch:btnMismatch).classList.add('active');

        if(timeOver || now()>endAt){
          finish();
        }else{
          queueNext();
        }
      }

      offM=onPressPointer(btnMatch,()=>respond("MATCH"));
      offMM=onPressPointer(btnMismatch,()=>respond("MISMATCH"));
      function keyHandler(e){
        const k=e.key?.toLowerCase();
        if(k==='f'){e.preventDefault();respond("MATCH");}
        if(k==='j'){e.preventDefault();respond("MISMATCH");}
      }
      window.addEventListener('keydown',keyHandler);

      showTrial();
      sectionTimer("Color–Word",sec,(tleft,p)=>{
        countdown.textContent=Math.ceil(tleft)+"s";
        const elapsed=DUR.warmup + DUR.srt + (DUR.stroop - tleft);
        setProgress(elapsed / TOTAL_TIME);
      }).then(()=>{
        timeOver=true;
        if(!awaiting && !finished) finish();
      });
    });
  }

  async function runTwoBack(groups){
    show(nbackPane); hide(srtPane); hide(stroopPane); hide(preNbackPane); hide(betweenPane);

    // Small pause before the very first group
    await sleep(1000);

    let group=1, hits=0, fas=0, miss=0, hitRTs=[];
    const VIS=250, GAP=100; let tStim=0; twoBackButtons.style.visibility="hidden";

    function setDigit(d,vis){ nbackDigit.textContent=String(d); nbackDigit.style.visibility=vis?"visible":"hidden"; }
    function rDigit(except){ let d; do{ d=Math.floor(1+Math.random()*9); }while(d===except); return d; }

    async function doGroup(){
      if(group>groups) return;

      // NEW: short blank gap between groups so the first digit is clearly a new group
      if(group>1){
        setDigit("", false);
        twoBackButtons.style.visibility="hidden";
        await sleep(300); // 250–500 ms; tuned to 300 ms here
      }

      groupLabel.textContent=`Group ${group}`;
      twoBackButtons.style.visibility="hidden";
      const a=rDigit(null), b=rDigit(null), target=Math.random()<0.5, c=target?a:rDigit(a);

      await new Promise(res=>{
        let awaiting=false;
        function showA(){ setDigit(a,true); setTimeout(()=>{ setDigit(a,false); setTimeout(showB,GAP); },VIS); }
        function showB(){ setDigit(b,true); setTimeout(()=>{ setDigit(b,false); setTimeout(showC,GAP); },VIS); }
        function showC(){ setDigit(c,true); twoBackButtons.style.visibility="visible"; awaiting=true; tStim=now(); }

        function evalResp(isTarget){
          if(!awaiting) return;
          awaiting=false;
          const rt=now()-tStim, correctTarget=(c===a);
          if(isTarget){
            if(correctTarget){ hits++; if(rt>=100 && rt<=3000) hitRTs.push(rt); }
            else { fas++; }
          }else{
            if(correctTarget){ miss++; }
          }
          setDigit(c,false); twoBackButtons.style.visibility="hidden";
          offT(); offNT(); offKey();
          res();
        }

        const offT=onPressPointer(btnTarget,()=>evalResp(true));
        const offNT=onPressPointer(btnNotTarget,()=>evalResp(false));
        function key(e){
          if(e.code==='Space'){e.preventDefault();evalResp(true);}
          if(e.key && e.key.toLowerCase()==='n'){e.preventDefault();evalResp(false);}
        }
        function offKey(){ window.removeEventListener('keydown',key); }
        window.addEventListener('keydown',key);

        showA();
      });
      group++;
      await doGroup();
    }

    await doGroup();

    const total=groups;
    const targets=Math.max(1, hits+miss);
    const nonTargets=Math.max(1, total-(hits+miss));
    const hitRate=(hits/targets)*100, faRate=(fas/nonTargets)*100;
    const rawD=dPrimeApprox(hitRate/100, faRate/100);
    let scaledD=rawD;
    if(isFinite(rawD)){
      if(total<=5) scaledD=rawD*0.4;
      else if(total<=10) scaledD=rawD*0.7;
    }
    const meanHitRT=hitRTs.length?mean(hitRTs):NaN;
    return {hitRate,faRate,dprime:scaledD,rawDprime:rawD,meanHitRT,counts:{hits,fas,miss},groups:total};
  }

  function dPrimeApprox(H,F){
    const eps=1e-4; H=clamp(H,eps,1-eps); F=clamp(F,eps,1-eps);
    function invNorm(p){
      const a=[-39.6968302866538,220.946098424521,-275.928510446969,138.357751867269,-30.6647980661472,2.50662827745924];
      const b=[-54.4760987982241,161.585836858041,-155.698979859887,66.8013118877197,-13.2806815528857];
      const c=[-0.00778489400243029,-0.322396458041136,-2.40075827716184,-2.54973253934373,4.37466414146497,2.93816398269878];
      const d=[0.00778469570904146,0.32246712907004,2.445134137143,3.75440866190742];
      const pl=0.02425, ph=1-pl; let q,r;
      if(p<pl){
        q=Math.sqrt(-2*Math.log(p));
        return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
               (((((d[0]*q+d[1])*q+d[2])*q+d[3])*q)+1);
      }
      if(p>ph){
        q=Math.sqrt(-2*Math.log(1-p));
        return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
               (((((d[0]*q+d[1])*q+d[2])*q+d[3])*q)+1);
      }
      q=p-0.5; r=q*q;
      return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5]) * q /
             (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r + b[4])*r + 1);
    }
    return invNorm(H)-invNorm(F);
  }

  function computeBaselineStats(b){
    const keys=["srt_median","srt_lapses","srt_false","stro_acc","stro_mean_rt","stro_cost","stro_score","nb_hit","nb_fa","nb_d","nb_hit_rt"];
    const meanObj={}, sdObj={};
    keys.forEach(k=>{
      const arr=b.map(s=>s[k]).filter(x=>Number.isFinite(x));
      meanObj[k]=arr.length?mean(arr):NaN;
      sdObj[k]=arr.length>1?sd(arr):0;
    });
    return {mean:meanObj, sd:sdObj, n:b.length};
  }

  function computeScoring(srt,stro,nb,baseline){
    const today={
      srt_median:srt.medianRT, srt_lapses:srt.lapses, srt_false:srt.falseStarts,
      stro_acc:stro.acc, stro_mean_rt:stro.meanRTCorrect, stro_cost:stro.congruencyCost, stro_score:stro.stroopScore,
      nb_hit:nb.hitRate, nb_fa:nb.faRate, nb_d:nb.dprime, nb_hit_rt:nb.meanHitRT
    };
    const base=computeBaselineStats(baseline);

    function sdEff(key, raw){
      let min=0;
      if(key==="srt_median") min=30;
      else if(key==="stro_mean_rt") min=50;
      else if(key==="stro_cost") min=25;
      if(!isFinite(raw) || raw<=0) return min || 1;
      return Math.max(raw, min || raw);
    }

    function zLower(key){
      const m=base.mean[key], rawS=base.sd[key], s=sdEff(key, rawS);
      if(!isFinite(m) || !isFinite(today[key]) || !isFinite(s)) return NaN;
      return (today[key]-m)/s;
    }
    function zHigher(key){
      const m=base.mean[key], rawS=base.sd[key], s=sdEff(key, rawS);
      if(!isFinite(m) || !isFinite(today[key]) || !isFinite(s)) return NaN;
      return (m-today[key])/s;
    }

    const z={
      speed_median:zLower("srt_median"),
      speed_lapses:zLower("srt_lapses"),
      speed_false:zLower("srt_false"),
      stro_cost:zLower("stro_cost"),
      stro_acc:zHigher("stro_acc"),
      stro_rt:zLower("stro_mean_rt"),
      nb_d:zHigher("nb_d"),
      nb_hit_rt:zLower("nb_hit_rt"),
      nb_fa:zLower("nb_fa")
    };

    function comp(keys){
      const vals=keys.map(k=>z[k]).filter(Number.isFinite);
      if(!vals.length) return NaN;
      const srtArr=vals.slice().sort((a,b)=>a-b);
      const trim=Math.max(0,Math.floor(srtArr.length*0.1));
      return mean(srtArr.slice(trim, srtArr.length-trim||undefined));
    }

    const zSpeed=comp(["speed_median","speed_lapses","speed_false"]);
    const zStroop=comp(["stro_cost","stro_acc","stro_rt"]);
    const zNback=comp(["nb_d","nb_hit_rt","nb_fa"]);
    const maxZ=Math.max(zSpeed||0,zStroop||0,zNback||0);

    const readiness=Math.round(100-clamp(10*maxZ,0,50));
    const hasBaseline=baseline.length>=BASELINE_MIN;

    const baseLaps=base.mean.srt_lapses;
    const lapseThreshold=(isFinite(baseLaps)? baseLaps+3 : 4);
    const lapseFlag=((srt.lapses>=4) || (isFinite(baseLaps) && srt.lapses>=lapseThreshold));

    let stroopTScore=NaN, stroopMessage="—";
    if(isFinite(today.stro_score)&&isFinite(base.mean.stro_score)&&base.sd.stro_score>0){
      const zSt=(today.stro_score-base.mean.stro_score)/base.sd.stro_score;
      stroopTScore=50+10*zSt;
      const drop=(50-stroopTScore)/50;
      if(drop<=0.10) stroopMessage="you do not show a meaningful decline in executive function compared to your baseline.";
      else if(drop>0.10 && drop<=0.15000) stroopMessage="there’s a small dip in executive function relative to baseline — worth noticing, even if it’s subtle.";
      else if(drop>0.15001 && drop<=0.20) stroopMessage="your executive function is noticeably below baseline. Treat today as a higher-workload day before you add a demanding flight on top.";
      else if(drop>0.20) stroopMessage="your executive function is substantially below baseline. If your device seems fine, assume you may be having an off day and plan very conservatively—or scrub.";
    } else {
      stroopMessage="you still need at least 3 baseline sessions on this device before Stroop T-scores mean much.";
    }

    let statusLabel="Baseline needed", light="amber", qualitativeLevel="baseline";
    if(hasBaseline){
      if(maxZ < 0.75){
        statusLabel="Near baseline";
        light="green"; qualitativeLevel="near";
      } else if(maxZ < 1.5){
        statusLabel="Mildly below baseline";
        light="amber"; qualitativeLevel="mild";
      } else if(maxZ < 2.5){
        statusLabel="Moderately below baseline";
        light="amber"; qualitativeLevel="moderate";
      } else {
        statusLabel="Well below baseline";
        light="red"; qualitativeLevel="high";
      }
    }
    if(hasBaseline && lapseFlag){
      statusLabel="Well below baseline";
      light="red"; qualitativeLevel="high";
    }

    let guidance="";
    if(!hasBaseline){
      guidance="treat this as a practice run. You still need several good-days’ worth of baseline sessions on this device before the numbers can really tell you anything.";
    } else {
      if(qualitativeLevel==="near"){
        guidance="you’re performing close to your own baseline today. If your phone or tablet seems to be behaving normally, this feels like one of your typical days.";
      } else if(qualitativeLevel==="mild"){
        guidance="you’re a bit softer than usual. This might be a good moment to grab food, water, or a short break, then re-run the check before you launch into a demanding flight.";
      } else if(qualitativeLevel==="moderate"){
        guidance="you’re noticeably below baseline. If your device seems fine, treat this as a yellow flag and ask whether today’s conditions and workload really deserve a ‘go’ call.";
      } else {
        guidance="you’re well below your usual performance. Assuming your device is behaving, that’s a strong hint to slow down, build in extra margin, or simply not go today.";
      }
    }

    const drivers=[];
    if(Number.isFinite(zSpeed)&&zSpeed>=1) drivers.push("slower reaction and/or more lapses");
    if(Number.isFinite(zStroop)&&zStroop>=1) drivers.push("weaker color–word control");
    if(Number.isFinite(zNback)&&zNback>=1) drivers.push("reduced 2-back working memory");
    const driver=!hasBaseline
      ? "Baseline not established yet; this run is best treated as practice."
      : (drivers.length?("Most of the difference from baseline seems to come from: "+drivers.join(" + ")+".")
                       :"Nothing stands far from your baseline; differences are small and spread across domains.");

    const nbackNote=(DUR.nbackGroups<=5)
      ? "Note: 2-back d′ is based on a very small number of groups and scaled for small-sample stability; for research-level work you’d want 10–20 groups."
      : "";

    return {today,baseStats:base,z:{speed:zSpeed,stroop:zStroop,nback:zNback,max:maxZ},
            readiness,light,statusLabel,guidance,driver,hasBaseline,stroopTScore,stroopMessage,nbackNote};
  }

  function renderResults(res,srt,stro,nb){
    hide(testCard);
    hide(baselineCard);
    show(resultCard);
    lightDot.className="dot "+(res.hasBaseline?(res.light==="green"?"green":res.light==="red"?"red":"amber"):"amber");
    statusText.textContent=res.hasBaseline? res.statusLabel:"Baseline needed";
    driverText.textContent=res.driver;
    guidanceText.textContent=res.guidance;
    addBaselineBtn2.disabled=false;
    const totalPresses=srt.falseStarts+srt.n, fsRate=totalPresses?(100*srt.falseStarts/totalPresses):0;
    const shownNbD=res.today.nb_d;

    metricToday.innerHTML=[
      `Reaction median: <b>${fmt(srt.medianRT)} ms</b>`,
      `Lapses (&gt;500 ms): <b>${srt.lapses}</b>`,
      `False starts: <b>${srt.falseStarts}</b>`,
      `<span class="muted">Diagnostics — SRT trials: <b>${srt.n}</b>; presses: <b>${totalPresses}</b>; false-start rate: <b>${fmt(fsRate)}%</b></span>`,
      `Stroop accuracy: <b>${fmt(stro.acc)}%</b>`,
      `Stroop mean RT: <b>${fmt(stro.meanRTCorrect)} ms</b>`,
      `Stroop cost: <b>${isFinite(stro.congruencyCost)?fmt(stro.congruencyCost):"—"} ms</b>`,
      `2-back d′ (scaled): <b>${isFinite(shownNbD)?fmt(shownNbD):"—"}</b>`,
      `2-back hits / FA / miss: <b>${nb.counts.hits}/${nb.counts.fas}/${nb.counts.miss}</b>`,
      res.nbackNote? `<span class="muted">${res.nbackNote}</span>` : ``
    ].map(x=>`<div>${x}</div>`).join("");

    const b=res.baseStats;
    function baseLine(label,key,unit=""){
      const m=b.mean[key], s=b.sd[key];
      return `<div>${label}: <b>${isFinite(m)?fmt(m):"—"}${unit}</b> <span class="muted">± ${isFinite(s)?fmt(s):"—"}</span></div>`;
    }
    metricBase.innerHTML=[
      baseLine("Reaction median","srt_median"," ms"),
      baseLine("Lapses","srt_lapses"),
      baseLine("False starts","srt_false"),
      baseLine("Stroop accuracy","stro_acc","%"),
      baseLine("Stroop mean RT","stro_mean_rt"," ms"),
      baseLine("Stroop cost","stro_cost"," ms"),
      baseLine("Stroop score (acc)","stro_score",""),
      baseLine("2-back d′ (scaled)","nb_d",""),
    ].join("");

    resultCard.dataset.payload=JSON.stringify({srt,stro,nb,res});
  }

  function addCurrentToBaseline(){
    const payload=resultCard.dataset.payload?JSON.parse(resultCard.dataset.payload):null;
    if(!payload){
      alert("Run an assessment and view the results before adding to baseline.");
      return;
    }
    const {res}=payload;
    baselineSessions.push(res.today);
    saveBaseline(baselineSessions);
    updateBaselineList();
    alert("Added to baseline. Collect at least 3 baseline sessions on good days to make the comparisons meaningful.");
  }

  function updateBaselineList(){
    if(!baselineSessions.length){
      baselineList.textContent="No baseline yet.";
      return;
    }
    const lines=baselineSessions.map((s,i)=>{
      return `#${i+1} • medRT ${fmt(s.srt_median)} ms • lapses ${fmt(s.srt_lapses)} • Stroop acc ${fmt(s.stro_acc)}% • 2-back d′ ${fmt(s.nb_d)}`;
    });
    baselineList.innerHTML=lines.map(l=>`<div>${l}</div>`).join("");
  }

  function exportPDF(){
    const payload=resultCard.dataset.payload?JSON.parse(resultCard.dataset.payload):null;
    const bcount=baselineSessions.length; const when=new Date().toLocaleString();
    let html=`<html><head><title>Second Opinion — Cognition &amp; Acuity Summary</title>
      <style>body{font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;color:#111}
      h1{font-size:20px;margin:0 0 6px} h2{font-size:16px;margin:18px 0 6px}
      .muted{color:#555}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.box{border:1px solid #ddd;border-radius:8px;padding:12px}
      .mono{font-family:ui-monospace,Menlo,Monaco,Consolas}</style></head><body>
      <h1>Second Opinion — Cognition &amp; Acuity (Summary)</h1>
      <div class="muted">Generated: ${when} • Baseline sessions on this device: ${bcount} • Version: v0.7 experimental</div>`;
    if(!payload){
      html+=`<p>No recent assessment run to export.</p></body></html>`;
      const w=window.open("","_blank"); if(w){w.document.write(html);w.document.close();w.focus();w.print();}
      else alert("Pop-up blocked — please allow pop-ups to view the summary.");
      return;
    }
    const {srt,stro,nb,res}=payload; const totalPresses=srt.falseStarts+srt.n; const fsRate=totalPresses?(100*srt.falseStarts/totalPresses):0;
    const shownNbD=res.today.nb_d;
    html+=`
      <h2>Overall</h2>
      <div class="box">
        <div><b>Status:</b> ${res.statusLabel}${res.hasBaseline?" (baseline-referenced)":" (baseline not yet established)"}</div>
        <div><b>On Second Thought…</b> ${res.guidance}</div>
        <div><b>Driver:</b> ${res.driver}</div>
      </div>
      <div class="grid" style="margin-top:10px">
        <div class="box">
          <h2>Reaction</h2>
          <div>Median RT: <b>${fmt(srt.medianRT)} ms</b></div>
          <div>Lapses (&gt;500 ms): <b>${srt.lapses}</b></div>
          <div>False starts: <b>${srt.falseStarts}</b></div>
          <div class="muted">Diagnostics — trials: <b>${srt.n}</b>; presses: <b>${totalPresses}</b>; false-start rate: <b>${fmt(fsRate)}%</b></div>
        </div>
        <div class="box">
          <h2>Stroop (Executive Function)</h2>
          <div>Accuracy: <b>${fmt(stro.acc)}%</b></div>
          <div>Mean RT (correct): <b>${fmt(stro.meanRTCorrect)} ms</b></div>
          <div>Cost (incong − cong): <b>${isFinite(stro.congruencyCost)?fmt(stro.congruencyCost):"—"} ms</b></div>
          <div>T-score vs baseline (accuracy): <b>${isFinite(res.stroopTScore)?fmt(res.stroopTScore):"—"}</b></div>
          <div><i>On Second Thought… ${res.stroopMessage}</i></div>
        </div>
      </div>
      <div class="box" style="margin-top:10px">
        <h2>2-back (Working Memory)</h2>
        <div>d′ (scaled): <b>${isFinite(shownNbD)?fmt(shownNbD):"—"}</b></div>
        <div>Hits / False Alarms / Misses: <b>${nb.counts.hits}/${nb.counts.fas}/${nb.counts.miss}</b> (${nb.groups} groups)</div>
        ${res.nbackNote?`<div class="muted">${res.nbackNote}</div>`:""}
      </div>
      <h2>Baseline (mean ± SD)</h2>
      <div class="box mono">
        Reaction median: ${fmt(res.baseStats.mean.srt_median)} ms ± ${fmt(res.baseStats.sd.srt_median)}<br/>
        Lapses: ${fmt(res.baseStats.mean.srt_lapses)} ± ${fmt(res.baseStats.sd.srt_lapses)}<br/>
        False starts: ${fmt(res.baseStats.mean.srt_false)} ± ${fmt(res.baseStats.sd.srt_false)}<br/>
        Stroop accuracy: ${fmt(res.baseStats.mean.stro_acc)}% ± ${fmt(res.baseStats.sd.stro_acc)}<br/>
        Stroop mean RT: ${fmt(res.baseStats.mean.stro_mean_rt)} ms ± ${fmt(res.baseStats.sd.stro_mean_rt)}<br/>
        Stroop cost: ${fmt(res.baseStats.mean.stro_cost)} ms ± ${fmt(res.baseStats.sd.stro_cost)}<br/>
        Stroop score (acc): ${fmt(res.baseStats.mean.stro_score)} ± ${fmt(res.baseStats.sd.stro_score)}<br/>
        2-back d′ (scaled): ${fmt(res.baseStats.mean.nb_d)} ± ${fmt(res.baseStats.sd.nb_d)}<br/>
      </div>
      </body></html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    } else {
      alert("Pop-up blocked — please allow pop-ups to view the summary.");
    }
  }

  // =====================================================================
  //                              FRAT
  // =====================================================================

  const fratQuestionsDiv=$("#fratQuestions");
  const fratCalcBtn=$("#fratCalcBtn");
  const fratResetBtn=$("#fratResetBtn");
  const fratResultCard=$("#fratResultCard");
  const fratDot=$("#fratDot");
  const fratStatusLabel=$("#fratStatusLabel");
  const fratScoreText=$("#fratScoreText");
  const fratNarrative=$("#fratNarrative");
  const fratGuidance=$("#fratGuidance");
  const fratBreakdown=$("#fratBreakdown");
  const fratBandRef=$("#fratBandRef");
  const fratExportBtn=$("#fratExportBtn");

  const FRAT_ITEMS=[
    {id:"pilot_recent", cat:"Pilot", text:"Less than 3 hours flight time in last 30 days.", score:2, rule:"BOTH"},
    {id:"pilot_inst_curr", cat:"Pilot", text:"Instrument rating not current and/or not proficient.", score:4, rule:"IFR"},
    {id:"pilot_night", cat:"Pilot", text:"Planning night operations with minimal recent night experience.", score:3, rule:"BOTH"},
    {id:"pilot_fatigue", cat:"Pilot", text:"Moderate fatigue or reduced sleep in last 24 hours.", score:3, rule:"BOTH"},
    {id:"pilot_illness", cat:"Pilot", text:"IM SAFE: ‘Illness’ or ‘Medication’ not completely resolved.", score:5, rule:"BOTH"},

    {id:"ac_new_type", cat:"Aircraft", text:"Less than 25 hours in this aircraft / avionics type.", score:3, rule:"BOTH"},
    {id:"ac_mx_def", cat:"Aircraft", text:"Minor deferred maintenance items or recent maintenance just completed.", score:2, rule:"BOTH"},
    {id:"ac_complex", cat:"Aircraft", text:"Complex or high-performance aircraft (retract, turbo, etc.) with limited recent experience.", score:3, rule:"BOTH"},

    {id:"env_xwind", cat:"Environment", text:"Forecast crosswind component within 5 kt of personal minimums or POH limits.", score:3, rule:"BOTH"},
    {id:"env_ceiling_marginal", cat:"Environment", text:"Ceiling / visibility marginal for planned route (MVFR or worse).", score:4, rule:"IFR"},
    {id:"env_convective", cat:"Environment", text:"Convective activity or embedded cells along route or near destination.", score:4, rule:"BOTH"},
    {id:"env_ice", cat:"Environment", text:"Known or forecast icing in climb/cruise/approach segment.", score:5, rule:"IFR"},

    {id:"route_new", cat:"Route / Operation", text:"Unfamiliar route, airspace, or destination.", score:3, rule:"BOTH"},
    {id:"route_mountain", cat:"Route / Operation", text:"Mountainous terrain or high density altitude without recent experience.", score:3, rule:"BOTH"},
    {id:"route_night_vfr", cat:"Route / Operation", text:"Night VFR over unlit terrain or water.", score:3, rule:"VFR"},

    {id:"ifrp_altmin", cat:"IFR Flight Plan", text:"IFR alternate required and close to minimums.", score:4, rule:"IFR"},
    {id:"ifrp_single_pilot_ifr", cat:"IFR Flight Plan", text:"Single-pilot IFR in busy or unfamiliar airspace.", score:4, rule:"IFR"},

    {id:"app_nonprec_mins", cat:"Approach (IFR)", text:"Planned nonprecision approach within 200 ft of published minimums.", score:4, rule:"IFR"},
    {id:"app_circle", cat:"Approach (IFR)", text:"Circle-to-land or circling maneuver required at destination.", score:4, rule:"IFR"},

    {id:"press_schedule", cat:"External Pressures", text:"Schedule pressure (late departure, tight arrival window, passengers waiting).", score:3, rule:"BOTH"},
    {id:"press_passengers", cat:"External Pressures", text:"Carrying business associates, family, or people you feel pressure to impress.", score:3, rule:"BOTH"},
    {id:"press_financial", cat:"External Pressures", text:"Financial or other external consequences if the flight is delayed or cancelled.", score:3, rule:"BOTH"}
  ];

  function buildFratQuestions(){
    fratQuestionsDiv.innerHTML="";
    const cats=[...new Set(FRAT_ITEMS.map(i=>i.cat))];
    cats.forEach(cat=>{
      const wrapper=document.createElement("div");
      wrapper.className="card";
      wrapper.style.background="#0f1622";
      wrapper.style.border="1px solid #223042";
      wrapper.style.marginBottom="10px";
      const h=document.createElement("h3");
      h.textContent=cat;
      wrapper.appendChild(h);
      const subset=FRAT_ITEMS.filter(i=>i.cat===cat);
      subset.forEach(item=>{
        const row=document.createElement("div");
        row.className="frat-q";
        row.dataset.itemId=item.id;
        const textDiv=document.createElement("div");
        textDiv.className="frat-q-text";
        textDiv.innerHTML=`${item.text} <span class="muted" style="font-size:.8rem;">(True = +${item.score})</span>`;
        const controls=document.createElement("div");
        controls.className="frat-q-controls";
        controls.innerHTML=`
          <label><input type="radio" name="${item.id}" value="true"> True</label><br/>
          <label><input type="radio" name="${item.id}" value="false"> False</label>
        `;
        row.appendChild(textDiv);
        row.appendChild(controls);
        wrapper.appendChild(row);
      });
      fratQuestionsDiv.appendChild(wrapper);
    });
  }

  buildFratQuestions();

  function getFratProfile(){
    const rules=document.querySelector('input[name="fratRules"]:checked')?.value || null;
    const exp=document.querySelector('input[name="fratExp"]:checked')?.value || null;
    return {rules,exp};
  }

  function applicableToRules(itemRule, rules){
    if(itemRule==="BOTH") return true;
    return itemRule===rules;
  }

  fratCalcBtn.addEventListener("click",()=>{
    const {rules,exp}=getFratProfile();
    if(!rules || !exp){
      alert("Please select flight rules (VFR/IFR) and experience in type before scoring.");
      return;
    }
    let total=0;
    const byCat={};
    FRAT_ITEMS.forEach(item=>{
      if(!applicableToRules(item.rule,rules)) return;
      const val=document.querySelector(`input[name="${item.id}"]:checked`)?.value;
      if(val==="true"){
        total+=item.score;
        byCat[item.cat]=(byCat[item.cat]||0)+item.score;
      }
    });

    let band="Low", dotClass="green", narrative="", guidance="";
    let bandText="";
    if(rules==="IFR"){
      if(exp==="<100"){
        if(total<20){band="Below ref range";dotClass="green";}
        else if(total<=25){band="Low";dotClass="green";}
        else if(total<=30){band="Moderate";dotClass="amber";}
        else {band="High";dotClass="red";}
        bandText="IFR • <100 in type: Low 20–25, Moderate 25–30, High >30.";
      }else{
        if(total<25){band="Below ref range";dotClass="green";}
        else if(total<=30){band="Low";dotClass="green";}
        else if(total<=35){band="Moderate";dotClass="amber";}
        else {band="High";dotClass="red";}
        bandText="IFR • ≥100 in type: Low 25–30, Moderate 30–35, High >35.";
      }
    }else{
      if(exp==="<100"){
        if(total<5){band="Below ref range";dotClass="green";}
        else if(total<=15){band="Low";dotClass="green";}
        else if(total<=20){band="Moderate";dotClass="amber";}
        else {band="High";dotClass="red";}
        bandText="VFR • <100 in type: Low 5–15, Moderate 15–20, High >20.";
      }else{
        if(total<15){band="Below ref range";dotClass="green";}
        else if(total<=20){band="Low";dotClass="green";}
        else if(total<=25){band="Moderate";dotClass="amber";}
        else {band="High";dotClass="red";}
        bandText="VFR • ≥100 in type: Low 15–20, Moderate 20–25, High >25.";
      }
    }

    if(band==="Below ref range"){
      narrative="Your numeric score is below the reference “Low” band for this profile. That can happen if conditions are benign and you answered “False” to most items.";
      guidance="don’t let a low number lull you into complacency. Keep scanning for traps that the form doesn’t capture—especially external pressure, fatigue, and subtle weather changes.";
    }else if(band==="Low"){
      narrative="Your risk score falls in the reference Low band for this profile.";
      guidance="this is where a lot of routine, well-planned flights end up. Still, it’s worth a quick second look at any items you answered “True” on; those are the specific edges you’re choosing to accept today.";
    }else if(band==="Moderate"){
      narrative="Your risk score is in the Moderate band for this profile.";
      guidance="this is a good moment for an “On Second Thought…” pause: can you mitigate any of the True items? Change routing or timing, add fuel, bring another pilot, or delay? Moderate scores reward deliberate, not automatic, go-decisions.";
    }else{
      narrative="Your risk score is in the High band for this profile.";
      guidance="this deserves a very slow, very honest second look. If your answers are accurate, you’re stacking several meaningful risk factors. Scrubbing or substantially reshaping the plan is often the safest—and most professional—choice.";
    }

    fratDot.className="dot "+(dotClass==="green"?"green":dotClass==="red"?"red":"amber");
    fratStatusLabel.textContent=`${band} risk band`;
    fratScoreText.textContent=`Score: ${total}`;
    fratNarrative.textContent=narrative;
    fratGuidance.textContent=guidance;

    const catLines=Object.keys(byCat).sort().map(cat=>{
      return `<div><b>${cat}:</b> ${byCat[cat]} points</div>`;
    });
    fratBreakdown.innerHTML=catLines.length?catLines.join(""):"<div>No items scored True.</div>";
    fratBandRef.textContent=bandText;

    fratResultCard.classList.remove("hide");
    fratResultCard.scrollIntoView({behavior:"auto"});
    fratResultCard.dataset.payload=JSON.stringify({total,band,byCat,rules,exp});
  });

  fratResetBtn.addEventListener("click",()=>{
    document.querySelectorAll("#fratQuestions input[type=radio]").forEach(r=>r.checked=false);
    fratResultCard.classList.add("hide");
  });

  fratExportBtn.addEventListener("click",()=>{
    const payload=fratResultCard.dataset.payload?JSON.parse(fratResultCard.dataset.payload):null;
    const when=new Date().toLocaleString();
    const {rules,exp}=getFratProfile();
    let html=`<html><head><title>Second Opinion — FRAT Summary</title>
      <style>body{font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;color:#111}
      h1{font-size:20px;margin:0 0 6px} h2{font-size:16px;margin:18px 0 6px}
      .muted{color:#555}.box{border:1px solid #ddd;border-radius:8px;padding:12px}</style></head><body>
      <h1>Second Opinion — Flight Risk Assessment (FRAT)</h1>
      <div class="muted">Generated: ${when}</div>`;
    if(!payload){
      html+=`<p>No FRAT result to export.</p></body></html>`;
      const w=window.open("","_blank"); if(w){w.document.write(html);w.document.close();w.focus();w.print();}
      else alert("Pop-up blocked — please allow pop-ups to view the summary.");
      return;
    }
    const {total,band,byCat}=payload;
    html+=`
      <h2>Overall</h2>
      <div class="box">
        <div><b>Flight rules:</b> ${rules||"—"} • <b>Experience in type:</b> ${exp||"—"}</div>
        <div><b>Total FRAT score:</b> ${total}</div>
        <div><b>Reference band:</b> ${band}</div>
        <div><b>On Second Thought…</b> ${fratGuidance.textContent}</div>
      </div>
      <h2>Category breakdown</h2>
      <div class="box">`;
    const cats=Object.keys(byCat).sort();
    if(!cats.length){
      html+=`No items scored True.`;
    }else{
      cats.forEach(cat=>{
        html+=`<div><b>${cat}:</b> ${byCat[cat]} points</div>`;
      });
    }
    html+=`</div></body></html>`;
    const w=window.open("","_blank");
    if(w){
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    }else{
      alert("Pop-up blocked — please allow pop-ups to view the summary.");
    }
  });

})();
