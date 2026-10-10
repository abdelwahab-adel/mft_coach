/* ---------- كارت الحجز: خطوتان -> رسالة واتساب جاهزة ----------
 * - يفتح عند الضغط على أي زر حجز/ابدأ (رابط واتساب أو #contact) وعلى "اسأل عن هذا البرنامج"
 *   (وفي هذه الحالة يُختار البرنامج تلقائيًا).
 * - نموذج من خطوتين (صفحة 1: بياناتك الشخصية / صفحة 2: اختر برنامجك) ثم رسالة واتساب جاهزة.
 * - لا يُرسل أي بيانات إلى أي سيرفر: كل شيء يُجمَّع في رسالة واتساب يضغط العميل "إرسال" عليها بنفسه.
 * - لاستبعاد رابط من الكارت: أضف data-no-booking. ولإجبار أي رابط على فتحه: أضف data-booking.
 * - إن لم يدعم المتصفح <dialog> تبقى الروابط تعمل كما كانت (تفتح واتساب مباشرة).
 *
 * (CSS مقترح للإضافات الجديدة في آخر الملف)
 */
(() => {
  "use strict";
  if (typeof document.createElement("dialog").showModal !== "function") return;

  const WA = window.MFT_WA || "https://wa.me/201155822360";

  /* ---------- الخيارات (مطابقة لما هو مكتوب في الموقع) ---------- */
  const GOALS = ["خسارة الدهون", "بناء العضلات", "تثبيت الوزن", "زيادة الوزن", "تحسين اللياقة والصحة", "خطة تتناسب مع حالة صحية"];
  const PROGRAMS = ["إنقاص الوزن وإدارة تركيب الجسم", "بناء العضلات", "القوة والتحمل", "تحسين اللياقة", "تحول نمط الحياة", "التعافي وإعادة التأهيل"];
  const LEVELS = ["مبتدئ", "متوسط", "متقدم"];
  const AGES = Array.from({ length: 77 }, (_, i) => String(14 + i));
  /* الوزن (30 -> 200 كجم) والطول (120 -> 220 سم) - نفس فكرة السن (select جاهز) */
  const WEIGHTS = Array.from({ length: 171 }, (_, i) => String(30 + i));
  const HEIGHTS = Array.from({ length: 101 }, (_, i) => String(120 + i));
  /* الجنس (اختياري) */
  const GENDERS = ["ذكر", "أنثى"];
  /* الباقات والأسعار (جنيه مصري) كما في التصميم */
  const PLANS = [
    ["STARTER", "(بداية قوية)", 1500, "bolt"],
    ["TRANSFORMATION", "(تحول كامل)", 2500, "star"],
    ["ELITE", "(أعلى مستوى)", 3500, "crown"],
  ];


 const PAYS = [
  ["إنستا باي", "assets/images/pays/instapay-120h.webp"],
  ["اتصالات كاش", "assets/images/pays/etisalat-cash-120h.webp"],
];
  


  const money = (n) => "EGP " + n.toLocaleString("en");

  /* ---------- أدوات صغيرة ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /* أرقام عربية/فارسية -> لاتينية (لتسهيل التحقق وقراءة الرسالة) */
  const latin = (v) =>
    String(v)
      .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x660)
      .replace(/[\u06F0-\u06F9]/g, (d) => d.charCodeAt(0) - 0x6f0);
  const num = (v) => {
    const s = latin(v).replace(/[٫,]/g, ".").trim();
    return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
  };
  /* يحذف محارف التحكم غير المرئية ويقصّ الطول */
  const clean = (v, max) =>
    String(v)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/[ \t]+/g, " ")
      .trim()
      .slice(0, max);

  const range = (min, max, msg) => (v) => {
    const n = num(v);
    return n >= min && n <= max ? "" : msg;
  };
  /* قواعد التحقق: ترجع نص الخطأ أو "" إذا الحقل سليم */
  const RULES = {
    phone: (v) => {
      const s = latin(v);
      const d = s.replace(/\D/g, "").length;
      return /^[+\d\s()-]+$/.test(s) && d >= 7 && d <= 15 ? "" : "أدخل رقم هاتف صحيحًا";
    },
    email: (v) =>
      !v.trim() ||
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? ""
        : "اكتب بريدًا إلكترونيًا صحيحًا",
    weight: range(30, 300, "الوزن بين 30 و 300 كجم"),
    height: range(120, 230, "الطول بين 120 و 230 سم"),
  };
  const PICK = { goal: "اختر هدفك", program: "اختر البرنامج", level: "اختر مستواك الرياضي", age: "اختر عمرك", plan: "اختر الباقة", pay: "اختر طريقة الدفع" };

  /* ---------- الأيقونات (SVG خطّية 24×24) ---------- */
  const ICONS = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    run: '<svg class="ic" viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" stroke="none" d="M61.88 45.061c-.073-.799-.143-1.552-.092-2.121c.451-5.027-1.014-9.559-4.236-13.103c-3.655-4.021-9.417-6.422-15.412-6.422c-8.348 0-15.345 4.374-18.718 11.701c-.008.019-.018.038-.025.057c-.775-2.853-1.557-4.833-2.183-6.42c-1.058-2.684-1.626-4.123-1.171-7.279a3.841 3.841 0 0 0 2.207-1.012c.105.007.214.012.324.012c1.135 0 2.119-.43 2.83-1.196l.088.001c1.413 0 2.616-.611 3.417-1.689c1.954-.164 3.304-1.342 3.571-3.157c.36-2.436-.492-9.254-2.333-11.4C29.417 2.18 28.611 2 28.065 2c-3.115 0-7.987.719-12.123 1.788C8.404 5.736 7.226 7.703 7.039 9.2c-.765 6.177-1.899 11.687-2.901 16.549c-1.42 6.888-2.541 12.329-1.999 16.607c.211 1.669.632 3.101 1.038 4.484c.508 1.726 1.031 3.511 1.208 5.952c.243 3.393 3.907 5.339 10.053 5.339c2.409 0 4.866-.314 6.882-.873C23.792 58.442 31.949 62 40.661 62c2.996 0 5.787-.428 8.299-1.272c12.853-4.326 13.43-10.112 12.92-15.667M4.124 42.103C3.258 35.27 7.191 24.255 9.025 9.449c.311-2.505 11.713-5.127 17.985-5.41c-.255.205-.438.474-.462.76c.752-.341 1.875-.451 2.426.673c.029-.188.041-.355.041-.511c.288.564.551 1.333.773 2.209c.279 1.26.435 2.552.438 3.849c.002.901.198 4.113-1.285 3.695c-.914-.258-.937-1.101-1.198-1.969c-.402-1.357-1.11-2.921-1.024-4.363c-.349 1.415.066 3.113.22 4.544c.088.833.664 3.084-.356 3.391c-.564.173-1.218-.224-1.685-.515c-.178-.112-.311-.931-.376-1.161c-.402-1.406-1.122-3.023-1.03-4.5c-.352 1.332-.009 2.937.103 4.302c.069.846.496 2.68-.458 3.106c-1.08.565-1.246-.805-1.446-1.523c-.371-1.333-.974-2.791-.958-4.189c-.377 1.703.066 3.697.139 5.441c.039.866-1.776 1.648-2.453 1.104c-1.061-.853-1.24-2.85-1.36-4.141c.318.434.774.995 1.353.938c-.492-.561-.701-1.523-1.03-2.205c-.302-.56-.915-1.893-1.636-1.915c.111.239.719 1.886.625 2.06c-.293.545-.578 1.099-.904 1.621c-.277.439-1.081 1.838-1.73 1.415c-.701-.454-1.141-2.487-1.141-2.487s.026 2.535.932 3.122c.858.558 1.836-.322 2.404-.95c.113 1.205.439 2.618 1.168 3.55c-2.142 9.499 1.801 9.404 4.459 22.102c0 0 1.752-2.583 3.284-5.91c3.343-7.262 10.316-10.498 17.038-10.498c6.666 0 13.804 3.408 16.398 9.3c.857 1.946 1.07 4.272.838 6.834c-.379 4.173 3.739 10.962-11.622 16.063c-12.189 4.047-27.181-3.713-27.181-3.713c-4.112 1.344-13.728 1.931-13.931-.917c-.335-4.665-1.816-7.04-2.259-10.548"></path><path fill="currentColor" stroke="none" d="M34.245 53.57c2.677.982 5.586 1.249 8.392.915c2.808-.34 5.556-1.257 7.95-2.803c1.188-.778 2.293-1.714 3.182-2.837c.869-1.127 1.573-2.429 1.736-3.81c-1.728 2.114-3.926 3.278-6.191 4.203c-2.277.9-4.672 1.461-7.086 1.75c-2.416.279-4.855.282-7.271-.093a21.33 21.33 0 0 1-7.174-2.484c1.364 2.402 3.804 4.179 6.462 5.159"></path><path fill="currentColor" stroke="none" d="M25.566 6.85c.424-2.749-2.332-1.844-2.428-.672c.752-.342 1.877-.451 2.428.672"></path><path fill="currentColor" stroke="none" d="M22.841 8.37c.425-2.75-2.33-1.847-2.426-.671c.752-.345 1.876-.453 2.426.671"></path><path fill="currentColor" stroke="none" d="M19.694 9.957c.425-2.749-2.33-1.845-2.426-.671c.753-.345 1.875-.452 2.426.671"></path></svg>',
    clip: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    scale: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10a4 4 0 0 1 8 0M12 10l1.8-2"/>',
    ruler: '<rect x="9" y="3" width="6" height="18" rx="1.5"/><path d="M9 7h2.5M9 11h2M9 15h2.5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    fork: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/><path d="M6 11h3l1.5-3 2.5 6 1.5-3H18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  };
  const ico = (k, cls = "bk-ic") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

  /* ---------- قوالب الحقول ---------- */
  const req = '<b class="bk-req" aria-hidden="true">*</b>';
  const opts = (arr, ph) => `<option value="" disabled selected>${ph}</option>` + arr.map((v) => `<option>${esc(v)}</option>`).join("");
  const text = (key, label, icon, attrs, optional = false) =>
    `<div class="bk-f" data-f="${key}" data-kind="text"
      ${optional ? 'data-optional="1"' : ""}>
      <label for="bk-${key}">${label} ${optional ? "" : req}</label>
      <div class="bk-box">
        <input class="bk-in" id="bk-${key}" ${attrs}>
        ${ico(icon)}
      </div>
    </div>`;
  const select = (key, label, icon, name, arr, ph, optional = false) =>
    `<div class="bk-f" data-f="${key}" data-kind="select"${optional ? ' data-optional="1"' : ""}><label for="bk-${key}">${label} ${optional ? "" : req}</label><div class="bk-box bk-sel">${ico(icon)}<select class="bk-in" id="bk-${key}" name="${name}">${opts(arr, ph)}</select>${ico("chev", "bk-chev")}</div></div>`;

  /* ---------- عدد الصفحات ---------- */
  const TOTAL_STEPS = 2;
  let currentStep = 1;

  const TEMPLATE = `
<div class="bk-card">
  <button type="button" class="bk-x" data-act="close" aria-label="إغلاق">${ico("x", "")}</button>

  <aside class="bk-side">
    <div class="bk-sbg" aria-hidden="true"></div>
    <div class="bk-sin" lang="ar" dir="rtl">
      <div class="bk-brand">
        <div class="bk-logo" dir="ltr"><svg class="bk-pulse" viewBox="0 0 48 24" aria-hidden="true"><path d="M1 13h10l3-9 5 17 4-12 3 4h21"/></svg><b>MFT</b><b class="r">Coach</b></div>
        <small dir="ltr">ONLINE MEDICAL FITNESS COACHING</small>
      </div>
      <div class="bk-hl">ابدأ رحلتك مع<span dir="ltr">MFT Coach</span></div>
      <p class="bk-lead">برنامج متكامل يجمع بين التدريب الرياضي والتغذية والمتابعة الصحية، لتحقيق أفضل نسخة من نفسك.</p>
      <ul class="bk-feats">
        <li><span class="bk-fi">${ico("user", "")}</span><div><b>خطة مخصصة لك</b><small>حسب هدفك وحالتك الصحية</small></div></li>
        <li><span class="bk-fi">${ico("fork", "")}</span><div><b>تغذية متوازنة</b><small>تدعم تقدمك ونتائجك</small></div></li>
        <li><span class="bk-fi">${ico("heart", "")}</span><div><b>متابعة مستمرة</b><small>مع فريق متخصص</small></div></li>
      </ul>
      <div class="bk-tag" dir="ltr"><svg viewBox="0 0 220 24" aria-hidden="true" preserveAspectRatio="none"><path d="M0 12h70l8-8 10 18 9-14 6 4h117"/></svg><span>HEALTHIER • STRONGER • BETTER YOU</span></div>
    </div>
  </aside>

  <div class="bk-main">
    <form class="bk-form" novalidate>
      <div class="bk-body">
        <div class="bk-top" aria-hidden="true">
          <span class="bk-stp">الخطوة <b class="bk-cur">1</b> من ${TOTAL_STEPS}</span>
          <span class="bk-bar">
            <i class="bk-bdot"></i>
            <i class="bk-bdot"></i>
          </span>
        </div>

        <!-- ============ الصفحة 1: البيانات الشخصية ============ -->
        <div class="bk-step" data-step="1">
          <h2 class="bk-title" id="bk-title-1" tabindex="-1">بياناتك الشخصية</h2>
          <p class="bk-sub">ابدأ بمعلوماتك الأساسية لنبدأ رحلتك معنا.</p>

          <div class="bk-grid">
            ${text("name", "الاسم الكامل", "user", 'name="الاسم" type="text" maxlength="80" autocomplete="name" placeholder="الاسم الكامل"')}
            ${text("phone", "رقم الهاتف", "phone", 'name="الهاتف" type="tel" maxlength="20" autocomplete="tel" inputmode="tel" dir="ltr" placeholder="+20 1X XXXX XXXX"')}
            ${text(
              "email",
              "البريد الإلكتروني (اختياري)",
              "mail",
              'name="email" type="email" maxlength="100" autocomplete="email" dir="ltr" placeholder="name@domain.com"',
              true
            )}
            ${text(
              "address",
              "العنوان (اختياري)",
              "pin",
              'name="العنوان" type="text" maxlength="120" autocomplete="street-address" placeholder="العنوان"',
              true
            )}
            ${select("age", "السن", "cal", "السن", AGES, "اختر عمرك")}
            ${select("gender", "الجنس (اختياري)", "user", "الجنس", GENDERS, "—", true)}
            ${select("weight", "الوزن (كجم)", "scale", "الوزن", WEIGHTS, "اختر وزنك")}
            ${select("height", "الطول (سم)", "ruler", "الطول", HEIGHTS, "اختر طولك")}
          </div>
        </div>

        <!-- ============ الصفحة 2: اختيار البرنامج ============ -->
        <div class="bk-step" data-step="2" hidden>
          <h2 class="bk-title" id="bk-title-2" tabindex="-1">اختر برنامجك</h2>
          <p class="bk-sub">حدّد هدفك والباقة المناسبة، وسنتولى الباقي.</p>

          <div class="bk-grid">
            ${select("goal", "الهدف", "target", "الهدف", GOALS, "اختر هدفك")}
            ${select("program", "البرنامج", "clip", "البرنامج", PROGRAMS, "اختر البرنامج")}
            ${select("level", "المستوى الرياضي", "run", "المستوى", LEVELS, "اختر مستواك الرياضي")}

            <fieldset class="bk-f bk-full" data-f="plan" data-kind="radio"><legend>الأسعار ${req}</legend><div class="bk-plans">
              ${PLANS.map(([n, t, p, ic], i) => `<label class="bk-opt"><input type="radio" name="plan" value="${n}"${i ? "" : " checked"}><span class="bk-oc bk-pc">${ico(ic, "bk-oi")}<span class="bk-pt"><b dir="ltr">${n}</b><small>${t}</small><em dir="ltr">${money(p)}</em></span><i class="bk-rad"></i></span></label>`).join("")}
            </div></fieldset>

          <fieldset class="bk-f bk-full" data-f="pay" data-kind="radio">
  <legend>طريقة الدفع ${req}</legend>

  <div class="bk-pays">
    ${PAYS.map(([n, img], i) => `
      <label class="bk-opt">
        <input
          type="radio"
          name="pay"
          value="${esc(n)}"
          ${i === 0 ? "checked" : ""}
        >

        <span class="bk-oc">
          <img
            src="${esc(img)}"
            alt="${esc(n)}"
            class="bk-pay-logo"
            loading="lazy"
          >
          <b>${esc(n)}</b>
        </span>
      </label>
    `).join("")}
  </div>
</fieldset>

            <div class="bk-f bk-full" data-f="msg" data-kind="text" data-optional="1"><label for="bk-msg">رسالة اختيارية</label><div class="bk-box"><textarea class="bk-in" id="bk-msg" name="الرسالة" rows="2" maxlength="300" placeholder="اكتب رسالتك هنا..."></textarea></div></div>
          </div>
        </div>
      </div>

      <div class="bk-foot">
        <p class="bk-sum" id="bk-sum" role="alert" hidden></p>

        <div class="bk-actions" data-step="1">
          <button type="button" class="bk-submit bk-next" data-act="next">
            <span>التالي</span>
            
          </button>
        </div>

        <div class="bk-actions" data-step="2" hidden>
          <button type="button" class="bk-back" data-act="prev">
            
            <span>السابق</span>
          </button>
          <button type="submit" class="bk-submit bk-send">
            <span>إرسال طلب الاشتراك</span>
          </button>
        </div>

        <p class="bk-note">${ico("info", "")}<span>سيتم فتح واتساب لإرسال بياناتك، ولن يتم إرسال أي شيء قبل ضغطك على زر الإرسال هناك.</span></p>
      </div>
    </form>

    <div class="bk-done" hidden>
      <div class="bk-ok" aria-hidden="true">${ico("ok", "")}</div>
      <h2 class="bk-title" id="bk-done-t" tabindex="-1">تم تجهيز رسالتك</h2>
      <p>فتحنا لك واتساب برسالة جاهزة تحتوي على بياناتك. اضغط <strong>إرسال</strong> داخل واتساب لإتمام الطلب، وسنتواصل معك هناك.</p>
      <p class="bk-small">لم يفتح واتساب؟ <a class="bk-link" data-fallback target="_blank" rel="noopener noreferrer" href="${WA}">اضغط هنا لفتحه</a></p>
      <button type="button" class="bk-submit bk-close" data-act="close"><span>إغلاق</span></button>
    </div>
  </div>
</div>`;

  let dlg, form, sumEl, doneEl, formWrap, opener = null;

  function finish() {
    document.documentElement.classList.remove("bk-lock");
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  }
  function shut() {
    if (dlg.open) dlg.close();
    finish();
  }

  /* ---------- التنقل بين الصفحات ---------- */
  function goToStep(n) {
    if (n < 1 || n > TOTAL_STEPS) return;
    currentStep = n;

    /* إظهار/إخفاء صفحات النموذج */
    dlg.querySelectorAll(".bk-step").forEach((el) => {
      el.hidden = +el.dataset.step !== n;
    });
    /* إظهار/إخفاء أزرار الفوتر الخاصة بكل صفحة */
    dlg.querySelectorAll(".bk-actions").forEach((el) => {
      el.hidden = +el.dataset.step !== n;
    });
    /* تحديث رقم الخطوة في الـ header */
    dlg.querySelector(".bk-cur").textContent = n;
    /* تحديث الـ progress bar (نقطتين) */
    dlg.querySelectorAll(".bk-bdot").forEach((dot, i) => {
      dot.classList.toggle("on", i < n);
      dot.classList.toggle("cur", i === n - 1);
    });
    /* تحديث aria-labelledby ديناميكيًا لقارئات الشاشة */
    dlg.setAttribute("aria-labelledby", "bk-title-" + n);
    /* سكرول لأعلى الصفحة الجديدة + مسح الأخطاء */
    dlg.querySelector(".bk-body").scrollTop = 0;
    dlg.querySelectorAll(".bk-f.bad").forEach((w) => setErr(w, ""));
    sumEl.hidden = true;
    /* نقل التركيز إلى عنوان الصفحة الجديدة (في غير اللمس) */
    const t = dlg.querySelector("#bk-title-" + n);
    if (t) t.focus({ preventScroll: true });
  }

  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "bk";
    dlg.setAttribute("lang", "ar");
    dlg.setAttribute("dir", "rtl");
    dlg.setAttribute("aria-labelledby", "bk-title-1");
    dlg.innerHTML = TEMPLATE; /* قالب ثابت بالكامل: لا يدخل فيه أي إدخال من المستخدم */
    document.body.appendChild(dlg);
    form = dlg.querySelector(".bk-form");
    sumEl = dlg.querySelector("#bk-sum");
    doneEl = dlg.querySelector(".bk-done");
    formWrap = form;

    /* رسالة خطأ لكل حقل */
    dlg.querySelectorAll(".bk-f").forEach((w) => {
      const e = document.createElement("small");
      e.className = "bk-fe";
      e.id = "bk-e-" + w.dataset.f;
      e.hidden = true;
      w.appendChild(e);
    });

    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest('[data-act="close"]')) {
        shut(); /* الخلفية أو زر الإغلاق */
      } else if (e.target.closest('[data-act="next"]')) {
        e.preventDefault();
        e.stopPropagation();
        if (validate()) goToStep(currentStep + 1);
      } else if (e.target.closest('[data-act="prev"]')) {
        e.preventDefault();
        e.stopPropagation();
        goToStep(currentStep - 1);
      }
    });
    /* Esc أو أي إغلاق آخر: فك قفل التمرير وإرجاع التركيز */
    dlg.addEventListener("cancel", finish);
    dlg.addEventListener("close", finish);
    /* مسح خطأ الحقل أثناء الكتابة/الاختيار */
    form.addEventListener("input", (e) => {
      const w = e.target.closest(".bk-f");
      if (w) setErr(w, "");
      if (!form.querySelector(".bk-f.bad")) sumEl.hidden = true;
    });
    /* Enter في حقل نصي = روح للصفحة التالية (أو ابعت لو على آخر صفحة) */
    form.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const t = e.target;
      if (t.tagName === "TEXTAREA" || t.tagName === "BUTTON") return;
      if (t.tagName === "INPUT" && (t.type === "button" || t.type === "submit" || t.type === "checkbox" || t.type === "radio")) return;
      e.preventDefault();
      if (currentStep < TOTAL_STEPS) {
        if (validate()) goToStep(currentStep + 1);
      } else if (validate()) {
        send();
      }
    });
    /* الإرسال النهائي: لو مش على آخر صفحة، روح للتالية بدل ما تبعت */
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (currentStep < TOTAL_STEPS) {
        if (validate()) goToStep(currentStep + 1);
      } else if (validate()) {
        send();
      }
    });
  }

  /* ---------- التحقق (للصفحة الحالية فقط) ---------- */
  function check(w) {
    const k = w.dataset.f;

    if (w.dataset.kind === "radio") {
      return form.elements[k].value ? "" : PICK[k];
    }

    const el = w.querySelector(".bk-in");
    const v = el.value.trim();

    if (!v) {
      return w.dataset.optional === "1" ? "" : "هذا الحقل مطلوب";
    }

    if (w.dataset.kind === "select") {
      return "";
    }

    return RULES[k] ? RULES[k](v) : "";
  }
  function setErr(w, msg) {
    const e = w.querySelector(".bk-fe");
    if (!e) return;
    e.textContent = msg;
    e.hidden = !msg;
    w.classList.toggle("bad", !!msg);
    w.querySelectorAll(".bk-in, input[type=radio]").forEach((c) => {
      if (msg) {
        c.setAttribute("aria-invalid", "true");
        c.setAttribute("aria-describedby", e.id);
      } else {
        c.removeAttribute("aria-invalid");
        c.removeAttribute("aria-describedby");
      }
    });
  }
  function validate() {
    let first = null, count = 0;
    /* التحقق يقتصر على حقول الصفحة الحالية فقط */
    dlg.querySelectorAll(`.bk-step[data-step="${currentStep}"] .bk-f`).forEach((w) => {
      const msg = check(w);
      setErr(w, msg);
      if (msg) {
        count++;
        first = first || w;
      }
    });
    sumEl.hidden = !count;
    sumEl.textContent = count ? (count === 1 ? "راجع الحقل المحدد بالأحمر." : `راجع الحقول المحددة بالأحمر (${count}).`) : "";
    if (first) {
      first.querySelector(".bk-in, input[type=radio]").focus({ preventScroll: true });
      first.scrollIntoView({ block: "center", behavior: "smooth" });
      return false;
    }
    return true;
  }

  /* ---------- الإرسال النهائي: رسالة واتساب جاهزة ---------- */
  function send() {
    const v = (k) => clean(form.elements[k].value, form.elements[k].maxLength > 0 ? form.elements[k].maxLength : 200);
    const plan = PLANS.find((p) => p[0] === form.elements.plan.value);
    const lines = [
      ["الاسم", v("الاسم")],
      ["الهاتف", latin(v("الهاتف"))],
      ["البريد الإلكتروني", v("email")],
      ["العنوان", v("العنوان")],
      ["السن", latin(v("السن")) + " سنة"],
      ["الجنس", v("الجنس")],
      ["الوزن", latin(v("الوزن")).replace(/[٫,]/g, ".") + " كجم"],
      ["الطول", latin(v("الطول")) + " سم"],
      ["الهدف", v("الهدف")],
      ["البرنامج", v("البرنامج")],
      ["المستوى الرياضي", v("المستوى")],
      ["الباقة", plan ? plan[0] + " (" + money(plan[2]) + ")" : ""],
      ["طريقة الدفع", clean(form.elements.pay.value, 20)],
      ["الرسالة", v("الرسالة")],
    ]
      .filter(([, x]) => x)
      .map(([k, x]) => "• " + k + ": " + x)
      .join("\n");
    const msg = "مرحبًا MFT 👋\nأرغب في الاشتراك في برامج MFT، وهذه بياناتي:\n\n" + lines;
    const url = WA + "?text=" + encodeURIComponent(msg);

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    doneEl.querySelector("[data-fallback]").href = url;
    formWrap.hidden = true;
    doneEl.hidden = false;
    form.reset();
    dlg.querySelectorAll(".bk-f").forEach((w) => setErr(w, ""));
    sumEl.hidden = true;
    doneEl.querySelector("#bk-done-t").focus({ preventScroll: true });
  }

  /* ---------- الفتح ---------- */
  function open(opt = {}) {
    if (!dlg) build();
    if (dlg.open) return;
    formWrap.hidden = false;
    doneEl.hidden = true;
    sumEl.hidden = true;
    goToStep(1); /* ابدأ دايمًا من الصفحة 1 */
    dlg.querySelector(".bk-body").scrollTop = 0;
    if (opt.program) {
      const p = PROGRAMS.find((x) => opt.program.includes(x) || x.includes(opt.program));
      if (p) form.elements["البرنامج"].value = p;
    }
    document.documentElement.classList.add("bk-lock");
    dlg.showModal();
    /* على اللمس لا نركّز على حقل (حتى لا تظهر لوحة المفاتيح فوق الكارت)، وعلى غيره نركّز على الاسم */
    if (window.matchMedia("(pointer:coarse)").matches) {
      dlg.querySelector("#bk-title-1").focus({ preventScroll: true });
    } else {
      form.elements["الاسم"].focus({ preventScroll: true });
    }
  }
  window.MFT_BOOKING = { open };

  /* ---------- أي رابط "حجز/ابدأ" يفتح الكارت ---------- */
  const INTENT = /احجز|استشار|ابدأ|اسأل عن هذا البرنامج|book|consult/i;
  const skip = (a) => a.closest("[data-no-booking]") || a.matches(".soc, .ct-cta, .fab") || a.dataset.wa === "general";
  function wants(a) {
    if (a.hasAttribute("data-booking")) return true;
    if (skip(a)) return false;
    const h = a.getAttribute("href") || "";
    if (!/wa\.me\//.test(h) && !/(^|\/|index\.html)#contact$/.test(h)) return false;
    return INTENT.test(a.textContent || "");
  }
  function programFrom(a) {
    try {
      const q = new URL(a.href, location.href).searchParams.get("text") || "";
      const m = q.match(/برنامج:\s*(.+)/);
      return m ? m[1].trim() : "";
    } catch (_) {
      return "";
    }
  }
  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || !wants(a)) return;
      e.preventDefault();
      opener = a;
      open({ program: programFrom(a) });
    },
    true,
  );
})();

/* ============================================================
 * CSS مقترح (أضفه لملف الستايل عندك — اختياري، السكربت يعمل بدونه)
 * ملاحظة: شيلنا الـ comments الداخلية من هنا عشان الـ block comments
 * في JS بتتقفل عند أول علامة إغلاق، فلو سبنا comments جوه كانت بتكسر التحليل.
 * ============================================================
.bk-step[hidden] { display: none !important; }

.bk-bdot {
  width: 28px; height: 6px; border-radius: 3px;
  background: rgba(0,0,0,.12); display: inline-block;
  transition: background .25s, box-shadow .25s;
}
.bk-bdot.on { background: var(--bk-accent, #16a34a); }
.bk-bdot.cur { box-shadow: 0 0 0 3px rgba(22,163,74,.18); }

.bk-actions { display: flex; gap: 10px; align-items: stretch; }
.bk-actions .bk-submit { flex: 1; }

.bk-go {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; flex-shrink: 0;
}

.bk-arr {
  width: 18px; height: 18px; fill: currentColor;
  transition: transform .2s;
}

.bk-back {
  appearance: none;
  border: 1px solid rgba(0, 0, 0, .14);
  background: #fff;
  color: #333;
  padding: 12px 20px;
  border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px;
  font: inherit; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .04);
  transition: background .2s, border-color .2s, transform .15s, box-shadow .2s, color .2s;
}
.bk-back:hover {
  background: #f6f6f6;
  border-color: rgba(0, 0, 0, .24);
  color: var(--bk-accent, #16a34a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, .08);
}
.bk-back:active { transform: translateY(0); box-shadow: 0 1px 2px rgba(0, 0, 0, .04); }
.bk-back:focus-visible {
  outline: 2px solid var(--bk-accent, #16a34a);
  outline-offset: 2px;
}

.bk-flip { transform: scaleX(-1); }

.bk-submit:hover .bk-arr { transform: translateX(-4px); }
.bk-back:hover .bk-arr { transform: translateX(4px); }
.bk-flip:hover .bk-arr { transform: translateX(4px) scaleX(-1); }
*/
// ↑ انتهى تعليق CSS المقترح — الكود JS كله فوق ضمن الـ IIFE فقط
