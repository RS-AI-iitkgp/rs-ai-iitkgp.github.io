/* ==================================================================
   PhD ALUMNI - edit this list.
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
  { name: "Atif Hassan",          joined: "Jul 2020", graduated: "2025", sector: "Industry", position: "Senior Researcher", organisation: "Dolby Laboratories", thesis: "PhD thesis title goes here", supervisors: ["Swanand Khare", "Jiaul Hoque Paik"], photo: "images/alumni/atif-hassan.jpg", email: "atif.hit.hassan@kgpian.iitkgp.ac.in", website: "#", scholar: "https://scholar.google.com/citations?user=GW_sRXMAAAAJ", linkedin: "https://www.linkedin.com/in/atif-hassan-1a8a45127/", github: "#" },
  // Roll 20AI91R11 and supervisor from the Teacher's Day 2025 sheet; thesis, position and links from his
  // homepage (sites.google.com/view/subhankarmaity): PhD 2020-2025, degree at the 72nd Convocation.
  { name: "Subhankar Maity",      joined: "Jul 2020", graduated: "2025", sector: "Academia", position: "Postdoctoral Researcher", organisation: "LyRIDS Lab, ECE Paris", thesis: "Toward the Automated Generation and Evaluation of Educational Open-Ended Questions Using Large Language Models", supervisors: ["Sudeshna Sarkar"], photo: "images/alumni/subhankar-maity.jpg", email: "smaity@ece.fr", website: "https://sites.google.com/view/subhankarmaity/home", scholar: "https://scholar.google.com/citations?user=O-er9aoAAAAJ", linkedin: "#", github: "#" },
  { name: "Deepayan Chakraborty", joined: "Jul 2019", graduated: "2025", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "Generative, Explainable and Causal AI for Climate Prediction and Simulation", supervisors: ["Adway Mitra"], photo: "images/alumni/deepayan-chakraborty.jpg", email: "deepayanc@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "https://www.linkedin.com/in/deepayan-chakraborty-14504b196/", github: "#" },

  // "Degree awarded" in the department PhD scholar sheet (Oct 2026): joining date (from the roll
  // number), supervisor, institute email and photo. Graduation year, position and thesis not yet known.
  { name: "Namita Bajpai",                 joined: "Jan 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Sudeshna Sarkar"], photo: "images/alumni/namita-bajpai.jpg", email: "namitabajpai@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Paidi Avinash",                 joined: "Jul 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Pabitra Mitra"], photo: "images/alumni/paidi-avinash.jpg", email: "avinashp@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Km Poonam",                     joined: "Jul 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Partha Pratim Chakrabarti"], photo: "images/alumni/km-poonam.jpg", email: "poonamk@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Omprakash Chakraborty",         joined: "Jul 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Abir Das"], photo: "images/alumni/omprakash-chakraborty.jpg", email: "opckgp@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Sumanta Chandra Mishra Sharma", joined: "Jul 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Adway Mitra"], photo: "images/alumni/sumanta-chandra-mishra-sharma.jpg", email: "sumantams@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Shubhajit Datta",               joined: "Jan 2020", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Partha Pratim Chakrabarti"], photo: "images/alumni/shubhajit-datta.jpg", email: "shubhajitdatta@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Asim Manna",                    joined: "Jul 2021", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", supervisors: ["Debdoot Sheet"], photo: "images/alumni/asim-manna.jpg", email: "asimmanna17@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
];
