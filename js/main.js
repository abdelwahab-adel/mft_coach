document.documentElement.classList.add("js");

/* رقم الواتساب مصدره layout.js (window.MFT_WA)، وهذا احتياطي فقط */
const WA_BASE = window.MFT_WA || "https://wa.me/201155822360";
const hasIO = "IntersectionObserver" in window;

/* ---------- ظهور العناصر عند التمرير ---------- */
const io = hasIO
  ? new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    )
  : null;
document.querySelectorAll(".rv").forEach((el) => {
  /* بدون IntersectionObserver نُظهر العنصر فورًا بدل تركه شفافًا للأبد */
  if (!io) return el.classList.add("in");
  el.style.transitionDelay =
    ([...el.parentNode.children].indexOf(el) % 6) * 90 + "ms";
  io.observe(el);
});

/* ---------- صور بديلة (بدل onerror المضمّن، ليتوافق مع CSP) ---------- */
document.querySelectorAll("img[data-fallback]").forEach((img) => {
  const swap = () => {
    const fb = img.dataset.fallback;
    img.removeAttribute("data-fallback"); // مرة واحدة فقط لتفادي التكرار اللانهائي
    if (fb) img.src = fb;
  };
  img.addEventListener("error", swap, { once: true });
  /* لو فشل التحميل قبل تنفيذ هذا السكربت */
  if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap();
});

/* ---------- أزرار تمرير الشريط (إن وُجد) ---------- */
const rail = document.querySelector(".rail");
if (rail)
  document
    .querySelectorAll("[data-dir]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        rail.scrollBy({
          left: b.dataset.dir * rail.clientWidth * 0.8,
          behavior: "smooth",
        }),
      ),
    );

/* ---------- نموذج التواصل -> رسالة واتساب جاهزة ---------- */
const cf = document.getElementById("cform");
if (cf) {
  /* يحذف محارف التحكم غير المرئية ويقصّ الطول (الحد الأقصى من maxlength الحقل) */
  const clean = (v, max) =>
    String(v)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim()
      .slice(0, max);
  /* الهاتف: 7–15 رقمًا فعليًا (يقبل الأرقام العربية). الـ pattern وحده كان يقبل مثل "+++++++" */
  const tel = cf.querySelector('input[type="tel"]');
  if (tel) {
    const chk = () => {
      const d = tel.value.replace(/[^0-9\u0660-\u0669]/g, "").length;
      tel.setCustomValidity(
        !tel.value || (d >= 7 && d <= 15) ? "" : tel.title || "أدخل رقم هاتف صحيحًا",
      );
    };
    tel.addEventListener("input", chk);
    chk();
  }
  cf.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cf.reportValidity()) return;
    const t = [...new FormData(cf)]
        .map(([k, v]) => {
          const fld = cf.elements[k];
          const max = fld && fld.maxLength > 0 ? fld.maxLength : 200;
          return [k, clean(v, max)];
        })
        .filter(([, v]) => v)
        .map(([k, v]) => "• " + k + ": " + v)
        .join("\n"),
      msg = "مرحبًا MFT 👋\nأرغب في بدء رحلتي معكم.\n\n" + t,
      u = WA_BASE + "?text=" + encodeURIComponent(msg),
      a = document.createElement("a");
    a.href = u;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    const st = document.getElementById("cstatus");
    if (st) {
      st.textContent = "تم تجهيز رسالتك. اضغط إرسال داخل واتساب لإتمام الطلب.";
      st.hidden = false;
    }
  });
}

/* ---------- عدّاد الأرقام (قسم الإحصاءات) ---------- */
if (hasIO) {
  const cio = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const t = e.target.textContent,
          m = t.match(/[\d.]+/);
        if (!m || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
        const n = parseFloat(m[0]),
          dec = (m[0].split(".")[1] || "").length,
          t0 = performance.now();
        const f = (now) => {
          const p = Math.min((now - t0) / 1400, 1);
          e.target.textContent = t.replace(
            m[0],
            (n * (1 - Math.pow(1 - p, 3))).toFixed(dec),
          );
          p < 1 && requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      }),
    { threshold: 0.6 },
  );
  document.querySelectorAll(".st b").forEach((b) => cio.observe(b));
}

/* ---------- قائمة الموبايل ---------- */
const nv = document.querySelector(".nav");
if (nv) {
  const sc = () => nv.classList.toggle("sc", scrollY > 30);
  sc();
  addEventListener("scroll", sc, { passive: true });
  const bg = nv.querySelector(".burger");
  const setOpen = (o) => {
    nv.classList.toggle("open", o);
    document.documentElement.classList.toggle("nav-lock", o); // يقفل تمرير الصفحة خلف القائمة (CSS ≤640px فقط)
    if (bg) {
      bg.setAttribute("aria-expanded", String(o));
      bg.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    }
  };
  if (bg) {
    bg.setAttribute("aria-expanded", "false");
    bg.addEventListener("click", () => setOpen(!nv.classList.contains("open")));
  }
  nv.querySelectorAll(".links a").forEach((a) =>
    a.addEventListener("click", () => setOpen(false)),
  );
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nv.classList.contains("open")) {
      setOpen(false);
      bg && bg.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (nv.classList.contains("open") && !nv.contains(e.target)) setOpen(false);
  });
  /* Safari القديم (< 14) لا يدعم addEventListener على MediaQueryList */
  const mq = matchMedia("(min-width: 1101px)");
  const onMq = (m) => {
    if (m.matches) setOpen(false);
  };
  mq.addEventListener ? mq.addEventListener("change", onMq) : mq.addListener(onMq);
}

/* الهاتف (≤ 699px): بطاقات «التدريب الأونلاين» و«المنهجية» تُطوى ويُفتح تفصيلها بالضغط.
   عنوان كل بطاقة يصير زرًّا حقيقيًا (لوحة المفاتيح وقارئات الشاشة)، والبطاقة كلها قابلة للضغط.
   خارج الهاتف (أو بدون JS) تُزال كل التعديلات ويبقى الشكل كما كان. */
(() => {
  const GROUPS = [
    { cards: "#coaching .oc-card", hide: ".oc-desc, .oc-chips" },
    { cards: "#method .pillars > li", hide: ".chips" },
  ];
  const mq = matchMedia("(max-width: 699px)");
  let seq = 0;
  const enable = () =>
    GROUPS.forEach((g) =>
      document.querySelectorAll(g.cards).forEach((card) => {
        const h = card.querySelector("h3"),
          parts = [...card.querySelectorAll(g.hide)];
        if (card.classList.contains("tg") || !h || !parts.length) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tg-btn";
        btn.setAttribute("aria-expanded", "false");
        parts.forEach((p) => p.id || (p.id = "tg-" + ++seq));
        btn.setAttribute("aria-controls", parts.map((p) => p.id).join(" "));
        while (h.firstChild) btn.appendChild(h.firstChild);
        h.appendChild(btn);
        card.classList.add("tg");
        btn.addEventListener("click", () => {
          btn.setAttribute("aria-expanded", String(card.classList.toggle("open")));
        });
      }),
    );
  const disable = () =>
    document.querySelectorAll(".tg").forEach((card) => {
      const btn = card.querySelector(".tg-btn");
      if (btn) {
        const h = btn.parentNode;
        while (btn.firstChild) h.insertBefore(btn.firstChild, btn);
        btn.remove();
      }
      card.classList.remove("tg", "open");
    });
  const sync = () => (mq.matches ? enable() : disable());
  sync();
  /* Safari القديم (< 14) لا يدعم addEventListener على MediaQueryList */
  mq.addEventListener ? mq.addEventListener("change", sync) : mq.addListener(sync);
})();

/* أزرار عائمة على كل الصفحات: واتساب (يسار) + سهم للعودة لأعلى الصفحة (يمين، يظهر بعد التمرير).
   رابط واتساب بدون نص: layout.js يضيف له الرقم والرسالة الجاهزة (data-wa="general") ويحدّثها وقت الضغط. */
(() => {
  if (document.querySelector(".fab")) return;
  const wa = window.MFT_WA || "https://wa.me/201155822360";
  const a = document.createElement("a");
  a.className = "fab fab-wa";
  a.href = wa;
  a.target = "_blank";
  a.rel = "noopener";
  a.dataset.wa = "general";
  a.setAttribute("aria-label", "تواصل معنا عبر واتساب");
  a.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
  const t = document.createElement("button");
  t.type = "button";
  t.className = "fab fab-top";
  t.setAttribute("aria-label", "العودة إلى أعلى الصفحة");
  t.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.append(a, t);
  const show = () => t.classList.toggle("show", scrollY > 400);
  show();
  addEventListener("scroll", show, { passive: true });
  t.addEventListener("click", () =>
    scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    }),
  );
})();
