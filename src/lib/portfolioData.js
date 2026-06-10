import {
  AiFillGithub,
  AiFillHtml5,
  AiFillMail,
  AiFillLinkedin,
} from "react-icons/ai";
import { DiCss3, DiJava, DiMongodb, DiNodejs } from "react-icons/di";
import {
  FaAws,
  FaCode,
  FaDatabase,
  FaDocker,
  FaFileAlt,
  FaLinux,
  FaMicrochip,
  FaNetworkWired,
  FaRobot,
  FaServer,
  FaTools,
} from "react-icons/fa";
import {
  SiApacheairflow,
  SiApachekafka,
  SiApachespark,
  SiExpress,
  SiFastapi,
  SiGithubactions,
  SiJavascript,
  SiMysql,
  SiNextdotjs,
  SiPostgresql,
  SiPostman,
  SiPrisma,
  SiPython,
  SiReact,
  SiSelenium,
  SiSpringboot,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

import {
  aboutHighlights,
  aboutMe,
  achievements,
  contactInfo,
  educationList,
  experiences,
  navLinks,
  profilePhoto,
  projects,
  projectTabs,
  resumeLink,
  skills,
  socialMedia,
} from "../constants";
import { gdsc, raafidMark, vitLogo } from "../assets";
import { isSupabaseConfigured, supabase } from "./supabase";

export const portfolioCategories = [
  "Major Projects",
  "Backend & APIs",
  "Frontend/UI",
  "AI/Data/Automation",
  "Systems & IoT",
];

const hasRows = (data) => Array.isArray(data) && data.length > 0;

const iconByName = new Map(
  [
    ["api", FaServer],
    ["api integration", FaServer],
    ["apis", FaServer],
    ["airflow", SiApacheairflow],
    ["arduino c", FaCode],
    ["athena", FaDatabase],
    ["aws glue", FaAws],
    ["aws s3", FaAws],
    ["backstopjs", FaTools],
    ["c", FaCode],
    ["c++", FaCode],
    ["cache simulation", FaDatabase],
    ["cassandra", FaDatabase],
    ["chromadb", FaDatabase],
    ["computer architecture", FaMicrochip],
    ["concurrency", FaServer],
    ["css", DiCss3],
    ["docker", FaDocker],
    ["esp8266", FaMicrochip],
    ["express", SiExpress],
    ["express.js", SiExpress],
    ["fastapi", SiFastapi],
    ["flask", SiFastapi],
    ["geojson", FaDatabase],
    ["geopandas", FaDatabase],
    ["git", FaTools],
    ["github", AiFillGithub],
    ["github actions", SiGithubactions],
    ["github api", AiFillGithub],
    ["html", AiFillHtml5],
    ["i2c", FaMicrochip],
    ["java", DiJava],
    ["javascript", SiJavascript],
    ["jwt", FaServer],
    ["kafka", SiApachekafka],
    ["linux", FaLinux],
    ["logging middleware", FaTools],
    ["lost pixel", FaTools],
    ["machine learning", FaRobot],
    ["mongodb", DiMongodb],
    ["mysql", SiMysql],
    ["next.js", SiNextdotjs],
    ["nlp", FaRobot],
    ["node.js", DiNodejs],
    ["numpy/scipy", FaRobot],
    ["openai/gemini", FaRobot],
    ["pandas", FaDatabase],
    ["playwright", FaTools],
    ["postgreSQL".toLowerCase(), SiPostgresql],
    ["postman", SiPostman],
    ["prisma", SiPrisma],
    ["puppeteer", FaTools],
    ["python", SiPython],
    ["rasterio", FaTools],
    ["react", SiReact],
    ["react flow", FaNetworkWired],
    ["react.js", SiReact],
    ["redis", FaDatabase],
    ["render", FaServer],
    ["rest apis", FaServer],
    ["scikit-learn", FaRobot],
    ["selenium", SiSelenium],
    ["shapely", FaNetworkWired],
    ["spark", SiApachespark],
    ["spring boot", SiSpringboot],
    ["spring mvc", FaServer],
    ["spring security", FaServer],
    ["sql", FaDatabase],
    ["supabase", SiSupabase],
    ["swagger", FaCode],
    ["systems", FaTools],
    ["system monitoring", FaTools],
    ["tailwind css", SiTailwindcss],
    ["tensorflow/keras", FaRobot],
    ["thymleaf", FaCode],
    ["thymeleaf", FaCode],
    ["typescript", SiTypescript],
    ["ui", FaCode],
    ["vercel", SiVercel],
    ["visual testing", FaTools],
    ["visual regression testing", FaTools],
    ["vite", FaCode],
    ["zustand", FaDatabase],
  ].map(([name, icon]) => [name.toLowerCase(), icon]),
);

const getIcon = (name) => iconByName.get(String(name).toLowerCase()) || FaCode;

const toSlug = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const fallbackSiteContent = {
  hero: {
    greeting: "Hey, I am",
    name: aboutMe.name,
    tagline: aboutMe.tagLine,
    description: aboutMe.intro,
  },
  about: {
    heading: aboutMe.aboutHeading,
    paragraph: aboutMe.aboutParagraph,
    highlights: aboutHighlights.map((highlight) => ({
      title: highlight.title,
      text: highlight.content,
    })),
  },
  contact: {
    heading: contactInfo.heading,
    text: contactInfo.text,
    email: contactInfo.email,
    phone: contactInfo.phone,
    github: contactInfo.github,
    linkedin: contactInfo.linkedin,
    website: "",
  },
  profile: {
    profile_photo_url: profilePhoto,
  },
  resume: {
    resume_url: resumeLink,
  },
};

export const localPortfolioRows = {
  site_content: fallbackSiteContent,
  projects: projects.map((project, index) => ({
    title: project.title,
    category: project.tab,
    description: project.content,
    tech_stack: project.stack.map((item) => item.name),
    code_url: project.github || null,
    live_url: project.link || null,
    thumbnail_text: project.thumbnailText || null,
    image_url: project.image || null,
    sort_order: index,
    is_visible: true,
  })),
  skills: skills.map((group, index) => ({
    group_name: group.title,
    items: group.items.map((item) => item.name),
    sort_order: index,
    is_visible: true,
  })),
  experience: experiences.flatMap((experience, experienceIndex) =>
    experience.positions.map((position, positionIndex) => ({
      title: position.title,
      company: experience.organisation,
      location: experience.location || null,
      duration: position.duration || null,
      bullets: position.content.map((item) => item.text),
      sort_order: experienceIndex + positionIndex,
      is_visible: true,
    })),
  ),
  education: educationList.map((education, index) => ({
    degree: education.degree,
    institution: education.title,
    location: null,
    duration: education.duration,
    score: education.content1,
    description: education.content2,
    logo_url: null,
    sort_order: index,
    is_visible: true,
  })),
  achievements: achievements.map((achievement, index) => ({
    title: achievement.position,
    organization: achievement.event,
    description: achievement.content1,
    link_url: null,
    sort_order: index,
    is_visible: true,
  })),
};

const normalizeSiteContent = (rowsOrObject = fallbackSiteContent) => {
  const fromRows = Array.isArray(rowsOrObject)
    ? rowsOrObject.reduce(
        (content, row) => ({
          ...content,
          [row.key]: row.value,
        }),
        {},
      )
    : rowsOrObject;

  const legacyAbout = fromRows.about_me || {};
  const legacyContact = fromRows.contact || {};

  return {
    hero: {
      ...fallbackSiteContent.hero,
      ...(fromRows.hero || {}),
      name: fromRows.hero?.name || legacyAbout.name || fallbackSiteContent.hero.name,
      tagline:
        fromRows.hero?.tagline ||
        legacyAbout.tagLine ||
        fallbackSiteContent.hero.tagline,
      description:
        fromRows.hero?.description ||
        legacyAbout.intro ||
        fallbackSiteContent.hero.description,
    },
    about: {
      ...fallbackSiteContent.about,
      ...(fromRows.about || {}),
      heading:
        fromRows.about?.heading ||
        legacyAbout.aboutHeading ||
        fallbackSiteContent.about.heading,
      paragraph:
        fromRows.about?.paragraph ||
        legacyAbout.aboutParagraph ||
        fallbackSiteContent.about.paragraph,
      highlights:
        fromRows.about?.highlights ||
        fromRows.about_highlights?.map((highlight) => ({
          title: highlight.title,
          text: highlight.text || highlight.content,
        })) ||
        fallbackSiteContent.about.highlights,
    },
    contact: {
      ...fallbackSiteContent.contact,
      ...legacyContact,
      ...(fromRows.contact || {}),
    },
    profile: {
      ...fallbackSiteContent.profile,
      ...(fromRows.profile || {}),
      profile_photo_url:
        fromRows.profile?.profile_photo_url ||
        fromRows.profile_photo_url ||
        fallbackSiteContent.profile.profile_photo_url,
    },
    resume: {
      ...fallbackSiteContent.resume,
      ...(fromRows.resume || {}),
      resume_url:
        fromRows.resume?.resume_url ||
        fromRows.resume_url ||
        legacyContact.resume ||
        fallbackSiteContent.resume.resume_url,
    },
  };
};

const normalizeProjects = (rows) =>
  rows.map((project, index) => ({
    id: project.id || `${toSlug(project.title)}-${index}`,
    tab: project.category,
    title: project.title,
    category: project.category,
    github: project.code_url || "",
    link: project.live_url || "",
    content: project.description,
    image: project.image_url || "",
    thumbnailText:
      project.thumbnail_text ||
      project.title
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    stack: normalizeStringArray(project.tech_stack).map((name, stackIndex) => ({
      id: `${toSlug(project.title)}-stack-${stackIndex}`,
      icon: getIcon(name),
      name,
    })),
  }));

const normalizeSkills = (rows) =>
  rows.map((group, index) => ({
    title: group.group_name,
    items: normalizeStringArray(group.items).map((name, itemIndex) => ({
      id: `${toSlug(group.group_name)}-${itemIndex}`,
      icon: getIcon(name),
      name,
    })),
    sort_order: group.sort_order ?? index,
  }));

const normalizeExperience = (rows) =>
  rows.map((experience, index) => ({
    organisation: experience.company,
    logo: raafidMark,
    link: "",
    location: experience.location || "",
    positions: [
      {
        title: experience.title,
        duration: experience.duration || "",
        content: normalizeStringArray(experience.bullets).map((text) => ({
          text,
          link: "",
        })),
      },
    ],
    sort_order: experience.sort_order ?? index,
  }));

const normalizeEducation = (rows) =>
  rows.map((education, index) => ({
    id: education.id || `${toSlug(education.institution)}-${index}`,
    icon: education.logo_url || (index === 0 ? vitLogo : raafidMark),
    title: education.institution,
    degree: education.degree,
    duration: education.duration || "",
    content1: education.score || "",
    content2: education.description || "",
    sort_order: education.sort_order ?? index,
  }));

const normalizeAchievements = (rows) =>
  rows.map((achievement, index) => ({
    id: achievement.id || `${toSlug(achievement.title)}-${index}`,
    icon: achievement.organization?.includes("Google DSC") ? gdsc : null,
    thumbnailText:
      achievement.thumbnail_text ||
      achievement.organization
        ?.split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() ||
      "A",
    event: achievement.organization || "",
    position: achievement.title,
    content1: achievement.description || "",
    project: achievement.link_url || "",
    sort_order: achievement.sort_order ?? index,
  }));

const normalizePortfolioData = ({
  site_content = fallbackSiteContent,
  projects: projectRows = localPortfolioRows.projects,
  skills: skillRows = localPortfolioRows.skills,
  experience: experienceRows = localPortfolioRows.experience,
  education: educationRows = localPortfolioRows.education,
  achievements: achievementRows = localPortfolioRows.achievements,
} = {}) => {
  const siteContent = normalizeSiteContent(site_content);

  return {
    siteContent,
    projectTabs,
    projects: normalizeProjects(projectRows),
    skills: normalizeSkills(skillRows),
    experiences: normalizeExperience(experienceRows),
    educationList: normalizeEducation(educationRows),
    achievements: normalizeAchievements(achievementRows),
    navLinks: navLinks.map((link) =>
      link.id === "resume"
        ? { ...link, link: siteContent.resume.resume_url || resumeLink }
        : link,
    ),
    socialMedia: socialMedia.map((link) =>
      link.id === "social-media-resume"
        ? { ...link, link: siteContent.resume.resume_url || resumeLink }
        : link,
    ),
  };
};

export const localPortfolioData = normalizePortfolioData(localPortfolioRows);

const queryRows = async (table, fallback) => {
  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });

    if (error || !hasRows(data)) {
      if (error) {
        console.warn(`Falling back to local ${table}:`, error.message);
      }
      return fallback;
    }

    return data;
  } catch (error) {
    console.warn(`Falling back to local ${table}:`, error);
    return fallback;
  }
};

export const getSiteContentRows = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackSiteContent;
  }

  try {
    const { data, error } = await supabase.from("site_content").select("*");

    if (error || !hasRows(data)) {
      if (error) {
        console.warn("Falling back to local site content:", error.message);
      }
      return fallbackSiteContent;
    }

    return data;
  } catch (error) {
    console.warn("Falling back to local site content:", error);
    return fallbackSiteContent;
  }
};

export const getProjects = () => queryRows("projects", localPortfolioRows.projects);
export const getSkills = () => queryRows("skills", localPortfolioRows.skills);
export const getExperience = () =>
  queryRows("experience", localPortfolioRows.experience);
export const getEducation = () =>
  queryRows("education", localPortfolioRows.education);
export const getAchievements = () =>
  queryRows("achievements", localPortfolioRows.achievements);
export const getSiteContent = async () =>
  normalizeSiteContent(await getSiteContentRows());

export const getPortfolioData = async () => {
  const [site_content, projectRows, skillRows, experienceRows, educationRows, achievementRows] =
    await Promise.all([
      getSiteContentRows(),
      getProjects(),
      getSkills(),
      getExperience(),
      getEducation(),
      getAchievements(),
    ]);

  return normalizePortfolioData({
    site_content,
    projects: projectRows,
    skills: skillRows,
    experience: experienceRows,
    education: educationRows,
    achievements: achievementRows,
  });
};

export const getRawTableRows = async (table) => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getTableCount = async (table) => {
  if (!isSupabaseConfigured || !supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count || 0;
};

export const upsertSiteContentValue = async (key, value) => {
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    throw error;
  }
};
