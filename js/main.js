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
