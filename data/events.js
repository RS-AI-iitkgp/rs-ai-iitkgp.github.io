/* ==================================================================
   EVENTS & ACTIVITIES — edit this list.
   ------------------------------------------------------------------
   title        Event name
   date         "6 Oct 2026", "Sep 2025" or "2024" ("YYYY" = not set yet)
   category     Used for the filter and colour, e.g. "Research Scholars' Day",
                "Celebration", "IdoAI Talk Series", "Scholar Talk",
                "Student Activity". Keep spellings consistent.
   speaker      (talks) Speaker name;  affiliation  their organisation
   venue        Where it happened
   summary      One or two lines about the event
   people       Scholars involved, e.g. ["Ranjan Sarkar", "Biswamitra Mitra"]
   peopleLabel  Heading for `people`, e.g. "Organised by", "Coordinators"
   links        Buttons, e.g. [{ label: "Slides", url: "https://…" }]

   Sources: IdoAI talk series website (idoai-iitkgp.github.io) and the
   PhD scholars' Teachers' Day 2025 sheet.
   ================================================================== */

window.EVENTS = [
  // Template for a new entry (copy, then edit):
  // { title: "Event name", date: "12 Mar 2027", category: "Student Activity", venue: "Department of AI, IIT Kharagpur", summary: "What happened, in a line or two.", people: ["Scholar Name"], peopleLabel: "Organised by", links: [{ label: "Photos", url: "https://…" }] },

  // ---- Research Scholars' Day (fill in the details) ----
  { title: "Research Scholars' Day", date: "YYYY", category: "Research Scholars' Day", venue: "Department of AI, IIT Kharagpur",
    summary: "PhD scholars presented their research through talks and posters. Add the date, highlights and award winners here.",
    people: [], peopleLabel: "Organised by", links: [] },

  // ---- Celebrations ----
  { title: "Teachers' Day Celebration", date: "Sep 2025", category: "Celebration", venue: "Department of AI, IIT Kharagpur",
    summary: "The PhD scholars of the department organised a Teachers' Day celebration to thank their supervisors and faculty mentors, with personalised cards and tokens of appreciation.",
    people: ["PhD scholars, Department of AI"], peopleLabel: "Organised by", links: [] },

  // ---- IdoAI talk series ----
  { title: "IdoAI — Interdisciplinary Opportunities with AI", date: "21 Jul 2025", category: "IdoAI Talk Series", venue: "CRR Building, IIT Kharagpur",
    summary: "The department's weekly talk series, every Tuesday 5–6 PM, coordinated by PhD scholars. The inaugural session featured speakers from the University of South Florida, Princeton University, Indian Railways and the Zoological Survey of India.",
    people: ["Ranjan Sarkar", "Subhojyoti Khastagir"], peopleLabel: "Student coordinators",
    links: [{ label: "Talk series", url: "https://idoai-iitkgp.github.io/" }, { label: "All talks", url: "https://idoai-iitkgp.github.io/events.html" }, { label: "Propose a talk", url: "https://forms.gle/89a4wQrrdy2YnLNX6" }] },

  // ---- Talks by PhD scholars at IdoAI ----
  { title: "Spend less time tuning and more time chilling", date: "6 Jun 2024", category: "Scholar Talk", speaker: "Atif Hassan", affiliation: "PhD scholar, Dept. of AI", venue: "IdoAI talk series",
    summary: "A talk at the IdoAI series on spending less effort on hyperparameter tuning.",
    people: [], links: [{ label: "Slides", url: "https://idoai-iitkgp.github.io/content/Spend%20less%20time%20TUNING.pptx" }] },
  { title: "An Introduction to Graph Machine Learning — Part I", date: "8 Mar 2024", category: "Scholar Talk", speaker: "Animesh Sachan", affiliation: "PhD scholar, Dept. of AI", venue: "IdoAI talk series",
    summary: "An introductory tutorial on graph machine learning.",
    people: [], links: [{ label: "Slides", url: "https://idoai-iitkgp.github.io/content/Intro%20to%20GML%20Part%201.pptx" }] },
  { title: "SSEnse: Stochastic Method for Discovering Sparse Ensembles", date: "29 Feb 2024", category: "Scholar Talk", speaker: "Ashraf Haroon Rashid", affiliation: "PhD scholar, Dept. of AI", venue: "IdoAI talk series",
    summary: "A stochastic method for discovering sparse ensembles of models.",
    people: [], links: [] },
  { title: "Ensemble Learning: The Dark Horse of the Modern Machine Learning Landscape", date: "15 Feb 2024", category: "Scholar Talk", speaker: "Ashraf Haroon Rashid", affiliation: "PhD scholar, Dept. of AI", venue: "IdoAI talk series",
    summary: "An overview of ensemble learning and why it still matters.",
    people: [], links: [] },
];
