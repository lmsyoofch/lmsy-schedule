const events = [
  {
    date: "2025-12-20",
    who: "Lookmhee",
    category: "FanMeeting",
    title: "Lookmhee 1st Fanmeet in Fuzhou",
    location: "Fuzhou, China",
    notes: "10.00 AM (GMT+7)",
    tags: ["LOOKMHEExFirstFanMeetinFuzhou"]
  },
  {
    date: "2025-12-21",
    who: "Sonya",
    category: "FanMeeting",
    title: "Sonya 1st Fanmeet in Fuzhou",
    location: "Fuzhou, China",
    notes: "10.00 AM (GMT+7)",
    tags: ["SONYAxFirstFanMeetinFuzhou"]
  }
];

const container = document.getElementById("schedule");

events.forEach(e => {
  const div = document.createElement("div");
  div.className = "event";
  div.innerHTML = `
    <strong>${e.title}</strong><br>
    ${e.date} • ${e.notes}<br>
    ${e.location}<br>
    <div class="tags">#${e.tags.join(" #")}</div>
  `;
  container.appendChild(div);
});
