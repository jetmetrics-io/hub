(function () {
  // Пришли со старой открытой страницы дашборда (/dashboards-funnel → «Зарегистрироваться» / «Войти»): после входа
  // Тильда открывает Хаб, а человек шёл за дашбордом — один раз уводим туда (отметку ставит dashboards/funnel/loader.js)
  try {
    var go = JSON.parse(localStorage.getItem("jm.goto") || "null");
    if (go) {
      localStorage.removeItem("jm.goto");
      if (/^\/hub-[a-z-]+$/.test(go.path) && Date.now() - go.at < 86400000) { location.replace(go.path); return; }
    }
  } catch (e) { /* storage unavailable */ }

  // Кто вошёл и «Выйти» — вход по почте (sign-in, с переключения с кабинета Тильды): почта из пропуска
  // сервера входа, jmAuth грузит HEAD сайта. Без jmAuth (кабинет Тильды) строки нет.
  (function account() {
    var auth = window.jmAuth;
    var header = document.querySelector(".jm-hub-header");
    if (!auth || !auth.signedIn() || !header) return;
    var line = document.createElement("p");
    line.className = "jm-hub-account";
    line.appendChild(document.createTextNode("Вы вошли как "));
    var who = document.createElement("b");
    who.textContent = auth.email();
    line.appendChild(who);
    line.appendChild(document.createTextNode(" · "));
    var out = document.createElement("a");
    out.href = "/";
    out.textContent = "Выйти";
    out.addEventListener("click", function (e) { e.preventDefault(); auth.signOut(); });
    line.appendChild(out);
    header.appendChild(line);
  })();

  var script = document.currentScript;
  var ASSET_BASE = script && script.src ? script.src.replace(/app\.js.*$/, "") : "";

  // The cheatsheet count lives in the library's own data.json — never copy it
  // here, or the hub starts lying the day a cheatsheet is added.
  var DATA_URL = "https://jetmetrics-static.storage.yandexcloud.net/hub-cheatsheets/data.json";

  // Карточка Атласа у всех ведёт на ОДИН адрес (/hub-atlas). Free/pro больше НЕ
  // разводим в хабе: с 2026-07-24 гейт полной версии живёт внутри самого приложения
  // Атласа (оно само по paid.json решает, показать 3 карты или 28). См.
  // site-state/SITE_STATE §7 и CHANGELOG. materials.json уже указывает на /hub-atlas.

  function pluralize(n, one, few, many) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  }

  function render(materials, sheetCount) {
    var grid = document.getElementById("jm-hub-grid");
    if (!grid) return;
    grid.innerHTML = "";
    materials.forEach(function (item) {
      var isSoon = !!item.comingSoon;
      var card = document.createElement(isSoon ? "div" : "a");
      card.className = "jm-hub-card" + (isSoon ? " jm-hub-card--soon" : "");
      if (!isSoon) {
        card.href = item.link;
        // Explicit _self so a stray <base target="_blank"> on the host Tilda
        // page can't force these into a new tab. Links off the site (Статьи →
        // Teletype, 21.10.2026) open in a new tab so the hub stays open.
        if (card.hostname && card.hostname !== location.hostname) { card.target = "_blank"; card.rel = "noopener"; }
        else card.target = "_self";
      }

      var icon = document.createElement("div");
      icon.className = "jm-hub-card-icon";
      icon.textContent = item.icon || "📁";
      card.appendChild(icon);

      var title = document.createElement("div");
      title.className = "jm-hub-card-title";
      title.textContent = item.title;
      card.appendChild(title);

      var desc = document.createElement("div");
      desc.className = "jm-hub-card-desc";
      desc.textContent = item.description || "";
      card.appendChild(desc);

      if (isSoon) {
        var badge = document.createElement("div");
        badge.className = "jm-hub-card-badge";
        badge.textContent = "Скоро";
        card.appendChild(badge);
      } else if (item.showCount && sheetCount) {
        // No count means data.json didn't load — show no badge rather than a
        // stale number.
        var countBadge = document.createElement("div");
        countBadge.className = "jm-hub-card-badge jm-hub-card-badge--live";
        countBadge.textContent = sheetCount + " " + pluralize(sheetCount, "читшит", "читшита", "читшитов");
        card.appendChild(countBadge);
      }

      grid.appendChild(card);
    });
  }

  var materialsPromise = fetch(ASSET_BASE + "materials.json").then(function (r) { return r.json(); });
  var countPromise = fetch(DATA_URL)
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { return data ? data.items.length : null; })
    .catch(function () { return null; });

  Promise.all([materialsPromise, countPromise])
    .then(function (results) {
      render(results[0].materials || [], results[1]);
    })
    .catch(function (err) { console.error("JM Hub: failed to load materials.json", err); });
})();
