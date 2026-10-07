/*
 * layout.js – الناف والفوتر في مكان واحد لكل صفحات الموقع.
 * الاستخدام في أي صفحة:
 *   <site-nav current="home|about|calculator|transformations|articles|doctor"></site-nav>
 *   <site-footer></site-footer>
 * ويُحمَّل في <head> بدون defer:  <script src="js/layout.js"></script>
 * لتعديل روابط الناف أو الفوتر: عدّل القوالب هنا فقط.
 * لتعديل رسائل الواتساب: عدّل MSG هنا فقط.
 */
(() => {
  let cur = "";
  const c = (k) => (k === cur ? ' aria-current="page"' : "");

  /* ---------- الواتساب: كل الرسائل هنا ----------
   * أي رابط wa.me بدون ?text= بياخد رسالة تلقائياً حسب مكانه في الصفحة.
   * الروابط اللي فيها ?text= (كروت البرامج، فورم التواصل) بتفضل زي ما هي.
   * لتحديد نوع الرسالة يدوياً: <a data-wa="consult|start|pricing|general">
   */
  const WA = "https://wa.me/201155822360";
  window.MFT_WA = WA; // مصدر واحد لرقم الواتساب (يستخدمه main.js أيضًا)
  const GREET = "مرحبًا MFT 👋\n";
  const FORM = "\n\nالاسم:\nهدفي:";
  const MSG = {
    consult: GREET + "أرغب في حجز استشارة." + FORM,
    start: GREET + "أرغب في بدء رحلتي معكم." + FORM,
    pricing: GREET + "أرغب في الاستفسار عن العضوية والأسعار." + FORM,
    general: GREET + "أرغب في الاستفسار عن خدماتكم.",
    doctor: GREET + "أرغب في حجز استشارة مع د. محمد الريس." + FORM,
    transformations:
      GREET + "شاهدت نتائج التحولات على موقعكم وأرغب في بدء رحلتي." + FORM,
  };
  const txt = (id) => {
    const e = document.getElementById(id);
    return e ? e.textContent.trim() : "";
  };
  const articleMsg = () =>
    GREET +
    "قرأت مقال «" +
    (txt("a-title") || document.title.split(" – ")[0]) +
    "» على موقعكم وأرغب في استشارة." +
    FORM;
  const calcMsg = () => {
    const res = document.getElementById("mft-results"),
      f = document.getElementById("calc");
    if (!res || res.hidden || !f)
      return GREET + "استخدمت حاسبة السعرات في موقعكم وأرغب في خطة مناسبة لي." + FORM;
    const v = (n) => (f.elements[n] ? f.elements[n].value : "");
    return (
      GREET +
      "استخدمت حاسبة السعرات في موقعكم:\n" +
      `• العمر: ${v("age")} | الطول: ${v("height")} سم | الوزن: ${v("weight")} كجم\n` +
      `• الهدف: ${txt("r-goal")}\n` +
      `• السعرات المستهدفة: ${txt("r-target")} سعرة يوميًا\n` +
      `• احتياج الحفاظ على الوزن: ${txt("r-tdee")} | BMR: ${txt("r-bmr")}\n\n` +
      "أرغب في خطة مناسبة لي واستشارة."
    );
  };
  const PAGE_MSG = {
    article: articleMsg,
    calculator: calcMsg,
    doctor: () => MSG.doctor,
    transformations: () => MSG.transformations,
  };
  const waText = (a) => {
    const t = (a.textContent || "").toLowerCase();
    const k =
      a.dataset.wa ||
      (a.closest("#pricing")
        ? "pricing"
        : /ابدأ|start/.test(t)
          ? "start"
          : /استشار|احجز|consult|book/.test(t)
            ? "consult"
            : "general");
    if (k === "consult" || k === "start") {
      const page = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "");
      if (PAGE_MSG[page]) return PAGE_MSG[page]();
    }
    return MSG[k] || MSG.general;
  };
  const isBare = (a) => {
    try {
      const u = new URL(a.href);
      return u.hostname === "wa.me" && !u.searchParams.get("text");
    } catch (_) {
      return false;
    }
  };
  const setWa = (a) => {
    a.href = WA + "?text=" + encodeURIComponent(waText(a));
    a.dataset.waAuto = "1";
  };
  /* يوحّد الرقم: أي رابط wa.me في الصفحة يأخذ الرقم من WA أعلاه (ويحتفظ بنص الرسالة إن وُجد) */
  const syncNumber = (a) => {
    try {
      const u = new URL(a.href),
        n = new URL(WA).pathname;
      if (u.hostname === "wa.me" && u.pathname !== n) {
        u.pathname = n;
        a.href = u.href;
      }
    } catch (_) {}
  };
  const enhanceWa = () =>
    document.querySelectorAll('a[href*="wa.me/"]').forEach((a) => {
      syncNumber(a);
      if (isBare(a)) setWa(a);
    });
  /* يتجدد وقت الضغط عشان رسالة الحاسبة والمقال تاخد آخر بيانات */
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target instanceof Element && e.target.closest('a[href*="wa.me/"]');
      if (a && (a.dataset.waAuto || isBare(a))) setWa(a);
    },
    true,
  );
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", enhanceWa)
    : enhanceWa();

  const NAV = () => `<nav class="nav" aria-label="Main">
        <a
          class="logo"
          href="index.html"
          aria-label="MFT – Medical Fitness Transformation, home"
        >
          <img
            src="assets/images/logo.jpg"
            alt="MFT Medical Fitness Transformation logo"
            width="88"
            height="88"
          />
        </a>
        <ul class="links" id="site-menu">
       
<li><a href="index.html"${c("home")}>الرئيسية</a></li>
<li><a href="about.html"${c("about")}>عن MFT</a></li>
<li><a href="index.html#programs">البرامج</a></li>
<li><a href="transformations.html"${c("transformations")}>التحولات</a></li>
<li><a href="calculator.html"${c("calculator")}>حاسبة السعرات الحرارية</a></li>
<li><a href="articles.html"${c("articles")}>المقالات</a></li>
  <li><a href="doctor.html"${c("doctor")}>الدكتور</a></li>
<li><a href="index.html#contact">تواصل</a></li>
<li class="menu-cta-li">
  <a class="menu-cta" href="${WA}" target="_blank" rel="noopener">
    <span>احجز مكانك الآن</span>
    <span class="dot"><svg aria-hidden="true"><use href="#arr" /></svg></span>
  </a>
</li>


        </ul>
        <a
          class="pill"
          href="${WA}"
          target="_blank"
          rel="noopener"
        >
          <span  class="long">احجز مكانك الآن</span>
          <span class="short">احجز مكانك الآن</span>
          <span class="dot"
            ><svg aria-hidden="true"><use href="#arr" /></svg
          ></span>
        </a>
        <button class="burger" aria-label="Open menu" aria-controls="site-menu">
          <svg class="ic-menu" width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="2" />
          </svg>
          <svg class="ic-x" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </nav>`;

  /* ---- الفوتر: الأعمدة بيانات فقط. كل عمود 6 روابط عشان يبقوا بنفس الطول ---- */
  const ICON = {
    wa: '<use href="#chat"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    book: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    msg: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/>',
    fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>',
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>',
  };



const COLS = [
    ["روابط سريعة", [
      ["الرئيسية", "index.html"],
      ["برامجنا", "index.html#programs"],
      ["قصص التحول", "transformations.html"],
      ["تواصل معنا", "index.html#contact"],
    ]],
    ["ابدأ رحلتك", [
      ["حاسبة السعرات", "calculator.html"],
      ["مقالات ونصائح", "articles.html"],
      ["كيف تبدأ رحلتك؟", "index.html#steps"],
      ["الحياة مع MFT", "index.html#life"],
      ["الأسئلة الشائعة", "index.html#faq"],
    ]],
    ["اكتشف MFT", [
      ["قصتنا", "about.html"],
      ["فلسفتنا في التدريب والتغذية", "about.html#h-why"],
      ["د. محمد الريس", "doctor.html"],
      ["لماذا تختار MFT؟", "index.html#compare"],
      ["منهجية MFT", "index.html#method"],
      ["التدريب والمتابعة أونلاين", "index.html#coaching"],
    ]],
    ["ابدأ معنا", [
      ["تواصل عبر واتساب", WA, "wa", 1],
      ["+20 11 55822360", "tel:+201155822360", "phone"],
      ["احجز استشارتك", WA, "book", 1],
      ["تحدث معنا", "index.html#contact", "msg"],
      ["فيسبوك", "https://www.facebook.com/mohamed.adel.402955/", "fb", 1],
      ["إنستجرام", "https://www.instagram.com/dr_mohamed_elrayes", "ig", 1],
    ]],
  ];


  const item = ([label, href, icon, ext]) =>
    `<li><a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ""}>${
      icon ? `<svg class="fi" viewBox="0 0 24 24" aria-hidden="true">${ICON[icon]}</svg>` : ""
    }${label}</a></li>`;

  const FOOTER = () => `<footer class="ft" aria-label="Footer">
      <div class="fg">
        <div class="fbrand">
          <img
            class="flogo"
            src="assets/images/logo.jpg"
            alt="MFT Medical Fitness Transformation logo"
            width="110"
            height="110"
            loading="lazy"
          />
          <p class="ap" lang="ar" dir="rtl">
            نساعدك على بناء جسم أقوى، وصحة أفضل، وعادات تستطيع الاستمرار عليها.
          </p>
          <p class="fdoc">
            <b lang="ar">د. محمد الريس</b>
            <span>Founder &amp; Medical Fitness Director</span>
          </p>
        </div>
        ${COLS.map(
          ([title, links]) =>
            `<nav class="fcol" aria-label="${title}"><h3>${title}</h3><ul>${links.map(item).join("")}</ul></nav>`,
        ).join("")}
      </div>
      <div class="fbar">
        <p dir="ltr">© ${new Date().getFullYear()} MFT – Medical Fitness Transformation. All rights reserved.</p>
      </div>
    </footer>`;

  /* ---- أيقونة الواتساب (#chat): معرّفة هنا مرة واحدة وتتحقن في كل الصفحات ---- */
  const CHAT_SYMBOL = `<symbol id="chat" viewBox="0 0 512 512"><g fill="currentColor" stroke="none"><g><g><g><path d="M393.752,117.213c-36.487-36.531-85.018-56.663-136.656-56.685c-106.579,0-193.323,86.702-193.368,193.275 c-0.013,36.53,10.207,72.102,29.556,102.869l1.967,3.13l-17.311,63.241c-0.962,3.515,0.024,7.275,2.588,9.866 c2.563,2.591,6.311,3.616,9.838,2.693l65.169-17.096l3.018,1.792c29.69,17.617,63.711,26.937,98.391,26.952h0.076 c106.539,0,193.248-86.708,193.291-193.287C450.334,202.311,430.248,153.746,393.752,117.213z M257.019,426.853v10.199 l-0.071-10.199c-31.017-0.014-61.442-8.347-87.983-24.096l-6.684-3.97c-1.589-0.944-3.39-1.43-5.208-1.43 c-0.865,0-1.735,0.11-2.588,0.336l-52.206,13.695l13.83-50.525c0.754-2.756,0.318-5.701-1.203-8.121l-4.355-6.927 c-17.301-27.51-26.439-59.325-26.427-92.004c0.04-95.329,77.634-172.885,172.965-172.885 c46.184,0.02,89.593,18.026,122.229,50.702c32.646,32.679,50.614,76.122,50.593,122.325 C429.874,349.291,352.316,426.853,257.019,426.853z" ></path><path d="M436.562,74.432C388.635,26.458,324.874,0.024,257.02,0C117.128,0,3.271,113.845,3.214,253.779 c-0.013,43.133,10.96,85.616,31.776,123.152L1.537,499.106c-0.962,3.515,0.023,7.276,2.586,9.867 c1.94,1.962,4.561,3.027,7.251,3.027c0.862,0,1.732-0.109,2.588-0.333l125.271-32.858 c36.131,18.948,76.732,28.953,117.789,28.969c139.893,0,253.75-113.852,253.805-253.794 C510.85,186.167,484.476,122.401,436.562,74.432z M256.927,487.38c-38.925-0.015-77.492-9.837-111.528-28.405 c-2.284-1.245-4.956-1.571-7.472-0.912L25.877,487.453l29.898-109.189c0.719-2.627,0.358-5.433-1.004-7.792 c-20.397-35.344-31.172-75.693-31.159-116.686c0.052-128.69,104.759-233.387,233.404-233.387 c62.401,0.022,121.039,24.331,165.114,68.449c44.065,44.116,68.319,102.759,68.297,165.129 C490.376,382.676,385.67,487.38,256.927,487.38z" ></path></g></g></g><g><g><path d="M445.836,354.427c-4.835-2.887-11.098-1.31-13.986,3.527c-36.656,61.378-103.646,99.506-174.917,99.506 c-5.633,0-10.155,4.566-10.155,10.199c0,5.633,4.61,10.199,10.243,10.199c39.401,0,78.177-10.435,112.138-30.175 c32.931-19.143,60.666-46.554,80.205-79.27C452.252,363.577,450.673,357.316,445.836,354.427z" ></path></g></g><g><g><path d="M464.692,305.386c-5.395-1.616-11.081,1.447-12.697,6.844c-1.168,3.899-2.474,7.819-3.881,11.65 c-1.942,5.287,0.771,11.148,6.058,13.09c1.16,0.426,2.347,0.628,3.515,0.628c4.155,0,8.059-2.559,9.576-6.685 c1.548-4.218,2.986-8.535,4.272-12.83C473.153,312.686,470.089,307.001,464.692,305.386z" ></path></g></g><g><g><path d="M377.684,330.047l-57.246-57.246c-2.619-2.618-6.452-3.612-10.014-2.595l-8.526,2.436c-1.016,0.29-1.981,0.736-2.86,1.323 l-18.762,12.52c-22.402-15.483-41.899-35.347-56.971-58.031l13.7-13.701c1.226-1.225,2.118-2.743,2.595-4.409l2.437-8.526 c1.018-3.562,0.024-7.395-2.595-10.015l-57.246-57.246c-2.827-2.827-7.046-3.742-10.793-2.338l-9.744,3.654 c-1.363,0.51-2.601,1.308-3.631,2.338c-33.863,33.863-33.862,88.963,0,122.826l93.177,93.177 c16.934,16.934,39.17,25.397,61.413,25.397c22.237,0,44.483-8.467,61.411-25.395c1.029-1.03,1.827-2.268,2.338-3.631l3.654-9.744 C381.426,337.096,380.511,332.875,377.684,330.047z M358.073,341.276c-12.751,11.968-29.099,17.949-45.456,17.947 c-17.015-0.002-34.036-6.479-46.989-19.433l-93.177-93.177c-25.405-25.405-25.902-66.43-1.486-92.445l1.447-0.544l48.359,48.358 l-0.061,0.214l-17.619,17.62c-3.331,3.331-3.947,8.51-1.49,12.53c18.324,29.986,43.615,55.909,73.14,74.969 c3.415,2.204,7.813,2.171,11.194-0.085l23.1-15.414l1.222-0.351l48.359,48.36L358.073,341.276z" ></path></g></g></g></symbol>`;
  const ensureSprite = () => {
    if (document.getElementById("chat") || !document.body) return;
    const t = document.createElement("template");
    t.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${CHAT_SYMBOL}</defs></svg>`;
    document.body.prepend(t.content);
  };

  const frag = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content;
  };

  if (!customElements.get("site-nav"))
    customElements.define("site-nav", class extends HTMLElement {
      connectedCallback() {
        cur = this.getAttribute("current") || "";
        ensureSprite();
        this.replaceWith(frag(NAV()));
      }
    });
  if (!customElements.get("site-footer"))
    customElements.define("site-footer", class extends HTMLElement {
      connectedCallback() {
        ensureSprite();
        this.replaceWith(frag(FOOTER()));
      }
    });
})();
