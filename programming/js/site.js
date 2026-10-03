(function () {
  "use strict";

  var KEYWORDS = {
    False: 1, None: 1, True: 1, and: 1, as: 1, break: 1, class: 1, continue: 1,
    def: 1, del: 1, elif: 1, else: 1, for: 1, from: 1, if: 1, import: 1, in: 1,
    is: 1, not: 1, or: 1, pass: 1, return: 1, while: 1, with: 1
  };

  var BUILTINS = {
    bool: 1, dict: 1, float: 1, input: 1, int: 1, len: 1, list: 1, print: 1,
    range: 1, sorted: 1, str: 1, sum: 1, tuple: 1, type: 1, zip: 1
  };

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function readString(source, start) {
    var quote = source.charAt(start);
    var triple = source.slice(start, start + 3) === quote + quote + quote;
    var i = start + (triple ? 3 : 1);
    while (i < source.length) {
      if (source.charAt(i) === "\\") {
        i += 2;
        continue;
      }
      if (triple && source.slice(i, i + 3) === quote + quote + quote) {
        return { text: source.slice(start, i + 3), end: i + 3 };
      }
      if (!triple && source.charAt(i) === quote) {
        return { text: source.slice(start, i + 1), end: i + 1 };
      }
      if (!triple && source.charAt(i) === "\n") break;
      i += 1;
    }
    return { text: source.slice(start), end: source.length };
  }

  function highlightPython(source) {
    var out = "";
    var i = 0;

    function painted(cls, text) {
      return '<span class="' + cls + '">' + escapeHtml(text) + "</span>";
    }

    while (i < source.length) {
      var ch = source.charAt(i);

      if (ch === "#") {
        var nl = source.indexOf("\n", i);
        if (nl < 0) nl = source.length;
        out += painted("tok-cmt", source.slice(i, nl));
        i = nl;
        continue;
      }

      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        out += escapeHtml(ch);
        i += 1;
        continue;
      }

      if (/[A-Za-z_]/.test(ch)) {
        var j = i + 1;
        while (j < source.length && /[A-Za-z0-9_]/.test(source.charAt(j))) j += 1;
        var word = source.slice(i, j);
        var lowered = word.toLowerCase();
        var quoteAt = source.charAt(j);
        if (/^(fr|rf|rb|br|f|r|b|u)$/.test(lowered) && (quoteAt === "'" || quoteAt === '"')) {
          var prefixed = readString(source, j);
          out += painted("tok-str", word + prefixed.text);
          i = prefixed.end;
          continue;
        }
        var next = j;
        while (next < source.length && (source.charAt(next) === " " || source.charAt(next) === "\t")) next += 1;
        if (KEYWORDS[word]) out += painted("tok-kw", word);
        else if (BUILTINS[word] || source.charAt(next) === "(") out += painted("tok-fn", word);
        else out += escapeHtml(word);
        i = j;
        continue;
      }

      if (ch === "'" || ch === '"') {
        var parsed = readString(source, i);
        out += painted("tok-str", parsed.text);
        i = parsed.end;
        continue;
      }

      if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(source.charAt(i + 1)))) {
        var k = i;
        if (source.charAt(k) === ".") k += 1;
        while (k < source.length && /[0-9]/.test(source.charAt(k))) k += 1;
        if (source.charAt(k) === "." && /[0-9]/.test(source.charAt(k + 1))) {
          k += 1;
          while (k < source.length && /[0-9]/.test(source.charAt(k))) k += 1;
        }
        out += painted("tok-num", source.slice(i, k));
        i = k;
        continue;
      }

      out += escapeHtml(ch);
      i += 1;
    }
    return out;
  }

  Array.prototype.forEach.call(document.querySelectorAll("pre code"), function (block) {
    block.innerHTML = highlightPython(block.textContent);
  });

  var search = document.getElementById("q");
  var empty = document.getElementById("empty");
  var count = document.getElementById("count");
  var sidenav = document.getElementById("sidenav");
  var entries = Array.prototype.slice.call(document.querySelectorAll(".entry"));
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
  var links = Array.prototype.slice.call(sidenav.querySelectorAll("a"));

  var records = entries.map(function (entry) {
    return {
      entry: entry,
      hay: ((entry.getAttribute("data-keys") || "") + " " + entry.textContent).toLowerCase()
    };
  });

  chapters.forEach(function (chapter) {
    var end = document.createElement("p");
    end.className = "chapter-end";
    end.innerHTML = '<span class="ko">단원 끝</span><span class="en">End of chapter</span>';
    chapter.appendChild(end);
  });

  var memo = document.getElementById("memo");
  var memoToggle = document.getElementById("memo-toggle");
  if (memo && memoToggle) {
    memoToggle.addEventListener("click", function () {
      var covered = memo.classList.toggle("is-covered");
      memoToggle.setAttribute("aria-pressed", covered ? "true" : "false");
      if (!covered) {
        Array.prototype.forEach.call(memo.querySelectorAll(".memo.is-open"), function (card) {
          card.classList.remove("is-open");
        });
      }
    });
    memo.addEventListener("click", function (event) {
      if (!memo.classList.contains("is-covered")) return;
      if (event.target.closest("a, button")) return;
      var card = event.target.closest(".memo");
      if (!card) return;
      card.classList.toggle("is-open");
    });
  }

  function applyFilter() {
    var q = search.value.trim().toLowerCase();
    var tokens = q ? q.split(/\s+/) : [];
    var shown = 0;

    records.forEach(function (record) {
      var ok = tokens.every(function (token) {
        return record.hay.indexOf(token) !== -1;
      });
      record.entry.hidden = !ok;
      if (ok) shown += 1;
    });

    chapters.forEach(function (chapter) {
      if (!chapter.querySelector(".entry")) {
        chapter.hidden = q.length > 0;
        return;
      }
      chapter.hidden = !chapter.querySelector(".entry:not([hidden])");
    });

    empty.hidden = !(q && shown === 0);
    var langNow = document.documentElement.lang === "en" ? "en" : "ko";
    count.textContent = q ? (shown + (langNow === "en" ? " entries" : "개 항목")) : "";
  }

  var langToggle = document.getElementById("lang-toggle");

  function applyLang(next) {
    document.documentElement.lang = next;
    search.placeholder = next === "en" ? "function, method, operator" : "함수, 메서드, 연산자";
    document.title = next === "en"
      ? "Python reference — day 1–4"
      : "프로그래밍 참고 — Python day 1–4";
    if (langToggle) {
      langToggle.textContent = next === "en" ? "한글" : "EN";
      langToggle.setAttribute("aria-pressed", next === "en" ? "true" : "false");
    }
    sidenav.setAttribute("aria-label", next === "en" ? "Chapters" : "장");
    try { localStorage.setItem("programming-ref-lang", next); } catch (err) {}
    if (search.value) applyFilter();
  }

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(document.documentElement.lang === "en" ? "ko" : "en");
    });
  }

  var storedLang = "ko";
  try { storedLang = localStorage.getItem("programming-ref-lang") === "en" ? "en" : "ko"; } catch (err) {}
  applyLang(storedLang);

  search.addEventListener("input", applyFilter);

  document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    for (var i = 0; i < records.length; i += 1) {
      if (!records[i].entry.hidden) {
        records[i].entry.scrollIntoView({ block: "start" });
        break;
      }
    }
  });

  sidenav.addEventListener("click", function (event) {
    if (!event.target.closest("a") || !search.value) return;
    search.value = "";
    applyFilter();
  });

  document.addEventListener("keydown", function (event) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "BUTTON") {
      event.preventDefault();
      search.focus();
      return;
    }
    if (event.key === "Escape" && document.activeElement === search) {
      if (search.value) {
        search.value = "";
        applyFilter();
      } else {
        search.blur();
      }
    }
  });

  function syncHeader() {
    var header = document.querySelector(".site-header");
    var nav = document.getElementById("sidenav");
    var narrow = window.matchMedia("(max-width: 860px)").matches;
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    document.documentElement.style.setProperty("--nav-h", narrow ? nav.offsetHeight + "px" : "0px");
  }

  window.addEventListener("resize", syncHeader);
  syncHeader();

  function updateCurrent() {
    var marker = (document.querySelector(".site-header").offsetHeight || 0)
      + (window.matchMedia("(max-width: 860px)").matches ? document.getElementById("sidenav").offsetHeight : 0)
      + 12;
    var current = null;
    chapters.forEach(function (chapter) {
      if (chapter.hidden) return;
      if (chapter.getBoundingClientRect().top <= marker) current = chapter.id;
    });
    links.forEach(function (link) {
      var on = current !== null && link.getAttribute("href") === "#" + current;
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  document.addEventListener("scroll", updateCurrent, { passive: true });
  window.addEventListener("hashchange", updateCurrent);
  updateCurrent();
})();
