document.documentElement.classList.add("js");
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12 },
);
document.querySelectorAll(".rv").forEach((el) => {
  el.style.transitionDelay =
    ([...el.parentNode.children].indexOf(el) % 6) * 90 + "ms";
  io.observe(el);
});
const rail = document.querySelector(".rail");
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
const cf = document.getElementById("cform");
if (cf)
  cf.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cf.reportValidity()) return;
    const t = [...new FormData(cf)]
        .filter(([, v]) => String(v).trim())
        .map(([k, v]) => "• " + k + ": " + String(v).trim())
        .join("\n"),
      msg = "مرحبًا MFT 👋\nأرغب في بدء رحلتي معكم.\n\n" + t,
      u = "https://wa.me/201155822360?text=" + encodeURIComponent(msg),
      a = document.createElement("a");
    a.href = u;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    const st = document.getElementById("cstatus");
    if (st) {
      st.textContent = "تم تجهيز رسالتك. اضغط إرسال داخل واتساب لإتمام الطلب.";
      st.hidden = false;
    }
  });
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

const nv = document.querySelector(".nav");
if (nv) {
  const sc = () => nv.classList.toggle("sc", scrollY > 30);
  sc();
  addEventListener("scroll", sc, { passive: true });
  const bg = nv.querySelector(".burger");
  if (bg) {
    bg.setAttribute("aria-expanded", "false");
    bg.addEventListener("click", () => {
      const o = nv.classList.toggle("open");
      bg.setAttribute("aria-expanded", o);
    });
  }
  nv.querySelectorAll(".links a").forEach((a) =>
    a.addEventListener("click", () => nv.classList.remove("open")),
  );
}
