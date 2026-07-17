console.log("LMSY schedule script loaded: upcoming exactly 5 fixed");


/* =========================
   SCROLL POSITION FIX
   Force the page to start at the top after refresh or reopen.
   This prevents Safari/Chrome mobile from restoring the old scroll position.
   ========================= */

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function forceScrollToTop() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

window.addEventListener("load", forceScrollToTop);
window.addEventListener("pageshow", forceScrollToTop);
document.addEventListener("DOMContentLoaded", forceScrollToTop);


/* schedule.js
   Drop-in full script. It keeps your full events array and fixes the bugs that break filtering.
   Paste this whole file into GitHub as-is.
*/

let currentLang = "en";
let currentView = "schedule";
function getBangkokTodayTomorrowKeys() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const todayKey = fmt.format(new Date());

  const [y, m, d] = todayKey.split("-").map(Number);
  const tomorrowUTC = new Date(Date.UTC(y, m - 1, d + 1));
  const tomorrowKey = fmt.format(tomorrowUTC);

  return { todayKey, tomorrowKey };
}

function toBangkokDate(dateString) {
  return new Date(dateString + "T00:00:00+07:00");
}


function getGmt7DateKey(dateObj) {
  // Create a YYYY-MM-DD key based on GMT+7, regardless of the user's local timezone
  const utcMs = dateObj.getTime() + dateObj.getTimezoneOffset() * 60000;
  const gmt7 = new Date(utcMs + 7 * 60 * 60000);
  return gmt7.toISOString().slice(0, 10);
}

function getTodayTomorrowKeysGmt7() {
  const now = new Date();
  const todayKey = getGmt7DateKey(now);
  const tomorrowKey = getGmt7DateKey(new Date(now.getTime() + 24 * 60 * 60000));
  return { todayKey, tomorrowKey };
}

function getTodayTomorrowLabel(dateKey, todayKey, tomorrowKey) {
  if (dateKey !== todayKey && dateKey !== tomorrowKey) return "";

  const isToday = dateKey === todayKey;

  if (currentLang === "th") return isToday ? "วันนี้" : "พรุ่งนี้";
  if (currentLang === "zh") return isToday ? "今天" : "明天";
  return isToday ? "TODAY" : "TOMORROW";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function extractTimeRangeFromNotes(notesText) {
  if (!notesText) return { start: "", end: "" };

  // Match: 19:00–20:00 or 19:00-20:00 or 19:00–20:00 (GMT+7)
  const range = notesText.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (range) return { start: range[1], end: range[2] };

  // Match first single time like 19:00
  const single = notesText.match(/\b(\d{1,2}:\d{2})\b/);
  if (single) return { start: single[1], end: "" };

  return { start: "", end: "" };
}

function buildGoogleCalendarUrl(ev) {
  const title = pickLang(ev, "title") || "Event";
  const location = pickLang(ev, "location") || "";
  const details = (pickLang(ev, "notes") || buildLegacyNotes(ev) || "").trim();

  const dateKey = ev.date; // YYYY-MM-DD
  const notesText = pickLang(ev, "notes") || "";
  const extracted = extractTimeRangeFromNotes(notesText);
  const startTime = (ev.startTime || extracted.start || "").trim();
  const endTime = (extracted.end || "").trim();

  function ymdCompact(ymd) {
    return ymd.replaceAll("-", "");
  }

  let datesParam = "";

  if (startTime) {
    const [sh, sm] = startTime.split(":").map(Number);
    let eh = sh;
    let em = sm;

    if (endTime) {
      [eh, em] = endTime.split(":").map(Number);
    } else {
      // Default duration: 1 hour
      eh = sh + 1;
      em = sm;
      if (eh >= 24) eh = 23; // safety
    }

    const start = `${ymdCompact(dateKey)}T${pad2(sh)}${pad2(sm)}00`;
    const end = `${ymdCompact(dateKey)}T${pad2(eh)}${pad2(em)}00`;
    datesParam = `${start}/${end}`;
  } else {
    // All day event (end date must be next day)
    const d = toBangkokDate(dateKey);
    const next = new Date(d.getTime() + 24 * 60 * 60000);
    const endKey = getGmt7DateKey(next);
    datesParam = `${ymdCompact(dateKey)}/${ymdCompact(endKey)}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: datesParam,
    details,
    location,
    ctz: "Asia/Bangkok"
  });

  return "https://calendar.google.com/calendar/render?" + params.toString();
}


/* =========================
   EVENTS DATA
   Keep your full events array exactly.
   I am pasting your full dataset below unchanged.
   ========================= */

const events = [
  {
    date: "2024-05-23",
    who: "LMSY",
    category: "Special event",
    title_en: "OK Presents Fiew Fiew On Tour",
    title_th: "มาม่า OK PRESENTS ฟิ้วว ฟิ้วว ON TOUR",
    title_zh: "OK Presents 见面活动巡回（On Tour）",
    location_en: "Bangkok (school event)",
    location_th: "กรุงเทพฯ (กิจกรรมโรงเรียน)",
    location_zh: "曼谷（学校活动）",
    startTime: "10:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Special event"],
    hashtags: ["#มาม่าOKpresentsฟิ้ววฟิ้ววOnTour"]
  },
  {
    date: "2024-06-05",
    who: "LMSY",
    category: "Special event",
    title_en: "OK Presents Fiew Fiew On Tour",
    title_th: "มาม่า OK PRESENTS ฟิ้วว ฟิ้วว ON TOUR",
    title_zh: "OK Presents 见面活动巡回（On Tour）",
    location_en: "Bangkok (school event)",
    location_th: "กรุงเทพฯ (กิจกรรมโรงเรียน)",
    location_zh: "曼谷（学校活动）",
    startTime: "10:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Special event"],
    hashtags: ["#มาม่าOKpresentsฟิ้ววฟิ้ววOnTour"]
  },
  {
    date: "2024-06-18",
    who: "LMSY",
    category: "Special event",
    title_en: "OK Presents Fiew Fiew On Tour",
    title_th: "มาม่า OK PRESENTS ฟิ้วว ฟิ้วว ON TOUR",
    title_zh: "OK Presents 见面活动巡回（On Tour）",
    location_en: "Bangkok (school event)",
    location_th: "กรุงเทพฯ (กิจกรรมโรงเรียน)",
    location_zh: "曼谷（学校活动）",
    startTime: "10:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Special event"],
    hashtags: ["#มาม่าOKpresentsฟิ้ววฟิ้ววOnTour"]
  },
  {
    date: "2024-06-20",
    who: "LMSY",
    category: "Drama",
    title_en: "Affair The Series Artist Schedule",
    title_th: "ตารางงานนักแสดง Affair The Series",
    title_zh: "《Affair》演员行程",
    location_en: "GMM Grammy Lobby",
    location_th: "GMM Grammy Lobby",
    location_zh: "GMM Grammy 大堂",
    startTime: "10:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Drama", "Appearance"],
    hashtags: ["#Affairรักเล่นกล"]
  },
  {
    date: "2024-08-30",
    who: "LMSY",
    category: "Drama",
    title_en: "Affair The Series, First Episode Watch Party",
    title_th: "Affair The Series, ดูตอนแรกพร้อมกัน (Watch Party)",
    title_zh: "《Affair》第一集观看派对",
    location_en: "House Samyan, 5th Floor, Samyan Mitrtown",
    location_th: "House Samyan ชั้น 5, Samyan Mitrtown",
    location_zh: "House Samyan, Samyan Mitrtown 5楼",
    startTime: "18:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Drama", "WatchParty"],
    hashtags: ["#Affair1stEPWatchParty"]
  },
  {
    date: "2024-09-06",
    who: "LMSY",
    category: "Drama",
    title_en: "Affair Press Tour",
    title_th: "Affair Press Tour",
    title_zh: "《Affair》宣传巡回",
    location_en: "Multiple sessions",
    location_th: "หลายช่วงเวลา",
    location_zh: "多场次",
    startTime: "09:30",
    timezone: "GMT+7",
    tags: ["LMSY", "Drama", "PressTour"],
    hashtags: ["#AffairPressTour"]
  },
  {
    date: "2024-09-07",
    who: "LMSY",
    category: "Special event",
    title_en: "Praew Charity 2024",
    title_th: "Praew Charity 2024",
    title_zh: "Praew Charity 2024",
    location_en: "Paragon Hall, Siam Paragon",
    location_th: "Paragon Hall, Siam Paragon",
    location_zh: "暹罗百丽宫 Paragon Hall",
    startTime: "17:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Appearance"],
    hashtags: ["#LMSYxPraewCharity2024"]
  },
  {
    date: "2024-09-17",
    who: "LMSY",
    category: "Drama",
    title_en: "Affair Press Tour (Media Rounds)",
    title_th: "Affair Press Tour (สื่อรอบบ่าย)",
    title_zh: "《Affair》宣传行程（媒体访问）",
    location_en: "Multiple interviews",
    location_th: "หลายสื่อสัมภาษณ์",
    location_zh: "多家媒体采访",
    startTime: "16:30",
    timezone: "GMT+7",
    tags: ["LMSY", "PressTour"],
    hashtags: ["#AffairPressTour"]
  },
  {
    date: "2024-09-21",
    who: "LMSY",
    category: "Award",
    title_en: "FEED Y Awards 2024",
    title_th: "FEED Y Awards 2024",
    title_zh: "FEED Y Awards 2024",
    location_en: "Paragon Hall, Siam Paragon",
    location_th: "Paragon Hall, Siam Paragon",
    location_zh: "暹罗百丽宫 Paragon Hall",
    startTime: "17:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Award", "Appearance"],
    hashtags: ["#FeedYAwards2024xLMSY"]
  },
  {
    date: "2024-10-03",
    who: "LMSY",
    category: "Brand",
    title_en: "Wan Sang Suk Market x LMSY",
    title_th: "วันสร้างสุข Market x LMSY",
    title_zh: "Wan Sang Suk 市集 x LMSY",
    location_en: "Central Westville, G Floor, Waterfall Amphitheatre",
    location_th: "Central Westville ชั้น G, Waterfall Amphitheatre",
    location_zh: "Central Westville, G层 Waterfall Amphitheatre",
    startTime: "15:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Brand", "Appearance"],
    hashtags: ["#วันสร้างสุขxLMSY"]
  },
  {
    date: "2024-10-03",
    who: "LMSY",
    category: "Special event",
    title_en: "EFM Fandom Live",
    title_th: "EFM Fandom Live",
    title_zh: "EFM Fandom Live",
    location_en: "Facebook, TikTok (EFM), YouTube (Atime)",
    location_th: "Facebook, TikTok (EFM), YouTube (Atime)",
    location_zh: "Facebook, TikTok（EFM）, YouTube（Atime）",
    startTime: "20:30",
    timezone: "GMT+7",
    tags: ["LMSY", "Live"],
    hashtags: ["#LMSYxEFMFandomLive"]
  },
  {
    date: "2024-10-10",
    who: "LMSY",
    category: "Special event",
    title_en: "ELLE Fashion Week 2024 (Sretsis)",
    title_th: "ELLE Fashion Week 2024 (Sretsis)",
    title_zh: "ELLE Fashion Week 2024（Sretsis）",
    location_en: "True Icon Hall, 7th Floor, ICONSIAM",
    location_th: "True Icon Hall ชั้น 7, ICONSIAM",
    location_zh: "ICONSIAM 7楼 True Icon Hall",
    startTime: "19:30",
    timezone: "GMT+7",
    tags: ["LMSY", "Appearance"],
    hashtags: ["#EFW2024"]
  },
  {
    date: "2024-10-18",
    who: "LMSY",
    category: "Drama",
    title_en: "Affair The Series, Final Episode Screening",
    title_th: "Affair The Series, งานดูตอนจบ (Final EP)",
    title_zh: "《Affair》大结局放映活动",
    location_en: "Siam Pavalai Royal Grand Theatre, Siam Paragon",
    location_th: "Siam Pavalai Royal Grand Theatre, Siam Paragon",
    location_zh: "暹罗百丽宫 Siam Pavalai Royal Grand Theatre",
    startTime: "19:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Drama", "Screening"],
    hashtags: ["#AffairTheSeriesFinalEP"]
  },
  {
    date: "2024-10-25",
    who: "LMSY",
    category: "Brand",
    title_en: "Grand Opening ONE Bangkok",
    title_th: "Grand Opening ONE Bangkok",
    title_zh: "ONE Bangkok 盛大开幕",
    location_en: "ONE Bangkok",
    location_th: "ONE Bangkok",
    location_zh: "ONE Bangkok",
    startTime: "19:30",
    timezone: "GMT+7",
    tags: ["LMSY", "Brand", "Appearance"],
    hashtags: ["#OneBangkokxLMSY"]
  },
  {
    date: "2024-10-27",
    who: "LMSY",
    category: "Brand",
    title_en: "Destiny Clinic",
    title_th: "Destiny Clinic",
    title_zh: "Destiny Clinic 活动",
    location_en: "Central Rama 3",
    location_th: "Central Rama 3",
    location_zh: "Central Rama 3",
    startTime: "17:30",
    timezone: "GMT+7",
    tags: ["LMSY", "Brand", "Appearance"],
    hashtags: ["#DestinyclinicLookmheeSonya"]
  },
  {
    date: "2024-11-02",
    who: "LMSY",
    category: "Brand",
    title_en: "MAMI Puppy Love Moment with Lookmhee & Sonya",
    title_th: "MAMI Puppy Love Moment กับ Lookmhee และ Sonya",
    title_zh: "MAMI Puppy Love Moment（Lookmhee & Sonya）",
    location_en: "",
    location_th: "",
    location_zh: "",
    startTime: "15:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Brand"],
    hashtags: ["#MAMIxLookmheeSonya"]
  },
  {
    date: "2024-11-09",
    who: "LMSY",
    category: "FanMeeting",
    title_en: "Lookmhee & Sonya 1st Fan Meeting in Macau",
    title_th: "Lookmhee และ Sonya 1st Fan Meeting in Macau",
    title_zh: "Lookmhee & Sonya 澳门首场粉丝见面会",
    location_en: "The Londoner Macao, Loulé Meeting Room",
    location_th: "The Londoner Macao, Loulé Meeting Room",
    location_zh: "伦敦人澳门 Loulé Meeting Room",
    startTime: "16:00",
    timezone: "GMT+7",
    tags: ["LMSY", "FanMeeting"],
    hashtags: ["#LMSY1stFMInMacau"]
  },
  {
    date: "2024-11-09",
    who: "Sonya",
    category: "Special event",
    title_en: "The Big Kitchen",
    title_th: "The Big Kitchen",
    title_zh: "The Big Kitchen",
    location_en: "Workpoint 23",
    location_th: "Workpoint 23",
    location_zh: "Workpoint 23",
    startTime: "09:30",
    timezone: "GMT+7",
    tags: ["Sonya", "TV"],
    hashtags: ["#TheBigKitchenxSonya"]
  },
  {
    date: "2024-12-01",
    who: "LMSY",
    category: "FanMeeting",
    title_en: "Lookmhee & Sonya 1st Fan Meeting in Hong Kong",
    title_th: "Lookmhee และ Sonya 1st Fan Meeting in Hong Kong",
    title_zh: "Lookmhee & Sonya 香港粉丝见面会",
    location_en: "Sheraton Hong Kong Tung Chung Hotel, 2F Ballroom 1-3",
    location_th: "Sheraton Hong Kong Tung Chung Hotel, 2F Ballroom 1-3",
    location_zh: "香港东涌世茂喜来登酒店 2F 宴会厅 1-3",
    startTime: "15:00",
    timezone: "GMT+8",
    tags: ["LMSY", "FanMeeting"],
    hashtags: []
  },
  {
    date: "2024-12-08",
    who: "LMSY",
    category: "Livestream",
    title_en: "TheTasteTime Taobao Live",
    title_th: "TheTasteTime Taobao Live",
    title_zh: "TheTasteTime 淘宝直播",
    location_en: "Taobao",
    location_th: "Taobao",
    location_zh: "淘宝",
    startTime: "19:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Live", "Brand"],
    hashtags: []
  },
  {
    date: "2024-12-14",
    who: "Sonya",
    category: "Special event",
    title_en: "Newtamins Merry X’Mas with Sonya (Special Meet & Greet)",
    title_th: "Newtamins Merry X’Mas with Sonya (Meet & Greet)",
    title_zh: "Newtamins 圣诞活动（Sonya 见面会）",
    location_en: "",
    location_th: "",
    location_zh: "",
    startTime: "13:00",
    timezone: "GMT+7",
    tags: ["Sonya", "Special event"],
    hashtags: []
  },
  {
    date: "2024-12-21",
    who: "Lookmhee",
    category: "FanMeeting",
    title_en: "Lookmhee 1st Fan Meeting in Nanning",
    title_th: "Lookmhee 1st Fan Meeting in Nanning",
    title_zh: "Lookmhee 南宁首场粉丝见面会",
    location_en: "Baiyi Shanghecheng HOPELIVE, Nanning",
    location_th: "Baiyi Shanghecheng HOPELIVE, Nanning",
    location_zh: "南宁百益上河城 HOPELIVE",
    startTime: "12:30",
    timezone: "GMT+7",
    tags: ["Lookmhee", "FanMeeting"],
    hashtags: []
  },
  {
    date: "2024-12-21",
    who: "Sonya",
    category: "FanMeeting",
    title_en: "Sonya 1st Fan Meeting in Nanning",
    title_th: "Sonya 1st Fan Meeting in Nanning",
    title_zh: "Sonya 南宁首场粉丝见面会",
    location_en: "Baiyi Shanghecheng HOPELIVE, Nanning",
    location_th: "Baiyi Shanghecheng HOPELIVE, Nanning",
    location_zh: "南宁百益上河城 HOPELIVE",
    startTime: "18:00",
    timezone: "GMT+7",
    tags: ["Sonya", "FanMeeting"],
    hashtags: []
  },
  {
    date: "2024-12-24",
    who: "LMSY",
    category: "Livestream",
    title_en: "Mystbelle Taobao Live",
    title_th: "Mystbelle Taobao Live",
    title_zh: "Mystbelle 淘宝直播",
    location_en: "Taobao",
    location_th: "Taobao",
    location_zh: "淘宝",
    startTime: "19:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Live", "Brand"],
    hashtags: []
  },
  {
    date: "2024-12-28",
    who: "LMSY",
    category: "Special event",
    title_en: "ICONSIAM Pre Countdown Party",
    title_th: "ICONSIAM Pre Countdown Party",
    title_zh: "ICONSIAM 倒数派对（Pre Countdown）",
    location_en: "River Park, ICONSIAM",
    location_th: "River Park, ICONSIAM",
    location_zh: "ICONSIAM River Park",
    startTime: "19:00",
    timezone: "GMT+7",
    tags: ["LMSY", "Special event"],
    hashtags: []
  },

  {
    date: "2025-01-08",
    who: "LMSY",
    category: "Drama",
    title_en: "Press Tour",
    title_th: "Press Tour",
    title_zh: "宣传行程",
    location_en: "Bangkok",
    location_th: "กรุงเทพฯ",
    location_zh: "曼谷",
    startTime: "",
    timezone: "GMT+7",
    tags: ["LMSY", "PressTour"],
    hashtags: []
  },
  {
    date: "2025-01-10",
    who: "LMSY",
    category: "Livestream",
    title_en: "Arousar Studios Taobao Live",
    title_th: "Arousar Studios Taobao Live",
    title_zh: "Arousar Studios 淘宝直播",
    location_en: "Taobao Live (Arousar Studios)",
    location_th: "Taobao Live (Arousar Studios)",
    location_zh: "淘宝直播（Arousar Studios）",
    startTime: "",
    timezone: "GMT+7",
    tags: ["LMSY", "Live", "Brand"],
    hashtags: []
  },
  {
    date: "2025-01-16",
    who: "LMSY",
    category: "Special event",
    title_en: "T-POP Stage Show",
    title_th: "T-POP Stage Show",
    title_zh: "T-POP 舞台秀",
    location_en: "Bangkok",
    location_th: "กรุงเทพฯ",
    location_zh: "曼谷",
    startTime: "",
    timezone: "GMT+7",
    tags: ["LMSY", "Show"],
    hashtags: []
  },
  {
    date: "2025-01-18",
    who: "LMSY",
    category: "Fansign",
    title_en: "1st Fansign in Tianjin",
    title_th: "1st Fansign in Tianjin",
    title_zh: "天津首场签售",
    location_en: "Tianjin",
    location_th: "Tianjin",
    location_zh: "天津",
    startTime: "",
    timezone: "GMT+7",
    tags: ["LMSY", "Fansign"],
    hashtags: []
  },
  {
    date: "2025-01-23",
    who: "LMSY",
    category: "Brand",
    title_en: "Sretsis In-store (Lance)",
    title_th: "Sretsis In-store (Lance)",
    title_zh: "Sretsis 门店活动",
    location_en: "Sretsis (Bangkok)",
    location_th: "Sretsis (กรุงเทพฯ)",
    location_zh: "Sretsis（曼谷）",
    startTime: "",
    timezone: "GMT+7",
    tags: ["LMSY", "Brand"],
    hashtags: []
  },
  {
    date: "2025-01-24",
    who: "LMSY",
    category: "Drama",
    title_en: "Press Tour",
    title_th: "Press Tour",
    title_zh: "宣传行程",
    location_en: "Bangkok",
    location_th: "กรุงเทพฯ",
    location_zh: "曼谷",
    startTime: "",
    timezone: "GMT+7",
    tags: ["LMSY", "PressTour"],
    hashtags: []
  },
  {
    date: "2025-02-15",
    who: "LMSY",
    category: "FanMeeting",
    title_en: "LMSY 1st Fan Meeting in Thailand, Be My Valentine",
    title_th: "LMSY 1st Fan Meeting in Thailand, Be My Valentine",
    title_zh: "LMSY 泰国首场粉丝见面会《Be My Valentine》",
    location_en: "True Icon Hall, 7th Floor, ICONSIAM",
    location_th: "True Icon Hall ชั้น 7, ICONSIAM",
    location_zh: "ICONSIAM 7楼 True Icon Hall",
    startTime: "",
    timezone: "GMT+7",
    tags: ["LMSY", "FanMeeting"],
    hashtags: []
  },

  // MARCH 2025
  {
    date: "2025-03-01",
    who: "LMSY",
    category: "Brand",
    title: "DCASH Tops of Beauty 2025",
    location: "Central Westgate, Bangkok",
    notes: "14:00–15:00 (GMT+7)",
    tags: ["LMSY", "Brand"]
  },
  {
    date: "2025-03-05",
    who: "LMSY",
    category: "Brand",
    title: "Siam Center The Summer Runway curated by Mint",
    location: "Siam Center, Bangkok",
    notes: "17:45 (GMT+7)",
    tags: ["LMSY", "Runway", "Brand"]
  },
  {
    date: "2025-03-08",
    who: "LMSY",
    category: "FanMeeting",
    title: "1st Fan Meeting in Vietnam",
    location: "Ben Thanh Theater, Vietnam",
    notes: "18:00 (GMT+7)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-03-13",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY × Taixiaoxiang Live",
    location: "Taobao Live",
    notes: "19:00 (GMT+7)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-03-15",
    who: "LMSY",
    category: "FanMeeting",
    title: "1st Fan Meeting in Manila with Lookmhee & Sonya",
    location: "SM Skydome, Philippines",
    notes: "13:00 (GMT+7)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-03-22",
    who: "LMSY",
    category: "Brand",
    title: "Arousar × LMSY",
    location: "Guangzhou, China",
    notes: "12:30 (GMT+7)",
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
    notes: "10:00 (GMT+7)",
    tags: ["LMSY", "Event"]
  },

  // APRIL 2025
  {
    date: "2025-04-03",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY PandaThaiHouse Live",
    location: "Taobao Live",
    notes: "19:00–20:00 (GMT+7)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-04-05",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY 1st Fan Meeting in Taipei",
    location: "Legacy Tera, Taipei, Taiwan",
    notes: "16:00 (GMT+7)",
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-04-12",
    who: "LMSY",
    category: "Brand",
    title: "Shop & Snap with Celebrities at Lotus's",
    location: "Lotus's Rama 1, Bangkok",
    notes: "13:30 (GMT+7)",
    tags: ["LMSY", "Brand", "Event"]
  },
  {
    date: "2025-04-18",
    who: "SY",
    category: "Special event",
    title: "Sonya's Birthday Party",
    location: "Century The Movie Plaza, Bangkok",
    notes: "13:00–16:00 (GMT+7)",
    tags: ["Sonya", "Birthday"]
  },
  {
    date: "2025-04-26",
    who: "LMSY",
    category: "Fansign",
    title: "LMSY 1st Fansign in Chongqing",
    location: "Chongqing, China",
    notes: "12:00 (GMT+7)",
    tags: ["LMSY", "Fansign"]
  },

  // MAY 2025
  {
    date: "2025-05-02",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY Taixiaoxiang Live",
    location: "Taobao Live",
    notes: "19:00–20:00 (GMT+7)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-05-03",
    who: "LMSY",
    category: "Award",
    title: "Award Ceremony",
    location: "Airforce Convention Hall, Bangkok",
    notes: "13:00 (GMT+7)",
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
    notes: "15:00 (GMT+7)",
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
    notes: "15:45 (GMT+7)",
    tags: ["LMSY", "Pride", "Event"]
  },
  {
    date: "2025-06-11",
    who: "LMSY",
    category: "Drama",
    title: "Harmony Secret special event",
    location: "GMM Grammy Place, Bangkok",
    notes: "09:09 (GMT+7)",
    tags: ["LMSY", "Harmony Secret"]
  },
  {
    date: "2025-06-13",
    who: "LMSY",
    category: "Livestream",
    title: "MIDATO × LMSY Live",
    location: "Weidian Live",
    notes: "19:00 (GMT+7)",
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
    notes: "19:00 (GMT+7)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-07-25",
    who: "LMSY",
    category: "Livestream",
    title: "LMSY × Clouvia Live",
    location: "Taobao Live",
    notes: "19:00 (GMT+7)",
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
    notes: "23:30 (GMT+7)",
    tags: ["LMSY", "Harmony Secret", "Streaming"]
  },

  // AUGUST 2025
  {
    date: "2025-08-07",
    who: "LMSY",
    category: "Livestream",
    title: "EFM Fandom Live Lookmhee Sonya",
    location: "EFM Station Live",
    notes: "20:30 (GMT+7)",
    tags: ["LMSY", "Live"]
  },
  {
    date: "2025-08-09",
    who: "LM",
    category: "Special event",
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
    notes: "18:30 (GMT+7)",
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
    notes: "11:00, 14:00, 16:00, 19:00 (GMT+7)",
    tags: ["LMSY", "Harmony Secret"]
  },
  {
    date: "2025-09-06",
    who: "LMSY",
    category: "Special event",
    title: "Praew Charity 2025",
    location: "Parc Paragon, Living Hall 3F, Bangkok",
    notes: "17:00 (GMT+7)",
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
    notes: "14:00 (GMT+7)",
    hashtags: ["#LMSYFANMEETINGINMACAU"],
    tags: ["LMSY", "Fanmeeting"]
  },

  // OCTOBER 2025
  {
    date: "2025-10-04",
    who: "LM",
    category: "FanMeeting",
    title: "Lookmhee Nanning 2nd Fan Meeting",
    location: "Nanning, China",
    notes: "11:00 (GMT+7)",
    tags: ["Lookmhee", "Fanmeeting"]
  },
  {
    date: "2025-10-04",
    who: "SY",
    category: "FanMeeting",
    title: "Sonya 2nd Fan Meeting in Nanning",
    location: "Nanning, China",
    notes: "18:00 (GMT+7)",
    tags: ["Sonya", "Fanmeeting"]
  },
  {
    date: "2025-10-11",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY in Hong Kong 2025",
    location: "Hong Kong, AXA Dreamland",
    notes: "15:00 (GMT+7)",
    hashtags: ["#LMSYFANMEETINGINHONGKONG2025"],
    tags: ["LMSY", "Fanmeeting"]
  },
  {
    date: "2025-10-25",
    who: "SY",
    category: "Special event",
    title: "Candy Kiss Halloween with Sonya",
    location: "To be announced",
    notes: "Details to be announced",
    hashtags: ["#CandyKissHalloweenwithSonya"],
    tags: ["Sonya", "Event", "Halloween"]
  },

  // NOVEMBER 2025
  {
    date: "2025-11-01",
    who: "LMSY",
    category: "Brand",
    title: "FOAMDREAM Party",
    location: "Hangzhou, China",
    notes: "11:00–18:00 (GMT+7)",
    hashtags: ["#FoamDreamxLMSY"],
    tags: ["LMSY", "Event"]
  },
  {
    date: "2025-11-07",
    who: "LMSY",
    category: "Special event",
    title: "iQIYI 2026 Event",
    location: "Sphere Hall, 5M Floor, EmSphere, Bangkok",
    notes: "Details to be announced",
    hashtags: ["#IQIYIiJOYTH2026xLMSY"],
    tags: ["LMSY", "Event"]
  },
  {
    date: "2025-11-08",
    who: "LMSY",
    category: "Special event",
    title: "LMSY × BuddyBesties2DSY1Night (Day 1)",
    location: "Kanchanaburi Province, Thailand",
    notes: "Details to be announced",
    hashtags: ["#BUddyBestiesLoveMeLoveYouxLMSY"],
    tags: ["LMSY", "BuddyBesties"]
  },
  {
    date: "2025-11-09",
    who: "LMSY",
    category: "Special event",
    title: "LMSY × BuddyBesties2DSY1Night (Day 2)",
    location: "Kanchanaburi Province, Thailand",
    notes: "Details to be announced",
    hashtags: ["#BUddyBestiesLoveMeLoveYouxLMSY"],
    tags: ["LMSY", "BuddyBesties"]
  },
  {
    date: "2025-11-12",
    who: "LMSY",
    category: "Award",
    title: "HOWE Awards 2025",
    location: "BITEC Bangna 2F Grand Hall 201–203, Bangkok",
    notes: "Details to be announced",
    hashtags: ["#HOWEAWARDS2025XLMSY"],
    tags: ["LMSY", "Awards"]
  },
  {
    date: "2025-11-23",
    who: "LMSY",
    category: "Livestream",
    title: "Chun Xiangji Weidian Live",
    location: "Weidian Live",
    notes: "19:00 (GMT+7)",
    tags: ["LMSY", "Live", "Brand"]
  },
  {
    date: "2025-11-29",
    who: "LM",
    category: "FanMeeting",
    title: "Lookmhee Fan Meeting in Wuhan",
    location: "Wuhan, China",
    notes: "Details to be announced",
    hashtags: ["#LOOKMHEExFirstFansignWuHan"],
    tags: ["Lookmhee", "Fanmeeting"]
  },
  {
    date: "2025-11-30",
    who: "SY",
    category: "FanMeeting",
    title: "Sonya Fan Meeting in Wuhan",
    location: "Wuhan, China",
    notes: "Details to be announced",
    hashtags: ["#SonyaxFirstFansignWuHan"],
    tags: ["Sonya", "Fanmeeting"]
  },

  // DECEMBER 2025
  {
    date: "2025-12-11",
    who: "LMSY",
    category: "Brand",
    title: "MIRROR All Voices, Empowering Ones",
    location: "EM Skye, FL.14, Emsphere, Bangkok",
    location_th: "EM Skye ชั้น 14 เอ็มสเฟียร์ กรุงเทพฯ",
    location_zh: "曼谷 Emsphere EM Skye 14楼",
    notes: "Start time 18:00 (GMT+7)",
    notes_th: "เริ่ม 18:00 น. (GMT+7)",
    notes_zh: "开始时间 18:00（GMT+7）",
    hashtags: ["#MIRROR50xLMSY", "#AllVoicesEmpoweringOnes"],
    tags: ["LMSY", "Brand", "Appearance"]
  },
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
    notes: "Start time 15:00 (GMT+7)",
    notes_th: "เริ่ม 15:00 น. (GMT+7)",
    notes_zh: "开始时间 15:00（GMT+7）",
    hashtags: ["#LMSY1stFMinSINGAPORE"],
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
    notes: "Start time 15:00 (GMT+7)",
    notes_th: "เริ่ม 15:00 น. (GMT+7)",
    notes_zh: "开始时间 15:00（GMT+7）",
    hashtags: ["#PersonOfTheYearAwards2025xLMSY"],
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
    notes: "Start time 10:00 (GMT+7) · MOLI Jasmine Space, Fuzhou, China",
    notes_th: "เริ่ม 10:00 น. (GMT+7) · MOLI Jasmine Space เมืองฝูโจว ประเทศจีน",
    notes_zh: "开始时间 10:00（GMT+7) · 中国福州 MOLI茉莉空间",
    hashtags: ["#LOOKMHEExFirstFanMeetinFuzhou"],
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
    notes: "Start time 10:00 (GMT+7) · MOLI Jasmine Space, Fuzhou, China",
    notes_th: "เริ่ม 10:00 น. (GMT+7) · MOLI Jasmine Space เมืองฝูโจว ประเทศจีน",
    notes_zh: "开始时间 10:00（GMT+7) · 中国福州 MOLI茉莉空间",
    hashtags: ["#SONYAxFirstFanMeetinFuzhou"],
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
    notes: "Start time 18:00 (GMT+7)",
    notes_th: "เริ่ม 18:00 น. (GMT+7)",
    notes_zh: "开始时间 18:00（GMT+7)",
    hashtags: ["#HIKARUxLOOKMHEE", "#LookmheeInASecretChristmasNight"],
    tags: ["Lookmhee", "Christmas Event"]
  },

    // JANUARY 2026
  {
    date: "2026-01-07",
    who: "LMSY",
    category: "FanEvent",
    title_en: "LMSY Say Hi 2026",
    title_th: "LMSY Say Hi 2026",
    title_zh: "LMSY Say Hi 2026",
    location_en: "Lobby G Floor, GMM Grammy Place, Bangkok",
    location_th: "Lobby ชั้น G, GMM Grammy Place, กรุงเทพฯ",
    location_zh: "GMM Grammy Place G层大厅，曼谷",
    startTime: "20:00",
    timezone: "GMT+7",
    details_en: "Special fan appearance event",
    details_th: "กิจกรรมพิเศษพบปะแฟน ๆ",
    details_zh: "特别粉丝见面活动",
    tags: ["LMSY", "FanEvent"],
    hashtags: ["#ลูกหมีซอนญ่ารวมพลปีใหม่"],
  },
  {
    date: "2026-01-17",
    who: "SY",
    category: "FanMeeting",
    title: "Sonya Sweetheart Party (Chengdu)",
    title_th: "Sonya Sweetheart Party (เฉิงตู)",
    title_zh: "SONYA 甜心派对（成都）",
    location: "Chengdu, China",
    location_th: "เฉิงตู ประเทศจีน",
    location_zh: "中国·成都",
    notes: "Start time 10:00 (GMT+7)",
    notes_th: "เริ่ม 10:00 น. (GMT+7)",
    notes_zh: "开始时间 10:00（GMT+7)",
    hashtags: ["#Sonyaxchengdu"],
    tags: ["Sonya", "Fanmeeting"]
  },
  {
    date: "2026-01-18",
    who: "LM",
    category: "FanMeeting",
    title: "Lookmhee Heart Flutter (Chengdu)",
    title_th: "Lookmhee Heart Flutter (เฉิงตู)",
    title_zh: "LOOKMHEE 怦然心动（成都）",
    location: "Chengdu, China",
    location_th: "เฉิงตู ประเทศจีน",
    location_zh: "中国·成都",
    notes: "Start time 10:00 (GMT+7)",
    notes_th: "เริ่ม 10:00 น. (GMT+7)",
    notes_zh: "开始时间 10:00（GMT+7)",
    hashtags: ["#Lookmheexchengdu"],
    tags: ["Lookmhee", "Fanmeeting"]
  },
  {
    date: "2026-01-24",
    who: "LMSY",
    category: "FanMeeting",
    title: "LMSY Deal With You in Taipei",
    title_th: "LMSY Deal With You in Taipei",
    title_zh: "LMSY 台北见面会 Deal With You",
    location: "National Taipei University of Technology, Taipei",
    location_th: "National Taipei University of Technology, ไทเป",
    location_zh: "国立台北科技大学",
    notes: "Start time 14:00 (GMT+7)",
    notes_th: "เริ่ม 14:00 น. (GMT+7)",
    notes_zh: "开始时间 14:00（GMT+7)",
    hashtags: ["#LMSYDealWithYouInTaipei"],
    tags: ["LMSY", "Fanmeeting"]
  },
   {
  date: "2026-01-28",
  who: "LMSY",
  category: "Special event",
  title_en: "CHANGE VERSE 2026",
  title_th: "CHANGE VERSE 2026",
  title_zh: "CHANGE VERSE 2026",
  location_en: "True Icon Hall, 7th Floor, ICONSIAM, Bangkok",
  location_th: "True Icon Hall ชั้น 7, ICONSIAM กรุงเทพฯ",
  location_zh: "曼谷 ICONSIAM 7楼 True Icon Hall",
  notes: "Start time 18:00 (GMT+7)",
  notes_th: "เริ่ม 18:00 น. (GMT+7)",
  notes_zh: "开始时间 18:00（GMT+7)",
  hashtags: ["#CHANGEVERSE2026"],
  tags: ["LMSY", "Special event"]
},
   {
  date: "2026-01-30",
  who: "LMSY",
  category: "Special event",
  title_en: "A Journey of Falling In Love with LMSY",
  title_th: "A Journey of Falling In Love with LMSY",
  title_zh: "A Journey of Falling In Love with LMSY",
  location_en: "Chiang Mai",
  location_th: "เชียงใหม่",
  location_zh: "清迈",
  notes: "Start time 12:00 (GMT+7)",
  notes_th: "เริ่ม 12:00 น. (GMT+7)",
  notes_zh: "开始时间 12:00（GMT+7)",
  hashtags: ["#JourneywithFoamDreamxLMSY"],
  tags: ["LMSY", "Special event"]
},
   {
  date: "2026-01-31",
  who: "LMSY",
  category: "Special event",
  title_en: "A Journey of Falling In Love with LMSY",
  title_th: "A Journey of Falling In Love with LMSY",
  title_zh: "A Journey of Falling In Love with LMSY",
  location_en: "Chiang Mai",
  location_th: "เชียงใหม่",
  location_zh: "清迈",
  notes_en: "30 Jan to 1 Feb 2026",
  notes_th: "30 ม.ค. ถึง 1 ก.พ. 2026",
  notes_zh: "2026年1月30日至2月1日",
  hashtags: ["#JourneywithFoamDreamxLMSY"],
  tags: ["LMSY", "Special event"]
},

    // FEBRUARY 2026
   {
  date: "2026-02-01",
  who: "LMSY",
  category: "Special event",
  title_en: "A Journey of Falling In Love with LMSY",
  title_th: "A Journey of Falling In Love with LMSY",
  title_zh: "A Journey of Falling In Love with LMSY",
  location_en: "Chiang Mai",
  location_th: "เชียงใหม่",
  location_zh: "清迈",
  notes_en: "30 Jan to 1 Feb 2026",
  notes_th: "30 ม.ค. ถึง 1 ก.พ. 2026",
  notes_zh: "2026年1月30日至2月1日",
  hashtags: ["#JourneywithFoamDreamxLMSY"],
  tags: ["LMSY", "Special event"]
},
   {
  date: "2026-02-07",
  who: "Lookmhee",
  category: "FanEvent",
  title_en: "Hug Lai Mai Lookmhee 27th Birthday",
  title_th: "ฮักหลายมายลูกหมี 27th Birthday",
  title_zh: "Lookmhee 27岁生日应援活动",
  location_en: "To be announced",
  location_th: "สถานที่รอประกาศ",
  location_zh: "地点待公布",
  notes_en: "Event time 12:00–17:00 (GMT+7)",
  notes_th: "ระยะเวลากิจกรรม 12:00–17:00 น. (GMT+7)",
  notes_zh: "活动时间 12:00–17:00（GMT+7）",
  tags: ["Lookmhee", "FanEvent", "Birthday"],
  hashtags: ["LM BDAY LUV UNLIMIT\n\n#ฮักหลายมายลูกหมี"]
},
   {
  date: "2026-02-08",
  who: "LMSY",
  category: "Award",
  title_en: "Japan Expo Thailand Award 2026 (Japan Expo Relationship Award)",
  title_th: "JAPAN EXPO THAILAND AWARD 2026 (JAPAN EXPO RELATIONSHIP AWARD)",
  title_zh: "日本博览会泰国 2026 颁奖典礼（Japan Expo Relationship Award）",
  location_en: "KAZE Stage (Outdoor), Square B, centralwOrld, Bangkok",
  location_th: "เวที KAZE (กลางแจ้ง), Square B, ศูนย์การค้าเซ็นทรัลเวิลด์ กรุงเทพฯ",
  location_zh: " Square B, 曼谷 centralwOrld · KAZE 户外舞台",
  notes_en: "8 Feb 2026 · Time 14:00 (GMT+7)",
  notes_th: "8 ก.พ. 2026 · เวลา 14:00 น. (GMT+7)",
  notes_zh: "2026年2月8日 · 时间 14:00（GMT+7)",
  tags: ["LMSY", "Award"],
  hashtags: ["LMSY AT JAPAN EXPO 2026\n\n#JapanExpoThailand2026xLMSY"]
},
   {
  date: "2026-02-08",
  who: "LMSY",
  category: "Special event",
  title_en: "Japan Expo Thailand 2026 (World of T-Pop)",
  title_th: "JAPAN EXPO THAILAND 2026 (WORLD OF T-POP!)",
  title_zh: "日本博览会泰国 2026（World of T-Pop)",
  location_en: "Central Court, 1F, centralwOrld, Bangkok",
  location_th: "Central Court, 1F, centralwOrld, กรุงเทพฯ",
  location_zh: "Central Court, 1F, 曼谷 centralwOrld",
  notes_en: "8 Feb 2026 · Start time 18:35 (GMT+7) · Taiyo Stage",
  notes_th: "8 ก.พ. 2026 · เริ่ม 18:35 น. (GMT+7) · Taiyo Stage",
  notes_zh: "2026年2月8日 · 开始时间 18:35（GMT+7) · Taiyo Stage",
  tags: ["LMSY", "Special event"],
  hashtags: ["LMSY AT JAPAN EXPO 2026\n\n#JapanExpoThailand2026xLMSY"]
},
   {
  date: "2026-02-08",
  who: "LMSY",
  category: "Special event",
  title_en: "Japan Expo Thailand 2026 (Post event gathering activity)",
  title_th: "JAPAN EXPO THAILAND 2026 (กิจกรรมรวมพลหลังเลิกงาน)",
  title_zh: "日本博览会泰国 2026（活动结束后见面会)",
  location_en: "Central Court, 1F, centralwOrld, Bangkok",
  location_th: "Central Court, 1F, centralwOrld, กรุงเทพฯ",
  location_zh: "Central Court, 1F, 曼谷 centralwOrld",
  notes_en: "8 Feb 2026 · Start time 19:30 (GMT+7) · Taiyo Stage",
  notes_th: "8 ก.พ. 2026 · เริ่ม 19:30 น. (GMT+7) · Taiyo Stage",
  notes_zh: "2026年2月8日 · 开始时间 19:30（GMT+7) · Taiyo Stage",
  tags: ["LMSY", "Special event"],
  hashtags: ["LMSY AT JAPAN EXPO 2026\n\n#JapanExpoThailand2026xLMSY"]
},
   {
  date: "2026-02-14",
  who: "Lookmhee",
  category: "FanMeeting",
  title_en: "Lookmhee Birthday Party Fansign in Chongqing",
  title_th: "งานแฟนไซน์วันเกิด Lookmhee ที่ฉงชิ่ง",
  title_zh: "Lookmhee 重庆生日签售",
  location_en: "Chongqing, China",
  location_th: "ฉงชิ่ง ประเทศจีน",
  location_zh: "中国·重庆",
  notes: "Start time 11:30 (GMT+7)",
  notes_th: "เริ่ม 11:30 น. (GMT+7)",
  notes_zh: "开始时间 11:30（GMT+7)",
  hashtags: ["LM BD IN CHONGQING\n\n#Lookmheebirthdaypartychongqing"],
  tags: ["Lookmhee","Fanmeeting"]
},
   {
  date: "2026-02-21",
  who: "LMSY",
  category: "Special event",
  title_en: "Buddy Besties x LMSY Meet & Greet",
  title_th: "Buddy Besties x LMSY Meet & Greet",
  title_zh: "Buddy Besties x LMSY Meet & Greet",
  location_en: "Lancaster Bangkok",
  location_th: "Lancaster Bangkok",
  location_zh: "Lancaster Bangkok",
  notes_en: "Start time 10.00 AM (GMT+7)",
  notes_th: "เริ่ม 10.00 น. (GMT+7)",
  notes_zh: "开始时间 上午10:00 (GMT+7)",
  hashtags: ["LMSY FANS DAY X BUDDY BESTIES\n\n#BDBTxMeetandGreetLMSY"],
  tags: ["LMSY", "Special event"]
},
{
  date: "2026-03-01",
  who: "LMSY",
  category: "Special event",
  title_en: "LMSY & Banksorn Special Appearance · Likay Sornam Nam Phet",
  title_th: "LMSY และ Banksorn ร่วมแสดงพิเศษกับลิเกคณะศรรามน้ำเพชร",
  title_zh: "LMSY 与 Banksorn 特别出演 · ศรรามน้ำเพชร 戏剧团",
  location_en: "Wat Samrong Tai, Phra Pradaeng, Samut Prakan, Thailand",
  location_th: "วัดสำโรงใต้ อ.พระประแดง จ.สมุทรปราการ",
  location_zh: "泰国·北榄府 帕巴登县 三隆泰寺",
  notes_en: "Start time 20:30 (GMT+7). Live stream available on Facebook via Banksorn page and on YouTube channel ลิเกคณะศรรามน้ำเพชร.",
  notes_th: "เริ่ม 20:30 น. (GMT+7). มีไลฟ์สดทาง Facebook เพจ Banksorn และช่อง YouTube ลิเกคณะศรรามน้ำเพชร",
  notes_zh: "开始时间 20:30（GMT+7). 可通过 Facebook Banksorn 页面及 YouTube 频道 ลิเกคณะศรรามน้ำเพชร",
  hashtags: ["Hometown Romance Fun Joy Sornram Namphet\n\n#คุณแฟนบ้านนอกจอยม่วนศรรามน้ำเพชร"],
  tags: ["LMSY","Special event"]
},
{
  date: "2026-03-07",
  who: "LMSY",
  category: "Special event",
  title_en: "Hometown Romance X Ann Oradee Special Event",
  title_th: "คุณแฟนบ้านนอก X แอน อรดี งานพิเศษ",
  title_zh: "Hometown Romance X Ann Oradee 特别活动",
  location_en: "Wat Khom Phuttharangsri (Phutthamonthon Sai 3), Thawee Watthana, Bangkok",
  location_th: "วัดโคมพุทธรังสี (พุทธมณฑล สาย 3), เขตทวีวัฒนา กรุงเทพฯ",
  location_zh: "曼谷 他威瓦他那区 · Wat Khom Phuttharangsri（Phutthamonthon Sai 3）",
  notes_en: "Show Time 22:00 (GMT+7) · Tickets available at venue",
  notes_th: "เวลา 22:00 น. (GMT+7) · บัตรซื้อได้ที่หน้างาน",
  notes_zh: "演出时间 22:00（GMT+7）· 现场购票",
  tags: ["LMSY", "Special event"],
  hashtags: ["HTRM X AnnOradee\n\n#คุณแฟนบ้านนอกXแอนอรดี "]
},
    {
    date: "2026-03-12",
    who: "LMSY",
    category: "Drama",
    title: "Worship Hometown Romance Special Ceremony",
    location: "GMM Grammy Place, Bangkok",
    location_th: "งานปิด สามารถให้กำลังใจศิลปินบริเวณรอบๆงานได้",
    location_zh: "GMM Grammy Place，曼谷",
    notes: "Start time 9:09 (GMT+7)",
    notes_th: "เริ่ม 9:09 น. (GMT+7)",
    notes_zh: "开始时间 9:09（GMT+7)",
    tags: ["LMSY", "Drama"],
    hashtags: ["Worship Hometown Romance\n\n#บวงสรวงคุณแฟนบ้านนอก"]
  },
    {
  date: "2026-03-12",
  who: "LMSY",
  category: "Award",
  title: "9Entertain Awards 2026",
  title_th: "งานประกาศรางวัล 9Entertain Awards 2026",
  title_zh: "9Entertain Awards 2026 颁奖典礼",
  location: "Paragon Hall, Bangkok",
  location_th: "พารากอน ฮอลล์ กรุงเทพฯ",
  location_zh: "曼谷 Paragon Hall",
  notes: "Start time 17:00 (GMT+7). Closing event, fans can support around the venue.",
  notes_th: "เริ่มเวลา 17:00 น. (GMT+7) งานปิด สามารถให้กำลังใจบริเวณรอบงานได้",
  notes_zh: "开始时间 17:00（GMT+7），为闭幕活动，粉丝可在场馆周边应援",
  hashtags: ["LMSY 9ENT X SIAM PARAGON\n\n#9EntertainAwards2026xLMSY", "#9entawards2026xSIAMPARAGON"],
  tags: ["Awards", "Appearance"]
},
  {
  date: "2026-03-12",
  who: "LMSY",
  category: "Drama",
  title: "Hometown Romance Official Teaser Release",
  location: "YouTube – CHANGE2561",
  location_th: "YouTube : CHANGE2561",
  location_zh: "YouTube：CHANGE2561",
  notes: "Official teaser premiere at 20:00 (GMT+7)",
  notes_th: "ปล่อยทีเซอร์อย่างเป็นทางการ เวลา 20:00 น. (GMT+7)",
  notes_zh: "官方预告发布，时间 20:00（GMT+7）",
  hashtags: ["HOMETOWN ROMANCE TEASER\n\n#HometownRomanceTeaser"],
  tags: ["LMSY", "Drama", "Teaser"]
},
{
  date: "2026-03-13",
  who: "LMSY",
  category: "Livestream",
  title: "Foam Dream Live Streaming",
  title_th: "Foam Dream Live Streaming",
  title_zh: "Foam Dream 直播活动",
  location: "Taobao Live (Foam Dream)",
  location_th: "Taobao Live (Foam Dream)",
  location_zh: "淘宝直播（Foam Dream）",
  notes: "Start time 19:00 (GMT+7)",
  notes_th: "เริ่ม 19:00 น. (GMT+7)",
  notes_zh: "开始时间 19:00（GMT+7）",
  hashtags: ["LMSY X FOAM DREAM MOMENT\n\n#FoamdreammomentwithLMSY"],
  tags: ["LMSY", "Livestream"]
},
{
  date: "2026-03-13",
  who: "LMSY",
  category: "Drama",
  title: "Hometown Romance Reaction Teaser",
  location: "YouTube – CHANGE2561",
  location_th: "YouTube : CHANGE2561",
  location_zh: "YouTube：CHANGE2561",
  notes: "Reaction teaser premiere at 19:00 (GMT+7)",
  notes_th: "ปล่อย Reaction Teaser เวลา 19:00 น. (GMT+7)",
  notes_zh: "Reaction 预告发布，时间 19:00（GMT+7）",
  hashtags: ["#HometownRomance_ReactionTeaser"],
  tags: ["LMSY", "Drama", "Reaction", "Teaser"]
},
{
  date: "2026-03-15",
  who: "LMSY",
  category: "Brand",
  title: "Lucky Moment with LMSY",
  title_th: "Lucky Moment with LMSY",
  title_zh: "LMSY 幸运时刻活动",
  location: "Big C Ratchadamri, Bangkok",
  location_th: "บิ๊กซี ราชดำริ กรุงเทพฯ",
  location_zh: "曼谷 Big C Ratchadamri",
  notes: "Start time 14:00 (GMT+7)",
  notes_th: "เริ่ม 14:00 น. (GMT+7)",
  notes_zh: "开始时间 14:00（GMT+7）",
  hashtags: ["LUCKY MOMENT WITH LMSY\n\n#LMSYLUCKYMOMENT"],
  tags: ["LMSY", "Brand"]
},
{
  date: "2026-03-20",
  who: "LMSY",
  category: "Drama",
  title: "Hometown Romance Official Trailer Release",
  location: "YouTube – CHANGE2561",
  location_th: "YouTube : CHANGE2561",
  location_zh: "YouTube：CHANGE2561",
  notes: "Official trailer premiere at 20:00 (GMT+7)",
  notes_th: "ปล่อยตัวอย่างอย่างเป็นทางการ เวลา 20:00 น. (GMT+7)",
  notes_zh: "官方预告发布，时间 20:00（GMT+7）",
  hashtags: ["HOMETOWN ROMANCE TRAILER\n\n#HometownRomanceTrailer"],
  tags: ["LMSY", "Drama", "Trailer"]
},
      {
  date: "2026-03-21",
  who: "Sonya",
  category: "Fansign",
  title_en: "Spring Note Rendezvous · Sonya Shanghai Fansign Event",
  title_th: "งานแฟนไซน์ Sonya ที่เซี่ยงไฮ้",
  title_zh: "春日音符之约 · Sonya 上海签售会",
  location_en: "Shanghai, China",
  location_th: "เซี่ยงไฮ้ ประเทศจีน",
  location_zh: "中国·上海",
  notes: "Start time 11:00 (GMT+7)",
  notes_th: "เริ่ม 11:00 น. (GMT+7)",
  notes_zh: "开始时间 11:00（GMT+7)",
  hashtags: ["SPRING LETTER DATE SONYA SHANGHAI FANS\n\n#SonyaFSinShanghai"],
  tags: ["Sonya","Fansign"]
},
      {
  date: "2026-03-22",
  who: "Lookmhee",
  category: "Fansign",
  title_en: "Whispered Spring Tales · Lookmhee Shanghai Fansign Event",
  title_th: "งานแฟนไซน์ Lookmhee ที่เซี่ยงไฮ้",
  title_zh: "低语春日故事 · Lookmhee 上海签售会",
  location_en: "Shanghai, China",
  location_th: "เซี่ยงไฮ้ ประเทศจีน",
  location_zh: "中国·上海",
  notes: "Start time 11:00 (GMT+7)",
  notes_th: "เริ่ม 11:00 น. (GMT+7)",
  notes_zh: "开始时间 11:00（GMT+7)",
  hashtags: ["WHISPERS OF SPRING WT LM\n\n#LookmheeFSinShanghai"],
  tags: ["Lookmhee","Fansign"]
},
{
  date: "2026-03-25",
  who: "LMSY",
  category: "Special event",
  title_en: "Hometown Romance X Rabiab Wathasilp Special Event",
  title_th: "คุณแฟนบ้านนอก X ระเบียบวาทะศิลป์ งานพิเศษ",
  title_zh: "Hometown Romance X Rabiab Wathasilp 特别活动",
  location_en: "Lan Khang PTT Pump, Nava Nakorn Industrial Estate, Khlong Luang, Pathum Thani",
  location_th: "ลานข้างปั้ม ปตท. นิคมอุตสาหกรรมนวนคร อ.คลองหลวง จ.ปทุมธานี",
  location_zh: "巴吞他尼府 Khlong Luang · Nava Nakorn 工业园区 PTT 加油站旁广场",
  notes_en: "Festival: Khom Fai Festival 2026 · Show Time 20:30 (GMT+7) · Tickets available at venue",
  notes_th: "เทศกาลโคมไฟ เฟสติวัล 2026 · เวลาแสดง 20:30 น. (GMT+7) · บัตรซื้อได้ที่หน้างาน",
  notes_zh: "2026 灯节活动 · 演出时间 20:30（GMT+7）· 现场购票",
  hashtags: ["HTRM X Rabiab Wathasilp\n\n#คุณแฟนบ้านนอกXระเบียบวาทะศิลป์"],
  tags: ["LMSY", "Special event"]
},
{
  date: "2026-04-02",
  who: "LMSY",
  category: "Livestream",
  title: "LMSY Be My Romance Live",
  title_th: "LMSY Be My Romance Live",
  title_zh: "LMSY《Be My Romance》直播活动",
  location: "Instagram: CHANGE2561",
  location_th: "Instagram: CHANGE2561",
  location_zh: "Instagram：CHANGE2561",
  notes: "Live streaming for LMSY Be My Romance Fancon Presented by หมีกรุบ. Start time 19:00 (GMT+7).",
  notes_th: "ไลฟ์สตรีมงาน LMSY Be My Romance Fancon Presented by หมีกรุบ เริ่มเวลา 19:00 น. (GMT+7)",
  notes_zh: "LMSY Be My Romance Fancon Presented by หมีกรุบ 直播，开始时间为 19:00（GMT+7）",
  hashtags: ["LMSY BE MY ROMANCE LIVE\n\n#LMSYBEMYROMANCELIVE"],
  tags: ["LMSY", "Livestream", "Fancon"]
},
  {
    date: "2026-04-03",
    who: "LMSY",
    category: "Drama",
    title: "Hometown Romance First Premiere",
    location: "Siam Pavalai, Siam Paragon 6F, Bangkok",
    notes: "Start time 18:00 (GMT+7)",
    notes_th: "เริ่ม 18:00 น. (GMT+7)",
    notes_zh: "开始时间 18:00（GMT+7）",
    hashtags: ["HOMETOWN ROMANCE EP1\n\n#คุณแฟนบ้านนอกEP1"],
    tags: ["LMSY", "Hometown Romance"]
  },
    {
    date: "2026-04-05",
    who: "LMSY",
    category: "Special event",
    title: "Fan Gathering at Bookfair",
    location: "Queen Sirikit National Convention Center (QSNCC), Loading area at the “National Book Fair Bangkok",
    notes: "Start time 17:00 (GMT+7)",
    notes_th: "เริ่ม 17:00 น. (GMT+7)",
    notes_zh: "开始时间 17:00（GMT+7）",
    hashtags: ["HTRM BOOK FAIR 2026\n\n#lilyhousexคุณแฟนบ้านนอก"],
    tags: ["LMSY", "Special event"]
  },
    {
    date: "2026-04-05",
    who: "LMSY",
    category: "Special event",
    title: "My Rustic Wife x lilyhouse Stage Interview & Autograph Signing",
    location: "Queen Sirikit National Convention Center (QSNCC), LG Floor, Halls 5-7, Main Stage area at the “National Book Fair Bangkok",
    notes: "Start time 20:00 (GMT+7)",
    notes_th: "เริ่ม 20:00 น. (GMT+7)",
    notes_zh: "开始时间 20:00（GMT+7）",
    hashtags: ["HTRM BOOK FAIR 2026\n\n#lilyhousexคุณแฟนบ้านนอก"],
    tags: ["LMSY", "Special event"]
  },
  {
  date: "2026-04-07",
  who: "LMSY",
  category: "Livestream",
  title: "Mellow Pop",
  location: "TikTok / Website / Application, Mellow Pop",
  notes: "Live at 14:00 (GMT+7)",
  notes_th: "ถ่ายทอดสดเวลา 14:00 น. (GMT+7)",
  notes_zh: "直播时间为 14:00（GMT+7）",
  hashtags: ["#MellowPopxคุณแฟนบ้านนอก"],
  tags: ["LMSY", "Mellow Pop", "Hometown Romance"]
},
  {
  date: "2026-04-07",
  who: "LMSY",
  category: "Livestream",
  title: "Popcycle Live",
  location: "Popcycle Live",
  notes: "Private event for eligible participants, live at 17:00 (GMT+7)",
  notes_th: "งานปิด เฉพาะผู้มีสิทธิ์เข้าร่วม ถ่ายทอดสดเวลา 17:00 น. (GMT+7)",
  notes_zh: "仅限受邀者参与的活动，直播时间为 17:00（GMT+7）",
  hashtags: ["#PopcycleLivexLookmheeSonya"],
  tags: ["LMSY", "Popcycle", "Hometown Romance"]
},
{
  date: "2026-04-09",
  who: "LMSY",
  category: "Drama",
  title: "Media Interview",
  location_en: "Bangkok",
  location_th: "กรุงเทพฯ",
  location_zh: "曼谷",
  notes: "All-day media interviews",
  notes_th: "สัมภาษณ์สื่อทั้งวัน",
  notes_zh: "全天媒体采访",
  hashtags: [],
  tags: ["LMSY", "Hometown Romance"]
},
{
  date: "2026-04-11",
  who: "LMSY",
  category: "Livestream",
  title: "Kelana Live Streaming",
  title_th: "Kelana Live Streaming",
  title_zh: "可拉娜直播活动",
  location: "Weidian (Search: Kelana)",
  location_th: "Weidian (ค้นหา: Kelana)",
  location_zh: "微店（搜索：可拉娜）",
  notes: "Start time 19:00 (GMT+7), sales open on 2026-03-16 at 11:30 (GMT+7)",
  notes_th: "เริ่ม 19:00 น. (GMT+7), เปิดขายวันที่ 16 มี.ค. 2026 เวลา 11:30 น. (GMT+7)",
  notes_zh: "开始时间 19:00（GMT+7），开售时间为2026年3月16日11:30（GMT+7）",
  hashtags: [""],
  tags: ["LMSY", "Livestream"]
},
{
  date: "2026-04-18",
  who: "Sonya",
  category: "FanMeeting",
  title_en: "Sonya’s 1st Birthday Party in Chongqing",
  title_th: "งานวันเกิดครั้งที่ 1 ของ Sonya ที่ฉงชิ่ง",
  title_zh: "Sonya重庆生日见面会",
  location_en: "Chongqing, China",
  location_th: "ฉงชิ่ง ประเทศจีน",
  location_zh: "中国·重庆",
  notes: "Birthday fan event",
  notes_th: "งานแฟนมีตวันเกิด",
  notes_zh: "生日粉丝见面会",
  hashtags: ["SONYA BD 2026 IN CHONGQING\n\n#Sonyabirthdaypartychongqing"],
  tags: ["Sonya","Fanmeeting"]
},
{
  date: "2026-04-18",
  who: "LMSY",
  category: "Special event",
  title: "Club Friday Show",
  location: "one31",
  notes: "Airs at 10:00 (GMT+7), rerun on YouTube at 12:30 (GMT+7)",
  notes_th: "ออกอากาศเวลา 10:00 น. (GMT+7) และย้อนหลังทาง YouTube เวลา 12:30 น. (GMT+7)",
  notes_zh: "播出时间为 10:00（GMT+7），YouTube 重播时间为 12:30（GMT+7）",
  hashtags: [],
  tags: ["LMSY", "Special event"]
},
{
  date: "2026-04-22",
  who: "LMSY",
  category: "Drama",
  title: "Goodbye หมอไม่รู้ตัว",
  location_en: "Bangkok",
  location_th: "กรุงเทพฯ",
  location_zh: "曼谷",
  notes: "Recording at 16:00 (GMT+7)",
  notes_th: "ถ่ายรายการเวลา 16:00 น. (GMT+7)",
  notes_zh: "录制时间为 16:00（GMT+7）",
  hashtags: [],
  tags: ["LMSY", "Hometown Romance"]
},
{
  date: "2026-04-23",
  who: "LMSY",
  category: "Drama",
  title: "FIVE ME",
  location_en: "Bangkok",
  location_th: "กรุงเทพฯ",
  location_zh: "曼谷",
  notes: "Recording at 13:00 (GMT+7)",
  notes_th: "ถ่ายรายการเวลา 13:00 น. (GMT+7)",
  notes_zh: "录制时间为 13:00（GMT+7）",
  hashtags: [],
  tags: ["LMSY", "Hometown Romance"]
},
{
  date: "2026-04-23",
  who: "LMSY",
  category: "Livestream",
  title: "EFM Fandom Live",
  location: "EFM Station, atime.live/efm",
  notes: "Private event for eligible participants, live at 20:00 (GMT+7)",
  notes_th: "งานปิด สำหรับผู้มีสิทธิ์เข้าร่วมงาน ถ่ายทอดสดเวลา 20:00 น. (GMT+7)",
  notes_zh: "仅限受邀者参与的活动，直播时间为 20:00（GMT+7）",
  hashtags: ["HOMETOWN ROMANCE PRESS TOUR\n\n#LMSYxFANDOMFANFIC"],
  tags: ["LMSY", "EFM", "Hometown Romance"]
},
{
  date: "2026-04-23",
  who: "LMSY",
  category: "Livestream",
  title: "T-POP STAGE",
  location: "T-POP STAGE Facebook & YouTube",
  notes: "Stream live at 21:45 (GMT+7)",
  notes_th: "งานปิด ถ่ายทอดสดเวลา 21:45 น. (GMT+7)",
  notes_zh: "闭门活动，直播时间为晚上 21:45（GMT+7）",
  hashtags: ["HOMETOWN ROMANCE PRESS TOUR\n\n#TpopStagexLookmheeSonya"],
  tags: ["LMSY", "T-POP STAGE"]
},
{
  date: "2026-04-24",
  who: "LMSY",
  category: "Drama",
  title: "ข่าวที่ยิ่งรอบวัน",
  location: "ONE31",
  notes: "Live at 11:30 (GMT+7)",
  notes_th: "ถ่ายทอดสดเวลา 11:30 น. (GMT+7)",
  notes_zh: "直播时间为 11:30（GMT+7）",
  hashtags: ["HOMETOWN ROMANCE PRESS TOUR\n\n#ช่วงรอบวันxคุณแฟนบ้านนอก"],
  tags: ["LMSY", "ONE31", "Hometown Romance"]
},
{
  date: "2026-04-24",
  who: "LMSY",
  category: "Drama",
  title: "ถก",
  location: "YouTube / Facebook, GMM25 Thailand",
  notes: "Live at 22:30 (GMT+7)",
  notes_th: "ถ่ายทอดสดเวลา 22:30 น. (GMT+7)",
  notes_zh: "直播时间为 22:30（GMT+7）",
  hashtags: ["HOMETOWN ROMANCE PRESS TOUR\n\n#แฉxคุณแฟนบ้านนอก"],
  tags: ["LMSY", "GMM25", "Hometown Romance"]
},
{
  date: "2026-04-24",
  who: "LMSY",
  category: "Drama",
  title: "KhaosodArea Live Interview",
  location: "Facebook / TikTok, Khaosod",
  notes: "Live at 15:30 (GMT+7)",
  notes_th: "ไลฟ์สดเวลา 15:30 น. (GMT+7)",
  notes_zh: "直播时间为 15:30（GMT+7）",
  hashtags: ["#LMSY", "#ลูกหมีซอนญ่า", "#HometownRomance"],
  tags: ["LMSY", "Khaosod", "Hometown Romance"]
},
      {
  date: "2026-04-26",
  who: "Sonya",
  category: "FanEvent",
  title_en: "The Country Daughter-in-Law, Village Sports Style Sonya 27th Birthday",
  title_th: "สะใภ้บ้านนา กีฬาบ้านทุ่ง Sonya 27th Birthday",
  title_zh: "Sonya 27岁生日应援活动",
  location_en: "To be announced",
  location_th: "สถานที่รอประกาศ",
  location_zh: "地点待公布",
  notes_en: "Event time to be announced",
  notes_th: "ระยะเวลากิจกรรม รอประกาศ",
  notes_zh: "活动时间 待公布",
  tags: ["Sonya", "FanEvent", "Birthday"],
  hashtags: ["BABY SONYA 27 YRS\n\n#Sonya27thCelebration"]
},
{
  date: "2026-04-29",
  who: "LMSY",
  category: "Special event",
  title: "4โพดำ ลูกหมีซอนญ่า",
  location: "YouTube, อโศกมนตรี (@AsokMontri)",
  notes: "Special guest appearance on 4โพดำ, airs at 18:00 (GMT+7)",
  notes_th: "แขกรับเชิญพิเศษในรายการ 4โพดำ ออกอากาศเวลา 18:00 น. (GMT+7)",
  notes_zh: "特别嘉宾出演《4โพดำ》，播出时间为 18:00（GMT+7）",
  hashtags: ["#4โพดำลูกหมีซอนญ่า", "#4โพดำ", "#อโศกมนตรี", "#LMSY", "#ลูกหมีซอนญ่า", "#LMlookmhee", "#SonyaSaranphat"],
  tags: ["LMSY", "4โพดำ", "อโศกมนตรี"]
},
{
  date: "2026-04-30",
  who: "LMSY",
  category: "Drama",
  title: "Hotwave KRUB LIVE",
  location: "ATIME LIVE, atime.live/hotwave/live",
  notes: "Live at 19:00 (GMT+7)",
  notes_th: "ถ่ายทอดสดเวลา 19:00 น. (GMT+7)",
  notes_zh: "直播时间为 19:00（GMT+7）",
  hashtags: [],
  tags: ["LMSY", "Hometown Romance"]
},
{
  date: "2026-04-30",
  who: "LMSY",
  category: "Livestream",
  title: "ร้องข้ามกำแพง",
  location: "Facebook & YouTube: Workpoint 23",
  notes: "Live at 20:05 (GMT+7)",
  notes_th: "ถ่ายทอดสดเวลา 20:05 น. (GMT+7)",
  notes_zh: "直播时间为 20:05（GMT+7）",
  hashtags: ["#TheWallSongxLookmheeSonya"],
  tags: ["LMSY"]
},
{
  date: "2026-05-03",
  who: "LMSY",
  category: "FanEvent",
  title: "CHANGE FANDAY 2026",
  location: "SCBX Next Tech, 4th Floor, Siam Paragon, Bangkok",
  notes: "Event session with Lookmhee and Sonya starts 11:00 - 11:45 (GMT+7). Wristband registration available 10:15 - 12:30 (GMT+7). Pre-registration via Google Form opened on 19 April 2026 via X @change2561.",
  notes_th: "กิจกรรมกับลูกหมี ซอนญ่า เวลา 11:00 - 11:45 น. (GMT+7) ลงทะเบียนรับสายรัดข้อมือได้เวลา 10:15 - 12:30 น. (GMT+7) และเปิดลงทะเบียนล่วงหน้าทาง Google Form วันที่ 19 เมษายน 2026 ทาง X @change2561",
  notes_zh: "Lookmhee 与 Sonya 活动时间为 11:00 - 11:45（GMT+7），手环注册时间为 10:15 - 12:30（GMT+7），预注册已于 2026年4月19日 通过 X @change2561 开放",
  hashtags: ["1ST FANDAY WT LMSY", "#CHANGEFANDAY2026"],
  tags: ["LMSY", "FanEvent", "CHANGE2561", " #CHANGEFANDAY2026"]
},
{
  date: "2026-05-08",
  who: "LMSY",
  category: "Special event",
  title_en: "Chasing the Crystal Waves",
  title_th: "Chasing the Crystal Waves",
  title_zh: "收集风与海浪的光斑",
  location_en: "Pattaya, Thailand",
  location_th: "พัทยา, ประเทศไทย",
  location_zh: "芭堤雅，泰国",
  notes: "8 to 10 May 2026 (GMT+7)",
  notes_th: "วันที่ 8 ถึง 10 พฤษภาคม 2026 (GMT+7)",
  notes_zh: "2026年5月8日至10日（GMT+7）",
  hashtags: ["foamdreamxlmsy\n\n#FOAMDREAMingWithLMSY"],
  tags: ["LMSY", "Special event", "FoamDream"]
},
{
  date: "2026-05-09",
  who: "LMSY",
  category: "Special event",
  title_en: "Chasing the Crystal Waves",
  title_th: "Chasing the Crystal Waves",
  title_zh: "收集风与海浪的光斑",
  location_en: "Pattaya, Thailand",
  location_th: "พัทยา, ประเทศไทย",
  location_zh: "芭堤雅，泰国",
  notes: "8 to 10 May 2026 (GMT+7)",
  notes_th: "วันที่ 8 ถึง 10 พฤษภาคม 2026 (GMT+7)",
  notes_zh: "2026年5月8日至10日（GMT+7）",
  hashtags: ["foamdreamxlmsy\n\n#FOAMDREAMingWithLMSY"],
  tags: ["LMSY", "Special event", "FoamDream"]
},
{
  date: "2026-05-10",
  who: "LMSY",
  category: "Special event",
  title_en: "Chasing the Crystal Waves",
  title_th: "Chasing the Crystal Waves",
  title_zh: "收集风与海浪的光斑",
  location_en: "Pattaya, Thailand",
  location_th: "พัทยา, ประเทศไทย",
  location_zh: "芭堤雅，泰国",
  notes: "8 to 10 May 2026 (GMT+7)",
  notes_th: "วันที่ 8 ถึง 10 พฤษภาคม 2026 (GMT+7)",
  notes_zh: "2026年5月8日至10日（GMT+7）",
  hashtags: ["foamdreamxlmsy\n\n#FOAMDREAMingWithLMSY"],
  tags: ["LMSY", "Special event", "FoamDream"]
},
{
  date: "2026-05-14",
  who: "LMSY",
  category: "Award",
  title: "KAZZ Awards 2026",
  title_th: "งานประกาศรางวัล KAZZ Awards 2026",
  title_zh: "KAZZ Awards 2026 颁奖典礼",
  location: "BITEC Bangna, Bangkok",
  location_th: "ไบเทค บางนา กรุงเทพฯ",
  location_zh: "曼谷 BITEC Bangna",
  notes: "Special guest appearance. Start time 17:00 onwards (GMT+7). Live streaming via KAZZ Magazine, KAZZ Channel and LINE TODAY POP.",
  notes_th: "แขกรับเชิญพิเศษ เริ่มเวลา 17:00 น. เป็นต้นไป (GMT+7) ถ่ายทอดสดทาง KAZZ Magazine, KAZZ Channel และ LINE TODAY POP",
  notes_zh: "特别嘉宾出席。开始时间 17:00 起（GMT+7）。通过 KAZZ Magazine、KAZZ Channel 和 LINE TODAY POP 直播",
  hashtags: ["#KAZZAWARDS2026xLookmheeSonya"],
  tags: ["LMSY", "Awards", "Appearance"]
},
{
  date: "2026-05-21",
  who: "LMSY",
  category: "Livestream",
  title_en: "JOOX Live Chat Chit Tid Tom",
  title_th: "JOOX Live Chat ชิดติดอ่อม",
  title_zh: "JOOX Live Chat ชิดติดอ่อม 直播",
  location_en: "JOOX Music Application",
  location_th: "แอปพลิเคชัน JOOX Music",
  location_zh: "JOOX Music 应用程序",
  notes: "Live starts at 19:00 (GMT+7) via JOOX Music Application.",
  notes_th: "ไลฟ์เริ่มเวลา 19:00 น. (GMT+7) ผ่านแอปพลิเคชัน JOOX Music",
  notes_zh: "直播于19:00 (GMT+7) 开始，通过 JOOX Music 应用程序观看。",
  hashtags: ["#JOOXLiveChatชิดติดอ่อมxLMSY"],
  tags: ["LMSY", "Livestream"]
},
{
  date: "2026-05-22",
  who: "LMSY",
  category: "Special event",
  title_en: "Hometown Romance Final Episode",
  title_th: "คุณแฟนบ้านนอก Final Episode",
  title_zh: "Hometown Romance 最终集特别活动",
  location_en: "Siam Pavalai Royal Grand Theatre, 6F, Siam Paragon",
  location_th: "Siam Pavalai Royal Grand Theatre ชั้น 6, Siam Paragon",
  location_zh: "Siam Paragon 6楼 Siam Pavalai Royal Grand Theatre",
  notes: "Event starts at 18:00 (GMT+7). Entry is for eligible participants only.",
  notes_th: "งานเริ่มเวลา 18:00 น. (GMT+7) เฉพาะผู้มีสิทธิ์เข้าร่วมงานเท่านั้น",
  notes_zh: "活动于18:00 (GMT+7) 开始。仅限符合资格者入场。",
  hashtags: ["#คุณแฟนบ้านนอกFinalEP"],
  tags: ["LMSY", "Hometown Romance", "Special event"]
},
{
  date: "2026-05-25",
  who: "LMSY",
  category: "Livestream",
  title: "goodbye ตายไม่รู้ตัว",
  location: "Facebook & YouTube: Workpoint",
  notes: "Live at 20:05 (GMT+7)",
  notes_th: "ถ่ายทอดสดเวลา 20:05 น. (GMT+7)",
  notes_zh: "直播时间为 20:05（GMT+7）",
  hashtags: ["#ลูกหมีซอนญ่า", "#LMSY"],
  tags: ["LMSY","Livestream"]
},
{
  date: "2026-05-30",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "Lookmhee x Sonya Happiness in Full Bloom",
  title_th: "งานไซน์ Lookmhee x Sonya Happiness in Full Bloom",
  title_zh: "Lookmhee x Sonya Happiness in Full Bloom 上海签售会",
  location_en: "Shanghai, China",
  location_th: "เซี่ยงไฮ้ ประเทศจีน",
  location_zh: "中国，上海",
  notes: "Lookmhee x Sonya duo fansign in Shanghai. Venue is open only to ticket holders and invited guests.",
  notes_th: "งานแฟนไซน์คู่ Lookmhee x Sonya ที่เซี่ยงไฮ้ สถานที่จัดงานเปิดให้เฉพาะผู้ถือบัตรและผู้ที่ได้รับเชิญเท่านั้น",
  notes_zh: "Lookmhee x Sonya 上海双人签售会。活动场地仅限持票者及受邀嘉宾入场。",
  hashtags: ["#LMSYMay30SHANGHAIDUOFansign", "#LMSY2026FirstChinaDuoFansign"],
  tags: ["LMSY", "FanMeeting"]
},
{
  date: "2026-06-04",
  who: "LMSY",
  category: "Livestream",
  title: "นิยมคุย (Niyom Kuy) – แม่นี่ที่มีทุกบ้าน",
  location: "Facebook & Instagram: Ch7HD Entertainment",
  notes: "Live at 18:00 (GMT+7)",
  notes_th: "ถ่ายทอดสดเวลา 18:00 น. (GMT+7)",
  notes_zh: "直播时间为 18:00（GMT+7）",
  hashtags: [
    "#นิยมคุย",
    "#นิยมคุยลูกหมีซอนญ่า",
    "#ลูกหมีซอนญ่า",
    "#LMSY",
    "#LMlookmhee",
    "#SonyaSaranphat"
  ],
  tags: ["LMSY","Livestream"]
},
 {
  date: "2026-06-06",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "LMSY Be My Romance Fancon",
  title_th: "LMSY Be My Romance Fancon",
  title_zh: "LMSY Be My Romance Fancon",
  location_en: "ICONSIAM Hall @ ICONSIAM",
  location_th: "ICONSIAM Hall @ ICONSIAM",
  location_zh: "ICONSIAM Hall @ ICONSIAM",
  notes: "15:00 (GMT+7)",
  notes_th: "15:00 น. (GMT+7)",
  notes_zh: "15:00（GMT+7）",
  hashtags: ["LMSY FANCON DDAY\n\n#LMSYBeMyRomanceFanConPresentedbyหมึกกรุป"],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-06-13",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "2026 LMSY Sweet Whispers: Pastoral Romance Macau Fan Meeting",
  title_th: "งานแฟนมีตติ้ง 2026 LMSY Sweet Whispers: Pastoral Romance ที่มาเก๊า",
  title_zh: "2026 LMSY 田言蜜语・田园罗曼 澳门双人见面会",
  location_en: "H853 Entertainment Place, Lisboeta Macau",
  location_th: "H853 Entertainment Place, Lisboeta Macau",
  location_zh: "澳门葡京人 H853 娱乐馆",
  notes: "Tickets on sale at 16:00, 5 May. Exclusive bundle available at 19:00 on the same day. Purchase platform: Xiaomang App.",
  notes_th: "เปิดขายบัตรวันที่ 5 พฤษภาคม เวลา 16:00 น. แพ็กเกจพิเศษเปิดขายเวลา 19:00 น. ในวันเดียวกัน ผ่านแอป Xiaomang",
  notes_zh: "门票｜5月5日 16:00 正式开售。叠加包｜5月5日 19:00 准时开启。购买渠道：小芒 APP。",
  hashtags: [""],
  tags: ["LMSY","Fanmeeting"]
},
{
  date: "2026-06-26",
  time: "14:00",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "LOOKMHEE & SONYA Summer Signing Event",
  title_th: "งานแฟนมีตติ้งและแจกลายเซ็น LOOKMHEE & SONYA Summer",
  title_zh: "LOOKMHEE & SONYA 夏日签售会",
  location_en: "China",
  location_th: "ประเทศจีน",
  location_zh: "中国",
  notes: "Theme: 星莓入梦 × 屿山赴夏. Event starts at 14:00 on 27 June 2026. Ticket sales begin on 29 May 2026 at 11:00. Purchase details will be announced via the official Weibo account.",
  notes_th: "ธีม: 星莓入梦 × 屿山赴夏 งานเริ่มเวลา 14:00 น. วันที่ 27 มิถุนายน 2026 เปิดจำหน่ายบัตรวันที่ 29 พฤษภาคม 2026 เวลา 11:00 น. รายละเอียดการซื้อจะประกาศผ่าน Weibo อย่างเป็นทางการ",
  notes_zh: "主题：星莓入梦 × 屿山赴夏。活动时间为2026年6月27日14:00。门票将于2026年5月29日11:00开售。购买详情请留意官方微博后续发布。",
  hashtags: [""],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-06-27",
  time: "14:00",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "LOOKMHEE & SONYA Summer Signing Event",
  title_th: "งานแฟนมีตติ้งและแจกลายเซ็น LOOKMHEE & SONYA Summer",
  title_zh: "LOOKMHEE & SONYA 夏日签售会",
  location_en: "China",
  location_th: "ประเทศจีน",
  location_zh: "中国",
  notes: "Theme: 星莓入梦 × 屿山赴夏. Event starts at 14:00 on 27 June 2026. Ticket sales begin on 29 May 2026 at 11:00. Purchase details will be announced via the official Weibo account.",
  notes_th: "ธีม: 星莓入梦 × 屿山赴夏 งานเริ่มเวลา 14:00 น. วันที่ 27 มิถุนายน 2026 เปิดจำหน่ายบัตรวันที่ 29 พฤษภาคม 2026 เวลา 11:00 น. รายละเอียดการซื้อจะประกาศผ่าน Weibo อย่างเป็นทางการ",
  notes_zh: "主题：星莓入梦 × 屿山赴夏。活动时间为2026年6月27日14:00。门票将于2026年5月29日11:00开售。购买详情请留意官方微博后续发布。",
  hashtags: [""],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-06-28",
  time: "14:00",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "LOOKMHEE & SONYA Summer Signing Event",
  title_th: "งานแฟนมีตติ้งและแจกลายเซ็น LOOKMHEE & SONYA Summer",
  title_zh: "LOOKMHEE & SONYA 夏日签售会",
  location_en: "China",
  location_th: "ประเทศจีน",
  location_zh: "中国",
  notes: "Theme: 星莓入梦 × 屿山赴夏. Event starts at 14:00 on 27 June 2026. Ticket sales begin on 29 May 2026 at 11:00. Purchase details will be announced via the official Weibo account.",
  notes_th: "ธีม: 星莓入梦 × 屿山赴夏 งานเริ่มเวลา 14:00 น. วันที่ 27 มิถุนายน 2026 เปิดจำหน่ายบัตรวันที่ 29 พฤษภาคม 2026 เวลา 11:00 น. รายละเอียดการซื้อจะประกาศผ่าน Weibo อย่างเป็นทางการ",
  notes_zh: "主题：星莓入梦 × 屿山赴夏。活动时间为2026年6月27日14:00。门票将于2026年5月29日11:00开售。购买详情请留意官方微博后续发布。",
  hashtags: [""],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-07-08",
  who: "LMSY",
  category: "Livestream",
  title: "Grab Food จัดจานไลฟ์ตามใจคุณ X LMSY",
  location: "Grab Thailand Page / YouTube",
  notes: "Live at 19:00 (GMT+7)",
  notes_th: "ไลฟ์เวลา 19:00 น. (GMT+7)",
  notes_zh: "直播时间为 19:00（GMT+7）",
  hashtags: [
    "#GrabFoodถูกกว่าซั้วร์xลูกหมีซอนญ่า",
    "#GrabFoodxLookmheeSonya",
    "#ChangeArtist",
    "#LMSY",
    "#ลูกหมีซอนญ่า",
    "#LMlookmhee",
    "#SonyaSaranphat"
  ],
  tags: ["LMSY", "Livestream"]
},
{
  date: "2026-07-18",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "Heart Moved by Her, Year After Year Together",
  title_zh: "心动于她 岁岁相依",
  location_en: "Regal Airport Hotel, 1/F Grand Ballroom, Hong Kong",
  location_th: "โรงแรม Regal Airport Hotel ฮ่องกง ห้องจัดเลี้ยงชั้น 1",
  location_zh: "中国香港富豪机场酒店一楼宴会大厅",
  notes: "Event date: 18 July 2026. Ticket sales begin at 17:00 (GMT+7, Bangkok time) on 10 June 2026. Add-on package sales begin at 18:00 (GMT+7, Bangkok time) on 10 June 2026.",
  notes_th: "วันจัดงาน: 18 กรกฎาคม 2026 เปิดจำหน่ายบัตรวันที่ 10 มิถุนายน 2026 เวลา 17:00 น. (เวลาไทย GMT+7) และเปิดจำหน่ายแพ็กเกจเสริมเวลา 18:00 น. (เวลาไทย GMT+7)",
  notes_zh: "活动时间：2026年7月18日。门票将于2026年6月10日17:00（曼谷时间 GMT+7）开售。叠加包将于2026年6月10日18:00（曼谷时间 GMT+7）开售",
  hashtags: ["#ลูกหมีซอนญ่า", "#LMSY"],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-07-20",
  who: "LMSY",
  category: "Special event",
  title_en: "Thailand Content Market 2026 Opening Ceremony",
  title_th: "พิธีเปิด Thailand Content Market 2026",
  title_zh: "2026 泰国内容市场开幕典礼",
  location_en: "Main Stage, Halls 1–2, Queen Sirikit National Convention Center (QSNCC), Bangkok",
  location_th: "เวทีหลัก ฮอลล์ 1–2 ศูนย์การประชุมแห่งชาติสิริกิติ์ (QSNCC) กรุงเทพฯ",
  location_zh: "曼谷诗丽吉王后国家会议中心（QSNCC）1–2号馆主舞台",
  notes_en: "20 Jul 2026 · Opening Ceremony · Time 17:30 (GMT+7)",
  notes_th: "20 ก.ค. 2026 · พิธีเปิด · เวลา 17:30 น. (GMT+7)",
  notes_zh: "2026年7月20日 · 开幕典礼 · 时间17:30（GMT+7）",
  tags: ["LMSY", "Special event"],
  hashtags: ["LMSY AT THAILAND CONTENT MARKET\n\n#LMSYxTCM2026"]
},
{
  date: "2026-07-25",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "Love in Our Sweet Yard Fan Meeting in Kaohsiung",
  title_zh: "Love in Our Sweet Yard 高雄粉絲見面會",
  location_en: "Kaohsiung, Taiwan, Crystal Banquet, TAILU Hall, Galaxy Hall",
  location_th: "เกาสง ไต้หวัน, Crystal Banquet, TAILU Hall, Galaxy Hall",
  location_zh: "台灣高雄 晶綺盛宴 台鋁館 銀河廳",
  notes_en: "25 July 2026 · 15:00 (UTC+8) · 14:00 (GMT+7)",
  notes_th: "25 กรกฎาคม 2026 · เวลา 15:00 น. (UTC+8) · 14:00 น. (GMT+7)",
  notes_zh: "2026年7月25日 · 15:00（UTC+8）· 14:00（GMT+7）",
  hashtags: ["#ลูกหมีซอนญ่า","#LMSY","#LMSY2026FanMeetingInKaohsiung"],
  tags: ["LMSY","FanMeeting"]
},
{
  date: "2026-08-08",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "Sweet Honeymoon Party",
  title_zh: "甜蜜蜜月派对",
  location_en: "Cube Convention Center, Seoul, South Korea",
  location_th: "ศูนย์ประชุม CUBE กรุงโซล ประเทศเกาหลีใต้",
  location_zh: "韩国首尔 CUBE Convention Center",
  notes: "Event date: 8 August 2026. Ticket sales begin on 6 July 2026 at 17:00 (GMT+7, Bangkok time). Add-on package sales begin on 7 July 2026 at 17:00 (GMT+7, Bangkok time). Ticketing platforms: Damai and MaiSeat.",
  notes_th: "วันจัดงาน: 8 สิงหาคม 2569 เปิดจำหน่ายบัตรวันที่ 6 กรกฎาคม 2569 เวลา 17:00 น. (เวลาไทย GMT+7) เปิดจำหน่ายแพ็กเกจเสริมวันที่ 7 กรกฎาคม 2569 เวลา 17:00 น. (เวลาไทย GMT+7) ช่องทางจำหน่ายบัตร: Damai และ MaiSeat",
  notes_zh: "活动日期：2026年8月8日。门票将于2026年7月6日17:00（泰国时间 GMT+7）开售，附加礼包将于2026年7月7日17:00（泰国时间 GMT+7）开售。购票平台：大麦、MaiSeat。",
  hashtags: [
    "#SweetHoneymoonParty",
    "#LMSY",
    "#Lookmhee",
    "#Sonya",
    "#ลูกหมีซอนญ่า"],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-09-01",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "(TBC) LMSY Philippines FanMeeting",
  title_zh: "LMSY 菲律宾粉丝见面会",
  location_en: "Philippines",
  location_th: "ประเทศฟิลิปปินส์",
  location_zh: "菲律宾",
  notes: "Expected to take place in September 2026. Exact date, venue and ticketing details to be announced.",
  notes_th: "คาดว่าจะจัดขึ้นในเดือนกันยายน 2569 วันจัดงาน สถานที่ และรายละเอียดการจำหน่ายบัตรจะแจ้งภายหลัง",
  notes_zh: "预计于2026年9月举行，具体日期、地点及售票详情待公布。",
  hashtags: ["#ลูกหมีซอนญ่า", "#LMSY"],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-10-01",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "(TBC) LMSY Brazil FanMeeting",
  title_zh: "LMSY 巴西粉丝见面会",
  location_en: "Brazil",
  location_th: "ประเทศบราซิล",
  location_zh: "巴西",
  notes: "Expected to take place in October 2026. Exact date, venue and ticketing details to be announced.",
  notes_th: "คาดว่าจะจัดขึ้นในเดือนตุลาคม 2569 วันจัดงาน สถานที่ และรายละเอียดการจำหน่ายบัตรจะแจ้งภายหลัง",
  notes_zh: "预计于2026年10月举行，具体日期、地点及售票详情待公布。",
  hashtags: ["#ลูกหมีซอนญ่า", "#LMSY"],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-10-01",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "(TBC) LMSY Mexico FanMeeting",
  title_zh: "LMSY 墨西哥粉丝见面会",
  location_en: "Mexico",
  location_th: "ประเทศเม็กซิโก",
  location_zh: "墨西哥",
  notes: "Expected to take place in October 2026. Exact date, venue and ticketing details to be announced.",
  notes_th: "คาดว่าจะจัดขึ้นในเดือนตุลาคม 2569 วันจัดงาน สถานที่ และรายละเอียดการจำหน่ายบัตรจะแจ้งภายหลัง",
  notes_zh: "预计于2026年10月举行，具体日期、地点及售票详情待公布。",
  hashtags: ["#ลูกหมีซอนญ่า", "#LMSY"],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-11-01",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "(TBC) LMSY Spain FanMeeting",
  title_zh: "LMSY 西班牙粉丝见面会",
  location_en: "Spain",
  location_th: "ประเทศสเปน",
  location_zh: "西班牙",
  notes: "Expected to take place in November 2026. Exact date, venue and ticketing details to be announced.",
  notes_th: "คาดว่าจะจัดขึ้นในเดือนพฤศจิกายน 2569 วันจัดงาน สถานที่ และรายละเอียดการจำหน่ายบัตรจะแจ้งภายหลัง",
  notes_zh: "预计于2026年11月举行，具体日期、地点及售票详情待公布。",
  hashtags: ["#ลูกหมีซอนญ่า", "#LMSY"],
  tags: ["LMSY", "Fanmeeting"]
},
{
  date: "2026-12-01",
  who: "LMSY",
  category: "FanMeeting",
  title_en: "(TBC) LMSY Vietnam FanMeeting",
  title_zh: "LMSY 越南粉丝见面会",
  location_en: "Vietnam",
  location_th: "ประเทศเวียดนาม",
  location_zh: "越南",
  notes: "Expected to take place in December 2026. Exact date, venue and ticketing details to be announced.",
  notes_th: "คาดว่าจะจัดขึ้นในเดือนธันวาคม 2569 วันจัดงาน สถานที่ และรายละเอียดการจำหน่ายบัตรจะแจ้งภายหลัง",
  notes_zh: "预计于2026年12月举行，具体日期、地点及售票详情待公布。",
  hashtags: ["#ลูกหมีซอนญ่า", "#LMSY"],
  tags: ["LMSY", "Fanmeeting"]
},

];

/* =========================
   RENDER HELPERS
   ========================= */

function pickLang(ev, baseKey) {
  const directKey = baseKey + "_" + currentLang;
  let v = ev[directKey] || ev[baseKey];

  if (!v && baseKey === "title") {
    v =
      ev["eventName_" + currentLang] ||
      ev.eventName_en ||
      ev.eventName_th ||
      ev.eventName_zh ||
      ev.eventName;
  }

  if (!v) {
    v = ev[baseKey + "_en"] || ev[baseKey + "_th"] || ev[baseKey + "_zh"];
  }

  return v || "";
}

function buildLegacyNotes(ev) {
  const startTime = ev.startTime || "";

  const venue =
    ev["venue_" + currentLang] ||
    ev.venue_en ||
    ev.venue_th ||
    ev.venue_zh ||
    "";

  const desc =
    ev["description_" + currentLang] ||
    ev.description_en ||
    ev.description_th ||
    ev.description_zh ||
    "";

  const parts = [];

  if (startTime) {
    if (currentLang === "th") parts.push(`เวลาเริ่ม ${startTime}`);
    else if (currentLang === "zh") parts.push(`开始时间 ${startTime}`);
    else parts.push(`Start time ${startTime}`);
  }

  if (venue) parts.push(venue);
  if (desc) parts.push(desc);

  return parts.join(" · ");
}

function hasTag(ev, needle) {
  const n = String(needle).toLowerCase();
  return (ev.tags || []).some(t => String(t).toLowerCase().includes(n));
}

function normaliseEventType(type) {
  const raw = String(type || "").trim();
  const compact = raw.toLowerCase().replace(/\s+/g, "");

  if (compact === "fanmeeting" || compact === "fanmeet") return "FanMeeting";
  if (compact === "fanevent") return "FanEvent";
  if (compact === "specialevent") return "Special event";
  if (compact === "fansign") return "Fansign";
  if (compact === "livestream" || compact === "live") return "Livestream";
  if (compact === "brand") return "Brand";
  if (compact === "drama") return "Drama";
  if (compact === "award" || compact === "awards") return "Award";

  return raw || "Unknown";
}

function getDisplayType(ev) {
  if (hasTag(ev, "fansign")) return "Fansign";
  return normaliseEventType(ev.category);
}

function getEventIcon(ev) {
  const tags = (ev.tags || []).map(t => String(t).toLowerCase());

  if (tags.some(t => t.includes("fansign"))) return "✍️";
  if (tags.includes("birthday")) return "🎂";
  if (tags.some(t => t.includes("christmas"))) return "🎄";
  const type = getDisplayType(ev);

  if (type === "Award") return "🏆";
  if (type === "Drama") return "🎬";
  if (type === "Brand") return "💼";
  if (type === "Livestream") return "📺";
  if (type === "Special event") return "✨";

  // Support both FanMeeting and FanEvent
  if (type === "FanMeeting" || type === "FanEvent") {
    if (ev.who === "LM" || ev.who === "Lookmhee") return "💛";
    if (ev.who === "SY" || ev.who === "Sonya") return "🩵";
    if (ev.who === "LMSY") return "💛🩵";
    return "⭐";
  }

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

function formatWeekday(dateObj) {
  return dateObj.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
}

function getTagClasses(tag) {
  const t = String(tag).toLowerCase();
  const classes = ["tag"];

  if (t.includes("lookmhee")) classes.push("tag-lm");
  if (t.includes("sonya")) classes.push("tag-sy");
  if (t === "lmsy") classes.push("tag-lmsy");
  if (t.includes("fan")) classes.push("tag-fm");
  if (t.includes("award") || t.includes("awards")) classes.push("tag-award");
  if (t.includes("christmas") || t.includes("event")) classes.push("tag-event");

  return classes.join(" ");
}

/* =========================
   MAIN RENDER
   ========================= */

function renderSchedule(selectedYear, selectedType, selectedMonth) {
  const container = document.getElementById("schedule");
  if (!container) return;

  container.innerHTML = "";

  // Used for the TODAY / TOMORROW badge (all dates are treated as GMT+7).
  const { todayKey, tomorrowKey } = getBangkokTodayTomorrowKeys();

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const filtered = sorted.filter(ev => {
    const d = toBangkokDate(ev.date);
    const year = d.getFullYear().toString();
    const monthIndex = d.getMonth(); // 0–11

    const matchYear = selectedYear === "all" || year === selectedYear;
    const matchType = matchesEventType(ev, selectedType);
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
    const dateObj = toBangkokDate(ev.date);
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
    const isPastEvent = ev.date < todayKey;
    if (isPastEvent) {
      card.classList.add("is-past");
    }

    const dateEl = document.createElement("div");
    dateEl.className = "event-date";

    const weekdayLabel = formatWeekday(dateObj);
    const monthLabel = getMonthInfo(dateObj).monthLabel.toUpperCase();

    dateEl.innerHTML = `
      <div class="event-date-circle">${formatDay(dateObj)}</div>
      <div class="event-date-month">${monthLabel}</div>
      <div class="event-date-weekday">${weekdayLabel}</div>
    `;

    const main = document.createElement("div");
    main.className = "event-main";

    const titleRow = document.createElement("div");
    titleRow.className = "event-title-row";

    const iconSpan = document.createElement("span");
    iconSpan.className = "event-icon";
    const iconText = getEventIcon(ev);
    iconSpan.textContent = iconText;
    if (iconText.length > 2) {
      iconSpan.classList.add("event-icon-pair");
    }

    const titleEl = document.createElement("div");
    titleEl.className = "event-title";
    titleEl.textContent = pickLang(ev, "title");

    titleRow.appendChild(iconSpan);
    titleRow.appendChild(titleEl);

    const badgeLabel = getTodayTomorrowLabel(ev.date, todayKey, tomorrowKey);
    if (badgeLabel) {
      const badge = document.createElement("span");
      badge.className = "event-badge " + (ev.date === todayKey ? "event-badge-today" : "event-badge-tomorrow");
      badge.textContent = badgeLabel;
      titleRow.appendChild(badge);

      card.classList.add(ev.date === todayKey ? "is-today" : "is-tomorrow");
    }

    const metaEl = document.createElement("div");
    metaEl.className = "event-meta";
    metaEl.textContent = `${getDisplayType(ev)} · ${pickLang(ev, "location")}`;

    const notesEl = document.createElement("div");
    notesEl.className = "event-notes";

    let notesText = pickLang(ev, "notes");

    if (!notesText) {
      const legacy = buildLegacyNotes(ev);
      if (legacy) notesText = legacy;
    }

    notesEl.textContent = notesText;

    const tagsEl = document.createElement("div");
    tagsEl.className = "event-tags";
    (ev.tags || []).forEach(tag => {
      const span = document.createElement("span");
      span.className = getTagClasses(tag);
      span.textContent = tag;
      tagsEl.appendChild(span);
    });

    const hashtagsEl = document.createElement("div");
    hashtagsEl.className = "event-hashtags";
    if (ev.hashtags && ev.hashtags.length) {
      const link = document.createElement("a");
      const text = ev.hashtags.join(" ");
      const encoded = encodeURIComponent(text);
      link.href = "https://x.com/intent/tweet?text=" + encoded;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = text;
      hashtagsEl.appendChild(link);
    }

    main.appendChild(titleRow);
    main.appendChild(metaEl);
    if (notesText) main.appendChild(notesEl);
    if (ev.tags && ev.tags.length) main.appendChild(tagsEl);
    if (ev.hashtags && ev.hashtags.length) main.appendChild(hashtagsEl);

    const gcalEl = document.createElement("div");
    gcalEl.className = "event-gcal";
    const gcalLink = document.createElement("a");
    gcalLink.className = "gcal-btn";
    gcalLink.href = buildGoogleCalendarUrl(ev);
    gcalLink.target = "_blank";
    gcalLink.rel = "noopener noreferrer";
    gcalLink.textContent = "Add to Google Calendar";
    gcalEl.appendChild(gcalLink);
    main.appendChild(gcalEl);

    card.appendChild(dateEl);
    card.appendChild(main);
    groupEl.appendChild(card);
  });
}



/* =========================
   DASHBOARD HELPERS
   ========================= */

const dashboardTypeOrder = [
  "FanMeeting",
  "Fansign",
  "FanEvent",
  "Brand",
  "Livestream",
  "Drama",
  "Award",
  "Special event"
];

const dashboardTypeLabels = {
  FanMeeting: "Fan meeting",
  FanEvent: "Fan event",
  Fansign: "Fansign",
  Brand: "Brand",
  Livestream: "Livestream",
  Drama: "Drama",
  Award: "Award",
  "Special event": "Special event"
};

function getTypeLabel(type) {
  return dashboardTypeLabels[type] || type || "Unknown";
}

function matchesEventType(ev, selectedType) {
  if (selectedType === "all") return true;
  return getDisplayType(ev) === normaliseEventType(selectedType);
}

function getEventPerson(ev) {
  const who = String(ev.who || "").trim();
  if (who === "LM") return "Lookmhee";
  if (who === "SY") return "Sonya";
  if (who === "LMSY") return "LMSY";
  if (who.toLowerCase().includes("lookmhee")) return "Lookmhee";
  if (who.toLowerCase().includes("sonya")) return "Sonya";
  return who || "Unknown";
}

function getStableText(ev, key) {
  return (
    ev[key + "_en"] ||
    ev[key] ||
    ev[key + "_th"] ||
    ev[key + "_zh"] ||
    ""
  );
}

function getEventRegion(ev) {
  const titleText = getStableText(ev, "title");
  const locationText = getStableText(ev, "location");
  const notesText = getStableText(ev, "notes");
  const detailsText = getStableText(ev, "details");

  const text = [titleText, locationText, notesText, detailsText]
    .join(" ")
    .toLowerCase();

  // Use title + location first so "ticketing details to be announced" does not hide
  // entries that already have a country, for example Spain, Mexico or Brazil.
  const regionText = [titleText, locationText].join(" ").toLowerCase();

  if (/bangkok|thailand|chiang mai|kanchanaburi|pathum thani|khlong luang|nava nakorn|workpoint|ptt pump|qsncc|iconsiam|emsphere|emquartier|samyam|samyan|siam|paragon|central|grammy|bitec|กรุงเทพ|ไทย|ปทุมธานี|曼谷|泰国|泰國|清迈|清邁/.test(regionText)) {
    return "Thailand";
  }

  if (/hong kong|香港/.test(regionText)) return "Hong Kong";
  if (/macau|macao|澳门|澳門/.test(regionText)) return "Macau";
  if (/taipei|taiwan|kaohsiung|台湾|台灣|高雄/.test(regionText)) return "Taiwan";
  if (/vietnam|เวียดนาม|越南/.test(regionText)) return "Vietnam";
  if (/philippines|manila|ฟิลิปปินส์|菲律宾/.test(regionText)) return "Philippines";
  if (/singapore|สิงคโปร์|新加坡/.test(regionText)) return "Singapore";
  if (/cambodia|phnom penh|กัมพูชา|柬埔寨/.test(regionText)) return "Cambodia";
  if (/korea|south korea|seoul|เกาหลี|เกาหลีใต้|韩国|韓國/.test(regionText)) return "Korea";
  if (/brazil|บราซิล|巴西/.test(regionText)) return "Brazil";
  if (/mexico|เม็กซิโก|墨西哥/.test(regionText)) return "Mexico";
  if (/spain|สเปน|西班牙/.test(regionText)) return "Spain";

  if (/china|guangzhou|shanghai|chongqing|chengdu|nanning|wuhan|fuzhou|hangzhou|tianjin|beijing|中国|中國|广州|上海|重庆|成都|南宁|武汉|福州|杭州|天津|北京/.test(regionText)) {
    return "China";
  }

  if (/taobao|weidian|iqiyi|instagram|youtube|facebook|tiktok|online|live broadcast|live/.test(text)) {
    return "Online";
  }

  if (!locationText.trim() || !regionText.trim() || /multiple sessions|multiple interviews|to be announced|tba|รอประกาศ|待公布|แจ้งภายหลัง|หลายช่วงเวลา|หลายสื่อสัมภาษณ์|多场次|多家媒体采访/.test(text)) return "TBA";

  return "Other";
}

function countBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item) || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function topEntry(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) return ["None", 0];
  return entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
}

function monthNameFromIndex(monthIndex) {
  const d = new Date(2026, Number(monthIndex), 1);
  return d.toLocaleString("en-GB", { month: "short" });
}

function formatDashboardMonthKey(monthKey) {
  if (!monthKey || monthKey === "None") return "None";
  const [year, month] = monthKey.split("-");
  return `${monthNameFromIndex(Number(month) - 1)} ${year}`;
}

function formatDashboardDate(dateString) {
  return toBangkokDate(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getDashboardFilters() {
  return {
    year: document.getElementById("dashboard-year")?.value || "all",
    type: document.getElementById("dashboard-type")?.value || "all",
    month: document.getElementById("dashboard-month")?.value || "all",
    who: document.getElementById("dashboard-who")?.value || "all",
    region: document.getElementById("dashboard-region")?.value || "all",
    scope: document.getElementById("dashboard-scope")?.value || "all"
  };
}

function getFilteredDashboardEventsFromFilters(filters) {
  const { todayKey } = getBangkokTodayTomorrowKeys();

  return [...events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter(ev => {
      const dateObj = toBangkokDate(ev.date);
      const year = dateObj.getFullYear().toString();
      const month = String(dateObj.getMonth());
      const who = getEventPerson(ev);
      const region = getEventRegion(ev);
      const inScope =
        filters.scope === "all" ||
        (filters.scope === "upcoming" && ev.date >= todayKey) ||
        (filters.scope === "past" && ev.date < todayKey);

      return (
        (filters.year === "all" || year === filters.year) &&
        matchesEventType(ev, filters.type) &&
        (filters.month === "all" || month === filters.month) &&
        (filters.who === "all" || who === filters.who) &&
        (filters.region === "all" || region === filters.region) &&
        inScope
      );
    });
}

function getFilteredDashboardEvents() {
  return getFilteredDashboardEventsFromFilters(getDashboardFilters());
}

function clearElement(el) {
  if (el) el.innerHTML = "";
}

function createInsightCard(label, value, note, icon = "") {
  const card = document.createElement("article");
  card.className = "insight-card";
  if (icon) card.dataset.icon = icon;

  const labelEl = document.createElement("p");
  labelEl.className = "insight-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("p");
  valueEl.className = "insight-value";
  valueEl.textContent = value;

  const noteEl = document.createElement("p");
  noteEl.className = "insight-note";
  noteEl.textContent = note;

  card.appendChild(labelEl);
  card.appendChild(valueEl);
  card.appendChild(noteEl);
  return card;
}

function renderInsightCards(items) {
  const summary = document.getElementById("dashboard-summary");
  if (!summary) return;
  clearElement(summary);

  items.forEach(item => {
    summary.appendChild(createInsightCard(item.label, item.value, item.note, item.icon));
  });
}

function renderBarChart(containerId, entries, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const rows = entries.filter(([, value]) => value > 0);
  if (!rows.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No data for this filter.";
    container.appendChild(p);
    return;
  }

  const max = Math.max(...rows.map(([, value]) => value));

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const labelEl = document.createElement("div");
    labelEl.className = "chart-label";
    labelEl.textContent = options.labelFormatter ? options.labelFormatter(label) : label;

    const track = document.createElement("div");
    track.className = "chart-track";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.width = `${Math.max((value / max) * 100, 4)}%`;
    track.appendChild(bar);

    const valueEl = document.createElement("div");
    valueEl.className = "chart-value";
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(valueEl);
    container.appendChild(row);
  });
}

function renderList(containerId, entries, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const rows = entries.filter(([, value]) => value > 0);
  if (!rows.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No data for this filter.";
    container.appendChild(p);
    return;
  }

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const labelEl = document.createElement("div");
    labelEl.className = "list-label";
    labelEl.textContent = options.labelFormatter ? options.labelFormatter(label) : label;

    const spacer = document.createElement("div");
    spacer.className = "chart-track";
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const max = options.max || Math.max(...rows.map(([, v]) => v));
    bar.style.width = `${Math.max((value / max) * 100, 4)}%`;
    spacer.appendChild(bar);

    const valueEl = document.createElement("div");
    valueEl.className = "list-value";
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(spacer);
    row.appendChild(valueEl);
    container.appendChild(row);
  });
}

function formatEventCount(count) {
  return `${count} event${count === 1 ? "" : "s"}`;
}

function getDateDiffFromToday(dateString, todayKey) {
  const today = toBangkokDate(todayKey);
  const target = toBangkokDate(dateString);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function getScopeLabel(scope) {
  if (scope === "upcoming") return "Upcoming only";
  if (scope === "past") return "Past archive";
  return "All dates";
}

function renderActiveFilterChips(filters) {
  const container = document.getElementById("dashboard-active-filters");
  if (!container) return;
  clearElement(container);

  const chips = [];
  if (filters.year !== "all") chips.push(["Year", filters.year]);
  if (filters.type !== "all") chips.push(["Type", getTypeLabel(filters.type)]);
  if (filters.month !== "all") chips.push(["Month", monthNameFromIndex(filters.month)]);
  if (filters.who !== "all") chips.push(["Person", filters.who]);
  if (filters.region !== "all") chips.push(["Region", filters.region]);
  if (filters.scope !== "all") chips.push(["Time", getScopeLabel(filters.scope)]);

  if (!chips.length) chips.push(["View", "All events"]);

  chips.forEach(([label, value]) => {
    const chip = document.createElement("span");
    chip.className = "dashboard-chip";
    chip.innerHTML = `<strong>${label}</strong> ${value}`;
    container.appendChild(chip);
  });
}



function renderUpcomingList(filtered) {
  const container = document.getElementById("dashboard-upcoming");
  const titleEl = document.getElementById("dashboard-upcoming-title");
  const noteEl = document.getElementById("dashboard-upcoming-note");

  if (titleEl) titleEl.textContent = getDashboardUpcomingHeadingText();
  if (noteEl) noteEl.textContent = getDashboardUpcomingNoteText();
  if (!container) return;

  clearElement(container);

  const { todayKey } = getBangkokTodayTomorrowKeys();

  const upcoming = filtered
    .filter(ev => ev.date >= todayKey)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime || a.time || "").localeCompare(b.startTime || b.time || "");
    })
    .slice(0, 5);

  if (!upcoming.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = currentLang === "th"
      ? "ไม่มีงานที่จะมาถึงในมุมมองนี้"
      : currentLang === "zh"
        ? "当前视图暂无即将举行的活动。"
        : "No upcoming events in this view.";
    container.appendChild(p);
    return;
  }

  upcoming.forEach(ev => {
    const row = document.createElement("div");
    row.className = "upcoming-row upcoming-row-simple";

    const dateEl = document.createElement("div");
    dateEl.className = "upcoming-date";
    dateEl.textContent = formatDashboardDate(ev.date);

    const middle = document.createElement("div");

    const title = document.createElement("div");
    title.className = "upcoming-title";
    title.textContent = getScheduleSourceTitle(ev);

    const meta = document.createElement("div");
    meta.className = "upcoming-meta";
    meta.textContent = getScheduleSourceLocation(ev);

    middle.appendChild(title);
    if (meta.textContent) middle.appendChild(meta);

    const typeEl = document.createElement("div");
    typeEl.className = "upcoming-type";
    typeEl.textContent = getTypeLabel(getDisplayType(ev));

    row.appendChild(dateEl);
    row.appendChild(middle);
    row.appendChild(typeEl);
    container.appendChild(row);
  });
}


function renderDashboardStory(filtered, insight) {
  const container = document.getElementById("dashboard-story");
  if (!container) return;
  clearElement(container);

  const title = document.createElement("h3");
  title.className = "dashboard-story-title";

  const eyebrow = document.createElement("p");
  eyebrow.className = "dashboard-story-eyebrow";
  eyebrow.textContent = "Quick read";

  const text = document.createElement("p");
  text.className = "dashboard-story-text";

  const uniqueYears = new Set(filtered.map(ev => ev.date.slice(0, 4))).size;
  const internationalCount = filtered.filter(ev => {
    const region = getEventRegion(ev);
    return !["Thailand", "TBA", "Online"].includes(region);
  }).length;
  const internationalShare = filtered.length ? Math.round((internationalCount / filtered.length) * 100) : 0;

  if (!filtered.length) {
    title.textContent = "No events match this view yet";
    text.textContent = "Try widening the filters to bring the full LMSY schedule story back into view.";
  } else {
    title.textContent = `${getTypeLabel(insight.topTypeName)} is leading this view`;
    text.textContent = `${getTypeLabel(insight.topTypeName)} has the highest count with ${formatEventCount(insight.topTypeCount)}. ${insight.topRegionCount ? insight.topRegionName : "No fixed region"} is the strongest region and ${internationalShare}% of entries are outside Thailand.`;
  }

  const stats = document.createElement("div");
  stats.className = "dashboard-story-stats";

  [
    [filtered.length, "events in view"],
    [uniqueYears, "year span"],
    [`${internationalShare}%`, "outside Thailand"]
  ].forEach(([value, label]) => {
    const card = document.createElement("div");
    card.className = "story-stat";
    card.innerHTML = `<span class="story-stat-value">${value}</span><span class="story-stat-label">${label}</span>`;
    stats.appendChild(card);
  });

  container.appendChild(eyebrow);
  container.appendChild(title);
  container.appendChild(text);
  container.appendChild(stats);
}



/* Dashboard event display helpers
   Keeps Dashboard upcoming list in sync with the schedule cards after event title/location updates. */
function getDashboardEventTitle(ev) {
  return pickLang(ev, "title") || ev.title || ev.title_en || ev.title_th || ev.title_zh || "Untitled event";
}

function getDashboardEventLocation(ev) {
  return pickLang(ev, "location") || ev.location || ev.location_en || ev.location_th || ev.location_zh || getEventRegion(ev) || "";
}

function getDashboardEventNotes(ev) {
  return pickLang(ev, "notes") || ev.notes || ev.notes_en || ev.notes_th || ev.notes_zh || buildLegacyNotes(ev) || "";
}

function getDashboardEventType(ev) {
  return getTypeLabel(getDisplayType(ev));
}

function renderDashboardSpotlight(filtered) {
  const container = document.getElementById("dashboard-spotlight");
  if (!container) return;
  clearElement(container);

  const { todayKey } = getBangkokTodayTomorrowKeys();
  const upcoming = filtered.filter(ev => ev.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date));
  const past = filtered.filter(ev => ev.date < todayKey).sort((a, b) => b.date.localeCompare(a.date));
  const ev = upcoming[0] || past[0];
  const isUpcoming = Boolean(upcoming[0]);

  const eyebrow = document.createElement("p");
  eyebrow.className = "spotlight-eyebrow";
  eyebrow.textContent = isUpcoming ? "Next spotlight" : "Latest spotlight";
  container.appendChild(eyebrow);

  if (!ev) {
    const title = document.createElement("h3");
    title.className = "spotlight-title";
    title.textContent = "Nothing to spotlight";
    const meta = document.createElement("p");
    meta.className = "spotlight-meta";
    meta.textContent = "No event matches the selected filters.";
    container.appendChild(title);
    container.appendChild(meta);
    return;
  }

  const diff = getDateDiffFromToday(ev.date, todayKey);
  const datePill = document.createElement("div");
  datePill.className = "spotlight-date-pill";
  if (isUpcoming) {
    datePill.textContent = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `In ${diff} days`;
  } else {
    datePill.textContent = formatDashboardDate(ev.date);
  }

  const title = document.createElement("h3");
  title.className = "spotlight-title";
  title.textContent = getDashboardEventTitle(ev);

  const meta = document.createElement("p");
  meta.className = "spotlight-meta";
  const location = getDashboardEventLocation(ev);
  const note = pickLang(ev, "notes") || buildLegacyNotes(ev);
  meta.textContent = [formatDashboardDate(ev.date), location, note].filter(Boolean).join(" · ");

  const type = document.createElement("span");
  type.className = "spotlight-type";
  type.textContent = getTypeLabel(getDisplayType(ev));

  container.appendChild(datePill);
  container.appendChild(title);
  container.appendChild(meta);
  container.appendChild(type);
}

function renderDonutChart(containerId, entries, total) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const rows = entries.filter(([, value]) => value > 0);
  if (!rows.length || !total) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No data for this filter.";
    container.appendChild(p);
    return;
  }

  const topType = rows[0];
  const topShare = Math.round((topType[1] / total) * 100);
  const palette = [
    "#FFE89C",
    "#A7D8FF",
    "#B9F6CA",
    "#FFB7D5",
    "#D7C7FF",
    "#FFC68A",
    "#9FE7FF",
    "#F6F9FF"
  ];

  const chartWrap = document.createElement("div");
  chartWrap.className = "dashboard-pie-wrap";

  const pieBox = document.createElement("div");
  pieBox.className = "dashboard-pie-box";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 220 220");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Event mix by type pie chart");
  svg.classList.add("dashboard-pie");

  const centre = document.createElement("div");
  centre.className = "dashboard-pie-centre";
  centre.innerHTML = `
    <span class="pie-centre-number">${total}</span>
    <span class="pie-centre-label">Events</span>
  `;

  const tooltip = document.createElement("div");
  tooltip.className = "pie-tooltip";
  tooltip.setAttribute("role", "status");
  tooltip.hidden = true;

  const selectedLabel = document.createElement("div");
  selectedLabel.className = "pie-selected-label";
  selectedLabel.innerHTML = `
    <span>Tap or hover a slice</span>
    <strong>${getTypeLabel(topType[0])}: ${topType[1]} event${topType[1] === 1 ? "" : "s"} (${topShare}%)</strong>
  `;

  function polarToCartesian(cx, cy, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + (radius * Math.cos(angleInRadians)),
      y: cy + (radius * Math.sin(angleInRadians))
    };
  }

  function describeArc(cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  }

  function setSelected(slice, label, value, percentage) {
    svg.querySelectorAll(".pie-slice").forEach(el => el.classList.remove("is-selected"));
    slice.classList.add("is-selected");
    centre.innerHTML = `
      <span class="pie-centre-number">${percentage}%</span>
      <span class="pie-centre-label">${getTypeLabel(label)}</span>
    `;
    selectedLabel.innerHTML = `
      <span>Selected type</span>
      <strong>${getTypeLabel(label)}: ${value} event${value === 1 ? "" : "s"} (${percentage}%)</strong>
    `;
  }

  function showTooltip(event, label, value, percentage) {
    tooltip.innerHTML = `<strong>${getTypeLabel(label)}</strong><span>${value} event${value === 1 ? "" : "s"} · ${percentage}% of this view</span>`;
    tooltip.hidden = false;

    const box = pieBox.getBoundingClientRect();
    const clientX = event.clientX || (box.left + box.width / 2);
    const clientY = event.clientY || (box.top + box.height / 2);
    const left = Math.min(Math.max(clientX - box.left, 64), box.width - 64);
    const top = Math.min(Math.max(clientY - box.top, 48), box.height - 24);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  let currentAngle = 0;
  rows.forEach(([label, value], index) => {
    const angle = (value / total) * 360;
    const endAngle = currentAngle + angle;
    const percentage = Math.round((value / total) * 100);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", describeArc(110, 110, 98, currentAngle, endAngle));
    path.setAttribute("fill", palette[index % palette.length]);
    path.setAttribute("tabindex", "0");
    path.setAttribute("role", "button");
    path.setAttribute("aria-label", `${getTypeLabel(label)}, ${value} event${value === 1 ? "" : "s"}, ${percentage}%`);
    path.classList.add("pie-slice");
    if (index === 0) path.classList.add("is-selected");

    path.addEventListener("mouseenter", event => showTooltip(event, label, value, percentage));
    path.addEventListener("mousemove", event => showTooltip(event, label, value, percentage));
    path.addEventListener("mouseleave", hideTooltip);
    path.addEventListener("focus", event => {
      setSelected(path, label, value, percentage);
      showTooltip(event, label, value, percentage);
    });
    path.addEventListener("blur", hideTooltip);
    path.addEventListener("click", event => {
      setSelected(path, label, value, percentage);
      showTooltip(event, label, value, percentage);
    });

    svg.appendChild(path);
    currentAngle = endAngle;
  });

  const legend = document.createElement("div");
  legend.className = "pie-legend";

  rows.forEach(([label, value], index) => {
    const percentage = Math.round((value / total) * 100);
    const item = document.createElement("button");
    item.type = "button";
    item.className = "pie-legend-item";
    item.innerHTML = `
      <span class="pie-legend-dot" style="--pie-dot:${palette[index % palette.length]}"></span>
      <span class="pie-legend-name">${getTypeLabel(label)}</span>
      <strong>${value}</strong>
      <span>${percentage}%</span>
    `;
    item.addEventListener("click", () => {
      const slice = svg.querySelectorAll(".pie-slice")[index];
      setSelected(slice, label, value, percentage);
    });
    legend.appendChild(item);
  });

  pieBox.appendChild(svg);
  pieBox.appendChild(centre);
  pieBox.appendChild(tooltip);
  chartWrap.appendChild(pieBox);
  chartWrap.appendChild(legend);
  container.appendChild(chartWrap);
  container.appendChild(selectedLabel);
}
function renderMonthHeatmap(containerId, monthCounts) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const values = Array.from({ length: 12 }, (_, index) => monthCounts[String(index)] || 0);
  const max = Math.max(...values, 0);

  if (max === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No monthly data for this filter.";
    container.appendChild(p);
    return;
  }

  const busiestIndex = values.indexOf(max);
  const summary = document.createElement("div");
  summary.className = "dashboard-month-summary";
  summary.innerHTML = `
    <span class="month-summary-label">Busiest month</span>
    <strong>${monthNameFromIndex(busiestIndex)}</strong>
    <span>${max} event${max === 1 ? "" : "s"}</span>
  `;
  container.appendChild(summary);

  const list = document.createElement("div");
  list.className = "dashboard-month-list";

  values.forEach((value, index) => {
    const percentage = max ? Math.round((value / max) * 100) : 0;
    const row = document.createElement("div");
    row.className = "month-pulse-row";
    if (value === max) row.classList.add("is-busiest");
    row.innerHTML = `
      <span class="month-pulse-name">${monthNameFromIndex(index)}</span>
      <div class="month-pulse-track" aria-hidden="true">
        <span class="month-pulse-bar" style="width: ${value ? Math.max(percentage, 6) : 0}%"></span>
      </div>
      <span class="month-pulse-value">${value}</span>
    `;
    list.appendChild(row);
  });

  container.appendChild(list);
}


/* Dashboard schedule-source helpers */
function getScheduleSourceTitle(ev) {
  return pickLang(ev, "title") || ev.title || ev.title_en || ev.title_th || ev.title_zh || "Untitled event";
}

function getScheduleSourceLocation(ev) {
  return pickLang(ev, "location") || ev.location || ev.location_en || ev.location_th || ev.location_zh || getEventRegion(ev) || "";
}

function getScheduleSourceNotes(ev) {
  return pickLang(ev, "notes") || ev.notes || ev.notes_en || ev.notes_th || ev.notes_zh || buildLegacyNotes(ev) || "";
}

function getDashboardUpcomingHeadingText() {
  if (currentLang === "th") return "5 งานถัดไป";
  if (currentLang === "zh") return "下 5 个活动";
  return "Next 5 upcoming events";
}

function getDashboardUpcomingNoteText() {
  if (currentLang === "th") return "สรุปงานถัดไปแบบสั้น ๆ";
  if (currentLang === "zh") return "快速查看接下来的活动。";
  return "A quick look at what is coming next.";
}





function renderDashboard() {
  const dashboardView = document.getElementById("dashboard-view");
  if (!dashboardView) return;

  const filters = getDashboardFilters();
  renderActiveFilterChips(filters);

  const filtered = getFilteredDashboardEvents();
  const { todayKey } = getBangkokTodayTomorrowKeys();

  const upcomingCount = filtered.filter(ev => ev.date >= todayKey).length;
  const pastCount = filtered.length - upcomingCount;
  const typeCounts = countBy(filtered, ev => getDisplayType(ev));
  const regionCounts = countBy(filtered, ev => getEventRegion(ev));
  const regionCountsForInsight = Object.fromEntries(
    Object.entries(regionCounts).filter(([region]) => region !== "TBA")
  );
  const yearCounts = countBy(filtered, ev => toBangkokDate(ev.date).getFullYear().toString());
  const monthCounts = countBy(filtered, ev => String(toBangkokDate(ev.date).getMonth()));
  const yearMonthCounts = countBy(filtered, ev => ev.date.slice(0, 7));
  const fanMeetCount = filtered.filter(ev => ["FanMeeting", "Fansign", "FanEvent"].includes(getDisplayType(ev))).length;
  const fanMeetShare = filtered.length ? Math.round((fanMeetCount / filtered.length) * 100) : 0;

  const [topTypeName, topTypeCount] = topEntry(typeCounts);
  const [topRegionName, topRegionCount] = topEntry(regionCountsForInsight);
  const [busiestMonthKey, busiestMonthCount] = topEntry(yearMonthCounts);

  const regionsCovered = Object.keys(regionCountsForInsight).length;

  renderDashboardStory(filtered, {
    topTypeName,
    topTypeCount,
    topRegionName,
    topRegionCount
  });
  renderDashboardSpotlight(filtered);

  renderInsightCards([
    {
      label: "Total events",
      value: String(filtered.length),
      note: "Matching current dashboard filters",
      icon: "✨"
    },
    {
      label: "Upcoming",
      value: String(upcomingCount),
      note: "From today onwards, Bangkok time",
      icon: "📅"
    },
    {
      label: "Past archive",
      value: String(pastCount),
      note: "Completed or previous schedule items",
      icon: "🗂️"
    },
    {
      label: "Top type",
      value: topTypeCount ? getTypeLabel(topTypeName) : "None",
      note: topTypeCount ? formatEventCount(topTypeCount) : "No matching events",
      icon: "🏷️"
    },
    {
      label: "Busiest month",
      value: busiestMonthCount ? formatDashboardMonthKey(busiestMonthKey) : "None",
      note: busiestMonthCount ? formatEventCount(busiestMonthCount) : "No matching events",
      icon: "🔥"
    },
    {
      label: "Top region",
      value: topRegionCount ? topRegionName : "None",
      note: topRegionCount ? formatEventCount(topRegionCount) : "No matching events",
      icon: "🌏"
    },
    {
      label: "Regions covered",
      value: String(regionsCovered),
      note: "Excluding TBA entries",
      icon: "📍"
    },
    {
      label: "Fan moment mix",
      value: `${fanMeetShare}%`,
      note: "Fan meetings, fan events and fansigns",
      icon: "💛"
    }
  ]);

  const typeEntries = dashboardTypeOrder
    .filter(type => Object.prototype.hasOwnProperty.call(typeCounts, type))
    .map(type => [type, typeCounts[type]])
    .concat(
      Object.entries(typeCounts).filter(([type]) => !dashboardTypeOrder.includes(type))
    );

  const monthEntries = Array.from({ length: 12 }, (_, index) => [String(index), monthCounts[String(index)] || 0]);
  const yearEntries = Object.entries(yearCounts).sort((a, b) => a[0].localeCompare(b[0]));
  const regionEntries = Object.entries(regionCounts)
    .filter(([region]) => region !== "TBA")
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);

  renderDonutChart("dashboard-mix-donut", typeEntries, filtered.length);
  renderMonthHeatmap("dashboard-month-heatmap", monthCounts);
  renderBarChart("dashboard-year-chart", yearEntries);
  renderList("dashboard-region-list", regionEntries);
  renderUpcomingList(filtered);
}

function addSelectOption(select, value, label) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  select.appendChild(opt);
}

function setDashboardSelectOptions(select, options, preferredValue) {
  if (!select) return;
  const safePreferred = preferredValue || "all";
  select.innerHTML = "";

  options.forEach(([value, label]) => {
    addSelectOption(select, value, label);
  });

  const values = options.map(([value]) => value);
  select.value = values.includes(safePreferred) ? safePreferred : "all";
}

function getDashboardFiltersWithOverride(key, value) {
  return {
    ...getDashboardFilters(),
    [key]: value
  };
}

function refreshDashboardDependentFilters(changedSelectId = "") {
  const typeSelect = document.getElementById("dashboard-type");
  const monthSelect = document.getElementById("dashboard-month");
  const whoSelect = document.getElementById("dashboard-who");
  const regionSelect = document.getElementById("dashboard-region");
  const scopeSelect = document.getElementById("dashboard-scope");

  if (!typeSelect || !monthSelect || !whoSelect || !regionSelect || !scopeSelect) return;

  // A year switch should feel like a fresh yearly view. Otherwise an old month
  // or "Upcoming only" selection can quietly hide past events, for example
  // Singapore 2025.
  if (changedSelectId === "dashboard-year") {
    monthSelect.value = "all";
    scopeSelect.value = "all";
  }

  let typeFilters = getDashboardFiltersWithOverride("type", "all");
  let availableTypes = [...new Set(getFilteredDashboardEventsFromFilters(typeFilters).map(ev => getDisplayType(ev)))];
  const orderedTypeOptions = [["all", "All"]];
  dashboardTypeOrder.forEach(type => {
    if (availableTypes.includes(type)) orderedTypeOptions.push([type, getTypeLabel(type)]);
  });
  availableTypes
    .filter(type => !dashboardTypeOrder.includes(type))
    .sort()
    .forEach(type => orderedTypeOptions.push([type, getTypeLabel(type)]));
  setDashboardSelectOptions(typeSelect, orderedTypeOptions, typeSelect.value);

  let whoFilters = getDashboardFiltersWithOverride("who", "all");
  let availablePeople = [...new Set(getFilteredDashboardEventsFromFilters(whoFilters).map(ev => getEventPerson(ev)))];
  const whoOptions = [["all", "All"]];
  ["LMSY", "Lookmhee", "Sonya"]
    .filter(person => availablePeople.includes(person))
    .forEach(person => whoOptions.push([person, person]));
  availablePeople
    .filter(person => !["LMSY", "Lookmhee", "Sonya"].includes(person))
    .sort()
    .forEach(person => whoOptions.push([person, person]));
  setDashboardSelectOptions(whoSelect, whoOptions, whoSelect.value);

  let monthFilters = getDashboardFiltersWithOverride("month", "all");
  let availableMonths = [...new Set(getFilteredDashboardEventsFromFilters(monthFilters).map(ev => String(toBangkokDate(ev.date).getMonth())))];
  const monthOptions = [["all", "All"]];
  availableMonths
    .sort((a, b) => Number(a) - Number(b))
    .forEach(month => monthOptions.push([month, monthNameFromIndex(month)]));
  setDashboardSelectOptions(monthSelect, monthOptions, monthSelect.value);

  let regionFilters = getDashboardFiltersWithOverride("region", "all");
  let availableRegions = [...new Set(getFilteredDashboardEventsFromFilters(regionFilters).map(ev => getEventRegion(ev)))];
  const regionOptions = [["all", "All"]];
  availableRegions
    .filter(region => region !== "TBA")
    .sort((a, b) => a.localeCompare(b))
    .forEach(region => regionOptions.push([region, region]));
  setDashboardSelectOptions(regionSelect, regionOptions, regionSelect.value);
}

function populateDashboardFilters() {
  const yearSelect = document.getElementById("dashboard-year");
  const typeSelect = document.getElementById("dashboard-type");
  const monthSelect = document.getElementById("dashboard-month");
  const whoSelect = document.getElementById("dashboard-who");
  const regionSelect = document.getElementById("dashboard-region");
  const scopeSelect = document.getElementById("dashboard-scope");

  if (!yearSelect || !typeSelect || !monthSelect || !whoSelect || !regionSelect || !scopeSelect) return;

  [yearSelect, typeSelect, monthSelect, whoSelect, regionSelect, scopeSelect].forEach(select => {
    select.innerHTML = "";
  });

  addSelectOption(yearSelect, "all", "All");
  [...new Set(events.map(ev => ev.date.substring(0, 4)))].sort().forEach(year => {
    addSelectOption(yearSelect, year, year);
  });

  addSelectOption(typeSelect, "all", "All");
  const availableTypes = [...new Set(events.map(ev => getDisplayType(ev)))];
  dashboardTypeOrder.forEach(type => {
    if (availableTypes.includes(type)) addSelectOption(typeSelect, type, getTypeLabel(type));
  });
  availableTypes
    .filter(type => !dashboardTypeOrder.includes(type))
    .sort()
    .forEach(type => addSelectOption(typeSelect, type, getTypeLabel(type)));

  addSelectOption(monthSelect, "all", "All");
  Array.from({ length: 12 }, (_, index) => {
    addSelectOption(monthSelect, String(index), monthNameFromIndex(index));
  });

  addSelectOption(whoSelect, "all", "All");
  ["LMSY", "Lookmhee", "Sonya"]
    .filter(person => events.some(ev => getEventPerson(ev) === person))
    .forEach(person => addSelectOption(whoSelect, person, person));

  addSelectOption(regionSelect, "all", "All");
  [...new Set(events.map(ev => getEventRegion(ev)))]
    .filter(region => region !== "TBA")
    .sort((a, b) => a.localeCompare(b))
    .forEach(region => addSelectOption(regionSelect, region, region));

  addSelectOption(scopeSelect, "all", "All dates");
  addSelectOption(scopeSelect, "upcoming", "Upcoming only");
  addSelectOption(scopeSelect, "past", "Past archive");
}

function initDashboard() {
  const dashboardView = document.getElementById("dashboard-view");
  if (!dashboardView) return;

  populateDashboardFilters();
  refreshDashboardDependentFilters();

  const filterPanel = document.getElementById("dashboard-filter-panel");
  const filterToggle = document.getElementById("dashboard-filter-toggle");
  const resetBtn = document.getElementById("dashboard-reset");
  const filterSelects = dashboardView.querySelectorAll("select");

  filterToggle?.addEventListener("click", () => {
    if (!filterPanel) return;
    const isOpen = !filterPanel.hasAttribute("hidden");
    filterPanel.toggleAttribute("hidden", isOpen);
    filterToggle.setAttribute("aria-expanded", String(!isOpen));
    filterToggle.textContent = isOpen
      ? (currentLang === "th" ? "แสดงตัวกรอง" : currentLang === "zh" ? "显示筛选" : "Show filters")
      : (currentLang === "th" ? "ซ่อนตัวกรอง" : currentLang === "zh" ? "隐藏筛选" : "Hide filters");
  });

  filterSelects.forEach(select => {
    select.addEventListener("change", () => {
      refreshDashboardDependentFilters(select.id);
      renderDashboard();
    });
  });

  resetBtn?.addEventListener("click", () => {
    filterSelects.forEach(select => {
      select.value = "all";
    });
    renderDashboard();
  });

  renderDashboard();
}

function initViewTabs() {
  const tabs = document.querySelectorAll(".view-tab");
  const panels = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetView = tab.getAttribute("data-view");
      if (!targetView) return;

      currentView = targetView;

      tabs.forEach(btn => {
        const isActive = btn === tab;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach(panel => {
        const shouldShow = panel.id === `${targetView}-view`;
        panel.classList.toggle("active", shouldShow);
        panel.toggleAttribute("hidden", !shouldShow);
      });

      if (currentView === "dashboard") renderDashboard();
    });
  });
}

/* =========================
   FILTERS
   ========================= */

function initFilters() {
  const yearSelect = document.getElementById("filter-year");
  const typeSelect = document.getElementById("filter-type");
  const monthSelect = document.getElementById("filter-month");

  if (!yearSelect || !typeSelect || !monthSelect) return;

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

  typeSelect.innerHTML = "";
  const allType = document.createElement("option");
  allType.value = "all";
  allType.textContent = "All";
  typeSelect.appendChild(allType);

  const categories = [...new Set(events.map(ev => getDisplayType(ev)))];
  const hasFansign = categories.includes("Fansign");
    const typeOrder = [
    "FanMeeting",
    "Fansign",
    "FanEvent",
    "Brand",
    "Livestream",
    "Drama",
    "Award",
    "Special event"
  ];

  const labelMap = {
    "FanMeeting": "Fan meeting",
    "FanEvent": "Fan event",
    "Fansign": "Fansign",
    "Brand": "Brand",
    "Livestream": "Livestream",
    "Drama": "Drama",
    "Award": "Award",
    "Special event": "Special event"
  };

typeOrder.forEach(cat => {
  const includeCat =
    categories.includes(cat) ||
    (cat === "Fansign" && hasFansign);

  if (includeCat) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = labelMap[cat] || cat;
    typeSelect.appendChild(opt);
  }
});

  function populateMonths(year) {
    monthSelect.innerHTML = "";
    const allM = document.createElement("option");
    allM.value = "all";
    allM.textContent = "All";
    monthSelect.appendChild(allM);

    const monthsForYear = [...new Set(
      events
        .filter(ev => ev.date.substring(0, 4) === year)
        .map(ev => toBangkokDate(ev.date).getMonth())
    )].sort((a, b) => a - b);

    monthsForYear.forEach(mIdx => {
      const d = new Date(Number(year), mIdx, 1);
      const label = d.toLocaleString("en-GB", { month: "short" });
      const opt = document.createElement("option");
      opt.value = String(mIdx); // 0–11
      opt.textContent = label;
      monthSelect.appendChild(opt);
    });
  }

  const now = new Date();
  const currentYear = now.getFullYear().toString();

  // FIX 1: valid syntax
  const defaultYear = years.includes(currentYear)
    ? currentYear
    : years[years.length - 1];

  populateMonths(defaultYear);

  // FIX 2: month index must be 0–11
  const currentMonth = now.getMonth();

  const availableMonths = [...monthSelect.options]
    .map(o => o.value)
    .filter(v => v !== "all")
    .map(v => Number(v));

  const defaultMonthNum = availableMonths.includes(currentMonth)
    ? currentMonth
    : (availableMonths.length ? availableMonths[availableMonths.length - 1] : null);

  yearSelect.value = defaultYear;
  monthSelect.value = defaultMonthNum !== null ? String(defaultMonthNum) : "all";

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

/* =========================
   LANGUAGE TOGGLE
   ========================= */

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

      renderSchedule(
        yearSelect ? yearSelect.value : "all",
        typeSelect ? typeSelect.value : "all",
        monthSelect ? monthSelect.value : "all"
      );
      renderDashboard();
    });
  });
}


/* =========================
   DASHBOARD I18N OVERRIDES
   ========================= */

const dashboardI18n = {
  en: {
    scheduleTab: "Schedule",
    dashboardTab: "Dashboard",
    insightKicker: "Insights",
    dashboardTitle: "LMSY Event Dashboard",
    dashboardDesc: "Explore event patterns by year, type, month, person and region.",
    filterBtn: "Show filters",
    reset: "Reset",
    year: "Year",
    type: "Type",
    month: "Month",
    person: "Person",
    region: "Region",
    time: "Time",
    all: "All",
    allDates: "All dates",
    upcomingOnly: "Upcoming only",
    pastArchive: "Past archive",
    quickRead: "Quick read",
    noEventsTitle: "No events match this view yet",
    noEventsText: "Try widening the filters to bring the full LMSY schedule story back into view.",
    leading: "{type} is leading this view",
    storyText: "{type} has the highest count with {count}. {region} is the strongest region and {share}% of entries are outside Thailand.",
    noFixedRegion: "No fixed region",
    eventsInView: "events in view",
    yearSpan: "year span",
    outsideThailand: "outside Thailand",
    nextSpotlight: "Next spotlight",
    latestSpotlight: "Latest spotlight",
    nothingSpotlight: "Nothing to spotlight",
    noEventFilters: "No event matches the selected filters.",
    today: "Today",
    tomorrow: "Tomorrow",
    inDays: "In {days} days",
    totalEvents: "Total events",
    matchingFilters: "Matching current dashboard filters",
    upcoming: "Upcoming",
    fromToday: "From today onwards, Bangkok time",
    past: "Past archive",
    completed: "Completed or previous schedule items",
    topType: "Top type",
    noMatching: "No matching events",
    busiestMonth: "Busiest month",
    topRegion: "Top region",
    regionsCovered: "Regions covered",
    excludingTba: "Excluding TBA entries",
    fanMomentMix: "Fan moment mix",
    fanMomentNote: "Fan meetings, fan events and fansigns",
    noData: "No data for this filter.",
    noMonthly: "No monthly data for this filter.",
    noUpcoming: "No upcoming events in this view.",
    eventMixAria: "Event mix by type pie chart",
    events: "Events",
    tapHover: "Tap or hover a slice",
    selectedType: "Selected type",
    ofThisView: "of this view",
    panelEventMix: "Event mix by type",
    panelEventMixNote: "Tap or hover each slice to see the label, count and share.",
    panelMonthly: "Monthly pulse by count",
    panelYear: "Events by year",
    panelRegions: "Top regions",
    panelUpcoming: "Next upcoming events in this view",
    view: "View",
    allEvents: "All events"
  },
  th: {
    scheduleTab: "ตารางงาน",
    dashboardTab: "แดชบอร์ด",
    insightKicker: "ข้อมูลเชิงลึก",
    dashboardTitle: "แดชบอร์ดงาน LMSY",
    dashboardDesc: "ดูภาพรวมงานตามปี ประเภท เดือน บุคคล และภูมิภาค",
    filterBtn: "แสดงตัวกรอง",
    reset: "รีเซ็ต",
    year: "ปี",
    type: "ประเภท",
    month: "เดือน",
    person: "บุคคล",
    region: "ภูมิภาค",
    time: "ช่วงเวลา",
    all: "ทั้งหมด",
    allDates: "ทุกวัน",
    upcomingOnly: "เฉพาะงานที่จะมาถึง",
    pastArchive: "งานที่ผ่านมา",
    quickRead: "สรุปเร็ว",
    noEventsTitle: "ยังไม่มีงานที่ตรงกับตัวกรองนี้",
    noEventsText: "ลองขยายตัวกรองเพื่อดูภาพรวมตารางงาน LMSY ทั้งหมด",
    leading: "{type} นำอยู่ในมุมมองนี้",
    storyText: "{type} มีจำนวนมากที่สุดที่ {count} {region} เป็นภูมิภาคที่เด่นที่สุด และ {share}% ของรายการอยู่นอกประเทศไทย",
    noFixedRegion: "ยังไม่มีภูมิภาคชัดเจน",
    eventsInView: "งานในมุมมองนี้",
    yearSpan: "ช่วงปี",
    outsideThailand: "นอกประเทศไทย",
    nextSpotlight: "งานเด่นถัดไป",
    latestSpotlight: "งานเด่นล่าสุด",
    nothingSpotlight: "ยังไม่มีงานเด่น",
    noEventFilters: "ไม่มีงานที่ตรงกับตัวกรองที่เลือก",
    today: "วันนี้",
    tomorrow: "พรุ่งนี้",
    inDays: "อีก {days} วัน",
    totalEvents: "งานทั้งหมด",
    matchingFilters: "ตรงกับตัวกรองแดชบอร์ดปัจจุบัน",
    upcoming: "กำลังจะมาถึง",
    fromToday: "นับจากวันนี้เป็นต้นไป ตามเวลา Bangkok",
    past: "งานที่ผ่านมา",
    completed: "งานที่เสร็จแล้วหรือรายการก่อนหน้า",
    topType: "ประเภทสูงสุด",
    noMatching: "ไม่มีงานที่ตรงกัน",
    busiestMonth: "เดือนที่คึกคักที่สุด",
    topRegion: "ภูมิภาคสูงสุด",
    regionsCovered: "ภูมิภาคที่ครอบคลุม",
    excludingTba: "ไม่นับรายการ TBA",
    fanMomentMix: "สัดส่วนแฟนโมเมนต์",
    fanMomentNote: "แฟนมีตติ้ง แฟนอีเวนต์ และแฟนไซน์",
    noData: "ไม่มีข้อมูลสำหรับตัวกรองนี้",
    noMonthly: "ไม่มีข้อมูลรายเดือนสำหรับตัวกรองนี้",
    noUpcoming: "ไม่มีงานที่จะมาถึงในมุมมองนี้",
    eventMixAria: "แผนภูมิวงกลมสัดส่วนประเภทงาน",
    events: "งาน",
    tapHover: "แตะหรือวางเมาส์บนชิ้นกราฟ",
    selectedType: "ประเภทที่เลือก",
    ofThisView: "ของมุมมองนี้",
    panelEventMix: "สัดส่วนประเภทงาน",
    panelEventMixNote: "แตะหรือวางเมาส์บนแต่ละชิ้นเพื่อดูชื่อ จำนวน และสัดส่วน",
    panelMonthly: "จังหวะรายเดือนตามจำนวน",
    panelYear: "งานตามปี",
    panelRegions: "ภูมิภาคยอดนิยม",
    panelUpcoming: "งานถัดไปในมุมมองนี้",
    view: "มุมมอง",
    allEvents: "งานทั้งหมด"
  },
  zh: {
    scheduleTab: "日程",
    dashboardTab: "仪表板",
    insightKicker: "洞察",
    dashboardTitle: "LMSY 活动仪表板",
    dashboardDesc: "按年份、类型、月份、人物和地区查看活动趋势。",
    filterBtn: "显示筛选",
    reset: "重置",
    year: "年份",
    type: "类型",
    month: "月份",
    person: "人物",
    region: "地区",
    time: "时间",
    all: "全部",
    allDates: "全部日期",
    upcomingOnly: "仅即将举行",
    pastArchive: "过往归档",
    quickRead: "快速解读",
    noEventsTitle: "当前视图暂无匹配活动",
    noEventsText: "可以放宽筛选条件，查看完整的 LMSY 日程。",
    leading: "{type} 是当前视图最多的类型",
    storyText: "{type} 数量最多，共 {count}。{region} 是最主要的地区，{share}% 的活动在泰国以外。",
    noFixedRegion: "暂无明确地区",
    eventsInView: "当前视图活动",
    yearSpan: "年份跨度",
    outsideThailand: "泰国以外",
    nextSpotlight: "下一个重点活动",
    latestSpotlight: "最近重点活动",
    nothingSpotlight: "暂无重点活动",
    noEventFilters: "没有活动符合当前筛选条件。",
    today: "今天",
    tomorrow: "明天",
    inDays: "{days} 天后",
    totalEvents: "活动总数",
    matchingFilters: "符合当前仪表板筛选条件",
    upcoming: "即将举行",
    fromToday: "从今天起，按曼谷时间",
    past: "过往归档",
    completed: "已完成或过往日程",
    topType: "最多类型",
    noMatching: "暂无匹配活动",
    busiestMonth: "最繁忙月份",
    topRegion: "最多地区",
    regionsCovered: "覆盖地区",
    excludingTba: "不含 TBA 项目",
    fanMomentMix: "粉丝活动占比",
    fanMomentNote: "粉丝见面会、粉丝活动和签售",
    noData: "此筛选条件暂无数据。",
    noMonthly: "此筛选条件暂无月度数据。",
    noUpcoming: "当前视图暂无即将举行的活动。",
    eventMixAria: "按活动类型显示的饼图",
    events: "活动",
    tapHover: "点击或悬停查看分区",
    selectedType: "已选类型",
    ofThisView: "占当前视图",
    panelEventMix: "活动类型占比",
    panelEventMixNote: "点击或悬停每个分区查看标签、数量和占比。",
    panelMonthly: "月度活动量",
    panelYear: "按年份统计",
    panelRegions: "热门地区",
    panelUpcoming: "当前视图的下一个活动",
    view: "视图",
    allEvents: "全部活动"
  }
};

const dashboardTypeLabelsI18n = {
  en: {
    FanMeeting: "Fan meeting",
    FanEvent: "Fan event",
    Fansign: "Fansign",
    Brand: "Brand",
    Livestream: "Livestream",
    Drama: "Drama",
    Award: "Award",
    "Special event": "Special event"
  },
  th: {
    FanMeeting: "แฟนมีตติ้ง",
    FanEvent: "แฟนอีเวนต์",
    Fansign: "แฟนไซน์",
    Brand: "แบรนด์",
    Livestream: "ไลฟ์สตรีม",
    Drama: "ซีรีส์",
    Award: "รางวัล",
    "Special event": "อีเวนต์พิเศษ"
  },
  zh: {
    FanMeeting: "粉丝见面会",
    FanEvent: "粉丝活动",
    Fansign: "签售",
    Brand: "品牌活动",
    Livestream: "直播",
    Drama: "剧集",
    Award: "奖项",
    "Special event": "特别活动"
  }
};

const monthNamesI18n = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  th: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
};

function dt(key, vars = {}) {
  const langPack = dashboardI18n[currentLang] || dashboardI18n.en;
  let text = langPack[key] || dashboardI18n.en[key] || key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

function getTypeLabel(type) {
  const labels = dashboardTypeLabelsI18n[currentLang] || dashboardTypeLabelsI18n.en;
  return labels[type] || dashboardTypeLabelsI18n.en[type] || type || "Unknown";
}

function formatEventCount(count) {
  if (currentLang === "th") return `${count} งาน`;
  if (currentLang === "zh") return `${count} 个活动`;
  return `${count} event${count === 1 ? "" : "s"}`;
}

function monthNameFromIndex(monthIndex) {
  const names = monthNamesI18n[currentLang] || monthNamesI18n.en;
  return names[Number(monthIndex)] || monthNamesI18n.en[Number(monthIndex)] || "";
}

function formatDashboardMonthKey(monthKey) {
  if (!monthKey || monthKey === "None") return currentLang === "en" ? "None" : currentLang === "th" ? "ไม่มี" : "无";
  const [year, month] = monthKey.split("-");
  return `${monthNameFromIndex(Number(month) - 1)} ${year}`;
}

function formatDashboardDate(dateString) {
  const locale = currentLang === "th" ? "th-TH" : currentLang === "zh" ? "zh-CN" : "en-GB";
  return toBangkokDate(dateString).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getScopeLabel(scope) {
  if (scope === "upcoming") return dt("upcomingOnly");
  if (scope === "past") return dt("pastArchive");
  return dt("allDates");
}

function updateDashboardStaticText() {
  const scheduleTab = document.querySelector('.view-tab[data-view="schedule"]');
  const dashboardTab = document.querySelector('.view-tab[data-view="dashboard"]');
  if (scheduleTab) scheduleTab.textContent = dt("scheduleTab");
  if (dashboardTab) dashboardTab.textContent = dt("dashboardTab");

  const kicker = document.querySelector(".dashboard-kicker");
  const title = document.querySelector(".dashboard-title");
  const desc = document.querySelector(".dashboard-description");
  const filterToggle = document.getElementById("dashboard-filter-toggle");
  const resetBtn = document.getElementById("dashboard-reset");

  if (kicker) kicker.textContent = dt("insightKicker");
  if (title) title.textContent = dt("dashboardTitle");
  if (desc) desc.textContent = dt("dashboardDesc");
  if (filterToggle) {
    const isOpen = filterToggle.getAttribute("aria-expanded") === "true";
    filterToggle.textContent = isOpen
      ? (currentLang === "th" ? "ซ่อนตัวกรอง" : currentLang === "zh" ? "隐藏筛选" : "Hide filters")
      : dt("filterBtn");
  }

  const dashboardTop = document.querySelector(".dashboard-top");
  if (dashboardTop && !dashboardTop.querySelector(".dashboard-filter-hint")) {
    const hint = document.createElement("p");
    hint.className = "dashboard-filter-hint";
    dashboardTop.appendChild(hint);
  }
  const hint = document.querySelector(".dashboard-filter-hint");
  if (hint) {
    hint.textContent = currentLang === "th"
      ? "แตะปุ่มแสดงตัวกรองเพื่อเลือกปี ประเภท เดือน บุคคล ภูมิภาค และช่วงเวลา"
      : currentLang === "zh"
        ? "点击“显示筛选”可按年份、类型、月份、人物、地区和时间筛选。"
        : "Tap Show filters to filter by year, type, month, person, region and time.";
  }
  if (resetBtn) resetBtn.textContent = dt("reset");

  const labels = [
    ["dashboard-year", "year"],
    ["dashboard-type", "type"],
    ["dashboard-month", "month"],
    ["dashboard-who", "person"],
    ["dashboard-region", "region"],
    ["dashboard-scope", "time"]
  ];

  labels.forEach(([id, key]) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) label.textContent = dt(key);
  });

  const headings = {
    "dashboard-mix-donut": [dt("panelEventMix"), dt("panelEventMixNote")],
    "dashboard-month-heatmap": [dt("panelMonthly"), ""],
    "dashboard-year-chart": [dt("panelYear"), ""],
    "dashboard-region-list": [dt("panelRegions"), ""]
  };

  Object.entries(headings).forEach(([id, [heading, note]]) => {
    const panel = document.getElementById(id)?.closest(".dashboard-panel");
    const h3 = panel?.querySelector("h3");
    const p = panel?.querySelector(".dashboard-panel-note");
    if (h3) h3.textContent = heading;
    if (p && note) p.textContent = note;
  });
}

function renderActiveFilterChips(filters) {
  const container = document.getElementById("dashboard-active-filters");
  if (!container) return;
  clearElement(container);

  const chips = [];
  if (filters.year !== "all") chips.push([dt("year"), filters.year]);
  if (filters.type !== "all") chips.push([dt("type"), getTypeLabel(filters.type)]);
  if (filters.month !== "all") chips.push([dt("month"), monthNameFromIndex(filters.month)]);
  if (filters.who !== "all") chips.push([dt("person"), filters.who]);
  if (filters.region !== "all") chips.push([dt("region"), filters.region]);
  if (filters.scope !== "all") chips.push([dt("time"), getScopeLabel(filters.scope)]);

  if (!chips.length) chips.push([dt("view"), dt("allEvents")]);

  chips.forEach(([label, value]) => {
    const chip = document.createElement("span");
    chip.className = "dashboard-chip";
    chip.innerHTML = `<strong>${label}</strong> ${value}`;
    container.appendChild(chip);
  });
}

function renderDashboardStory(filtered, insight) {
  const container = document.getElementById("dashboard-story");
  if (!container) return;
  clearElement(container);

  const title = document.createElement("h3");
  title.className = "dashboard-story-title";

  const eyebrow = document.createElement("p");
  eyebrow.className = "dashboard-story-eyebrow";
  eyebrow.textContent = dt("quickRead");

  const text = document.createElement("p");
  text.className = "dashboard-story-text";

  const uniqueYears = new Set(filtered.map(ev => ev.date.slice(0, 4))).size;
  const internationalCount = filtered.filter(ev => {
    const region = getEventRegion(ev);
    return !["Thailand", "TBA", "Online"].includes(region);
  }).length;
  const internationalShare = filtered.length ? Math.round((internationalCount / filtered.length) * 100) : 0;

  if (!filtered.length) {
    title.textContent = dt("noEventsTitle");
    text.textContent = dt("noEventsText");
  } else {
    title.textContent = dt("leading", { type: getTypeLabel(insight.topTypeName) });
    text.textContent = dt("storyText", {
      type: getTypeLabel(insight.topTypeName),
      count: formatEventCount(insight.topTypeCount),
      region: insight.topRegionCount ? insight.topRegionName : dt("noFixedRegion"),
      share: internationalShare
    });
  }

  const stats = document.createElement("div");
  stats.className = "dashboard-story-stats";

  [
    [filtered.length, dt("eventsInView")],
    [uniqueYears, dt("yearSpan")],
    [`${internationalShare}%`, dt("outsideThailand")]
  ].forEach(([value, label]) => {
    const card = document.createElement("div");
    card.className = "story-stat";
    card.innerHTML = `<span class="story-stat-value">${value}</span><span class="story-stat-label">${label}</span>`;
    stats.appendChild(card);
  });

  container.appendChild(eyebrow);
  container.appendChild(title);
  container.appendChild(text);
  container.appendChild(stats);
}

function renderDashboardSpotlight(filtered) {
  const container = document.getElementById("dashboard-spotlight");
  if (!container) return;
  clearElement(container);

  const { todayKey } = getBangkokTodayTomorrowKeys();
  const upcoming = filtered.filter(ev => ev.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date));
  const past = filtered.filter(ev => ev.date < todayKey).sort((a, b) => b.date.localeCompare(a.date));
  const ev = upcoming[0] || past[0];
  const isUpcoming = Boolean(upcoming[0]);

  const eyebrow = document.createElement("p");
  eyebrow.className = "spotlight-eyebrow";
  eyebrow.textContent = isUpcoming ? dt("nextSpotlight") : dt("latestSpotlight");
  container.appendChild(eyebrow);

  if (!ev) {
    const title = document.createElement("h3");
    title.className = "spotlight-title";
    title.textContent = dt("nothingSpotlight");
    const meta = document.createElement("p");
    meta.className = "spotlight-meta";
    meta.textContent = dt("noEventFilters");
    container.appendChild(title);
    container.appendChild(meta);
    return;
  }

  const diff = getDateDiffFromToday(ev.date, todayKey);
  const datePill = document.createElement("div");
  datePill.className = "spotlight-date-pill";
  if (isUpcoming) {
    datePill.textContent = diff === 0 ? dt("today") : diff === 1 ? dt("tomorrow") : dt("inDays", { days: diff });
  } else {
    datePill.textContent = formatDashboardDate(ev.date);
  }

  const title = document.createElement("h3");
  title.className = "spotlight-title";
  title.textContent = getDashboardEventTitle(ev);

  const meta = document.createElement("p");
  meta.className = "spotlight-meta";
  const location = getDashboardEventLocation(ev);
  const note = pickLang(ev, "notes") || buildLegacyNotes(ev);
  meta.textContent = [formatDashboardDate(ev.date), location, note].filter(Boolean).join(" · ");

  const type = document.createElement("span");
  type.className = "spotlight-type";
  type.textContent = getTypeLabel(getDisplayType(ev));

  container.appendChild(datePill);
  container.appendChild(title);
  container.appendChild(meta);
  container.appendChild(type);
}

function createInsightCard(label, value, note, icon = "") {
  const card = document.createElement("article");
  card.className = "insight-card";
  if (icon) card.dataset.icon = icon;

  const labelEl = document.createElement("p");
  labelEl.className = "insight-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("p");
  valueEl.className = "insight-value";
  valueEl.textContent = value;

  const noteEl = document.createElement("p");
  noteEl.className = "insight-note";
  noteEl.textContent = note;

  card.appendChild(labelEl);
  card.appendChild(valueEl);
  card.appendChild(noteEl);
  return card;
}

function renderBarChart(containerId, entries, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const rows = entries.filter(([, value]) => value > 0);
  if (!rows.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = dt("noData");
    container.appendChild(p);
    return;
  }

  const max = Math.max(...rows.map(([, value]) => value));

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const labelEl = document.createElement("div");
    labelEl.className = "chart-label";
    labelEl.textContent = options.labelFormatter ? options.labelFormatter(label) : label;

    const track = document.createElement("div");
    track.className = "chart-track";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.width = `${Math.max((value / max) * 100, 4)}%`;
    track.appendChild(bar);

    const valueEl = document.createElement("div");
    valueEl.className = "chart-value";
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(valueEl);
    container.appendChild(row);
  });
}

function renderList(containerId, entries, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const rows = entries.filter(([, value]) => value > 0);
  if (!rows.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = dt("noData");
    container.appendChild(p);
    return;
  }

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "list-row";

    const labelEl = document.createElement("div");
    labelEl.className = "list-label";
    labelEl.textContent = options.labelFormatter ? options.labelFormatter(label) : label;

    const spacer = document.createElement("div");
    spacer.className = "chart-track";
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const max = options.max || Math.max(...rows.map(([, v]) => v));
    bar.style.width = `${Math.max((value / max) * 100, 4)}%`;
    spacer.appendChild(bar);

    const valueEl = document.createElement("div");
    valueEl.className = "list-value";
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(spacer);
    row.appendChild(valueEl);
    container.appendChild(row);
  });
}

function renderDonutChart(containerId, entries, total) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const rows = entries.filter(([, value]) => value > 0);
  if (!rows.length || !total) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = dt("noData");
    container.appendChild(p);
    return;
  }

  const topType = rows[0];
  const topShare = Math.round((topType[1] / total) * 100);
  const palette = ["#FFE89C", "#A7D8FF", "#B9F6CA", "#FFB7D5", "#D7C7FF", "#FFC68A", "#9FE7FF", "#F6F9FF"];
  const chartWrap = document.createElement("div");
  chartWrap.className = "dashboard-pie-wrap";
  const pieBox = document.createElement("div");
  pieBox.className = "dashboard-pie-box";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 220 220");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", dt("eventMixAria"));
  svg.classList.add("dashboard-pie");

  const centre = document.createElement("div");
  centre.className = "dashboard-pie-centre";
  centre.innerHTML = `<span class="pie-centre-number">${total}</span><span class="pie-centre-label">${dt("events")}</span>`;

  const tooltip = document.createElement("div");
  tooltip.className = "pie-tooltip";
  tooltip.setAttribute("role", "status");
  tooltip.hidden = true;

  const selectedLabel = document.createElement("div");
  selectedLabel.className = "pie-selected-label";
  selectedLabel.innerHTML = `<span>${dt("tapHover")}</span><strong>${getTypeLabel(topType[0])}: ${formatEventCount(topType[1])} (${topShare}%)</strong>`;

  function polarToCartesian(cx, cy, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return { x: cx + (radius * Math.cos(angleInRadians)), y: cy + (radius * Math.sin(angleInRadians)) };
  }

  function describeArc(cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", cx, cy, "L", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ");
  }

  function setSelected(slice, label, value, percentage) {
    svg.querySelectorAll(".pie-slice").forEach(el => el.classList.remove("is-selected"));
    slice.classList.add("is-selected");
    centre.innerHTML = `<span class="pie-centre-number">${percentage}%</span><span class="pie-centre-label">${getTypeLabel(label)}</span>`;
    selectedLabel.innerHTML = `<span>${dt("selectedType")}</span><strong>${getTypeLabel(label)}: ${formatEventCount(value)} (${percentage}%)</strong>`;
  }

  function showTooltip(event, label, value, percentage) {
    tooltip.innerHTML = `<strong>${getTypeLabel(label)}</strong><span>${formatEventCount(value)} · ${percentage}% ${dt("ofThisView")}</span>`;
    tooltip.hidden = false;
    const box = pieBox.getBoundingClientRect();
    const clientX = event.clientX || (box.left + box.width / 2);
    const clientY = event.clientY || (box.top + box.height / 2);
    tooltip.style.left = `${Math.min(Math.max(clientX - box.left, 64), box.width - 64)}px`;
    tooltip.style.top = `${Math.min(Math.max(clientY - box.top, 48), box.height - 24)}px`;
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  let currentAngle = 0;
  rows.forEach(([label, value], index) => {
    const angle = (value / total) * 360;
    const endAngle = currentAngle + angle;
    const percentage = Math.round((value / total) * 100);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", describeArc(110, 110, 98, currentAngle, endAngle));
    path.setAttribute("fill", palette[index % palette.length]);
    path.setAttribute("tabindex", "0");
    path.setAttribute("role", "button");
    path.setAttribute("aria-label", `${getTypeLabel(label)}, ${formatEventCount(value)}, ${percentage}%`);
    path.classList.add("pie-slice");
    if (index === 0) path.classList.add("is-selected");
    path.addEventListener("mouseenter", event => showTooltip(event, label, value, percentage));
    path.addEventListener("mousemove", event => showTooltip(event, label, value, percentage));
    path.addEventListener("mouseleave", hideTooltip);
    path.addEventListener("focus", event => {
      setSelected(path, label, value, percentage);
      showTooltip(event, label, value, percentage);
    });
    path.addEventListener("blur", hideTooltip);
    path.addEventListener("click", event => {
      setSelected(path, label, value, percentage);
      showTooltip(event, label, value, percentage);
    });
    svg.appendChild(path);
    currentAngle = endAngle;
  });

  const legend = document.createElement("div");
  legend.className = "pie-legend";
  rows.forEach(([label, value], index) => {
    const percentage = Math.round((value / total) * 100);
    const item = document.createElement("button");
    item.type = "button";
    item.className = "pie-legend-item";
    item.innerHTML = `<span class="pie-legend-dot" style="--pie-dot:${palette[index % palette.length]}"></span><span class="pie-legend-name">${getTypeLabel(label)}</span><strong>${value}</strong><span>${percentage}%</span>`;
    item.addEventListener("click", () => {
      const slice = svg.querySelectorAll(".pie-slice")[index];
      setSelected(slice, label, value, percentage);
    });
    legend.appendChild(item);
  });

  pieBox.appendChild(svg);
  pieBox.appendChild(centre);
  pieBox.appendChild(tooltip);
  chartWrap.appendChild(pieBox);
  chartWrap.appendChild(legend);
  container.appendChild(chartWrap);
  container.appendChild(selectedLabel);
}

function renderMonthHeatmap(containerId, monthCounts) {
  const container = document.getElementById(containerId);
  if (!container) return;
  clearElement(container);

  const values = Array.from({ length: 12 }, (_, index) => monthCounts[String(index)] || 0);
  const max = Math.max(...values, 0);

  if (max === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = dt("noMonthly");
    container.appendChild(p);
    return;
  }

  const busiestIndex = values.indexOf(max);
  const summary = document.createElement("div");
  summary.className = "dashboard-month-summary";
  summary.innerHTML = `<span class="month-summary-label">${dt("busiestMonth")}</span><strong>${monthNameFromIndex(busiestIndex)}</strong><span>${formatEventCount(max)}</span>`;
  container.appendChild(summary);

  const list = document.createElement("div");
  list.className = "dashboard-month-list";

  values.forEach((value, index) => {
    const percentage = max ? Math.round((value / max) * 100) : 0;
    const row = document.createElement("div");
    row.className = "month-pulse-row";
    if (value === max) row.classList.add("is-busiest");
    row.innerHTML = `<span class="month-pulse-name">${monthNameFromIndex(index)}</span><div class="month-pulse-track" aria-hidden="true"><span class="month-pulse-bar" style="width: ${value ? Math.max(percentage, 6) : 0}%"></span></div><span class="month-pulse-value">${value}</span>`;
    list.appendChild(row);
  });

  container.appendChild(list);
}



function renderDashboard() {
  const dashboardView = document.getElementById("dashboard-view");
  if (!dashboardView) return;

  updateDashboardStaticText();

  const filters = getDashboardFilters();
  renderActiveFilterChips(filters);
  const filtered = getFilteredDashboardEvents();
  const { todayKey } = getBangkokTodayTomorrowKeys();
  const upcomingCount = filtered.filter(ev => ev.date >= todayKey).length;
  const pastCount = filtered.length - upcomingCount;
  const typeCounts = countBy(filtered, ev => getDisplayType(ev));
  const regionCounts = countBy(filtered, ev => getEventRegion(ev));
  const regionCountsForInsight = Object.fromEntries(Object.entries(regionCounts).filter(([region]) => region !== "TBA"));
  const yearCounts = countBy(filtered, ev => toBangkokDate(ev.date).getFullYear().toString());
  const monthCounts = countBy(filtered, ev => String(toBangkokDate(ev.date).getMonth()));
  const yearMonthCounts = countBy(filtered, ev => ev.date.slice(0, 7));
  const fanMeetCount = filtered.filter(ev => ["FanMeeting", "Fansign", "FanEvent"].includes(getDisplayType(ev))).length;
  const fanMeetShare = filtered.length ? Math.round((fanMeetCount / filtered.length) * 100) : 0;

  const [topTypeName, topTypeCount] = topEntry(typeCounts);
  const [topRegionName, topRegionCount] = topEntry(regionCountsForInsight);
  const [busiestMonthKey, busiestMonthCount] = topEntry(yearMonthCounts);
  const regionsCovered = Object.keys(regionCountsForInsight).length;

  renderDashboardStory(filtered, { topTypeName, topTypeCount, topRegionName, topRegionCount });
  renderDashboardSpotlight(filtered);

  renderInsightCards([
    { label: dt("totalEvents"), value: String(filtered.length), note: dt("matchingFilters"), icon: "✨" },
    { label: dt("upcoming"), value: String(upcomingCount), note: dt("fromToday"), icon: "📅" },
    { label: dt("past"), value: String(pastCount), note: dt("completed"), icon: "🗂️" },
    { label: dt("topType"), value: topTypeCount ? getTypeLabel(topTypeName) : (currentLang === "en" ? "None" : currentLang === "th" ? "ไม่มี" : "无"), note: topTypeCount ? formatEventCount(topTypeCount) : dt("noMatching"), icon: "🏷️" },
    { label: dt("busiestMonth"), value: busiestMonthCount ? formatDashboardMonthKey(busiestMonthKey) : (currentLang === "en" ? "None" : currentLang === "th" ? "ไม่มี" : "无"), note: busiestMonthCount ? formatEventCount(busiestMonthCount) : dt("noMatching"), icon: "🔥" },
    { label: dt("topRegion"), value: topRegionCount ? topRegionName : (currentLang === "en" ? "None" : currentLang === "th" ? "ไม่มี" : "无"), note: topRegionCount ? formatEventCount(topRegionCount) : dt("noMatching"), icon: "🌏" },
    { label: dt("regionsCovered"), value: String(regionsCovered), note: dt("excludingTba"), icon: "📍" },
    { label: dt("fanMomentMix"), value: `${fanMeetShare}%`, note: dt("fanMomentNote"), icon: "💛" }
  ]);

  const typeEntries = dashboardTypeOrder.filter(type => Object.prototype.hasOwnProperty.call(typeCounts, type)).map(type => [type, typeCounts[type]]).concat(Object.entries(typeCounts).filter(([type]) => !dashboardTypeOrder.includes(type)));
  const yearEntries = Object.entries(yearCounts).sort((a, b) => a[0].localeCompare(b[0]));
  const regionEntries = Object.entries(regionCounts).filter(([region]) => region !== "TBA").sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);

  renderDonutChart("dashboard-mix-donut", typeEntries, filtered.length);
  renderMonthHeatmap("dashboard-month-heatmap", monthCounts);
  renderBarChart("dashboard-year-chart", yearEntries);
  renderList("dashboard-region-list", regionEntries);
  renderUpcomingList(filtered);
}

function refreshDashboardDependentFilters(changedSelectId = "") {
  const typeSelect = document.getElementById("dashboard-type");
  const monthSelect = document.getElementById("dashboard-month");
  const whoSelect = document.getElementById("dashboard-who");
  const regionSelect = document.getElementById("dashboard-region");
  const scopeSelect = document.getElementById("dashboard-scope");
  if (!typeSelect || !monthSelect || !whoSelect || !regionSelect || !scopeSelect) return;

  if (changedSelectId === "dashboard-year") {
    monthSelect.value = "all";
    scopeSelect.value = "all";
  }

  let typeFilters = getDashboardFiltersWithOverride("type", "all");
  let availableTypes = [...new Set(getFilteredDashboardEventsFromFilters(typeFilters).map(ev => getDisplayType(ev)))];
  const orderedTypeOptions = [["all", dt("all")]];
  dashboardTypeOrder.forEach(type => {
    if (availableTypes.includes(type)) orderedTypeOptions.push([type, getTypeLabel(type)]);
  });
  availableTypes.filter(type => !dashboardTypeOrder.includes(type)).sort().forEach(type => orderedTypeOptions.push([type, getTypeLabel(type)]));
  setDashboardSelectOptions(typeSelect, orderedTypeOptions, typeSelect.value);

  let whoFilters = getDashboardFiltersWithOverride("who", "all");
  let availablePeople = [...new Set(getFilteredDashboardEventsFromFilters(whoFilters).map(ev => getEventPerson(ev)))];
  const whoOptions = [["all", dt("all")]];
  ["LMSY", "Lookmhee", "Sonya"].filter(person => availablePeople.includes(person)).forEach(person => whoOptions.push([person, person]));
  availablePeople.filter(person => !["LMSY", "Lookmhee", "Sonya"].includes(person)).sort().forEach(person => whoOptions.push([person, person]));
  setDashboardSelectOptions(whoSelect, whoOptions, whoSelect.value);

  let monthFilters = getDashboardFiltersWithOverride("month", "all");
  let availableMonths = [...new Set(getFilteredDashboardEventsFromFilters(monthFilters).map(ev => String(toBangkokDate(ev.date).getMonth())))];
  const monthOptions = [["all", dt("all")]];
  availableMonths.sort((a, b) => Number(a) - Number(b)).forEach(month => monthOptions.push([month, monthNameFromIndex(month)]));
  setDashboardSelectOptions(monthSelect, monthOptions, monthSelect.value);

  let regionFilters = getDashboardFiltersWithOverride("region", "all");
  let availableRegions = [...new Set(getFilteredDashboardEventsFromFilters(regionFilters).map(ev => getEventRegion(ev)))];
  const regionOptions = [["all", dt("all")]];
  availableRegions.filter(region => region !== "TBA").sort((a, b) => a.localeCompare(b)).forEach(region => regionOptions.push([region, region]));
  setDashboardSelectOptions(regionSelect, regionOptions, regionSelect.value);

  setDashboardSelectOptions(scopeSelect, [["all", dt("allDates")], ["upcoming", dt("upcomingOnly")], ["past", dt("pastArchive")]], scopeSelect.value);
}

function populateDashboardFilters() {
  const yearSelect = document.getElementById("dashboard-year");
  const typeSelect = document.getElementById("dashboard-type");
  const monthSelect = document.getElementById("dashboard-month");
  const whoSelect = document.getElementById("dashboard-who");
  const regionSelect = document.getElementById("dashboard-region");
  const scopeSelect = document.getElementById("dashboard-scope");
  if (!yearSelect || !typeSelect || !monthSelect || !whoSelect || !regionSelect || !scopeSelect) return;

  [yearSelect, typeSelect, monthSelect, whoSelect, regionSelect, scopeSelect].forEach(select => { select.innerHTML = ""; });

  addSelectOption(yearSelect, "all", dt("all"));
  [...new Set(events.map(ev => ev.date.substring(0, 4)))].sort().forEach(year => addSelectOption(yearSelect, year, year));

  addSelectOption(typeSelect, "all", dt("all"));
  const availableTypes = [...new Set(events.map(ev => getDisplayType(ev)))];
  dashboardTypeOrder.forEach(type => { if (availableTypes.includes(type)) addSelectOption(typeSelect, type, getTypeLabel(type)); });
  availableTypes.filter(type => !dashboardTypeOrder.includes(type)).sort().forEach(type => addSelectOption(typeSelect, type, getTypeLabel(type)));

  addSelectOption(monthSelect, "all", dt("all"));
  Array.from({ length: 12 }, (_, index) => addSelectOption(monthSelect, String(index), monthNameFromIndex(index)));

  addSelectOption(whoSelect, "all", dt("all"));
  ["LMSY", "Lookmhee", "Sonya"].filter(person => events.some(ev => getEventPerson(ev) === person)).forEach(person => addSelectOption(whoSelect, person, person));

  addSelectOption(regionSelect, "all", dt("all"));
  [...new Set(events.map(ev => getEventRegion(ev)))].filter(region => region !== "TBA").sort((a, b) => a.localeCompare(b)).forEach(region => addSelectOption(regionSelect, region, region));

  addSelectOption(scopeSelect, "all", dt("allDates"));
  addSelectOption(scopeSelect, "upcoming", dt("upcomingOnly"));
  addSelectOption(scopeSelect, "past", dt("pastArchive"));
}

function initDashboard() {
  const dashboardView = document.getElementById("dashboard-view");
  if (!dashboardView) return;

  updateDashboardStaticText();
  populateDashboardFilters();
  refreshDashboardDependentFilters();

  const filterPanel = document.getElementById("dashboard-filter-panel");
  const filterToggle = document.getElementById("dashboard-filter-toggle");
  const resetBtn = document.getElementById("dashboard-reset");
  const filterSelects = dashboardView.querySelectorAll("select");

  filterToggle?.addEventListener("click", () => {
    if (!filterPanel) return;
    const isOpen = !filterPanel.hasAttribute("hidden");
    filterPanel.toggleAttribute("hidden", isOpen);
    filterToggle.setAttribute("aria-expanded", String(!isOpen));
    filterToggle.textContent = isOpen
      ? (currentLang === "th" ? "แสดงตัวกรอง" : currentLang === "zh" ? "显示筛选" : "Show filters")
      : (currentLang === "th" ? "ซ่อนตัวกรอง" : currentLang === "zh" ? "隐藏筛选" : "Hide filters");
  });

  filterSelects.forEach(select => {
    select.addEventListener("change", () => {
      refreshDashboardDependentFilters(select.id);
      renderDashboard();
    });
  });

  resetBtn?.addEventListener("click", () => {
    filterSelects.forEach(select => { select.value = "all"; });
    refreshDashboardDependentFilters();
    renderDashboard();
  });

  renderDashboard();
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

      renderSchedule(
        yearSelect ? yearSelect.value : "all",
        typeSelect ? typeSelect.value : "all",
        monthSelect ? monthSelect.value : "all"
      );

      updateDashboardStaticText();
      refreshDashboardDependentFilters();
      renderDashboard();
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initViewTabs();
  initFilters();
  initDashboard();
  initLanguageToggle();
});
