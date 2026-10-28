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
   status        Optional, e.g. "Thesis submitted" - shown in place of
                 the "Graduated" badge until the degree is awarded.
   thesis        PhD thesis title
   topic         Optional research interest - shown (as "Research")
                 while the thesis title is still the placeholder.
   supervisors   One or more supervisors, e.g. ["Prof. A", "Prof. B"]
   photo         Path to a square photo, e.g. "images/alumni/jane-doe.jpg".
                 If the file is missing, the card shows initials instead.
   email         Contact email ("" hides the icon)
   website, scholar, linkedin, github
                 Full URLs (https://...). "#" shows a faded icon; "" hides it.

   "" for sector shows as "Other". Placeholder values ("YYYY",
   "Current Position", "Organisation Name", "PhD thesis title goes here",
   "Prof. Supervisor Name") show on the card but are ignored by search.
   ================================================================== */

window.ALUMNI = [
  // Template for a new entry:
  // { name: "Full Name", joined: "Jul 2019", graduated: "2024", sector: "Academia", position: "Assistant Professor", organisation: "Organisation Name", thesis: "Thesis title", supervisors: ["Supervisor Name"], photo: "images/alumni/full-name.jpg", email: "", website: "", scholar: "", linkedin: "", github: "" },

  // Supervisor: Prof. Jiaul Hoque Paik's student list (jiaul.github.io). PhD years, position, email,
  // LinkedIn: IdoAI talk-series contact page (idoai-iitkgp.github.io/contact.html).
  { name: "Atif Hassan",          joined: "Jul 2020", graduated: "2025", sector: "Industry", position: "Senior Researcher", organisation: "Dolby Laboratories", thesis: "PhD thesis title goes here", topic: "Machine learning and Deep learning with applications", supervisors: ["Swanand Khare", "Jiaul Hoque Paik"], photo: "images/alumni/atif-hassan.jpg", email: "atif.hit.hassan@kgpian.iitkgp.ac.in", website: "#", scholar: "https://scholar.google.com/citations?user=GW_sRXMAAAAJ", linkedin: "https://www.linkedin.com/in/atif-hassan-1a8a45127/", github: "#" },
  // Roll 20AI91R11 and supervisor from the Teacher's Day 2025 sheet; thesis, position and links from his
  // homepage (sites.google.com/view/subhankarmaity): PhD 2020-2025, degree at the 72nd Convocation.
  { name: "Subhankar Maity",      joined: "Jul 2020", graduated: "2025", sector: "Academia", position: "Postdoctoral Researcher", organisation: "LyRIDS Lab, ECE Paris", thesis: "Toward the Automated Generation and Evaluation of Educational Open-Ended Questions Using Large Language Models", supervisors: ["Sudeshna Sarkar"], photo: "images/alumni/subhankar-maity.jpg", email: "smaity@ece.fr", website: "https://sites.google.com/view/subhankarmaity/home", scholar: "https://scholar.google.com/citations?user=O-er9aoAAAAJ", linkedin: "#", github: "#" },
  // Position, email, research interests and photo from his IIIT Sri City faculty page (Oct 2026):
  // Assistant Professor, CSE, IIIT Sri City since Mar 2026; before that UPES Dehradun (Apr 2025 - Feb 2026).
  { name: "Sumanta Chandra Mishra Sharma", joined: "Jul 2019", graduated: "YYYY", sector: "Academia", position: "Assistant Professor", organisation: "IIIT Sri City", thesis: "PhD thesis title goes here", topic: "Deep Learning, Computer Vision, Climate Informatics, Geospatial Data Analytics", supervisors: ["Adway Mitra"], photo: "images/alumni/sumanta-chandra-mishra-sharma.jpg", email: "sumantachandra.ms@iiits.in", website: "https://iiits.ac.in/people/regular-faculty/dr-sumanta-chandra-mishra-sharma/", scholar: "https://scholar.google.com/citations?user=ycDaVPAAAAAJ", linkedin: "https://www.linkedin.com/in/dr-sumanta-chandra-mishra-sharma-ba107a75/", github: "#" },
  { name: "Deepayan Chakraborty", joined: "Jul 2019", graduated: "2025", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "Generative, Explainable and Causal AI for Climate Prediction and Simulation", supervisors: ["Adway Mitra"], photo: "images/alumni/deepayan-chakraborty.jpg", email: "deepayanc@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "https://www.linkedin.com/in/deepayan-chakraborty-14504b196/", github: "#" },

  // "Degree awarded" in the department PhD scholar sheet (Oct 2026): joining date (from the roll
  // number), supervisor, institute email and photo. Graduation year, position and thesis not yet known.
  { name: "Namita Bajpai",                 joined: "Jan 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Artificial Intelligence", supervisors: ["Sudeshna Sarkar"], photo: "images/alumni/namita-bajpai.jpg", email: "namitabajpai@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Paidi Avinash",                 joined: "Jul 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Soft Computing", supervisors: ["Pabitra Mitra"], photo: "images/alumni/paidi-avinash.jpg", email: "avinashp@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Km Poonam",                     joined: "Jul 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Artificial Intelligence", supervisors: ["Partha Pratim Chakrabarti"], photo: "images/alumni/km-poonam.jpg", email: "poonamk@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Omprakash Chakraborty",         joined: "Jul 2019", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Explainable AI", supervisors: ["Abir Das"], photo: "images/alumni/omprakash-chakraborty.jpg", email: "opckgp@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Shubhajit Datta",               joined: "Jan 2020", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Deep learning", supervisors: ["Partha Pratim Chakrabarti"], photo: "images/alumni/shubhajit-datta.jpg", email: "shubhajitdatta@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Asim Manna",                    joined: "Jul 2021", graduated: "YYYY", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Deep Learning, Medical Imaging, Visual Hashing", supervisors: ["Debdoot Sheet"], photo: "images/alumni/asim-manna.jpg", email: "asimmanna17@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },

  // "Thesis submitted" in the department PhD scholar sheet (Oct 2026), moved from the scholars page.
  // When the degree is awarded, remove `status` and set `graduated` to the year.
  { name: "Abhishek Kumar",          joined: "Jul 2019", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Medical image analysis, video processing, explainable models", supervisors: ["Debdoot Sheet"], photo: "images/alumni/abhishek-kumar.jpg", email: "abhishek.kumar@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Anirban Lahiri",          joined: "Jul 2019", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "AI in Psychology", supervisors: ["Pabitra Mitra"], photo: "images/alumni/anirban-lahiri.jpg", email: "anirban.lahiri@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Anjali Raj",              joined: "Jul 2020", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Satellite-based mapping", supervisors: ["Adway Mitra"], photo: "images/alumni/anjali-raj.jpg", email: "anjaliraj@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Anupam Borthakur",        joined: "Jul 2020", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Federated Learning under Differential Privacy for Medical Imaging", supervisors: ["Debdoot Sheet"], photo: "images/alumni/anupam-borthakur.jpg", email: "anupamborthakur@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Dipankar Mandal",         joined: "Jul 2020", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Novel Frameworks for Efficient Route Planners in Intelligent Transportation System", supervisors: ["Arnab Sarkar"], photo: "images/alumni/dipankar-mandal.jpg", email: "dipankarmandal@kgpian.iitkgp.ac.in", website: "#", scholar: "https://scholar.google.com/citations?user=JaqPn1QAAAAJ", linkedin: "https://www.linkedin.com/in/dipankar-mandal-b801769a/", github: "#" },
  { name: "Meshram Suraj Shalikram", joined: "Jul 2020", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "", supervisors: ["Arnab Sarkar", "Arijit Mondal"], photo: "images/alumni/meshram-suraj-shalikram.jpg", email: "suraj_meshram@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "https://www.linkedin.com/in/suraj-meshram-76499a1a/", github: "#" },
  { name: "Sayantan Saha",           joined: "Jul 2020", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Machine Learning", supervisors: ["Jiaul Hoque Paik"], photo: "images/alumni/sayantan-saha.jpg", email: "sayantan.saha@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Soma Bandyopadhyay",      joined: "Jul 2019", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Machine Learning", supervisors: ["Sudeshna Sarkar"], photo: "images/alumni/soma-bandyopadhyay.jpg", email: "somab@iitkgp.ac.in", website: "#", scholar: "#", linkedin: "#", github: "#" },
  { name: "Soumyadipta Banerjee",    joined: "Jan 2021", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "Deep Learning", supervisors: ["Jiaul Hoque Paik"], photo: "images/alumni/soumyadipta-banerjee.jpg", email: "soumyadiptobnrj071@kgpian.iitkgp.ac.in", website: "#", scholar: "#", linkedin: "https://www.linkedin.com/in/soumyadipta-banerjee-59a02515b/", github: "#" },
  { name: "Swarnava Dey",            joined: "Jan 2021", graduated: "", status: "Thesis submitted", sector: "", position: "Current Position", organisation: "Organisation Name", thesis: "PhD thesis title goes here", topic: "AI and Deep Neural Networks", supervisors: ["Partha Pratim Chakrabarti"], photo: "images/alumni/swarnava-dey.jpg", email: "swarnava.dey@kgpian.iitkgp.ac.in", website: "#", scholar: "https://scholar.google.com/citations?user=aFplwjEAAAAJ", linkedin: "https://www.linkedin.com/in/swarnava-dey-8506454/", github: "#" },
];
