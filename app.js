(function(){
  const $ = s=>document.querySelector(s);
  const fmt = n=>(typeof n==="number"&&isFinite(n)?Math.round(n*10)/10:n);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const sd=a=>{if(a.length<2)return 0;const m=mean(a);const v=mean(a.map(x=>(x-m)**2));return Math.sqrt(v);};
  const now=()=>performance.now();

  function show(el){el.classList.remove("hide");}
  function hide(el){el.classList.add("hide");}

  // Splash screen + view / navigation helpers
  const splash=document.getElementById("splash");
  const splashIcon=document.getElementById("splash-icon");
  const splashOst=document.getElementById("splash-ost");
  if(splash){
    window.addEventListener("load",()=>{
      if(splashIcon) splashIcon.classList.add("visible");
      setTimeout(()=>{
        if(splashIcon) splashIcon.classList.remove("visible");
        if(splashOst) splashOst.classList.add("visible");
      },800);
      setTimeout(()=>{
        splash.classList.add("splash-hidden");
      },2000);
      splash.addEventListener("transitionend",()=>{splash.remove();},{once:true});
    });
  }

  const viewScreens=Array.from(document.querySelectorAll(".view-screen"));
  let currentViewId=(viewScreens.find(v=>!v.classList.contains("hide")) || document.getElementById("modeCard") || viewScreens[0] || {}).id || null;

  function goView(id){
    if(!id) return;
    if(id===currentViewId){
      const el=document.getElementById(id);
      if(el) el.classList.remove("hide");
      return;
    }
    const from=currentViewId?document.getElementById(currentViewId):null;
    const to=document.getElementById(id);
    if(!to) return;

    if(!from){
      to.classList.remove("hide","view-slide-in-right","view-slide-out-left");
      currentViewId=id;
      return;
    }

    from.classList.remove("view-slide-in-right","view-slide-out-left");
    to.classList.remove("view-slide-in-right","view-slide-out-left","hide");

    const handle=()=>{
      from.classList.add("hide");
      from.classList.remove("view-slide-out-left");
      to.classList.remove("view-slide-in-right");
      from.removeEventListener("animationend",handle);
    };
    requestAnimationFrame(()=>{
      from.classList.add("view-slide-out-left");
      to.classList.add("view-slide-in-right");
      from.addEventListener("animationend",handle);
    });
    currentViewId=id;
  }

  const globalHamburger=document.getElementById("globalHamburger");
  const globalHamburgerOverlay=document.getElementById("globalHamburgerOverlay");
  const globalHamburgerClose=document.getElementById("globalHamburgerClose");

  if(globalHamburger && globalHamburgerOverlay){
    const closeHamburger=()=>{
      globalHamburgerOverlay.classList.remove("open");
      globalHamburger.classList.remove("open");
    };
    globalHamburger.addEventListener("click",()=>{
      const isOpen=globalHamburgerOverlay.classList.contains("open");
      if(isOpen) closeHamburger();
      else{
        globalHamburgerOverlay.classList.add("open");
        globalHamburger.classList.add("open");
      }
    });
    if(globalHamburgerClose){
      globalHamburgerClose.addEventListener("click",closeHamburger);
    }
    globalHamburgerOverlay.addEventListener("click",e=>{
      if(e.target===globalHamburgerOverlay) closeHamburger();
    });
    document.querySelectorAll(".menu-item[data-view-target]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const target=btn.getAttribute("data-view-target");
        if(target){
          if(target==="modeCard") goMain();
          else goView(target);
        }
        closeHamburger();
      });
    });
  }

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
    // Return to main menu and reset major test views
    hide($("#tmdInfoCard"));
    hide($("#testCard"));
    hide($("#resultCard"));
    hide($("#baselineCard"));
    hide($("#tmdMenu"));
    goView("modeCard");
  }

  if (goTmdBtn) {
    goTmdBtn.addEventListener("click",()=>{
      goView("tmdRoot");
      if(tmdHome) show(tmdHome);
      if(tmdInfoCard) hide(tmdInfoCard);
      hide($("#testCard"));
      hide($("#resultCard"));
      hide($("#baselineCard"));
      hide($("#tmdMenu"));
    });
  }

  if (goFratBtn) {
    goFratBtn.addEventListener("click",()=>{
      goView("fratRoot");
    });
  }

  if (appInfoLink && appInfoCard) {
    appInfoLink.addEventListener("click",()=>{
      goView("appInfoCard");
    });
  }
  if (appInfoBackBtn) appInfoBackBtn.addEventListener("click",goMain);

  if (aboutAppLink && aboutAppCard) {
    aboutAppLink.addEventListener("click",()=>{
      goView("aboutAppCard");
    });
  }
  if (aboutAppBackBtn) aboutAppBackBtn.addEventListener("click",goMain);

  if (aboutOstBackBtn) {
    aboutOstBackBtn.addEventListener("click",()=>{
      goMain();
    });
  }

  if (tmdInfoBtn) {
    tmdInfoBtn.addEventListener("click",()=>{
      if(tmdHome) hide(tmdHome);
      hide($("#tmdMenu"));
      if(tmdInfoCard) show(tmdInfoCard);
    });
  }
  if (tmdInfoBackBtn) {
    tmdInfoBackBtn.addEventListener("click",()=>{
      if(tmdInfoCard) hide(tmdInfoCard);
      if(tmdHome) show(tmdHome);
    });
  }

  // ---------- Shared helpers ----------
  function onPressPointer(el,handler){
    const fn=e=>{
      e.preventDefault();
      handler(e);
    };
    el.addEventListener("click",fn);
    el.addEventListener("touchend",fn);
    return ()=>{el.removeEventListener("click",fn);el.removeEventListener("touchend",fn);};
  }

  // =====================================================================
  // COGNITION & ACUITY (TMD)
  // =====================================================================
  const storage=window.localStorage;
  const storeKey="tmdBaselineSessions_v1";

  const loadBaseline=()=>{
    try{return JSON.parse(localStorage.getItem(storeKey)||"[]");}catch{return[];}};
  const saveBaseline=s=>localStorage.setItem(storeKey,JSON.stringify(s||[]));

  const startBtn=$("#startBtn"), addBaselineBtn2=$("#addBaselineBtn2");
  const tmdMenuBtn=$("#tmdMenuBtn"), tmdMenu=$("#tmdMenu");
  const menuAddBaseline=$("#menuAddBaseline"), menuManageBaseline=$("#menuManageBaseline");
  const menuExport=$("#menuExport"), menuMain=$("#menuMain"), menuAboutOst=$("#menuAboutOst");

  const testCard=$("#testCard"), stepName=$("#stepName"), countdown=$("#countdown"), progressBar=$("#progressBar");
  const timePill=$("#timePill");
  const srtPane=$("#srtPane"), srtTarget=$("#srtTarget");
  const stroopPane=$("#stroopPane"), stroopWord=$("#stroopWord"), btnMatch=$("#btnMatch"), btnMismatch=$("#btnMismatch");
  const betweenPane=$("#betweenPane"), betweenCountdown=$("#betweenCountdown");
  const preNbackPane=$("#preNbackPane"), startNbackBtn=$("#startNbackBtn"), preNbackHint=$("#preNbackHint");
  const nbackPane=$("#nbackPane"), nbackDigit=$("#nbackDigit"), btnTarget=$("#btnTarget"), btnNotTarget=$("#btnNotTarget"), twoBackButtons=$("#twoBackButtons"), groupLabel=$("#groupLabel");
  const resultCard=$("#resultCard"), lightDot=$("#lightDot"), lightLabel=$("#lightLabel"), metricSrtMedian=$("#metricSrtMedian"), metricSrtLapses=$("#metricSrtLapses"), metricStroopAcc=$("#metricStroopAcc"), metricStroopMedian=$("#metricStroopMedian"), metricNbackAcc=$("#metricNbackAcc"), metricNbackBias=$("#metricNbackBias"), metricSummary=$("#metricSummary"), metricToday=$("#metricToday"), metricBase=$("#metricBase"), againBtn=$("#againBtn");
  const backToMainBtn=$("#backToMainBtn");
  const baselineCard=$("#baselineCard"), baselineList=$("#baselineList"), deleteBaselineBtn=$("#deleteBaselineBtn"), closeBaselineBtn=$("#closeBaselineBtn");

  let baselineSessions=loadBaseline();
  let sessionResult=null;

  function setProgress(p){progressBar.style.width=(p*100).toFixed(1)+"%";}

  if (tmdMenuBtn) {
    tmdMenu
