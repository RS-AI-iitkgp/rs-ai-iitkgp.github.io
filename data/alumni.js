/* ==================================================================
   PhD ALUMNI — edit this list.
   ------------------------------------------------------------------
   name          Full name
   joined        Year of joining the PhD programme (optional)
   graduated     Year the PhD was awarded, e.g. 2023. Used for the
                 year filter and sorting. "YYYY" is a template
                 placeholder and sorts after real years.
   sector        Where they work now, e.g. "Academia", "Industry",
                 "Research Lab", "Government", "Startup". Used for the
                 sector filter and colour coding; the hero counts
                 "Academia" and "Industry". Keep spelling consistent.
   position      Current position, e.g. "Assistant Professor"
   organisation  Current organisation, e.g. "IIT Bombay"
   thesis        PhD thesis title
   supervisors   One or more supervisors, e.g. ["Prof. A", "Prof. B"]
   photo         Path to a square photo, e.g. "images/alumni/jane-doe.jpg".
                 If the file is missing, the card shows initials instead.
   email         Contact email ("" hides the icon)
   website, scholar, linkedin, github
                 Full URLs (https://...). "#" is a placeholder; "" hides it.

   "" for sector shows as "Other". Placeholder values ("YYYY",
   "Current Position", "Organisation Name", "PhD thesis title goes here",
   "Prof. Supervisor Name") show on the card but are ignored by search.
   ================================================================== */

window.ALUMNI = [
  // Template for a new entry:
  // { name: "Full Name", joined: "Jul 2019", graduated: "2024", sector: "Academia", position: "Assistant Professor", organisation: "Organisation Name", thesis: "Thesis title", supervisors: ["Supervisor Name"], photo: "images/alumni/full-name.jpg", email: "", website: "", scholar: "", linkedin: "", github: "" },

  // Supervisor: Prof. Jiaul Hoque Paik's student list (jiaul.github.io). PhD years, position, email,
  // LinkedIn: IdoAI talk-series contact page (idoai-iitkgp.github.io/contact.html).
  { name: "Atif Hassan",          joined: "2020", graduated: "2025", sector: "Industry", position: "Senior Researcher", organisation: "Dolby Laboratories", thesis: "PhD thesis title goes here", supervisors: ["Jiaul Hoque Paik"], photo: "images/alumni/atif-hassan.jpg", email: "atif.hit.hassan@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "https://www.linkedin.com/in/atif-hassan-1a8a45127/", github: "#" },
  { name: "Deepayan Chakraborty", joined: "YYYY", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Prof. Supervisor Name"], photo: "images/alumni/deepayan-chakraborty.jpg", email: "", website: "#", scholar: "#", linkedin: "#", github: "#" },
];
