const roleKeywords = {
  "frontend developer": [
    "javascript",
    "typescript",
    "react",
    "html",
    "css",
    "accessibility",
    "performance",
    "testing",
    "responsive",
    "api",
  ],
  "software engineer": [
    "python",
    "java",
    "javascript",
    "algorithms",
    "api",
    "database",
    "testing",
    "cloud",
    "system design",
    "git",
  ],
  "data analyst": [
    "sql",
    "excel",
    "python",
    "tableau",
    "power bi",
    "dashboard",
    "statistics",
    "reporting",
    "data cleaning",
    "visualization",
  ],
  "product manager": [
    "roadmap",
    "stakeholder",
    "prioritization",
    "metrics",
    "user research",
    "go-to-market",
    "experiments",
    "analytics",
    "requirements",
    "launch",
  ],
};

const skillLibrary = [
  "javascript",
  "typescript",
  "react",
  "node.js",
  "python",
  "java",
  "sql",
  "mongodb",
  "postgresql",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "html",
  "css",
  "tailwind",
  "excel",
  "tableau",
  "power bi",
  "machine learning",
  "nlp",
  "api",
  "rest",
  "graphql",
  "testing",
  "jest",
  "cypress",
  "figma",
  "agile",
  "scrum",
  "leadership",
  "communication",
  "problem solving",
  "analytics",
  "data visualization",
  "accessibility",
  "performance",
  "responsive",
  "system design",
];

const fallbackKeywords = [
  "leadership",
  "collaboration",
  "communication",
  "project",
  "metrics",
  "automation",
  "analysis",
  "strategy",
  "customer",
  "delivery",
];

const resumeText = document.querySelector("#resumeText");
const jobDescription = document.querySelector("#jobDescription");
const resumeFile = document.querySelector("#resumeFile");
const fileLabel = document.querySelector("#fileLabel");
const dropZone = document.querySelector("#dropZone");
const analyzeButton = document.querySelector("#analyzeButton");
const scoreValue = document.querySelector("#scoreValue");
const scoreValueMirror = document.querySelector("#scoreValueMirror");
const scoreBar = document.querySelector("#scoreBar");
const scoreNote = document.querySelector("#scoreNote");
const keywordMetric = document.querySelector("#keywordMetric");
const matchMetric = document.querySelector("#matchMetric");
const formatMetric = document.querySelector("#formatMetric");
const suggestionList = document.querySelector("#suggestionList");
const strengthTags = document.querySelector("#strengthTags");
const missingSkillTags = document.querySelector("#missingSkillTags");
const analysisIntro = document.querySelector("#analysisIntro");
const resumeSummary = document.querySelector("#resumeSummary");
const parsedDetails = document.querySelector("#parsedDetails");
const textQualityMessage = document.querySelector("#textQualityMessage");

const normalize = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();

function getKeywords(role) {
  const key = normalize(role);
  return roleKeywords[key] || fallbackKeywords;
}

function percent(value) {
  return `${Math.round(value)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function getWords(text) {
  return unique((normalize(text).match(/[a-z][a-z+#.-]{2,}/g) || []).filter((word) => word.length > 2));
}

function extractSkills(text) {
  const normalized = normalize(text);
  return skillLibrary.filter((skill) => normalized.includes(skill));
}

function extractSection(text, headings) {
  const lines = text.split(/\r?\n/);
  const startIndex = lines.findIndex((line) =>
    headings.some((heading) => normalize(line).replace(/[:\-]/g, "").includes(heading)),
  );

  if (startIndex === -1) return "";

  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const isNextHeading = /^[A-Z][A-Z\s/&-]{3,}:?$/.test(line) || /^(skills|education|experience|projects|certifications)$/i.test(line);
    if (line && isNextHeading) break;
    if (line) sectionLines.push(line);
  }

  return sectionLines.join(" ");
}

function isLikelyBadExtraction(text) {
  const words = text.match(/[A-Za-z]{3,}/g) || [];
  const digits = text.match(/\d/g) || [];
  const symbols = text.match(/[^A-Za-z0-9\s.,:@/+()#&-]/g) || [];
  const hasResumeSignals = /(experience|education|skills|projects|certifications|summary|profile)/i.test(text);

  return text.length > 80 && (words.length < 35 || digits.length > words.length * 4 || symbols.length > words.length * 2) && !hasResumeSignals;
}

function findPhone(text) {
  const matches = text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?){2,4}\d{3,5}/g) || [];
  const validPhone = matches.find((match) => {
    const digits = match.replace(/\D/g, "");
    const repeated = /^(\d)\1+$/.test(digits);
    return digits.length >= 10 && digits.length <= 15 && !repeated;
  });

  return validPhone ? validPhone.trim() : "Not found";
}

function findName(lines) {
  const blockedWords = /(resume|curriculum|vitae|email|phone|mobile|linkedin|github|portfolio|address|developer|engineer)/i;
  return (
    lines
      .slice(0, 8)
      .find((line) => /^[A-Za-z][A-Za-z\s.'-]{2,50}$/.test(line) && !blockedWords.test(line)) || "Not found"
  );
}

function extractLanguages(text) {
  const languages = ["english", "spanish", "french", "german", "mandarin", "hindi", "portuguese", "arabic", "russian", "chinese", "korean", "japanese", "italian", "dutch", "swedish", "polish"];
  const normalized = normalize(text);
  return languages.filter((lang) => normalized.includes(lang));
}

function extractProjects(text) {
  const projectSection = extractSection(text, ["projects", "portfolio", "portfolio projects"]);
  if (!projectSection) return "Not detected";
  return projectSection.length > 250 ? `${projectSection.slice(0, 250)}...` : projectSection;
}

function parseResume(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const email = text.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || "Not found";
  const phone = findPhone(text);
  const name = findName(lines);
  const skills = extractSkills(text);
  const education = extractSection(text, ["education", "academic background"]) || "Not detected";
  const experience = extractSection(text, ["experience", "work experience", "professional experience"]) || "Not detected";
  const certifications = extractSection(text, ["certifications", "certificates"]) || "Not detected";
  const languages = extractLanguages(text);
  const projects = extractProjects(text);

  return {
    name,
    email,
    phone,
    skills,
    education,
    experience,
    certifications,
    languages,
    projects,
  };
}

function getJobKeywords(role, jdText) {
  const jdSkills = extractSkills(jdText);
  const jdWords = getWords(jdText)
    .filter((word) => !["with", "from", "this", "that", "will", "have", "your", "you", "and", "the"].includes(word))
    .slice(0, 16);
  return unique([...jdSkills, ...getKeywords(role), ...jdWords]).slice(0, 24);
}

function scoreResume(text, role, jdText) {
  const normalized = normalize(text);
  const keywords = getJobKeywords(role, jdText);
  const parsed = parseResume(text);
  const resumeSkills = parsed.skills;
  const jdSkills = extractSkills(jdText);
  const matchedKeywords = keywords.filter((keyword) => normalized.includes(keyword));
  const missingKeywords = keywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const matchedJobSkills = jdSkills.filter((skill) => resumeSkills.includes(skill));
  const missingJobSkills = jdSkills.filter((skill) => !resumeSkills.includes(skill));
  const keywordScore = keywords.length ? (matchedKeywords.length / keywords.length) * 100 : 0;
  const jobMatchScore = jdSkills.length ? (matchedJobSkills.length / jdSkills.length) * 100 : keywordScore;
  const hasContact = parsed.email !== "Not found" || parsed.phone !== "Not found";
  const hasSections = ["experience", "education", "skills"].filter((section) => normalized.includes(section)).length;
  const metricMatches =
    text.match(/\b\d{1,3}[%+]|\$\d[\d,]*(?:\.\d+)?|\b\d+x\b|\b\d+\s?(users|clients|projects|teams|hours|days)\b/gi) || [];
  const actionMatches =
    text.match(/\b(led|built|improved|created|launched|reduced|increased|managed|designed|implemented|optimized)\b/gi) ||
    [];
  const bulletMatches = text.match(/(^|\n)\s*[-*]/g) || [];
  const wordCount = normalized ? normalized.split(" ").length : 0;

  const impactScore = clamp(metricMatches.length * 18 + actionMatches.length * 4, 0, 100);
  const formatScore = clamp(
    (hasContact ? 20 : 0) + hasSections * 20 + Math.min(bulletMatches.length, 8) * 5 + (wordCount > 250 ? 20 : 0),
    0,
    100,
  );
  const total = clamp(keywordScore * 0.35 + jobMatchScore * 0.25 + impactScore * 0.15 + formatScore * 0.25, 0, 99);

  return {
    total,
    keywordScore,
    jobMatchScore,
    impactScore,
    formatScore,
    matchedKeywords,
    missingKeywords,
    matchedJobSkills,
    missingJobSkills,
    hasContact,
    hasSections,
    metricCount: metricMatches.length,
    actionCount: actionMatches.length,
    wordCount,
    parsed,
  };
}

function buildSuggestions(result, role, hasJobDescription) {
  const suggestions = [];

  if (result.wordCount < 220) {
    suggestions.push("Add more role-specific detail. The resume is short, so ATS systems may not see enough evidence for ranking.");
  }

  if (hasJobDescription && result.missingJobSkills.length > 0) {
    suggestions.push(`Add missing job-description skills where truthful: ${result.missingJobSkills.slice(0, 6).join(", ")}.`);
  }

  if (result.missingKeywords.length > 0) {
    suggestions.push(`Use more ${role || "target role"} keywords naturally: ${result.missingKeywords.slice(0, 5).join(", ")}.`);
  }

  if (result.metricCount < 3) {
    suggestions.push("Add measurable outcomes to bullets, such as percentage gains, revenue impact, time saved, or scale handled.");
  }

  if (result.actionCount < 6) {
    suggestions.push("Start more experience bullets with strong action verbs like built, improved, led, automated, optimized, or launched.");
  }

  if (!result.hasContact) {
    suggestions.push("Add clear contact information at the top so recruiters and parsing systems can identify you quickly.");
  }

  if (result.hasSections < 3) {
    suggestions.push("Use simple ATS-friendly headings: Experience, Skills, Education, Projects, and Certifications.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Strong resume foundation. Fine-tune the top third for the exact job description and keep achievements quantified.");
  }

  return suggestions;
}

function renderTagList(container, tags, emptyText) {
  container.innerHTML = "";
  (tags.length ? tags : [emptyText]).forEach((tag) => {
    const item = document.createElement("span");
    item.textContent = tag;
    container.appendChild(item);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(() => {
    alert("Copy failed. Please try again.");
  });
}

function renderParsedDetails(parsed) {
  const rows = [
    ["Name", parsed.name],
    ["Email", parsed.email],
    ["Phone", parsed.phone],
    ["Skills", parsed.skills.length ? parsed.skills.join(", ") : "Not detected"],
    ["Languages", parsed.languages.length ? parsed.languages.join(", ") : "Not detected"],
    ["Education", parsed.education],
    ["Experience", parsed.experience],
    ["Projects", parsed.projects],
    ["Certifications", parsed.certifications],
  ];

  parsedDetails.innerHTML = "";
  rows.forEach(([label, value]) => {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    const copyBtn = document.createElement("button");
    
    term.textContent = label;
    description.textContent = value.length > 220 ? `${value.slice(0, 220)}...` : value;
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", `Copy ${label}`);
    copyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(value).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      }).catch(() => {
        alert("Copy failed. Please try again.");
      });
    });
    
    parsedDetails.append(term, description, copyBtn);
  });
}

function renderSummary(result, role) {
  const skillText = result.parsed.skills.slice(0, 5).join(", ") || "no clear skills detected yet";
  const contactText = result.hasContact ? "Contact details are present" : "Contact details need attention";
  const candidateText = result.parsed.name === "Not found" ? "This resume" : result.parsed.name;
  resumeSummary.textContent = `${candidateText} is positioned for ${role || "the target role"} with ${skillText}. ${contactText}, and the resume shows ${result.metricCount} measurable achievement signal(s).`;
}

function analyze() {
  const text = resumeText.value.trim();
  const role = document.querySelector("#jobTitle").value.trim();
  const jdText = jobDescription.value.trim();
  textQualityMessage.textContent = "";
  textQualityMessage.classList.remove("warning");

  if (!text) {
    analysisIntro.textContent = "Paste resume text first so the analyzer has something useful to read.";
    suggestionList.innerHTML =
      "<li>Upload a TXT/MD file, or paste the resume text from your PDF/DOCX into the text area.</li>";
    scoreValue.textContent = "--";
    scoreValueMirror.textContent = "--";
    scoreBar.style.width = "0%";
    scoreNote.textContent = "No resume text was found yet, so ATS prediction cannot be calculated.";
    resumeSummary.textContent = "Summary will appear after analysis.";
    parsedDetails.innerHTML = "";
    renderTagList(strengthTags, [], "waiting for resume text");
    renderTagList(missingSkillTags, [], "waiting for job description");
    return;
  }

  if (isLikelyBadExtraction(text)) {
    textQualityMessage.textContent =
      "The uploaded file text looks corrupted. Paste clean resume text here for accurate name, sections, suggestions, and ATS score.";
    textQualityMessage.classList.add("warning");
  }

  const result = scoreResume(text, role, jdText);
  const roundedScore = Math.round(result.total);
  const color = roundedScore >= 75 ? "var(--green)" : roundedScore >= 55 ? "var(--amber)" : "var(--red)";

  scoreValue.textContent = roundedScore;
  scoreValueMirror.textContent = roundedScore;
  scoreBar.style.width = `${roundedScore}%`;
  scoreBar.style.background = color;
  scoreNote.textContent =
    roundedScore >= 75
      ? "Likely ATS-friendly for this role. Keep tailoring keywords per job posting."
      : roundedScore >= 55
        ? "Moderate ATS fit. A few keyword and impact edits should lift this quickly."
        : "Low ATS fit right now. Improve keywords, section headings, and quantified achievements.";

  keywordMetric.textContent = percent(result.keywordScore);
  matchMetric.textContent = percent(result.jobMatchScore);
  formatMetric.textContent = percent(result.formatScore);
  analysisIntro.textContent = `Analysis based on ${result.wordCount} words for ${role || "your target role"}.`;

  suggestionList.innerHTML = "";
  buildSuggestions(result, role, Boolean(jdText)).forEach((suggestion) => {
    const item = document.createElement("li");
    item.textContent = suggestion;
    suggestionList.appendChild(item);
  });

  renderSummary(result, role);
  renderParsedDetails(result.parsed);
  renderTagList(strengthTags, unique([...result.parsed.skills, ...result.matchedKeywords]).slice(0, 14), "no skills detected");
  renderTagList(
    missingSkillTags,
    (jdText ? result.missingJobSkills : result.missingKeywords).slice(0, 12),
    jdText ? "no major skill gaps detected" : "add a job description for skill gap analysis",
  );
}

function showFileMessage(message) {
  analysisIntro.textContent = message;
  suggestionList.innerHTML = `<li>${message}</li>`;
  scoreValue.textContent = "--";
  scoreValueMirror.textContent = "--";
  scoreBar.style.width = "0%";
  scoreNote.textContent = "ATS score prediction will appear once resume text is available.";
}

function extractReadablePdfText(rawText) {
  const chunks = [];
  const textObjects = rawText.match(/\((?:\\.|[^\\)])*\)/g) || [];

  textObjects.forEach((part) => {
    const cleaned = part
      .slice(1, -1)
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");

    if (/[a-zA-Z]{3,}/.test(cleaned)) {
      chunks.push(cleaned);
    }
  });

  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

function handleFile(file) {
  if (!file) return;
  fileLabel.textContent = file.name;

  if (/\.(txt|md)$/i.test(file.name)) {
    const reader = new FileReader();
    reader.onload = () => {
      resumeText.value = reader.result;
      analyze();
    };
    reader.readAsText(file);
    return;
  }

  if (/\.pdf$/i.test(file.name)) {
    const reader = new FileReader();
    reader.onload = () => {
      const rawText = new TextDecoder("latin1").decode(reader.result);
      const extractedText = extractReadablePdfText(rawText);

      if (extractedText.length > 120) {
        resumeText.value = extractedText;
        if (isLikelyBadExtraction(extractedText)) {
          resumeText.placeholder = `${file.name} was read, but the text looks corrupted. Paste clean resume text here for better results.`;
        }
        analyze();
        return;
      }

      resumeText.value = "";
      resumeText.placeholder = `${file.name} selected, but the PDF text could not be extracted in this browser. Paste the resume text here.`;
      showFileMessage("This PDF appears to use compressed or scanned text. Paste the resume text to get AI suggestions and ATS score.");
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  resumeText.value = "";
  resumeText.placeholder = `${file.name} selected. Paste the resume text here for analysis.`;
  showFileMessage("DOC/DOCX files cannot be read directly in this browser-only version. Paste the resume text to get suggestions and ATS score.");
}

resumeFile.addEventListener("change", (event) => handleFile(event.target.files[0]));
analyzeButton.addEventListener("click", analyze);

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  });
});

dropZone.addEventListener("drop", (event) => {
  handleFile(event.dataTransfer.files[0]);
});

const exportBtn = document.querySelector("#exportBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const rows = Array.from(parsedDetails.querySelectorAll("dt")).map((dt, idx) => {
      const dd = dt.nextElementSibling;
      return `${dt.textContent}: ${dd.textContent}`;
    });
    const exportText = rows.join("\n");
    navigator.clipboard.writeText(exportText).then(() => {
      const btn = exportBtn;
      const originalText = btn.textContent;
      btn.textContent = "Exported to Clipboard!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }).catch(() => {
      alert("Export failed. Please try again.");
    });
  });
}

renderTagList(strengthTags, [], "waiting for resume text");
renderTagList(missingSkillTags, [], "add a job description for skill gap analysis");
