/* ==================================================================
   EVENTS & ACTIVITIES — edit this list.
   ------------------------------------------------------------------
   title        Event name
   date         "6 Oct 2026", "Sep 2025" or "2024" ("YYYY" = not set yet)
   category     Used for the filter and colour, e.g. "RS Day",
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
                ar (optional) = width / height, e.g. 1.5 for 3:2 or 0.75 for a
                portrait 3:4 photo; lets the gallery lay out its rows before
                the photos load (without it the tile adjusts once loaded).
                Gallery tiles use a small copy from images/events/<id>/thumbs/
                (same file name) when it exists; give `thumb` to use another file.
                While empty, the page shows "Photos coming soon" tiles.
   highlights   Photo numbers that slide by on the event's card, e.g.
                [1, 8, 27]; leave out to use the first three photos.

   Card slides without a detail page (e.g. the IdoAI card):
   slides       Images that slide by on the card, e.g. ["images/events/idoai/01.jpg", …]
   slidesLink   Where clicking the slides goes, e.g. an external gallery

   Photo files  JPG named in display order (01.jpg, 02.jpg, …), camera
                metadata (GPS) removed. Longest side about 2400 px; keep
                4000 px or the full camera size for group/crowd photos so
                faces can be zoomed into. Thumbnails: 640 px, same name, in
                thumbs/.

   Sources: IdoAI talk series website (idoai-iitkgp.github.io) and the
   PhD scholars' Teachers' Day 2025 sheet.
   ================================================================== */

window.EVENTS = [
  // Template for a new entry (copy, then edit):
  // { title: "Event name", date: "12 Mar 2027", category: "Student Activity", venue: "Department of AI, IIT Kharagpur", summary: "What happened, in a line or two.", links: [{ label: "Photos", url: "https://…" }] },

  // ---- Research Scholars' Day & Foundation Day ----
  { id: "rs-day-foundation-day-2026", title: "Research Scholars' Day & Foundation Day", date: "29 Aug 2026", category: "RS Day", venue: "Kalidas Auditorium, IIT Kharagpur",
    summary: "The Department of AI celebrated its Foundation Day together with Research Scholars' Day, showcasing the work of its PhD scholars.", links: [],
    details: [], highlights: [8, 20, 28, 45, 47, 55], photos: [
      { src: "images/events/rs-day-foundation-day-2026/01.jpg", ar: 1.502, caption: "Foundation Day & Research Scholars' Day at Kalidas Auditorium" },
      { src: "images/events/rs-day-foundation-day-2026/02.jpg", ar: 1.499, caption: "Poster session" },
      { src: "images/events/rs-day-foundation-day-2026/03.jpg", ar: 1.502, caption: "The stage at Kalidas Auditorium" },
      { src: "images/events/rs-day-foundation-day-2026/04.jpg", ar: 1.499, caption: "Poster session" },
      { src: "images/events/rs-day-foundation-day-2026/05.jpg", ar: 1.499, caption: "The hosts open the programme" },
      { src: "images/events/rs-day-foundation-day-2026/06.jpg", ar: 1.502, caption: "Guests on stage" },
      { src: "images/events/rs-day-foundation-day-2026/07.jpg", ar: 1.502, caption: "HoD Prof. Plaban Kumar Bhowmick addressing the audience" },
      { src: "images/events/rs-day-foundation-day-2026/08.jpg", ar: 1.502, caption: "Inaugural speech by the Director, Prof. Suman Chakraborty" },
      { src: "images/events/rs-day-foundation-day-2026/09.jpg", ar: 1.502, caption: "In the audience" },
      { src: "images/events/rs-day-foundation-day-2026/10.jpg", ar: 1.502, caption: "The audience" },
      { src: "images/events/rs-day-foundation-day-2026/11.jpg", ar: 1.502, caption: "Inaugural speech by the Director" },
      { src: "images/events/rs-day-foundation-day-2026/12.jpg", ar: 1.502, caption: "In the audience" },
      { src: "images/events/rs-day-foundation-day-2026/13.jpg", ar: 1.502, caption: "Address at the podium" },
      { src: "images/events/rs-day-foundation-day-2026/14.jpg", ar: 1.502, caption: "Address at the podium" },
      { src: "images/events/rs-day-foundation-day-2026/15.jpg", ar: 1.502, caption: "Address at the podium" },
      { src: "images/events/rs-day-foundation-day-2026/16.jpg", ar: 1.502, caption: "Faculty and guests on stage" },
      { src: "images/events/rs-day-foundation-day-2026/17.jpg", ar: 1.502, caption: "Tea break" },
      { src: "images/events/rs-day-foundation-day-2026/18.jpg", ar: 1.502, caption: "Tea break" },
      { src: "images/events/rs-day-foundation-day-2026/19.jpg", ar: 1.502, caption: "Talk: Forces behind AI's rise" },
      { src: "images/events/rs-day-foundation-day-2026/20.jpg", ar: 1.502, caption: "Panel discussion on the future of the Department of AI" },
      { src: "images/events/rs-day-foundation-day-2026/21.jpg", ar: 1.502, caption: "Panel discussion" },
      { src: "images/events/rs-day-foundation-day-2026/22.jpg", ar: 1.502, caption: "Panel discussion" },
      { src: "images/events/rs-day-foundation-day-2026/23.jpg", ar: 1.502, caption: "The audience" },
      { src: "images/events/rs-day-foundation-day-2026/24.jpg", ar: 1.502, caption: "The audience" },
      { src: "images/events/rs-day-foundation-day-2026/25.jpg", ar: 1.502, caption: "A question from the audience" },
      { src: "images/events/rs-day-foundation-day-2026/26.jpg", ar: 1.502, caption: "A question from the audience" },
      { src: "images/events/rs-day-foundation-day-2026/27.jpg", ar: 1.502, caption: "The panel" },
      { src: "images/events/rs-day-foundation-day-2026/28.jpg", ar: 1.502, caption: "Group photo" },
      { src: "images/events/rs-day-foundation-day-2026/29.jpg", ar: 1.502, caption: "Group photo — left" },
      { src: "images/events/rs-day-foundation-day-2026/30.jpg", ar: 1.502, caption: "Group photo — centre" },
      { src: "images/events/rs-day-foundation-day-2026/31.jpg", ar: 1.502, caption: "Group photo — right" },
      { src: "images/events/rs-day-foundation-day-2026/32.jpg", ar: 1.502, caption: "Group photo — far right" },
      { src: "images/events/rs-day-foundation-day-2026/33.jpg", ar: 1.502, caption: "Research scholar presentation" },
      { src: "images/events/rs-day-foundation-day-2026/34.jpg", ar: 1.502, caption: "Questions from the audience" },
      { src: "images/events/rs-day-foundation-day-2026/35.jpg", ar: 1.502, caption: "Research scholar presentation" },
      { src: "images/events/rs-day-foundation-day-2026/36.jpg", ar: 1.502, caption: "Questions from the audience" },
      { src: "images/events/rs-day-foundation-day-2026/37.jpg", ar: 1.502, caption: "Research scholar presentation" },
      { src: "images/events/rs-day-foundation-day-2026/38.jpg", ar: 1.502, caption: "Research scholar presentation: Generative AI for Materials Science" },
      { src: "images/events/rs-day-foundation-day-2026/39.jpg", ar: 1.502, caption: "In the audience" },
      { src: "images/events/rs-day-foundation-day-2026/40.jpg", ar: 1.502, caption: "Questions from the audience" },
      { src: "images/events/rs-day-foundation-day-2026/41.jpg", ar: 1.502, caption: "Questions from the audience" },
      { src: "images/events/rs-day-foundation-day-2026/42.jpg", ar: 1.502, caption: "Research scholar presentation" },
      { src: "images/events/rs-day-foundation-day-2026/43.jpg", ar: 1.502, caption: "Research scholar presentation" },
      { src: "images/events/rs-day-foundation-day-2026/44.jpg", ar: 1.502, caption: "Research scholar presentation" },
      { src: "images/events/rs-day-foundation-day-2026/45.jpg", ar: 1.499, caption: "Poster session" },
      { src: "images/events/rs-day-foundation-day-2026/46.jpg", ar: 1.499, caption: "Poster session" },
      { src: "images/events/rs-day-foundation-day-2026/47.jpg", ar: 1.502, caption: "Award presentation" },
      { src: "images/events/rs-day-foundation-day-2026/48.jpg", ar: 1.502, caption: "Award presentation" },
      { src: "images/events/rs-day-foundation-day-2026/49.jpg", ar: 1.502, caption: "Award presentation" },
      { src: "images/events/rs-day-foundation-day-2026/50.jpg", ar: 1.502, caption: "Award presentation" },
      { src: "images/events/rs-day-foundation-day-2026/51.jpg", ar: 1.502, caption: "At the podium" },
      { src: "images/events/rs-day-foundation-day-2026/52.jpg", ar: 1.502, caption: "Prof. Prabhat Kumar Mishra thanking the department staff and inviting them on stage" },
      { src: "images/events/rs-day-foundation-day-2026/53.jpg", ar: 1.502, caption: "Presenting a token of thanks to the department staff" },
      { src: "images/events/rs-day-foundation-day-2026/54.jpg", ar: 1.502, caption: "Presenting a token of thanks to the department staff" },
      { src: "images/events/rs-day-foundation-day-2026/55.jpg", ar: 1.499, caption: "B.Tech student Archisman Nandy singing Rabindra Sangeet in the cultural programme" },
      { src: "images/events/rs-day-foundation-day-2026/56.jpg", ar: 1.499, caption: "PhD scholar Ashraf Haroon Rashid dancing in the cultural programme" },
      { src: "images/events/rs-day-foundation-day-2026/57.jpg", ar: 1.499, caption: "PhD scholar Ranjan Sarkar singing “Yaaron” by KK in the cultural programme" },
      { src: "images/events/rs-day-foundation-day-2026/58.jpg", ar: 1.499, caption: "Artist performance at the cultural programme" },
      { src: "images/events/rs-day-foundation-day-2026/59.jpg", ar: 1.499, caption: "Cultural programme" },
    ] },

  // ---- Teachers' Day ----
  { id: "teachers-day-2026", title: "Teachers' Day Celebration 2026", date: "7 Sep 2026", category: "Celebration", venue: "CRR Classroom, Department of AI, IIT Kharagpur",
    summary: "The PhD scholars of the department celebrated Teachers' Day to thank their supervisors and faculty mentors.", links: [],
    details: [], highlights: [1, 3, 5], photos: [
      { src: "images/events/teachers-day-2026/01.jpg", ar: 1.333, caption: "The decorated venue" },
      { src: "images/events/teachers-day-2026/02.jpg", ar: 1.333, caption: "Faculty and scholars at the celebration" },
      { src: "images/events/teachers-day-2026/03.jpg", ar: 1.333, caption: "Cutting the cake" },
      { src: "images/events/teachers-day-2026/04.jpg", ar: 1.333, caption: "Faculty members cut the cake" },
      { src: "images/events/teachers-day-2026/05.jpg", ar: 1.333, caption: "Group photo" },
    ] },
  { id: "teachers-day-2025", title: "Teachers' Day Celebration 2025", date: "8 Sep 2025", category: "Celebration", venue: "AI Lab, CRR Building, IIT Kharagpur",
    summary: "The PhD scholars of the department, together with the UG and PG students, celebrated Teachers' Day to thank their supervisors and faculty mentors.", links: [],
    details: [], highlights: [3, 7, 9], photos: [
      { src: "images/events/teachers-day-2025/01.jpg", ar: 0.75, caption: "The Department of AI inauguration plaque" },
      { src: "images/events/teachers-day-2025/02.jpg", ar: 1.333, caption: "Faculty members at the celebration" },
      { src: "images/events/teachers-day-2025/03.jpg", ar: 0.75, caption: "Lighting the lamp" },
      { src: "images/events/teachers-day-2025/04.jpg", ar: 1.333, caption: "Scholars gather for the celebration" },
      { src: "images/events/teachers-day-2025/05.jpg", ar: 0.75, caption: "The Teachers' Day cake" },
      { src: "images/events/teachers-day-2025/06.jpg", ar: 1.333, caption: "Faculty and scholars together" },
      { src: "images/events/teachers-day-2025/07.jpg", ar: 1.333, caption: "Faculty members cut the cake" },
      { src: "images/events/teachers-day-2025/08.jpg", ar: 1.778, caption: "Cutting the cake" },
      { src: "images/events/teachers-day-2025/09.jpg", ar: 1.778, caption: "Group photo" },
      { src: "images/events/teachers-day-2025/10.jpg", ar: 1.778, caption: "Group photo" },
      { src: "images/events/teachers-day-2025/11.jpg", ar: 1.778, caption: "Group photo" },
      { src: "images/events/teachers-day-2025/12.jpg", ar: 1.778, caption: "Group photo" },
    ] },

  // ---- IdoAI talk series ----
  // Card slides: the 4 most recent photos from the IdoAI gallery (idoai-iitkgp.github.io/gallery.html), cropped to 16:9.
  { title: "IdoAI — Interdisciplinary Opportunities with AI", date: "21 Jul 2025", category: "IdoAI Talk Series", venue: "CRR Building, IIT Kharagpur",
    slides: ["images/events/idoai/01.jpg", "images/events/idoai/02.jpg", "images/events/idoai/03.jpg", "images/events/idoai/04.jpg"],
    slidesLink: "https://idoai-iitkgp.github.io/",
    summary: "The department's weekly talk series, every Tuesday 5–6 PM, coordinated by PhD scholars. The inaugural session featured speakers from the University of South Florida, Princeton University, Indian Railways and the Zoological Survey of India.", 
    links: [{ label: "Talk series", url: "https://idoai-iitkgp.github.io/" }, { label: "All talks", url: "https://idoai-iitkgp.github.io/events.html" }, { label: "Propose a talk", url: "https://forms.gle/89a4wQrrdy2YnLNX6" }] },
];
