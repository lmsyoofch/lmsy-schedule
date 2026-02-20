/* schedule.js
   Drop-in full script. It keeps your full events array and fixes the bugs that break filtering.
   Paste this whole file into GitHub as-is.
*/

let currentLang = "en";
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
    location_en: "TBA",
    location_th: "รอประกาศ",
    location_zh: "待公布",
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
    location_en: "TBA",
    location_th: "รอประกาศ",
    location_zh: "待公布",
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
    location_en: "Sretsis (TBA)",
    location_th: "Sretsis (รอประกาศ)",
    location_zh: "Sretsis（待公布）",
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
    location_en: "TBA",
    location_th: "รอประกาศ",
    location_zh: "待公布",
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
  notes_en: 'Free live streaming available on Facebook via Banksorn page and on <a href="https://youtube.com/@sornramnampetch19" target="_blank" rel="noopener noreferrer">ช่อง YouTube ลิเกคณะศรรามน้ำเพชร</a> at 20:00 BKK time.',
  notes_th: 'มีไลฟ์สดฟรีทาง Facebook เพจ Banksorn และ <a href="https://youtube.com/@sornramnampetch19" target="_blank" rel="noopener noreferrer">ช่อง YouTube ลิเกคณะศรรามน้ำเพชร</a> เวลา 20.00 น. ตามเวลา กรุงเทพฯ',
  notes_zh: '可通过 Facebook Banksorn 页面及 <a href="https://youtube.com/@sornramnampetch19" target="_blank" rel="noopener noreferrer">ช่อง YouTube ลิเกคณะศรรามน้ำเพชร</a> 免费观看直播，时间为泰国时间晚上 8 点。',
  hashtags: [""],
  tags: ["LMSY","Special event"]
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
  notes_en: "Event time to be announced",
  notes_th: "ระยะเวลากิจกรรม รอประกาศ",
  notes_zh: "活动时间 待公布",
  hashtags: [""],
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
  notes_en: "Event time to be announced",
  notes_th: "ระยะเวลากิจกรรม รอประกาศ",
  notes_zh: "活动时间 待公布",
  hashtags: [""],
  tags: ["Lookmhee","Fansign"]
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
  hashtags: [""]
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
  startTime: "",
  notes_en: "To be announced",
  notes_th: "สถานที่รอประกาศ",
  notes_zh: "地点待公布",
  hashtags: [],
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

function getDisplayType(ev) {
  if (hasTag(ev, "fansign")) return "Fansign";
  return ev.category || "";
}

function getEventIcon(ev) {
  const tags = (ev.tags || []).map(t => String(t).toLowerCase());

  if (tags.some(t => t.includes("fansign"))) return "✍️";
  if (tags.includes("birthday")) return "🎂";
  if (tags.some(t => t.includes("christmas"))) return "🎄";
  if (ev.category === "Award") return "🏆";
  if (ev.category === "Drama") return "🎬";
  if (ev.category === "Brand") return "💼";
  if (ev.category === "Livestream") return "📺";
  if (ev.category === "Special event") return "✨";

  // Support both FanMeeting and FanEvent
  if (ev.category === "FanMeeting" || ev.category === "FanEvent") {
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
    const matchType =
      selectedType === "all" ||
      ev.category === selectedType ||
      (selectedType === "Fansign" && (ev.tags || []).some(t => String(t).toLowerCase().includes("fansign")));
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
    iconSpan.textContent = getEventIcon(ev);

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

  const categories = [...new Set(events.map(ev => ev.category))];
  const hasFansign = events.some(ev => (ev.tags || []).some(t => String(t).toLowerCase().includes("fansign")));
  if (hasFansign && !categories.includes("Fansign")) categories.push("Fansign");
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
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initLanguageToggle();
});
