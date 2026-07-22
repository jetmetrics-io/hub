(function () {
  var script = document.currentScript;
  var ASSET_BASE = script && script.src ? script.src.replace(/app\.js.*$/, "") : "";

  // The cheatsheet count lives in the library's own data.json — never copy it
  // here, or the hub starts lying the day a cheatsheet is added.
  var DATA_URL = "https://jetmetrics-static.storage.yandexcloud.net/hub-cheatsheets/data.json";

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
    .then(function (results) { render(results[0].materials || [], results[1]); })
    .catch(function (err) { console.error("JM Hub: failed to load materials.json", err); });
})();
