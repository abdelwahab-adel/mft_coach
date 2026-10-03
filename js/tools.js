(() => {
  const pills = [...document.querySelectorAll(".af-pill[data-f]")],
    cards = [...document.querySelectorAll(".art[data-c]")],
    pager = document.querySelector(".af-pager"),
    per = 9;
  let cur = "all",
    pg = 1;
  const url = () => {
    const q = pg > 1 ? "?page=" + pg : "",
      h = cur === "all" ? "" : "#" + cur;
    history.replaceState(null, "", location.pathname + q + h);
  };
  const render = () => {
    const m = cards.filter(
        (c) => cur === "all" || c.dataset.c.split(" ").includes(cur),
      ),
      n = Math.max(1, Math.ceil(m.length / per));
    pg = Math.min(pg, n);
    cards.forEach((c) => (c.hidden = true));
    m.slice((pg - 1) * per, pg * per).forEach((c) => (c.hidden = false));
    pills.forEach((p) => {
      const on = p.dataset.f === cur;
      p.classList.toggle("on", on);
      p.setAttribute("aria-pressed", on);
    });
    if (pager) {
      pager.hidden = n < 2;
      const b = (l, p, o = {}) =>
        '<button type="button" data-p="' +
        p +
        '"' +
        (o.d ? " disabled" : "") +
        (o.cur ? ' aria-current="page"' : "") +
        (o.al ? ' aria-label="' + o.al + '"' : "") +
        ">" +
        l +
        "</button>";
      pager.innerHTML =
        b("&lsaquo;", pg - 1, { d: pg === 1, al: "السابق" }) +
        Array.from({ length: n }, (_, k) =>
          b(k + 1, k + 1, { cur: k + 1 === pg }),
        ).join("") +
        b("&rsaquo;", pg + 1, { d: pg === n, al: "التالي" });
    }
  };
  if (pills.length) {
    pills.forEach((p) =>
      p.addEventListener("click", () => {
        cur = p.dataset.f;
        pg = 1;
        render();
        url();
      }),
    );
    if (pager)
      pager.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-p]");
        if (!b || b.disabled) return;
        pg = +b.dataset.p;
        render();
        url();
        document
          .querySelector(".af-pills")
          .scrollIntoView({ behavior: "smooth", block: "start" });
      });
    const h = location.hash.slice(1);
    cur = pills.some((p) => p.dataset.f === h) ? h : "all";
    pg = Math.max(1, +new URLSearchParams(location.search).get("page") || 1);
    render();
  }
})();
(() => {
  const f = document.getElementById("calc");
  if (!f) return;
  const $ = (id) => document.getElementById(id),
    N = (v) => Math.round(v).toLocaleString("en"),
    R10 = (v) => Math.round(v / 10) * 10,
    clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const GOALS = {
    "fat-loss": "خسارة الدهون",
    maintenance: "تثبيت الوزن",
    "muscle-gain": "بناء العضلات",
    "weight-gain": "زيادة الوزن",
  };
  const ERR_ID = {
    sex: "mft-sex-error",
    age: "mft-age-error",
    height: "mft-height-error",
    weight: "mft-weight-error",
    body_fat: "mft-body-fat-error",
    activity: "mft-activity-error",
    goal: "mft-goal-error",
  };
  const ORDER = [
    "sex",
    "age",
    "height",
    "weight",
    "body_fat",
    "activity",
    "goal",
  ];
  const GOAL_HELP = {
    "fat-loss":
      "استهداف خفض وزن الجسم أو نسبة الدهون تدريجيًا مع الحفاظ قدر الإمكان على الكتلة العضلية والنشاط البدني.",
    maintenance:
      "الحفاظ على الوزن الحالي مع دعم نظام غذائي متوازن ونمط حياة نشط ومستدام.",
    "muscle-gain":
      "دعم نمو الكتلة العضلية والأداء الرياضي من خلال التغذية المناسبة وتمارين المقاومة والتعافي الجيد.",
    "weight-gain":
      "زيادة وزن الجسم تدريجيًا عندما يكون ذلك مناسبًا للهدف والحالة الصحية.",
  };
  const res = $("mft-results");
  let done = false;
  /* قراءة رقم من حقل: null = فارغ، NaN = غير صالح */
  const num = (el) => {
    if (el.validity && el.validity.badInput) return NaN;
    const s = el.value.trim();
    if (s === "") return null;
    const v = Number(s);
    return Number.isFinite(v) ? v : NaN;
  };
  /* التحقق من المدخلات */
  const validate = () => {
    const e = {},
      v = {};
    v.sex = f.elements.sex.value;
    if (!v.sex) e.sex = "اختر الجنس.";
    const a = num(f.elements.age);
    v.age = a;
    if (a === null) e.age = "أدخل عمرك بالسنوات.";
    else if (Number.isNaN(a)) e.age = "أدخل العمر بالأرقام فقط.";
    else if (!Number.isInteger(a)) e.age = "أدخل العمر كرقم صحيح بدون كسور.";
    else if (a < 18)
      e.age =
        "هذه الحاسبة مخصصة للبالغين (18 سنة فأكثر). الأصغر سنًا يحتاجون تقييمًا مناسبًا للعمر والنمو.";
    else if (a > 90) e.age = "أدخل عمرًا صحيحًا بين 18 و90 سنة.";
    const h = num(f.elements.height);
    v.height = h;
    if (h === null) e.height = "أدخل طولك بالسنتيمتر.";
    else if (Number.isNaN(h)) e.height = "أدخل الطول بالأرقام فقط.";
    else if (h < 120 || h > 230)
      e.height = "أدخل طولًا منطقيًا بين 120 و230 سم.";
    const w = num(f.elements.weight);
    v.weight = w;
    if (w === null) e.weight = "أدخل وزنك بالكيلوجرام.";
    else if (Number.isNaN(w)) e.weight = "أدخل الوزن بالأرقام فقط.";
    else if (w < 30 || w > 300)
      e.weight = "أدخل وزنًا منطقيًا بين 30 و300 كجم.";
    if (!e.height && !e.weight) {
      const bmi = w / Math.pow(h / 100, 2);
      if (bmi < 13 || bmi > 70)
        e.weight = "الطول والوزن المدخلان غير متوافقين. راجع القيم والوحدات.";
    }
    const b = num(f.elements.body_fat);
    v.bodyFat = b;
    if (Number.isNaN(b) || (b !== null && (b < 3 || b > 70)))
      e.body_fat = "أدخل نسبة دهون منطقية بين 3% و70%، أو اترك الحقل فارغًا.";
    v.activity = num({ value: f.elements.activity.value, validity: null });
    if (!f.elements.activity.value || !(v.activity > 0))
      e.activity = "اختر مستوى نشاطك.";
    v.goal = f.elements.goal.value;
    if (!GOALS[v.goal]) e.goal = "اختر هدفك.";
    return { ok: !Object.keys(e).length, e, v };
  };
  /* الحساب: Mifflin–St Jeor ثم TDEE ثم الهدف ثم المغذيات */
  const compute = (v) => {
    const { sex, age, height: h, weight: w, activity, goal } = v;
    const bmr = 10 * w + 6.25 * h - 5 * age + (sex === "male" ? 5 : -161),
      tdee = bmr * activity;
    const floor = Math.max(bmr, sex === "male" ? 1500 : 1200);
    let t;
    if (goal === "fat-loss")
      t = Math.min(Math.max(tdee - Math.min(tdee * 0.2, 750), floor), tdee);
    else if (goal === "muscle-gain") t = tdee + clamp(tdee * 0.1, 150, 300);
    else if (goal === "weight-gain") t = tdee + clamp(tdee * 0.15, 250, 500);
    else t = tdee;
    const T = R10(t),
      B = R10(bmr),
      D = R10(tdee);
    const m = h / 100,
      bmi = w / (m * m),
      basis = bmi > 30 ? 30 * m * m : w;
    const pk = {
      "fat-loss": 2,
      maintenance: 1.6,
      "muscle-gain": 1.8,
      "weight-gain": 1.6,
    }[goal];
    let p = Math.min(pk * basis, (0.35 * T) / 4),
      fat = clamp(Math.max((0.25 * T) / 9, 0.6 * basis), 0, (0.35 * T) / 9),
      carb = (T - 4 * p - 9 * fat) / 4;
    const cMin = (0.2 * T) / 4;
    if (carb < cMin) {
      p = Math.max(1.2 * basis, (T - 9 * fat - 4 * cMin) / 4);
      carb = (T - 4 * p - 9 * fat) / 4;
    }
    p = Math.round(p);
    fat = Math.round(fat);
    carb = Math.max(Math.round((T - 4 * p - 9 * fat) / 4), 0);
    return {
      T,
      B,
      D,
      bmi,
      p,
      c: carb,
      f: fat,
      share: {
        p: ((p * 4) / T) * 100,
        c: ((carb * 4) / T) * 100,
        f: ((fat * 9) / T) * 100,
      },
    };
  };
  /* العرض */
  const show = (v, r) => {
    $("r-target").textContent = N(r.T);
    $("r-bmr").textContent = N(r.B);
    $("r-tdee").textContent = N(r.D);
    $("r-goal").textContent = GOALS[v.goal];
    const d = r.T - r.D;
    $("r-goal-note").textContent =
      v.goal === "maintenance"
        ? "السعرات المستهدفة قريبة من احتياج الحفاظ على الوزن."
        : d < 0
          ? "السعرات المستهدفة أقل بنحو " +
            N(-d) +
            " سعرة يوميًا من احتياج الحفاظ على الوزن (عجز معتدل)."
          : d > 0
            ? "السعرات المستهدفة أعلى بنحو " +
              N(d) +
              " سعرة يوميًا من احتياج الحفاظ على الوزن (فائض معتدل)."
            : "لم يُطبَّق عجز إضافي لأن احتياجك قريب من الحد الأدنى المناسب للسعرات.";
    $("r-caption").textContent =
      "تقدير السعرات اليومية وفقًا للهدف الذي اخترته" +
      (v.bodyFat !== null
        ? ". نسبة الدهون المدخلة لم تدخل في الحساب، فالتقدير يعتمد على معادلة ميفلين–سانت جيور."
        : ".");
    const al = $("r-alert");
    if (v.goal === "fat-loss" && r.bmi < 18.5) {
      al.textContent =
        "وزنك الحالي منخفض نسبيًا بالنسبة لطولك. يُفضّل استشارة مختص قبل السعي إلى خسارة المزيد من الوزن.";
      al.hidden = false;
    } else al.hidden = true;
    [
      ["p", r.p],
      ["c", r.c],
      ["f", r.f],
    ].forEach(([k, g]) => {
      $("m-" + k).textContent = N(g);
      const s = r.share[k];
      $("b-" + k).style.width = s.toFixed(1) + "%";
      $("b-" + k).parentNode.setAttribute("aria-valuenow", Math.round(s));
      $("s-" + k).textContent = "حوالي " + Math.round(s) + "% من السعرات";
    });
    res.hidden = false;
  };
  /* الأخطاء */
  const setErr = (k, msg) => {
    const el = $(ERR_ID[k]);
    if (!el) return;
    const fld = f.elements[k];
    if (msg) {
      el.textContent = msg;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
    if (
      fld &&
      (fld.tagName === "SELECT" ||
        (fld.tagName === "INPUT" && fld.type === "number"))
    ) {
      fld.setAttribute("aria-invalid", msg ? "true" : "false");
      const base =
        fld.dataset.base ??
        (fld.dataset.base = (fld.getAttribute("aria-describedby") || "")
          .replace(ERR_ID[k], "")
          .trim());
      fld.setAttribute(
        "aria-describedby",
        (base + (msg ? " " + ERR_ID[k] : "")).trim(),
      );
    }
  };
  f.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const r = validate();
    ORDER.forEach((k) => setErr(k, r.e[k]));
    if (!r.ok) {
      res.hidden = true;
      done = false;
      const k = ORDER.find((x) => r.e[x]),
        el = f.elements[k];
      (el.tagName ? el : el[0]).focus();
      return;
    }
    done = true;
    const out = compute(r.v);
    show(r.v, out);
    $("mft-status").textContent =
      "تم حساب النتائج: السعرات المستهدفة " + N(out.T) + " سعرة حرارية يوميًا.";
    const rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
    res.scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "start" });
    $("mft-results-title").focus({ preventScroll: true });
  });
  f.addEventListener("input", (ev) => {
    const n = ev.target.name;
    if (n === "goal" && GOAL_HELP[ev.target.value])
      $("mft-goal-help").textContent = GOAL_HELP[ev.target.value];
    if (n && ERR_ID[n]) setErr(n, "");
    if (!done) return;
    const r = validate();
    if (r.ok) show(r.v, compute(r.v));
    else res.hidden = true;
  });
})();
