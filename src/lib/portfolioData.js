import {
  aboutHighlights,
  aboutMe,
  achievements,
  contactInfo,
  educationList,
  experiences,
  profilePhoto,
  projects,
  resumeLink,
  skills,
} from "../constants";
import { isSupabaseConfigured, supabase } from "./supabase";

const hasRows = (data) => Array.isArray(data) && data.length > 0;

const queryOrFallback = async (query, fallback) => {
  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  try {
    const { data, error } = await query();

    if (error || !hasRows(data)) {
      return fallback;
    }

    return data;
  } catch {
    return fallback;
  }
};

const projectFallback = projects.map((project, index) => ({
  id: project.id,
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
}));

const skillFallback = skills.map((group, index) => ({
  id: group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  group_name: group.title,
  items: group.items.map((item) => item.name),
  sort_order: index,
  is_visible: true,
}));

const experienceFallback = experiences.flatMap((experience, experienceIndex) =>
  experience.positions.map((position, positionIndex) => ({
    id: `${experience.organisation}-${position.title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
    title: position.title,
    company: experience.organisation,
    location: experience.location || null,
    duration: position.duration || null,
    bullets: position.content.map((item) => item.text),
    sort_order: experienceIndex + positionIndex,
    is_visible: true,
  })),
);

const educationFallback = educationList.map((education, index) => ({
  id: education.id,
  degree: education.degree,
  institution: education.title,
  location: null,
  duration: education.duration,
  score: education.content1,
  description: education.content2,
  logo_url: null,
  sort_order: index,
  is_visible: true,
}));

const achievementFallback = achievements.map((achievement, index) => ({
  id: achievement.id,
  title: achievement.position,
  organization: achievement.event,
  description: achievement.content1,
  link_url: null,
  sort_order: index,
  is_visible: true,
}));

const siteContentFallback = {
  about_highlights: aboutHighlights,
  about_me: aboutMe,
  contact: contactInfo,
  profile_photo_url: profilePhoto,
  resume_url: resumeLink,
};

export const getProjects = () =>
  queryOrFallback(
    () =>
      supabase
        .from("projects")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true }),
    projectFallback,
  );

export const getSkills = () =>
  queryOrFallback(
    () =>
      supabase
        .from("skills")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
    skillFallback,
  );

export const getExperience = () =>
  queryOrFallback(
    () =>
      supabase
        .from("experience")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
    experienceFallback,
  );

export const getEducation = () =>
  queryOrFallback(
    () =>
      supabase
        .from("education")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
    educationFallback,
  );

export const getAchievements = () =>
  queryOrFallback(
    () =>
      supabase
        .from("achievements")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
    achievementFallback,
  );

export const getSiteContent = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return siteContentFallback;
  }

  try {
    const { data, error } = await supabase.from("site_content").select("*");

    if (error || !hasRows(data)) {
      return siteContentFallback;
    }

    return data.reduce(
      (content, row) => ({
        ...content,
        [row.key]: row.value,
      }),
      {},
    );
  } catch {
    return siteContentFallback;
  }
};
