(function () {
  var script = document.currentScript;
  var ASSET_BASE = script && script.src ? script.src.replace(/app\.js.*$/, "") : "";

  function render(materials) {
    var grid = document.getElementById("jm-hub-grid");
    if (!grid) return;
    grid.innerHTML = "";
    materials.forEach(function (item) {
      var isSoon = !!item.comingSoon;
      var card = document.createElement(isSoon ? "div" : "a");
      card.className = "jm-hub-card" + (isSoon ? " jm-hub-card--soon" : "");
      if (!isSoon) {
        card.href = item.link;
        card.target = "_blank";
        card.rel = "noopener";
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
      }

      grid.appendChild(card);
    });
  }

  fetch(ASSET_BASE + "materials.json")
    .then(function (r) { return r.json(); })
    .then(function (data) { render(data.materials || []); })
    .catch(function (err) { console.error("JM Hub: failed to load materials.json", err); });
})();
