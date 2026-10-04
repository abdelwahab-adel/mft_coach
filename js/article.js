/*
 * article.js – يرسم صفحة المقال الواحدة article.html من js/articles-data.js
 * الرابط: article.html?id=2
 *
 * يجب تحميله بعد articles-data.js وقبل main.js (انظر article.html).
 */
(() => {
  const ARTICLES = window.ARTICLES || [];
  const CATS = window.ARTICLE_CATS || {};
  const SITE = "MFT";
  const BLOCKS = ["h2", "h3", "p"];

  const $ = (id) => document.getElementById(id);

  // إنشاء عنصر بنص آمن (textContent) بدل innerHTML
  const el = (tag, attrs, text) => {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  };

  // يضبط وسم <meta> وينشئه إن لم يكن موجودًا
  const meta = (key, value, byProperty) => {
    const attr = byProperty ? "property" : "name";
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) {
      m = el("meta", { [attr]: key });
      document.head.appendChild(m);
    }
    m.setAttribute("content", value);
  };

  const articleUrl = (id) => "article.html?id=" + id;

  // يسمح فقط بروابط http(s) — يمنع javascript: و data: لو دخلت بيانات غير موثوقة مستقبلًا
  const safeUrl = (u, fallback) => {
    try {
      return /^https?:$/.test(new URL(u, location.href).protocol) ? u : fallback;
    } catch (_) {
      return fallback;
    }
  };

  // الصورة المصغّرة للبطاقات = نفس صورة المقال بعرض 700
  const thumb = (url) => url.replace("w=1200", "w=700");

  const notFound = () => {
    document.title = "المقال غير موجود – " + SITE;
    meta("robots", "noindex");
    $("notfound").hidden = false;
  };

  const renderBody = (blocks) => {
    const box = $("a-body");
    blocks.forEach((b) => {
      const type = Object.keys(b)[0];
      const val = b[type];
      if (type === "ul") {
        const ul = el("ul");
        val.forEach((t) => ul.appendChild(el("li", null, t)));
        box.appendChild(ul);
      } else if (BLOCKS.includes(type)) {
        box.appendChild(el(type, null, val));
      }
    });
  };

  const renderSources = (sources) => {
    if (!sources || !sources.length) {
      $("a-src").remove();
      return;
    }
    const list = $("a-srclist");
    sources.forEach(([label, href]) => {
      const a = el("a", { href: safeUrl(href, "#"), target: "_blank", rel: "noopener noreferrer" }, label);
      const li = el("li");
      li.appendChild(a);
      list.appendChild(li);
    });
  };

  const relatedCard = (r) => {
    const a = el("a", {
      class: "art rv",
      href: articleUrl(r.id),
      "data-c": r.cat,
    });

    const im = el("div", { class: "art-im", role: "img", "aria-label": r.title });
    im.style.backgroundImage = "url(" + JSON.stringify(safeUrl(thumb(r.img), "")) + ")";

    const body = el("div", { class: "art-b", lang: "ar", dir: "rtl" });
    body.appendChild(el("h3", null, r.title));
    body.appendChild(el("p", { class: "art-d" }, r.desc));

    a.appendChild(im);
    a.appendChild(el("span", { class: "art-tag", lang: "ar" }, CATS[r.cat] || ""));
    a.appendChild(body);
    return a;
  };

  // المقالات الثلاثة التالية بالترتيب الدائري (المقال الأخير يعود للأول)
  const renderRelated = (index) => {
    const grid = $("a-rel");
    const count = Math.min(3, ARTICLES.length - 1);
    for (let k = 1; k <= count; k++) {
      grid.appendChild(relatedCard(ARTICLES[(index + k) % ARTICLES.length]));
    }
    if (count > 0) $("related").hidden = false;
  };

  const render = () => {
    const raw = new URLSearchParams(location.search).get("id");
    const id = /^\d+$/.test(raw || "") ? Number(raw) : NaN;
    const index = ARTICLES.findIndex((a) => a.id === id);
    if (index < 0) return notFound();

    const a = ARTICLES[index];

    // وسوم الصفحة (العنوان، الوصف، المشاركة)
    document.title = a.title + " – " + SITE;
    meta("description", a.desc);
    meta("og:title", a.title, true);
    meta("og:description", a.desc, true);
    meta("og:image", safeUrl(a.img, ""), true);

    // محتوى المقال
    $("a-tag").textContent = CATS[a.cat] || "";
    $("a-aud").textContent = a.aud || "";
    $("a-title").textContent = a.title;
    const img = $("a-img");
    img.src = safeUrl(a.img, "");
    img.alt = a.title;
    renderBody(a.body);
    renderSources(a.sources);
    $("article").hidden = false;

    renderRelated(index);
  };

  render();
})();
