let currentLang = "en";

const events = [
  // MARCH 2025
  {
    date: "2025-03-01",
    who: "LMSY",
    category: "Brand",
    title: "DCASH Tops of Beauty 2025",
    location: "Central Westgate, Bangkok",
    notes: "15:00–16:00 (GMT+8)",
    tags: ["LMSY", "Brand"]
  },
  {
    date: "2025-03-05",
    who: "LMSY",
    category: "Brand",
    title: "Siam Center The Summer Runway curated by Mint",
    location: "Siam Center, Bangkok",
    notes: "18:45 (GMT+8)",
    tags: ["LMSY", "Runway", "Brand"]
  },
  {
    date: "2025-03-08",
    who: "LMSY",
    category: "FanMeeting",
    title: "1st Fan Meeting in Vietnam",
    location: "Ben Thanh Theater, Vietnam",
    notes: "19:00 (GMT+8)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-03-13",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY × Taixiaoxiang Live",
    location: "Taobao Live",
    notes: "20:00 (GMT+8)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-03-15",
    who: "LMSY",
    category: "FanMeeting",
    title: "1st Fan Meeting in Manila with Lookmhee & Sonya",
    location: "SM Skydome, Philippines",
    notes: "14:00 (GMT+8)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-03-22",
    who: "LMSY",
    category: "Brand",
    title: "Arousar × LMSY",
    location: "Guangzhou, China",
    notes: "13:30 (GMT+8)",
    tags: ["LMSY", "Brand", "Event"]
  },
  {
    date: "2025-03-29",
    who: "LMSY",
    category: "Special event",
    title: "Buddy Besties × LMSY",
    location: "To be announced",
    notes: "Details to be announced",
    tags: ["LMSY", "BuddyBesties"]
  },
  {
    date: "2025-03-30",
    who: "LMSY",
    category: "Special event",
    title: "International Book Fair 2025",
    location: "Exhibition Hall 5–8, QSNCC, Bangkok",
    notes: "11:00 (GMT+8)",
    tags: ["LMSY", "Event"]
  },

  // APRIL 2025
  {
    date: "2025-04-03",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY PandaThaiHouse Live",
    location: "Taobao Live",
    notes: "20:00–21:00 (GMT+8)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-04-05",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY 1st Fan Meeting in Taipei",
    location: "Legacy Tera, Taipei, Taiwan",
    notes: "17:00 (GMT+8)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-04-12",
    who: "LMSY",
    category: "Brand",
    title: "Shop & Snap with Celebrities at Lotus's",
    location: "Lotus's Rama 1, Bangkok",
    notes: "14:30 (GMT+8)",
    tags: ["LMSY", "Brand", "Event"]
  },
  {
    date: "2025-04-18",
    who: "SY",
    category: "Special event",
    title: "Sonya's Birthday Party",
    location: "Century The Movie Plaza, Bangkok",
    notes: "14:00–17:00 (GMT+8)",
    tags: ["Sonya", "Birthday"]
  },
  {
    date: "2025-04-26",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY 1st Fan Sing in Chongqing",
    location: "Chongqing, China",
    notes: "13:00 (GMT+8)",
    tags: ["LMSY", "Fanmeeting", "Concert"]
  },

  // MAY 2025
  {
    date: "2025-05-02",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY Taixiaoxiang Live",
    location: "Taobao Live",
    notes: "20:00–21:00 (GMT+8)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-05-03",
    who: "LMSY",
    category: "Award",
    title: "Award Ceremony",
    location: "Airforce Convention Hall, Bangkok",
    notes: "14:00 (GMT+8)",
    tags: ["LMSY", "Awards"]
  },
  {
    date: "2025-05-10",
    who: "LMSY",
    category: "Special event",
    title: "Buddy Besties Sweet Day Trip with LMSY",
    location: "To be announced",
    notes: "Details to be announced",
    tags: ["LMSY", "BuddyBesties"]
  },
  {
    date: "2025-05-17",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY Fan Meeting in Macao",
    location: "Macao",
    notes: "16:00 (GMT+8)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-05-24",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY 1st Fan Meeting in Phnom Penh",
    location: "Phnom Penh, Cambodia",
    notes: "Details to be announced",
    tags: ["LMSY", "Fanmeeting"]
  },

  // JUNE 2025
  {
    date: "2025-06-07",
    who: "LMSY",
    category: "Special event",
    title: "Thai Pride Merge Ride",
    location: "To be announced",
    notes: "16:45 (GMT+8)",
    tags: ["LMSY", "Pride", "Event"]
  },
  {
    date: "2025-06-11",
    who: "LMSY",
    category: "Drama",
    title: "Harmony Secret special event",
    location: "GMM Grammy Place, Bangkok",
    notes: "10:09 (GMT+8)",
    tags: ["LMSY", "Harmony Secret"]
  },
  {
    date: "2025-06-13",
    who: "LMSY",
    category: "Livestream",
    title: "MIDATO × LMSY Live",
    location: "Weidian Live",
    notes: "20:00 (GMT+8)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-06-28",
    who: "LMSY",
    category: "Brand",
    title: "Babi Blushing Brand Sharing Event",
    location: "Shanghai, China",
    notes: "Details to be announced",
    tags: ["LMSY", "Brand", "Event"]
  },

  // JULY 2025
  {
    date: "2025-07-05",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY × Coconut Live",
    location: "Weidian Live",
    notes: "20:00 (GMT+8)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-07-25",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY × Clouvia Live",
    location: "Taobao Live",
    notes: "20:00 (GMT+8)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-07-26",
    who: "LMSY",
    category: "Drama",
    title: "Harmony Secret First Premiere",
    location: "Siam Paragon 6F, Bangkok",
    notes: "Details to be announced",
    tags: ["LMSY", "Harmony Secret"]
  },
  {
    date: "2025-07-27",
    who: "LMSY",
    category: "Drama",
    title: "Harmony Secret Episode 1 on air",
    location: "on iQIYI",
    notes: "00:30 (GMT+8)",
    tags: ["LMSY", "Harmony Secret", "Streaming"]
  },

  // AUGUST 2025
  {
    date: "2025-08-07",
    who: "LMSY",
    category: "Livestream",
    title: "EFM Fandom Live Lookmhee Sonya",
    location: "EFM Station Live",
    notes: "21:30 (GMT+8)",
    tags: ["LMSY", "Live"]
  },
  {
    date: "2025-08-09",
    who: "LM",
    category: "Brand",
    title: "Spice It Up with Lookmhee",
    location: "To be announced",
    notes: "Details to be announced",
    tags: ["Lookmhee", "Event"]
  },
  {
    date: "2025-08-16",
    who: "LMSY",
    category: "Special event",
    title: "Weibo Cultural Exchange Night",
    location: "Queen Sirikit National Convention Center, QSNCC, Bangkok",
    notes: "19:30 (GMT+8)",
    tags: ["LMSY", "Event"]
  },
  {
    date: "2025-08-24",
    who: "LMSY",
    category: "Special event",
    title: "Buddybesties with LMSY",
    location: "To be announced",
    notes: "Details to be announced",
    tags: ["LMSY", "BuddyBesties"]
  },

  // SEPTEMBER 2025
  {
    date: "2025-09-05",
    who: "LMSY",
    category: "Drama",
    title: "Harmony Secret Press Tour",
    location: "Live broadcast",
    notes: "12:00, 15:00, 17:00, 20:00 (GMT+8)",
    tags: ["LMSY", "Harmony Secret"]
  },
  {
    date: "2025-09-06",
    who: "LMSY",
    category: "Special event",
    title: "Praew Charity 2025",
    location: "Parc Paragon, Living Hall 3F, Bangkok",
    notes: "18:00 (GMT+8)",
    tags: ["LMSY", "Charity", "Event"]
  },
  {
    date: "2025-09-13",
    who: "LMSY",
    category: "Drama",
    title: "Harmony Secret Final Episode",
    location: "Siam Pavalai Royal Grand Theatre 6F, Bangkok",
    notes: "Details to be announced",
    tags: ["LMSY", "Harmony Secret"]
  },
  {
    date: "2025-09-21",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY Fan Meeting in Macau",
    location: "Macau",
    notes: "15:00 (GMT+8)",
    tags: ["LMSY", "Fanmeeting"]
  },

  // OCTOBER 2025
  {
    date: "2025-10-04",
    who: "LM",
    category: "FanMeeting",
    title: "Lookmhee Nanning 2nd Fan Meeting",
    location: "Nanning, China",
    notes: "12:00 (GMT+8)",
    tags: ["Lookmhee", "Fanmeeting"]
  },
  {
    date: "2025-10-04",
    who: "SY",
    category: "FanMeeting",
    title: "Sonya 2nd Fan Meeting in Nanning",
    location: "Nanning, China",
    notes: "19:00 (GMT+8)",
    tags: ["Sonya", "Fanmeeting"]
  },
  {
    date: "2025-10-11",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY in Hong Kong 2025",
    location: "Hong Kong, AXA Dreamland",
    notes: "16:00 (GMT+8)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-10-25",
    who: "SY",
    category: "Special event",
    title: "Candy Kiss Halloween with Sonya",
    location: "To be announced",
    notes: "Details to be announced",
    tags: ["Sonya", "Event", "Halloween"]
  },

  // NOVEMBER 2025
  {
    date: "2025-11-01",
    who: "LMSY",
    category: "Brand",
    title: "FOAMDREAM Party",
    location: "Hangzhou, China",
    notes: "12:00–19:00 (GMT+8)",
    tags: ["LMSY", "Event"]
  },
  {
    date: "2025-11-07",
    who: "LMSY",
    category: "Drama",
    title: "iQIYI 2026 Event",
    location: "Sphere Hall, 5M Floor, EmSphere, Bangkok",
    notes: "Details to be announced",
    tags: ["LMSY", "Event"]
  },
  {
    date: "2025-11-08",
    who: "LMSY",
    category: "Special event",
    title: "LMSY × BuddyBesties2DSY1Night (Day 1)",
    location: "Kanchanaburi Province, Thailand",
    notes: "Details to be announced",
    tags: ["LMSY", "BuddyBesties"]
  },
  {
    date: "2025-11-09",
    who: "LMSY",
    category: "Special event",
    title: "LMSY × BuddyBesties2DSY1Night (Day 2)",
    location: "Kanchanaburi Province, Thailand",
    notes: "Details to be announced",
    tags: ["LMSY", "BuddyBesties"]
  },
  {
    date: "2025-11-12",
    who: "LMSY",
    category: "Award",
    title: "HOWE Awards 2025",
    location: "BITEC Bangna 2F Grand Hall 201–203, Bangkok",
    notes: "Details to be announced",
    tags: ["LMSY", "Awards"]
  },
  {
    date: "2025-11-23",
    who: "LMSY",
    category: "Livestream",
    title: "Chun Xiangji Weidian Live",
    location: "Weidian Live",
    notes: "20:00 (GMT+8)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-11-29",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY / Lookmhee Fan Meeting in Wuhan",
    location: "Wuhan, China",
    notes: "Details to be announced",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-11-30",
    who: "SY",
    category: "FanMeeting",
    title: "Sonya Fan Meeting in Wuhan",
    location: "Wuhan, China",
    notes: "Details to be announced",
    tags: ["Sonya", "Fanmeeting"]
  },

  // DECEMBER 2025
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
    category: "Special event",
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
  if (tags.some(t => t.includes("halloween"))) return "🎃";
  if (ev.category === "Award") return "🏆";
  if (ev.category === "FanMeeting") {
    if (ev.who === "LM") return "💛";
    if (ev.who === "SY") return "🩵";
    if (ev.who === "LMSY") return "💛🩵";
    return "⭐";
  }
  if (ev.category === "Brand") {
    if (ev.who === "LM") return "💛✨";
    if (ev.who === "SY") return "🩵✨";
    if (ev.who === "LMSY") return "💛🩵✨";
    return "✨";
  }
  if (ev.category === "Livestream") return "📺";
  if (ev.category === "Drama") return "🎬";
  if (ev.category === "Special event") return "⭐";
  return "⭐";
}

function getMonthInfo(dateObj) {
  const monthIndex = dateObj.getMonth();
  const monthLabel = dateObj.toLocaleString("en-GB", { month: "short" });
  const yearLabel = dateObj.getFullYear().toString();
  return { monthIndex, monthLabel, yearLabel };
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

function renderSchedule(selectedYear, selectedType, selectedMonth) {
  const container = document.getElementById("schedule");
  container.innerHTML = "";

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const filtered = sorted.filter(ev => {
    const d = new Date(ev.date);
    const year = d.getFullYear().toString();
    const monthIndex = d.getMonth();
    const matchYear = selectedYear === "all" || year === selectedYear;
    const matchType = selectedType === "all" || ev.category === selectedType;
    const matchMonth = selectedMonth === "all" || monthIndex === Number(selectedMonth);
    return matchYear && matchType && matchMonth;
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
    const info = getMonthInfo(dateObj);
    const monthKey = info.monthLabel + " " + info.yearLabel;

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
      title.textContent = info.monthLabel;

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
      <div class="event-date-month">${getMonthInfo(dateObj).monthLabel.toUpperCase()}</div>
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
  const monthSelect = document.getElementById("filter-month");

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
  const labelMap = {
    "FanMeeting": "Fan meeting",
    "Brand": "Brand",
    "Livestream": "Livestream",
    "Drama": "Drama",
    "Award": "Award",
    "Special event": "Special event"
  };
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = labelMap[cat] || cat;
    typeSelect.appendChild(opt);
  });

  function populateMonths(year) {
    monthSelect.innerHTML = "";
    const allM = document.createElement("option");
    allM.value = "all";
    allM.textContent = "All";
    monthSelect.appendChild(allM);

    const monthsForYear = [...new Set(
      events
        .filter(ev => ev.date.substring(0,4) === year)
        .map(ev => {
          const d = new Date(ev.date);
          return d.getMonth();
        })
    )].sort((a,b)=>a-b);

    monthsForYear.forEach(mIdx => {
      const d = new Date(Number(year), mIdx, 1);
      const label = d.toLocaleString("en-GB", { month: "short" });
      const opt = document.createElement("option");
      opt.value = String(mIdx);
      opt.textContent = label;
      monthSelect.appendChild(opt);
    });
  }

  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonthIndex = now.getMonth();

  let defaultYear = years.includes(currentYear) ? currentYear : years[years.length - 1];
  populateMonths(defaultYear);

  let availableMonths = [...monthSelect.options].map(o => o.value).filter(v => v !== "all").map(v => Number(v));
  let defaultMonth = "all";
  if (availableMonths.includes(currentMonthIndex) && defaultYear === currentYear) {
    defaultMonth = String(currentMonthIndex);
  } else if (availableMonths.length) {
    defaultMonth = String(availableMonths[availableMonths.length - 1]);
  }

  yearSelect.value = defaultYear;
  monthSelect.value = defaultMonth;

  yearSelect.addEventListener("change", () => {
    const y = yearSelect.value === "all" ? currentYear : yearSelect.value;
    populateMonths(y);
    monthSelect.value = "all";
    renderSchedule(yearSelect.value, typeSelect.value, monthSelect.value);
  });

  typeSelect.addEventListener("change", () => {
    renderSchedule(yearSelect.value, typeSelect.value, monthSelect.value);
  });

  monthSelect.addEventListener("change", () => {
    renderSchedule(yearSelect.value, typeSelect.value, monthSelect.value);
  });

  renderSchedule(yearSelect.value, typeSelect.value, monthSelect.value);
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
      const monthSelect = document.getElementById("filter-month");
      renderSchedule(yearSelect.value, typeSelect.value, monthSelect.value);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initLanguageToggle();
});
