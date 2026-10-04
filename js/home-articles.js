/*
 * home-articles.js – فلاتر قسم المقالات في الصفحة الرئيسية.
 * كان مضمَّنًا داخل index.html، ونُقل هنا ليعمل مع سياسة CSP صارمة (بدون inline script).
 * "الكل" يعرض البطاقات المميزة (data-home) فقط، وأي تصنيف آخر يعرض حتى 4 بطاقات.
 */
(function () {
  var sec = document.getElementById("articles");
  if (!sec) return;
  var LIMIT = 4;
  var pills = sec.querySelectorAll(".af-pill[data-f]");
  var cards = sec.querySelectorAll(".art[data-c]");
  var empty = sec.querySelector(".af-empty");
  function render(f) {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = false;
      if (f === "all") {
        ok = c.hasAttribute("data-home");
      } else if (
        c.getAttribute("data-c").split(" ").indexOf(f) !== -1 &&
        shown < LIMIT
      ) {
        ok = true;
      }
      c.hidden = !ok;
      if (ok) {
        c.classList.add("in");
        shown++;
      }
    });
    if (empty) empty.hidden = shown !== 0;
  }
  pills.forEach(function (p) {
    p.addEventListener("click", function () {
      pills.forEach(function (x) {
        var on = x === p;
        x.classList.toggle("on", on);
        x.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render(p.getAttribute("data-f"));
    });
  });
})();
