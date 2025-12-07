let currentLang = "en";

const events = [
  {
    date: "2025-12-14",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY 1st Fan Meet in Singapore",
    title_th: "งานแฟนมีตครั้งแรกของ LMSY ที่สิงคโปร์",
    title_zh: "LMSY 新加坡首次粉丝见面会",
    location: "The Theatre at Mediacorp, Singapore",
    location_th: "The Theatre at Mediacorp สิงคโปร์",
    location_zh: "新加坡 Mediacorp 剧场",
    notes: "Start time 16:00 (GMT+8)",
    notes_th: "เริ่ม 16:00 น. (GMT+8)",
    notes_zh: "开始时间 16:00（GMT+8）",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-12-16",
    who: "LMSY",
    category: "Award",
    title: "TH Headlines Person of the Year Awards",
    title_th: "งานประกาศรางวัล TH Headlines Person of the Year",
    title_zh: "TH Headlines 年度人物颁奖礼",
    location: "Bitec Live, Bangkok",
    location_th: "ไบเทค ไลฟ์ กรุงเทพฯ",
    location_zh: "曼谷 Bitec Live",
    notes: "Start time 19:30 (GMT+8)",
    notes_th: "เริ่ม 19:30 น. (GMT+8)",
    notes_zh: "开始时间 19:30（GMT+8）",
    tags: ["Awards", "Appearance"]
  },
  {
    date: "2025-12-20",
    who: "LM",
    category: "FanMeeting",
    title: "Lookmhee 1st Fan Meeting in Fuzhou",
    title_th: "แฟนมีตครั้งแรกของลูกหมี ที่ฝูโจว",
    title_zh: "Lookmhee 福州首次粉丝见面会",
    location: "Fuzhou, China",
    location_th: "ฝูโจว ประเทศจีน",
    location_zh: "中国福州",
    notes: "Details to be announced",
    notes_th: "รายละเอียดรอประกาศ",
    notes_zh: "详情待公布",
    tags: ["Lookmhee", "Fanmeeting"]
  },
  {
    date: "2025-12-21",
    who: "SY",
    category: "FanMeeting",
    title: "Sonya 1st Fan Meeting in Fuzhou",
    title_th: "แฟนมีตครั้งแรกของซอนญ่า ที่ฝูโจว",
    title_zh: "Sonya 福州首次粉丝见面会",
    location: "Fuzhou, China",
    location_th: "ฝูโจว ประเทศจีน",
    location_zh: "中国福州",
    notes: "Details to be announced",
    notes_th: "รายละเอียดรอประกาศ",
    notes_zh: "详情待公布",
    tags: ["Sonya", "Fanmeeting"]
  },
  {
    date: "2025-12-27",
    who: "LM",
    category: "Event",
    title: "Lookmhee in A Secret Christmas Night",
    title_th: "ลูกหมีในงาน A Secret Christmas Night",
    title_zh: "Lookmhee 的 Secret Christmas Night 活动",
    location: "To be announced",
    location_th: "สถานที่รอประกาศ",
    location_zh: "地点待公布",
    notes: "Details to be announced",
    notes_th: "รายละเอียดรอประกาศ",
    notes_zh: "详情待公布",
    tags: ["Lookmhee", "Christmas Event"]
  }
];

function pickLang(ev, baseKey) {
  if (currentLang === "en") return ev[baseKey] || "";
  const key = baseKey + "_" + currentLang;
  return ev[key] || ev[baseKey] || "";
}

function getEventIcon(ev) {
  const tags = (ev.tags || []).map(t => t.toLowerCase());
  if (tags.some(t => t.includes("christmas"))) return "🎄";
  if (ev.category === "Award") return "🏆";
  if (ev.category === "FanMeeting") {
    if (ev.who === "LM") return "💛";
    if (ev.who === "SY") return "🩵";
    if (ev.who === "LMSY") return "💛🩵";
    return "⭐";
  }
  if (ev.category === "Event") {
    if (ev.who === "LM") return "💛✨";
    if (ev.who === "SY") return "🩵✨";
    if (ev.who === "LMSY") return "💛🩵✨";
  }
  return "⭐";
}

function formatMonthInfo(dateObj) {
  const monthLabel = dateObj.toLocaleString("en-GB", { month: "short" });
  const yearLabel = dateObj.getFullYear().toString();
  return { monthLabel, yearLabel };
}

function formatDay(dateObj) {
  return dateObj.getDate().toString().padStart(2, "0");
}

function getTagClasses(tag) {
  const t = tag.toLowerCase();
  const classes = ["tag"];
  if (t.includes("lookmhee")) classes.push("tag-lm");
  if (t.includes("sonya")) classes.push("tag-sy");
  if (t === "lmsy") classes.push("tag-lmsy");
  if (t.includes("fan")) classes.push("tag-fm");
  if (t.includes("award")) classes.push("tag-award");
  if (t.includes("christmas") || t.includes("event")) classes.push("tag-event");
  return classes.join(" ");
}

function renderSchedule(selectedYear, selectedType) {
  const container = document.getElementById("schedule");
  container.innerHTML = "";

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const filtered = sorted.filter(ev => {
    const year = ev.date.substring(0, 4);
    const matchYear = selectedYear === "all" || year === selectedYear;
    const matchType = selectedType === "all" || ev.category === selectedType;
    return matchYear && matchType;
  });

  if (filtered.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No events yet for this filter.";
    container.appendChild(p);
    return;
  }

  let currentMonthKey = "";

  filtered.forEach(ev => {
    const dateObj = new Date(ev.date);
    const { monthLabel, yearLabel } = formatMonthInfo(dateObj);
    const monthKey = monthLabel + " " + yearLabel;

    if (monthKey !== currentMonthKey) {
      currentMonthKey = monthKey;

      const group = document.createElement("div");
      group.className = "month-group";

      const header = document.createElement("div");
      header.className = "month-header";

      const box = document.createElement("div");
      box.className = "month-label-box";
      box.textContent = "SCHEDULE";

      const title = document.createElement("div");
      title.className = "month-title";
      title.textContent = monthLabel;

      header.appendChild(box);
      header.appendChild(title);
      group.appendChild(header);
      container.appendChild(group);
    }

    const groupEl = container.lastElementChild;

    const card = document.createElement("article");
    card.className = "event-card";

    const dateEl = document.createElement("div");
    dateEl.className = "event-date";
    dateEl.innerHTML = `
      <div class="event-date-circle">${formatDay(dateObj)}</div>
      <div class="event-date-month">${monthLabel.toUpperCase()}</div>
    `;

    const main = document.createElement("div");
    main.className = "event-main";

    const titleRow = document.createElement("div");
    titleRow.className = "event-title-row";

    const iconSpan = document.createElement("span");
    iconSpan.className = "event-icon";
    iconSpan.textContent = getEventIcon(ev);

    const titleEl = document.createElement("div");
    titleEl.className = "event-title";
    titleEl.textContent = pickLang(ev, "title");

    titleRow.appendChild(iconSpan);
    titleRow.appendChild(titleEl);

    const metaEl = document.createElement("div");
    metaEl.className = "event-meta";
    metaEl.textContent = `${ev.category} · ${pickLang(ev, "location")}`;

    const notesEl = document.createElement("div");
    notesEl.className = "event-notes";
    notesEl.textContent = pickLang(ev, "notes");

    const tagsEl = document.createElement("div");
    tagsEl.className = "event-tags";
    (ev.tags || []).forEach(tag => {
      const span = document.createElement("span");
      span.className = getTagClasses(tag);
      span.textContent = tag;
      tagsEl.appendChild(span);
    });

    main.appendChild(titleRow);
    main.appendChild(metaEl);
    if (ev.notes) main.appendChild(notesEl);
    if (ev.tags && ev.tags.length) main.appendChild(tagsEl);

    card.appendChild(dateEl);
    card.appendChild(main);
    groupEl.appendChild(card);
  });
}

function initFilters() {
  const yearSelect = document.getElementById("filter-year");
  const typeSelect = document.getElementById("filter-type");

  const years = [...new Set(events.map(ev => ev.date.substring(0, 4)))].sort();

  yearSelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All";
  yearSelect.appendChild(allOption);

  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  const categories = [...new Set(events.map(ev => ev.category))].sort();
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    typeSelect.appendChild(opt);
  });

  yearSelect.addEventListener("change", () => {
    renderSchedule(yearSelect.value, typeSelect.value);
  });

  typeSelect.addEventListener("change", () => {
    renderSchedule(yearSelect.value, typeSelect.value);
  });

  renderSchedule(yearSelect.value, typeSelect.value);
}

function initLanguageToggle() {
  const buttons = document.querySelectorAll(".lang-toggle button");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (!lang || lang === currentLang) return;
      currentLang = lang;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const yearSelect = document.getElementById("filter-year");
      const typeSelect = document.getElementById("filter-type");
      renderSchedule(yearSelect.value, typeSelect.value);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initLanguageToggle();
});
