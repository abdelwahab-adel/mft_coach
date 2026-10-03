(() => {
  const f = document.getElementById("calc");
  if (!f) return;
  const $ = (id) => document.getElementById(id),
    n = (v) => Math.round(v / 10) * 10,
    fmt = (v) => v.toLocaleString("en");
  const calc = (show) => {
    const d = new FormData(f),
      sex = d.get("sex"),
      age = +d.get("age"),
      h = +d.get("h"),
      w = +d.get("w"),
      act = +d.get("act"),
      goal = d.get("goal"),
      err = $("cerr");
    const ok =
      age >= 14 && age <= 90 && h >= 120 && h <= 230 && w >= 30 && w <= 250;
    if (!ok) {
      if (show) {
        err.hidden = false;
        err.textContent = "من فضلك أدخل قيمًا صحيحة للعمر والطول والوزن.";
      }
      return;
    }
    err.hidden = true;
    const bmr = 10 * w + 6.25 * h - 5 * age + (sex === "m" ? 5 : -161),
      tdee = bmr * act;
    let t =
      goal === "lose"
        ? Math.max(tdee * 0.8, bmr)
        : goal === "gain"
          ? tdee * 1.1
          : tdee;
    const p = 2 * w,
      fat = (t * 0.25) / 9,
      c = (t - p * 4 - fat * 9) / 4;
    $("r-t").textContent = fmt(n(t));
    $("r-b").textContent = fmt(n(bmr)) + " kcal";
    $("r-m").textContent = fmt(n(tdee)) + " kcal";
    $("r-p").textContent = Math.round(p) + " g";
    $("r-c").textContent = Math.round(Math.max(c, 0)) + " g";
    $("r-f").textContent = Math.round(fat) + " g";
    const gl = {
      lose: "خسارة الدهون",
      keep: "الحفاظ على الوزن",
      gain: "زيادة الكتلة",
    }[goal];
    $("r-wa").href =
      "https://wa.me/201155822360?text=" +
      encodeURIComponent(
        "مرحبًا، استخدمت حاسبة السعرات في موقع MFT:\nالعمر: " +
          age +
          " | الطول: " +
          h +
          " سم | الوزن: " +
          w +
          " كجم\nالهدف: " +
          gl +
          "\nالسعرات المقترحة: " +
          fmt(n(t)) +
          " kcal\nأريد حجز استشارة.",
      );
  };
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    calc(true);
  });
  f.addEventListener("input", () => calc(false));
  calc(false);
})();
