/* ==================================================================
   EVENTS & ACTIVITIES — edit this list.
   ------------------------------------------------------------------
   title        Event name
   date         "6 Oct 2026", "Sep 2025" or "2024" ("YYYY" = not set yet)
   category     Used for the filter and colour, e.g. "Research Scholars' Day",
                "Celebration", "IdoAI Talk Series", "Student Activity".
                Keep spellings consistent.
   speaker      (talks) Speaker name;  affiliation  their organisation
   venue        Where it happened
   summary      One or two lines about the event
   links        Buttons, e.g. [{ label: "Slides", url: "https://…" }]

   Detail page (optional) — give an event an `id` to get its own page at
   event.html?id=<id>, with a photo gallery:
   id           Short unique name, e.g. "teachers-day-2026"
   details      Extra paragraphs for the detail page, e.g. ["…", "…"]
   photos       Photos in images/events/<id>/, e.g.
                ["images/events/teachers-day-2026/01.jpg", …]
                or with captions: [{ src: "…/01.jpg", caption: "…" }, …]
                While empty, the page shows "Photos coming soon" tiles.

   Sources: IdoAI talk series website (idoai-iitkgp.github.io) and the
   PhD scholars' Teachers' Day 2025 sheet.
   ================================================================== */

window.EVENTS = [
  // Template for a new entry (copy, then edit):
  // { title: "Event name", date: "12 Mar 2027", category: "Student Activity", venue: "Department of AI, IIT Kharagpur", summary: "What happened, in a line or two.", links: [{ label: "Photos", url: "https://…" }] },

  // ---- Research Scholars' Day & Foundation Day ----
  { id: "rs-day-foundation-day-2026", title: "Research Scholars' Day & Foundation Day", date: "30 Aug 2026", category: "Research Scholars' Day", venue: "Kalidas Auditorium, IIT Kharagpur",
    summary: "The Department of AI celebrated its Foundation Day together with Research Scholars' Day, showcasing the work of its PhD scholars.", links: [],
    details: [], photos: [] },

  // ---- Teachers' Day ----
  { id: "teachers-day-2026", title: "Teachers' Day Celebration 2026", date: "7 Sep 2026", category: "Celebration", venue: "Department of AI, IIT Kharagpur",
    summary: "The PhD scholars of the department celebrated Teachers' Day to thank their supervisors and faculty mentors.", links: [],
    details: [], photos: [
      { src: "images/events/teachers-day-2026/01.jpg", caption: "The decorated venue" },
      { src: "images/events/teachers-day-2026/02.jpg", caption: "Faculty and scholars at the celebration" },
      { src: "images/events/teachers-day-2026/03.jpg", caption: "Cutting the cake" },
      { src: "images/events/teachers-day-2026/04.jpg", caption: "Faculty members cut the cake" },
      { src: "images/events/teachers-day-2026/05.jpg", caption: "Group photo" },
    ] },
  { id: "teachers-day-2025", title: "Teachers' Day Celebration 2025", date: "8 Sep 2025", category: "Celebration", venue: "Department of AI, IIT Kharagpur",
    summary: "The PhD scholars of the department organised a Teachers' Day celebration to thank their supervisors and faculty mentors, with personalised cards and tokens of appreciation.", links: [],
    details: [], photos: [
      { src: "images/events/teachers-day-2025/01.jpg", caption: "The Department of AI inauguration plaque" },
      { src: "images/events/teachers-day-2025/02.jpg", caption: "Faculty members at the celebration" },
      { src: "images/events/teachers-day-2025/03.jpg", caption: "Lighting the lamp" },
      { src: "images/events/teachers-day-2025/04.jpg", caption: "Scholars gather for the celebration" },
      { src: "images/events/teachers-day-2025/05.jpg", caption: "The Teachers' Day cake" },
      { src: "images/events/teachers-day-2025/06.jpg", caption: "Faculty and scholars together" },
      { src: "images/events/teachers-day-2025/07.jpg", caption: "Faculty members cut the cake" },
      { src: "images/events/teachers-day-2025/08.jpg", caption: "Cutting the cake" },
      { src: "images/events/teachers-day-2025/09.jpg", caption: "Group photo" },
      { src: "images/events/teachers-day-2025/10.jpg", caption: "Group photo" },
      { src: "images/events/teachers-day-2025/11.jpg", caption: "Group photo" },
      { src: "images/events/teachers-day-2025/12.jpg", caption: "Group photo" },
    ] },

  // ---- IdoAI talk series ----
  { title: "IdoAI — Interdisciplinary Opportunities with AI", date: "21 Jul 2025", category: "IdoAI Talk Series", venue: "CRR Building, IIT Kharagpur",
    summary: "The department's weekly talk series, every Tuesday 5–6 PM, coordinated by PhD scholars. The inaugural session featured speakers from the University of South Florida, Princeton University, Indian Railways and the Zoological Survey of India.", 
    links: [{ label: "Talk series", url: "https://idoai-iitkgp.github.io/" }, { label: "All talks", url: "https://idoai-iitkgp.github.io/events.html" }, { label: "Propose a talk", url: "https://forms.gle/89a4wQrrdy2YnLNX6" }] },
];
