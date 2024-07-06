(()=>{var f=[],j=[],P={blink:7,overclock:1,recall:8,setup:4},h=-1;Ee().then(e=>{f=e.units,j=e.tiers}).then(()=>{X(),V(),fe(),le()});var g=document.getElementById("select-unit"),L=document.getElementsByClassName("card"),k=document.getElementById("select-ability"),y=document.getElementsByClassName("ability slot"),oe=document.getElementById("screenshot"),$=document.getElementById("file-input"),q=document.getElementById("load-deck"),re=document.getElementById("save-deck"),ae=document.getElementById("download-deck"),p=document.getElementById("deck-selection");document.getElementById("load-file").addEventListener("click",()=>{$.click()});function le(){Array.from(L).forEach(e=>{Y(e),e.addEventListener("click",()=>{if(g.hasChildNodes()){let r=g.children[0];if(r&&r.id===e.id){g.togglePopover(!1);return}}g.innerHTML="",K();let i=e.className.split(" ").filter(r=>r.indexOf("t")>-1).map(r=>parseInt(r.replace("t",""))),c=Te(i),s=v().filter(Boolean),o=c.filter(r=>!s.some(a=>r.slug===a));if(o.length===0)g.innerHTML=`Every unit from ${Ue(i).join(" and ")} already selected.`;else{z();let r=Se(o,(a,l)=>{e.innerHTML="";let d=ne(a);e.appendChild(d),g.hidePopover();let m=v();A(m),ve(m)});r.classList.add(e.id),e.classList.add("selection-in-progress"),g.appendChild(r)}g.togglePopover()})}),Array.from(y).forEach(e=>{Z(e),e.addEventListener("click",()=>{let n=v(),t=f.filter(c=>n.includes(c.slug)).reduce((c,s)=>(s.unitAbility&&!c.includes(s.unitAbility)&&c.push(s.unitAbility.toLowerCase()),c),[]);k.innerHTML="",Q();let i=_();Array.from(new Set(t)).sort((c,s)=>i.indexOf(c)-i.indexOf(s)).forEach(c=>{k.appendChild(ye(c,()=>{Array.from(y).forEach(s=>{let o=s.querySelector("img");o&&o.id.includes(c.toLowerCase())&&(s.innerHTML="",s.classList.remove("filled-slot"))}),e.innerHTML="",e.appendChild(J(c)),e.classList.add("filled-slot"),S(_()),k.togglePopover(!1)}))}),e.classList.add("selection-in-progress"),k.style.left=e.offsetLeft+e.clientWidth+"px",k.style.top=e.offsetTop+"px",k.togglePopover()})})}document.getElementById("share-button").addEventListener("click",()=>{Pe()});document.getElementById("reset-button").addEventListener("click",()=>{ie(),z(),ce()});g.addEventListener("toggle",e=>{e.newState==="closed"&&(g.innerHTML="",K())});k.addEventListener("toggle",e=>{e.newState==="closed"&&Q()});document.getElementById("animate-button").addEventListener("click",()=>{let e=document.createElement("div");e.className="row";let n=document.createElement("div");n.className="row",v().map(i=>$e(i)).forEach((i,c)=>{c>3?n.appendChild(i):e.appendChild(i)});let t=document.getElementById("video");t.innerHTML="",t.appendChild(e),t.appendChild(n)});oe.addEventListener("click",()=>{let e=document.getElementById("video");e.hasChildNodes()?M(3840,2160,e.querySelectorAll("video"),8,2):M(256,256,document.getElementsByClassName("card-img"),1,1)});ae.addEventListener("click",()=>{let e=localStorage.getItem("gameconfig-localuser");var n=new Blob([e]),t=URL.createObjectURL(n);let i=new Date;se(`gameconfig-localuser-${i.toLocaleDateString()}-${i.toLocaleTimeString()}.toml`,t),URL.revokeObjectURL(t)});q.addEventListener("click",()=>{p.innerHTML="";let e=document.createElement("div");e.className="deck-actions";let n=document.createElement("button");n.innerText="Load",n.addEventListener("click",()=>{if(h>-1){let i=JSON.parse(localStorage.getItem("parsed-decks"));ce(),ie(),S(i[h].abilities),A(i[h].slugs),H(),X(),V()}p.togglePopover(!1)});let t=document.createElement("button");t.innerText="Cancel",t.addEventListener("click",()=>{H(),p.togglePopover(!1)}),e.appendChild(n),e.appendChild(t),p.appendChild(F(JSON.parse(localStorage.getItem("parsed-decks")))),p.appendChild(e),p.togglePopover()});re.addEventListener("click",()=>{p.innerHTML="";let e=document.createElement("div");e.className="deck-actions";let n=document.createElement("button");n.innerText="Overwrite",n.addEventListener("click",()=>{if(h>-1){let i=R(window.location.href),c=JSON.parse(localStorage.getItem("gameconfig-localuser-decks"));h===0?(i._name="SelectedDeck",c.SelectedDeck=i):c.Decks[h-1]=i;let s=JSON.stringify(c);localStorage.setItem("gameconfig-localuser-decks",s),G(JSON.stringify(s));let o=b(c.SelectedDeck),r=c.Decks.map(a=>b(a));localStorage.setItem("parsed-decks",JSON.stringify([o,...r]))}p.togglePopover(!1)});let t=document.createElement("button");t.innerText="Cancel",t.addEventListener("click",()=>{H(),p.togglePopover(!1)}),e.appendChild(n),e.appendChild(t),p.appendChild(F(JSON.parse(localStorage.getItem("parsed-decks")))),p.appendChild(e),p.togglePopover()});$.addEventListener("change",()=>{let e=$.files[0],n=new FileReader;n.readAsText(e,"UTF-8"),n.onload=function(t){try{let i=de(t.target.result),c=JSON.parse(i),s=b(c.SelectedDeck),o=c.Decks.map(a=>b(a)),r=[s,...o];if(r.some(a=>!T(a.abilities,a.slugs)||!O(a.slugs)))throw new Error("Imported deck did not pass validation");localStorage.clear(),localStorage.setItem("gameconfig-localuser",t.target.result),localStorage.setItem("gameconfig-localuser-decks",i),localStorage.setItem("parsed-decks",JSON.stringify(r))}catch(i){console.error(i)}q.click()}});function H(){h=-1,W()}function F(e){let n=document.createElement("div"),t=l=>d=>{h=l,W(),d.currentTarget.classList.add("brighten")},i=document.createElement("div");i.className="row";let c=document.createElement("div");c.addEventListener("click",t(0)),c.appendChild(N(e[0],0)),c.className="deck-preview";let s=document.createElement("div");s.addEventListener("click",t(1)),s.appendChild(N(e[1],1)),s.className="deck-preview",i.appendChild(c),i.appendChild(s);let o=document.createElement("div");o.className="row";let r=document.createElement("div");r.addEventListener("click",t(2)),r.appendChild(N(e[2],2)),r.className="deck-preview";let a=document.createElement("div");return a.addEventListener("click",t(3)),a.appendChild(N(e[3],3)),a.className="deck-preview",o.appendChild(r),o.appendChild(a),n.appendChild(i),n.appendChild(o),n}function N(e,n){let t=document.createElement("div");t.className=`${n}-deck-preview deck-preview-group`;let i=document.createElement("row");i.className="row";let c=document.createElement("row");c.className="row";for(let s=0;s<e.slugs.length;s++){let o=e.slugs[s],r=o?C(I(o,"units"),`${o}-${n}-deck-review`):document.createElement("div");r.className=o?"select-image":"select-image empty",s<4?i.appendChild(r):c.appendChild(r)}return t.appendChild(i),t.appendChild(c),t}function de(e){let n=e.split(`
`).find(t=>t&&t.startsWith("decks"));if(n)try{return JSON.parse(n.replace(" ","").replace("decks=",""))}catch(t){return console.error(t),""}return""}function G(e){let t=localStorage.getItem("gameconfig-localuser").split(`
`),i=t.findIndex(c=>c&&c.startsWith("decks"));i>-1?t[i]=`decks = ${e}`:t.push(`decks = ${e}`),localStorage.setItem("gameconfig-localuser",t.join(`
`))}function me(e=""){return{_name:e,_activeAbilities:new Array(4).fill({_id:0}),_units:new Array(8).fill({_id:0})}}function ue(){return{SelectedDeck:R(window.location.href,"SelectedDeck"),Decks:new Array(3).fill(me())}}function pe(){let e=ue(),n=b(e.SelectedDeck),t=e.Decks.map(c=>b(c));localStorage.setItem("parsed-decks",JSON.stringify([n,...t]));let i=JSON.stringify(e);localStorage.setItem("gameconfig-localuser-decks",i),localStorage.setItem("gameconfig-localuser",`decks = ${JSON.stringify(i)}`)}function fe(){try{let e=JSON.parse(localStorage.getItem("parsed-decks"));if(e.some(i=>!T(i.abilities,i.slugs)||!O(i.slugs)))throw new Error("Deck in local storage did not pass validation");let n=e.map((i,c)=>R(ge(i),c===0?"SelectedDeck":"")),t=JSON.stringify({SelectedDeck:n[0],Decks:n.slice(1)});localStorage.setItem("gameconfig-localuser-decks",t),G(t)}catch(e){console.error(e),pe()}}function ge({slugs:e,abilities:n}){let t=new URL("https://zaokret.github.io/battle-aces/");return t.searchParams.set("deck",window.btoa(e)),t.searchParams.set("abs",window.btoa(n)),t}function b(e){let n=e._activeAbilities.map(s=>Object.keys(P).find(o=>P[o]===s?._id)||""),t=e._units.length/2,i=new Array(e._units.length);for(let s=0;s<t;s++)i[s]=e._units[2*s]._id,2*s+1<8&&(i[t+s]=e._units[2*s+1]._id);return{slugs:i.map(s=>f.find(o=>o.unitId===s)?.slug||""),abilities:n}}function R(e,n=""){let t=new URL(e),i=new Array(8).fill({_id:0}),c=[];if(t.searchParams.has("deck")){let o=t.searchParams.get("deck");try{let a=window.atob(o).split(",");if(!O(a))throw new Error("Invalid deck in URL");if(c=a,a.length>8)throw new Error("Deck is of wrong size.");let l=4,d=new Array(8).fill("");for(let m=0;m<l;m++)d[2*m]=a[m],d[2*m+1]=a[l+m];d.forEach((m,w)=>{i[w]={_id:f.find(u=>m&&u.slug.includes(m))?.unitId||0}})}catch(r){console.error(r)}}let s=new Array(4).fill({_id:0});if(t.searchParams.has("abs")){let o=t.searchParams.get("abs");try{let a=window.atob(o).split(",");if(!T(a,c))throw new Error("Invalid abilities");a.forEach((l,d)=>{s[d]={_id:P[l]||0}})}catch(r){console.error(r)}}return{_name:n,_activeAbilities:s,_units:i}}function W(){Array.from(document.querySelectorAll(".deck-preview")).forEach(e=>e.classList.remove("brighten"))}function V(){let e=Oe();T(e)?he(e):S([])}function he(e){if(e&&e.length>0)for(let n=0;n<e.length;n++)e[n]&&(y[n].appendChild(J(e[n])),y[n].classList.add("filled-slot"))}function T(e,n=v()){if(e.length>4)return!1;if(e.length===0||e.every(s=>s===""))return!0;let t=e.filter(Boolean),i=[...new Set(t)];if(t.length!==i.length)return!1;let c=f.filter(s=>n.includes(s.slug)).reduce((s,o)=>(o.unitAbility&&!s.includes(o.unitAbility)&&s.push(o.unitAbility.toLowerCase()),s),[]);return e.filter(Boolean).every(s=>c.includes(s))}function _(){return Array.from(y).map(e=>{let n=e.querySelector("img");return n?n.id.replace("-ability-icon",""):""})}function ve(e){let n=f.filter(t=>e.includes(t.slug)).reduce((t,i)=>(i.unitAbility&&!t.includes(i.unitAbility)&&t.push(i.unitAbility),t),[]);Array.from(y).forEach(t=>{let i=t.querySelector("img");i&&n.every(c=>!i.id.includes(c.toLowerCase()))&&(t.innerHTML="",t.classList.remove("filled-slot"))}),S(_())}function ye(e,n){let t=document.createElement("div");return t.classList.add("ability"),t.classList.add("selection"),t.appendChild(J(e)),t.addEventListener("click",n),t.classList.add("ability-icon-selection"),Z(t),t}function J(e){let n=window.location.origin+window.location.pathname+"/images/abilities/"+e.toLowerCase()+".png",t=C(n,`${e.toLowerCase()}-ability-icon`);return t.className="ability-icon",t}function z(){let e=document.getElementById("video");e.innerHTML=""}function K(){Array.from(L).forEach(e=>e.classList.remove("selection-in-progress"))}function Q(){Array.from(y).forEach(e=>e.classList.remove("selection-in-progress"))}function we(){return window.location.hostname.includes("github")?"https://deckbuilder.autos/data":"http://localhost:3000/data"}function Ee(){return fetch(we()).then(e=>e.json())}function X(){let e=xe();O(e)?Be(e):A([])}function v(){return Array.from(L).map(e=>e.hasChildNodes()?e.children[0].id.replace(" ","").toLowerCase():"")}function Y(e){e.addEventListener("mouseenter",()=>{e.classList.add("hover")}),e.addEventListener("mouseleave",()=>{e.classList.remove("hover")})}function ke(e){e.addEventListener("mouseenter",()=>{let n=e.id,t=f.find(i=>i.slug===n);t&&t.unitAbility&&document.querySelectorAll(`#${t.unitAbility.toLowerCase()}-ability-icon`).forEach(i=>{i&&i.classList.add("hover")}),e.classList.add("hover")}),e.addEventListener("mouseleave",()=>{e.classList.remove("hover"),Array.from(document.querySelectorAll(".ability-icon")).forEach(n=>n.classList.remove("hover"))})}function Z(e){e.addEventListener("mouseenter",()=>{if(["ability-icon-selection","filled-slot"].some(n=>e.classList.contains(n))){let t=e.querySelector(".ability-icon").id.replace("-ability-icon",""),i=v();f.forEach(c=>{if(i.indexOf(c.slug)>-1&&c.unitAbility?.toLowerCase()===t){let o=document.querySelector(`.card-img#${c.slug}`);o&&o.classList.add("hover")}})}e.classList.add("hover")}),e.addEventListener("mouseleave",()=>{e.classList.remove("hover"),Array.from(document.querySelectorAll(".card-img")).forEach(n=>n.classList.remove("hover"))})}function Le(e){let n=e.reduce((i,c)=>(i=i.concat(U(c)),i),[]);return[...new Set(n)]}function be(e,n){let t=document.createElement("div");t.className="tag-filter";let i=e.sort(),c=document.createElement("details"),s=document.createElement("summary");s.innerText="Filters",c.appendChild(s);let o=document.createElement("div");return i.forEach(r=>{let a=document.createElement("div");a.className="tag-input-wrapper";let l=document.createElement("input");l.className="tag-input",l.type="checkbox",l.id=r,l.value=r;let d=document.createElement("label");d.className="tag-input-label",d.setAttribute("for",r),d.innerText=r,d.style.userSelect="none",l.addEventListener("input",()=>{l.checked?d.classList.add("checked"):d.classList.remove("checked"),n(r,l.checked)}),a.appendChild(l),a.appendChild(d),o.appendChild(a)}),c.appendChild(o),t.appendChild(c),t}function ee(e,n){return e.map(t=>{let i=document.createElement("div");i.id=`unit-input-${t.slug}`;let c=C(I(t.name,"units"),t.id);c.className="select-image",c.addEventListener("click",r=>{n(t.slug,r)}),Y(c);let s=document.createElement("a");s.className="unit-out-link",s.href=`https://www.playbattleaces.com/units/${t.slug}`,s.target="_blank",s.rel="noopener noreferrer";let o=document.createElement("div");return o.innerText=t.name,o.className="card-name",s.appendChild(o),i.appendChild(c),i.appendChild(s),i.appendChild(Ne(t)),i.appendChild(Ie(t)),i.appendChild(Ae(t,Ce(e))),i})}function Se(e,n){let t=document.createElement("div");t.className="card-list";let i=be(Le(e),(c,s)=>{let r=Array.from(document.getElementsByClassName("tag-input")).filter(a=>a.checked).map(a=>a.value);e.forEach(a=>{let l=U(a),d=r.every(w=>w==="Anti-Air"?["Anti-Air","Versatile"].some(u=>l.some(E=>u===E)):w==="Anti-Ground"?["Anti-Ground","Versatile"].some(u=>l.some(E=>u===E)):l.some(u=>w===u)),m=document.getElementById(`unit-input-${a.slug}`);d?m.classList.remove("hide"):m.classList.add("hide")})});return t.appendChild(i),t.append(...ee(e,n)),t}function Ce(e){return e.map(t=>U(t).length).sort((t,i)=>i-t)[0]*30}function U(e){return e.unitTag.replace(" Unit","").replace(" Damage","").replace(" Defense","-Defense").replace(" Range","-Range").replace(`
`,"").split(" ").concat(e.unitAbility?e.unitAbility:[])}function Ae(e,n){let t=U(e),i=document.createElement("div");return i.className="tag-list",i.style.minHeight=n+"px",t.forEach(c=>{let s=document.createElement("p");s.innerText=c,s.className="tag",i.appendChild(s)}),i}function Ie(e){let n=document.createElement("div");return n.className="cost-list",["matter","energy","bandwidth"].forEach(t=>{let i=document.createElement("div");i.classList.add("cost-type"),i.classList.add(`cost-type-${t}`);let c=C(I(t,"resources"),e.name+`-${t}`);c.className="cost-type-img";let s=document.createElement("div");s.className="cost-type-num",s.innerText=e[`cost${te(t)}`],i.appendChild(c),i.appendChild(s),n.appendChild(i)}),n}function Ne(e){let n=document.createElement("div");return n.className="stat-list",n.appendChild(D(e,"health")),n.appendChild(D(e,"damage")),n.appendChild(D(e,"speed")),n.appendChild(D(e,"range")),n}function te(e){return e.charAt(0).toUpperCase()+e.slice(1)}function D(e,n){let t=document.createElement("div");t.className="stat-container";let i=C(I(n,"stats"),e.name+`-${n}`);return i.className="stat-icon",t.appendChild(i),t.appendChild(De(e["stat"+te(n)])),t}function De(e){let n=document.createElement("div");n.className="stat-number";for(let t=0;t<5;t++){let i=document.createElement("div");i.className=e>t?"stat-number-full":"stat-number-empty",n.appendChild(i)}return n}function Te(e){return f.filter(n=>e.some(t=>t===n.techTierId))}function Ue(e){return j.filter(n=>e.some(t=>n.techTierId===t)).map(n=>n.name)}function S(e){let n=new URL(window.location);n.searchParams.set("abs",window.btoa(e.join(","))),window.history.pushState({path:n.href},"",n.href)}function Oe(){let n=new URL(window.location).searchParams.get("abs");if(!n)return[];let t="";try{t=window.atob(n)}catch(c){console.error(c),S([])}return t.split(",").map(c=>c.replace(`
`,"").trim())}function A(e){let n=new URL(window.location);n.searchParams.set("deck",window.btoa(e.join(","))),window.history.pushState({path:n.href},"",n.href)}function xe(){let n=new URL(window.location).searchParams.get("deck");if(!n)return[];let t="";try{t=window.atob(n)}catch(c){console.error(c),A([])}return t.split(",").map(c=>c.replace(`
`,"").trim())}function O(e){if(e.every(s=>s===""))return!0;let n=e.filter(Boolean),t=[...new Set(n)];if(n.length!==t.length)return!1;let i=[[0],[1],[3],[3,1],[0],[2],[4],[4,2]],c=e.map(s=>f.find(o=>o.slug===s));return i.every((s,o)=>!c[o]||s.includes(c[o].techTierId))}function Be(e){if(e&&e.length>0){for(let n=0;n<L.length;n++)if(e[n]){let t=e[n].replace(" ","").toLowerCase();L[n].appendChild(ne(t))}}}function ne(e){let n=C(I(e,"units"),e);n.className="card-img",ke(n);let t=f.find(i=>i.slug===e);return n.addEventListener("mouseenter",function(i){if(document.getElementById("selected-unit-preview")||!t)return;let s=ee([t],()=>{})[0];s.id="selected-unit-preview",document.querySelector("main").appendChild(s)}),n.addEventListener("mouseleave",function(){let i=document.getElementById("selected-unit-preview");i&&i.remove()}),n}function ie(){for(let e of L)e.innerHTML="";A([])}function ce(){for(let e of y)e.innerHTML="",e.classList.remove("filled-slot");S([])}function Pe(){navigator.clipboard.writeText(window.location.href)}function I(e,n){let t="https://cdn.playbattleaces.com/images/icons",i={techtiers:"svg",stats:"png",abilities:"png",units:"png",resources:"svg"},c=e.replace(" ","").toLowerCase();return i[n]==="svg"?`./images/${n}/${c}.svg`:`${t}/${n}/${c}.${i[n]}`}function C(e,n){let t=document.createElement("img");return t.src=e,t.id=n,t.setAttribute("crossOrigin","anonymous"),t}function $e(e){let n=document.createElement("video");n.id=`${e}-video`,n.className="video",n.setAttribute("muted",""),n.setAttribute("loop",""),n.setAttribute("height","100px"),n.setAttribute("crossOrigin","anonymous"),n.setAttribute("preload","metadata"),n.setAttribute("playsInline","");let t=document.createElement("source");t.id="video-source",t.src=`https://cdn.playbattleaces.com/videos/turnarounds/${e}.mp4`,t.type="video/mp4",n.appendChild(t);let i=document.createElement("div");i.className="animation",i.appendChild(n);let c=!1;return n.addEventListener("click",()=>{c?n.pause():n.play(),c=!c}),i}function se(e,n){let t=document.createElement("a");t.download=e,t.href=n,t.click(),t.remove()}function He(e,n,t,i){let c=Math.floor(e/i);return{xOffset:e%i*n,yOffset:c*t}}function M(e,n,t,i,c){let s=document.getElementById("canvas"),o=s.getContext("2d"),r=e/i,a=Math.floor(r/50),l=4,d=2;s.width=r*l,s.height=r*d,o.strokeStyle="white",o.lineWidth=a;let w=v().map(u=>u?f.find(E=>E.slug===u).name:"Empty");_e(Array.from(t)).forEach((u,E)=>{let{xOffset:x,yOffset:B}=He(E,r,r,l,d);u?o.drawImage(u,0,0,e/c,n,x,B,r,r):(o.fillStyle="gray",o.fillRect(x,B,r,r)),o.rect(x,B,r,r),o.stroke()}),se(w,s.toDataURL())}function _e(e){if(e.length<8){let n=v(),t=new Array(8).fill(void 0);return e.forEach(i=>{let c=n.findIndex(s=>s&&i.id.includes(s));t[c]=i}),t}return e}})();
