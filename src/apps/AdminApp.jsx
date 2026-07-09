import { useEffect, useMemo, useState } from "react";

import {
  fallbackSiteContent,
  getRawTableRows,
  getTableCount,
  localPortfolioRows,
  portfolioCategories,
  upsertSiteContentValue,
} from "../lib/portfolioData";
import { adminEmail, isSupabaseConfigured, supabase } from "../lib/supabase";

const storageBucket = "portfolio-assets";

const sections = [
  "Dashboard",
  "Projects",
  "Site Content",
  "Skills",
  "Experience",
  "Education",
  "Achievements",
  "Assets",
  "Visitors",
  "Settings",
];

const countTables = ["projects", "skills", "experience", "education", "achievements"];

const emptyProject = {
  title: "",
  category: portfolioCategories[0],
  description: "",
  tech_stack: [],
  code_url: "",
  live_url: "",
  thumbnail_text: "",
  image_url: "",
  sort_order: 0,
  is_visible: true,
};

const emptyRows = {
  projects: emptyProject,
  skills: {
    group_name: "",
    items: [],
    sort_order: 0,
    is_visible: true,
  },
  experience: {
    title: "",
    company: "",
    location: "",
    duration: "",
    bullets: [],
    sort_order: 0,
    is_visible: true,
  },
  education: {
    degree: "",
    institution: "",
    location: "",
    duration: "",
    score: "",
    description: "",
    logo_url: "",
    sort_order: 0,
    is_visible: true,
  },
  achievements: {
    title: "",
    organization: "",
    description: "",
    link_url: "",
    sort_order: 0,
    is_visible: true,
  },
};

const tableConfigs = {
  projects: {
    title: "Projects",
    table: "projects",
    unique: (row) => `${row.title}|${row.category}`,
    required: ["title", "category", "description"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "category", label: "Category", type: "select", options: portfolioCategories },
      { key: "description", label: "Description", type: "textarea" },
      { key: "tech_stack", label: "Tech stack", type: "csv" },
      { key: "code_url", label: "Code URL", type: "url" },
      { key: "live_url", label: "Live URL", type: "url" },
      { key: "thumbnail_text", label: "Thumbnail text", type: "text" },
      { key: "image_url", label: "Image URL", type: "url" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_visible", label: "Visible", type: "checkbox" },
    ],
  },
  skills: {
    title: "Skills",
    table: "skills",
    unique: (row) => row.group_name,
    required: ["group_name"],
    fields: [
      { key: "group_name", label: "Group name", type: "text" },
      { key: "items", label: "Items", type: "csv" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_visible", label: "Visible", type: "checkbox" },
    ],
  },
  experience: {
    title: "Experience",
    table: "experience",
    unique: (row) => `${row.title}|${row.company}`,
    required: ["title", "company"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "bullets", label: "Bullets", type: "lines" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_visible", label: "Visible", type: "checkbox" },
    ],
  },
  education: {
    title: "Education",
    table: "education",
    unique: (row) => `${row.degree}|${row.institution}`,
    required: ["degree", "institution"],
    fields: [
      { key: "degree", label: "Degree", type: "text" },
      { key: "institution", label: "Institution", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "score", label: "Score", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "logo_url", label: "Logo URL", type: "url" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_visible", label: "Visible", type: "checkbox" },
    ],
  },
  achievements: {
    title: "Achievements",
    table: "achievements",
    unique: (row) => `${row.title}|${row.organization}`,
    required: ["title"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "organization", label: "Organization", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "link_url", label: "Link URL", type: "url" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_visible", label: "Visible", type: "checkbox" },
    ],
  },
};

const arrayToCsv = (value) => (Array.isArray(value) ? value.join(", ") : value || "");
const arrayToLines = (value) => (Array.isArray(value) ? value.join("\n") : value || "");

const parseCsv = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseLines = (value) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const cleanNullable = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const messageClass = (type) =>
  type === "error"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-[#31c0f4]/30 bg-[#31c0f4]/5 text-primary";

const AdminShell = ({ activeSection, children, onLogout, setActiveSection }) => (
  <main className="min-h-screen bg-white font-poppins text-primary">
    <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
      <aside className="border-b border-[#163269]/10 bg-white px-5 py-5 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <h1 className="text-xl font-normal tracking-tight text-primary">
          Raafid Portfolio Admin
        </h1>
        <p className="mt-2 text-sm font-light leading-6 text-[#4a5568]">
          Manage portfolio content, projects, resume, and profile assets.
        </p>
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sections.map((section) => (
            <button
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-left text-sm transition ${
                activeSection === section
                  ? "bg-secondary text-white"
                  : "text-[#4a5568] hover:bg-gray-50 hover:text-primary"
              }`}
              key={section}
              onClick={() => setActiveSection(section)}
              type="button"
            >
              {section}
            </button>
          ))}
        </nav>
        <button
          className="mt-6 hidden rounded-lg border border-[#163269]/10 px-4 py-2 text-sm font-medium text-primary transition hover:border-[#31c0f4]/50 hover:text-secondary lg:block"
          onClick={onLogout}
          type="button"
        >
          Logout
        </button>
      </aside>
      <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#163269]/10 pb-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary">
              {activeSection}
            </p>
            <h2 className="mt-2 text-2xl font-normal tracking-tight text-primary sm:text-3xl">
              Portfolio Admin
            </h2>
          </div>
          <button
            className="rounded-lg border border-[#163269]/10 px-4 py-2 text-sm font-medium text-primary transition hover:border-[#31c0f4]/50 hover:text-secondary lg:hidden"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </div>
        {children}
      </section>
    </div>
  </main>
);

const StatusMessage = ({ message }) =>
  message ? (
    <p className={`rounded-lg border px-4 py-3 text-sm font-light ${messageClass(message.type)}`}>
      {message.text}
    </p>
  ) : null;

const Field = ({ field, row, setRow }) => {
  const value = row[field.key] ?? "";

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-primary">
        <input
          checked={Boolean(value)}
          onChange={(event) => setRow({ ...row, [field.key]: event.target.checked })}
          type="checkbox"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block text-sm font-medium text-primary">
        {field.label}
        <select
          className="mt-2 w-full rounded-lg border border-[#163269]/10 px-3 py-2 text-sm font-light outline-none focus:border-[#31c0f4]"
          onChange={(event) => setRow({ ...row, [field.key]: event.target.value })}
          value={value}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea" || field.type === "csv" || field.type === "lines") {
    const textValue =
      field.type === "csv"
        ? arrayToCsv(value)
        : field.type === "lines"
          ? arrayToLines(value)
          : value;

    return (
      <label className="block text-sm font-medium text-primary md:col-span-2">
        {field.label}
        <textarea
          className="mt-2 min-h-24 w-full rounded-lg border border-[#163269]/10 px-3 py-2 text-sm font-light outline-none focus:border-[#31c0f4]"
          onChange={(event) =>
            setRow({
              ...row,
              [field.key]:
                field.type === "csv"
                  ? parseCsv(event.target.value)
                  : field.type === "lines"
                    ? parseLines(event.target.value)
                    : event.target.value,
            })
          }
          value={textValue}
        />
      </label>
    );
  }

  return (
    <label className="block text-sm font-medium text-primary">
      {field.label}
      <input
        className="mt-2 w-full rounded-lg border border-[#163269]/10 px-3 py-2 text-sm font-light outline-none focus:border-[#31c0f4]"
        onChange={(event) =>
          setRow({
            ...row,
            [field.key]:
              field.type === "number" ? Number(event.target.value) : event.target.value,
          })
        }
        type={field.type === "number" ? "number" : "text"}
        value={value ?? ""}
      />
    </label>
  );
};

const CrudEditor = ({ config, onSeed, refreshCounts }) => {
  const [rows, setRows] = useState([]);
  const [editingRow, setEditingRow] = useState({ ...emptyRows[config.table] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadRows = async () => {
    setLoading(true);
    setMessage(null);

    try {
      setRows(await getRawTableRows(config.table));
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [config.table]);

  const resetForm = () => setEditingRow({ ...emptyRows[config.table] });

  const saveRow = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const missingField = config.required.find((field) => !editingRow[field]);
    if (missingField) {
      setLoading(false);
      setMessage({ type: "error", text: `${missingField} is required.` });
      return;
    }

    try {
      const payload = Object.fromEntries(
        Object.entries(editingRow).map(([key, value]) => [
          key,
          ["code_url", "live_url", "image_url", "logo_url", "link_url"].includes(key)
            ? cleanNullable(value)
            : value,
        ]),
      );

      const { error } = await supabase
        .from(config.table)
        .upsert(payload, { onConflict: "id" });

      if (error) {
        throw error;
      }

      resetForm();
      await loadRows();
      await refreshCounts();
      setMessage({ type: "success", text: `${config.title} saved.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteRow = async (row) => {
    if (!window.confirm(`Delete "${row.title || row.group_name || row.institution}"?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.from(config.table).delete().eq("id", row.id);

      if (error) {
        throw error;
      }

      await loadRows();
      await refreshCounts();
      setMessage({ type: "success", text: `${config.title} row deleted.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisible = async (row) => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from(config.table)
        .update({ is_visible: !row.is_visible })
        .eq("id", row.id);

      if (error) {
        throw error;
      }

      await loadRows();
      setMessage({ type: "success", text: "Visibility updated." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const seedTable = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const inserted = await onSeed(config.table);
      await loadRows();
      await refreshCounts();
      setMessage({ type: "success", text: `Seeded ${inserted} missing row(s).` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-light text-[#4a5568]">
          {loading ? "Loading..." : `${rows.length} row(s)`}
        </p>
        {rows.length === 0 ? (
          <button className="button-primary" onClick={seedTable} type="button">
            Seed from local data
          </button>
        ) : null}
      </div>
      <StatusMessage message={message} />

      <form className="rounded-lg border border-[#163269]/10 p-5" onSubmit={saveRow}>
        <h3 className="mb-4 text-lg font-normal text-primary">
          {editingRow.id ? "Edit row" : "Add row"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => (
            <Field
              field={field}
              key={field.key}
              row={editingRow}
              setRow={setEditingRow}
            />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="button-primary" disabled={loading} type="submit">
            {editingRow.id ? "Save changes" : "Add row"}
          </button>
          <button
            className="rounded-lg border border-[#163269]/10 px-4 py-2 text-sm text-primary"
            onClick={resetForm}
            type="button"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="grid gap-3">
        {rows.map((row) => (
          <article
            className="rounded-lg border border-[#163269]/10 bg-white p-4"
            key={row.id}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-medium text-primary">
                  {row.title || row.group_name || row.institution}
                </h3>
                <p className="mt-1 text-sm font-light text-[#4a5568]">
                  {row.category || row.company || row.organization || row.degree}
                </p>
                <p className="mt-1 text-xs font-light text-[#4a5568]">
                  Sort: {row.sort_order} | {row.is_visible ? "Visible" : "Hidden"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg border border-[#163269]/10 px-3 py-2 text-sm text-primary"
                  onClick={() => setEditingRow(row)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="rounded-lg border border-[#163269]/10 px-3 py-2 text-sm text-primary"
                  onClick={() => toggleVisible(row)}
                  type="button"
                >
                  {row.is_visible ? "Hide" : "Show"}
                </button>
                <button
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
                  onClick={() => deleteRow(row)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ counts, loading, onSeedInitialData }) => {
  const hasEmptyTables = countTables.some((table) => counts[table] === 0);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#31c0f4]/40 bg-[#31c0f4]/5 p-5">
        <p className="text-sm font-medium text-secondary">Status</p>
        <h3 className="mt-2 text-xl font-normal text-primary">
          Admin editor ready
        </h3>
        <p className="mt-2 text-sm font-light text-[#4a5568]">
          CRUD editing is available for portfolio tables. Public data still falls
          back to local constants if Supabase is empty or unavailable.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countTables.map((table) => (
          <article className="rounded-lg border border-[#163269]/10 p-5" key={table}>
            <p className="text-sm font-light capitalize text-[#4a5568]">
              {table}
            </p>
            <p className="mt-2 text-3xl font-normal text-primary">
              {counts[table] ?? 0}
            </p>
          </article>
        ))}
      </section>
      {hasEmptyTables ? (
        <button
          className="button-primary w-fit"
          disabled={loading}
          onClick={onSeedInitialData}
          type="button"
        >
          {loading ? "Seeding..." : "Seed Initial Data"}
        </button>
      ) : null}
    </div>
  );
};

const SiteContentEditor = () => {
  const [content, setContent] = useState(fallbackSiteContent);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadContent = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.from("site_content").select("*");

      if (error) {
        throw error;
      }

      const loaded = (data || []).reduce(
        (nextContent, row) => ({ ...nextContent, [row.key]: row.value }),
        fallbackSiteContent,
      );
      setContent(loaded);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const updateSection = (section, value) =>
    setContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        ...value,
      },
    }));

  const saveContent = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await Promise.all(
        ["hero", "about", "contact", "profile", "resume"].map((key) =>
          upsertSiteContentValue(key, content[key] || {}),
        ),
      );
      setMessage({ type: "success", text: "Site content saved." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const highlightsText = (content.about.highlights || [])
    .map((highlight) => `${highlight.title || ""} | ${highlight.text || ""}`)
    .join("\n");

  return (
    <div className="grid gap-5">
      <StatusMessage message={message} />
      <section className="grid gap-4 rounded-lg border border-[#163269]/10 p-5 md:grid-cols-2">
        <FieldGroup title="Hero">
          <TextInput
            label="Greeting"
            onChange={(value) => updateSection("hero", { greeting: value })}
            value={content.hero.greeting}
          />
          <TextInput
            label="Name"
            onChange={(value) => updateSection("hero", { name: value })}
            value={content.hero.name}
          />
          <TextInput
            label="Tagline"
            onChange={(value) => updateSection("hero", { tagline: value })}
            value={content.hero.tagline}
          />
          <TextArea
            label="Description"
            onChange={(value) => updateSection("hero", { description: value })}
            value={content.hero.description}
          />
        </FieldGroup>
        <FieldGroup title="About">
          <TextInput
            label="Heading"
            onChange={(value) => updateSection("about", { heading: value })}
            value={content.about.heading}
          />
          <TextArea
            label="Paragraph"
            onChange={(value) => updateSection("about", { paragraph: value })}
            value={content.about.paragraph}
          />
          <TextArea
            label="Highlights, one per line: title | text"
            onChange={(value) =>
              updateSection("about", {
                highlights: value
                  .split(/\r?\n/)
                  .map((line) => {
                    const [title, ...text] = line.split("|");
                    return { title: title?.trim(), text: text.join("|").trim() };
                  })
                  .filter((highlight) => highlight.title || highlight.text),
              })
            }
            value={highlightsText}
          />
        </FieldGroup>
        <FieldGroup title="Contact">
          {["email", "phone", "github", "linkedin", "website"].map((field) => (
            <TextInput
              key={field}
              label={field}
              onChange={(value) => updateSection("contact", { [field]: value })}
              value={content.contact[field] || ""}
            />
          ))}
        </FieldGroup>
        <FieldGroup title="Profile and Resume">
          <TextInput
            label="Profile photo URL"
            onChange={(value) => updateSection("profile", { profile_photo_url: value })}
            value={content.profile.profile_photo_url || ""}
          />
          <TextInput
            label="Resume URL"
            onChange={(value) => updateSection("resume", { resume_url: value })}
            value={content.resume.resume_url || ""}
          />
        </FieldGroup>
      </section>
      <button className="button-primary w-fit" disabled={loading} onClick={saveContent} type="button">
        {loading ? "Saving..." : "Save Site Content"}
      </button>
    </div>
  );
};

const FieldGroup = ({ children, title }) => (
  <div className="grid gap-3">
    <h3 className="text-lg font-normal text-primary">{title}</h3>
    {children}
  </div>
);

const TextInput = ({ label, onChange, value }) => (
  <label className="block text-sm font-medium text-primary">
    {label}
    <input
      className="mt-2 w-full rounded-lg border border-[#163269]/10 px-3 py-2 text-sm font-light outline-none focus:border-[#31c0f4]"
      onChange={(event) => onChange(event.target.value)}
      value={value || ""}
    />
  </label>
);

const TextArea = ({ label, onChange, value }) => (
  <label className="block text-sm font-medium text-primary">
    {label}
    <textarea
      className="mt-2 min-h-24 w-full rounded-lg border border-[#163269]/10 px-3 py-2 text-sm font-light outline-none focus:border-[#31c0f4]"
      onChange={(event) => onChange(event.target.value)}
      value={value || ""}
    />
  </label>
);

const AssetsPage = ({ refreshProjects }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  useEffect(() => {
    getRawTableRows("projects")
      .then((rows) => {
        setProjects(rows);
        setSelectedProjectId(rows[0]?.id || "");
      })
      .catch((error) => setMessage({ type: "error", text: error.message }));
  }, []);

  const uploadFile = async ({ accept, file, path, saveUrl }) => {
    setLoading(true);
    setMessage(null);
    setUploadedUrl("");

    try {
      if (!file) {
        throw new Error("Choose a file first.");
      }

      const ext = file.name.split(".").pop().toLowerCase();
      if (!accept.includes(ext)) {
        throw new Error(`Invalid file type. Allowed: ${accept.join(", ")}`);
      }

      const { error } = await supabase.storage
        .from(storageBucket)
        .upload(path(ext, file), file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(storageBucket).getPublicUrl(path(ext, file));

      if (saveUrl) {
        await saveUrl(publicUrl);
      }

      setUploadedUrl(publicUrl);
      setMessage({ type: "success", text: "Upload complete." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const safeFileName = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div className="grid gap-5">
      <StatusMessage message={message} />
      {uploadedUrl ? (
        <p className="rounded-lg border border-[#163269]/10 p-4 text-sm font-light text-[#4a5568]">
          Uploaded URL:{" "}
          <a className="text-secondary" href={uploadedUrl} rel="noreferrer" target="_blank">
            {uploadedUrl}
          </a>
        </p>
      ) : null}
      <UploadCard
        disabled={loading}
        label="Upload profile photo"
        onUpload={(file) =>
          uploadFile({
            accept: ["jpg", "jpeg", "png", "webp"],
            file,
            path: (ext) => `profile/raafid-profile.${ext}`,
            saveUrl: (publicUrl) =>
              upsertSiteContentValue("profile", { profile_photo_url: publicUrl }),
          })
        }
      />
      <UploadCard
        disabled={loading}
        label="Upload resume PDF"
        onUpload={(file) =>
          uploadFile({
            accept: ["pdf"],
            file,
            path: () => "resume/resume.pdf",
            saveUrl: (publicUrl) =>
              upsertSiteContentValue("resume", { resume_url: publicUrl }),
          })
        }
      />
      <section className="rounded-lg border border-[#163269]/10 p-5">
        <h3 className="text-lg font-normal text-primary">Upload project image</h3>
        <select
          className="mt-3 w-full rounded-lg border border-[#163269]/10 px-3 py-2 text-sm font-light outline-none focus:border-[#31c0f4]"
          onChange={(event) => setSelectedProjectId(event.target.value)}
          value={selectedProjectId}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        <UploadCard
          disabled={loading}
          label="Choose project image"
          onUpload={(file) =>
            uploadFile({
              accept: ["jpg", "jpeg", "png", "webp"],
              file,
              path: (_ext, selectedFile) => `projects/${safeFileName(selectedFile.name)}`,
              saveUrl: async (publicUrl) => {
                if (!selectedProjectId) {
                  return;
                }
                const { error } = await supabase
                  .from("projects")
                  .update({ image_url: publicUrl })
                  .eq("id", selectedProjectId);

                if (error) {
                  throw error;
                }
                await refreshProjects();
              },
            })
          }
        />
      </section>
    </div>
  );
};

const UploadCard = ({ disabled, label, onUpload }) => {
  const [file, setFile] = useState(null);

  return (
    <section className="rounded-lg border border-[#163269]/10 p-5">
      <h3 className="text-lg font-normal text-primary">{label}</h3>
      <input
        className="mt-4 block w-full text-sm text-[#4a5568]"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        type="file"
      />
      <button
        className="button-primary mt-4"
        disabled={disabled}
        onClick={() => onUpload(file)}
        type="button"
      >
        {disabled ? "Uploading..." : "Upload"}
      </button>
    </section>
  );
};

// ── Visitor Tracking Admin Section ────────────────────────────────────────

const ToggleSwitch = ({ checked, disabled, label, description, onChange }) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border border-[#163269]/10 p-4">
    <div>
      <p className="text-sm font-medium text-primary">{label}</p>
      {description && (
        <p className="mt-1 text-xs font-light text-[#4a5568]">{description}</p>
      )}
    </div>
    <button
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-secondary" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const VisitorsPage = () => {
  const [settings, setSettings] = useState({
    tracking_enabled: true,
    notifications_enabled: true,
    show_public_counter: true,
  });
  const [visitors, setVisitors] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("settings");

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Load settings
      const { data: settingsData, error: settingsErr } = await supabase
        .from("visitor_settings")
        .select("key, value");
      if (settingsErr) throw settingsErr;
      const map = (settingsData || []).reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});
      setSettings((prev) => ({ ...prev, ...map }));

      // Load total count
      const { data: countData } = await supabase
        .from("visitor_count_cache")
        .select("total_count")
        .eq("id", 1)
        .single();
      setTotalCount(countData?.total_count ?? 0);

      // Load recent visitors
      const { data: visitorsData, error: visitorsErr } = await supabase
        .from("visitors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (visitorsErr) throw visitorsErr;
      setVisitors(visitorsData || []);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateSetting = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      const { error } = await supabase
        .from("visitor_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
      setMessage({ type: "success", text: "Setting saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      // Revert optimistic update
      setSettings((prev) => ({ ...prev, [key]: !value }));
    }
  };

  const toIST = (isoString) => {
    try {
      return new Date(isoString).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="grid gap-6">
      {/* Header stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border border-[#31c0f4]/40 bg-[#31c0f4]/5 p-5">
          <p className="text-sm font-light text-secondary">Total Unique Visitors</p>
          <p className="mt-2 text-3xl font-normal text-primary">
            {loading ? "—" : (totalCount ?? 0).toLocaleString()}
          </p>
        </article>
        <article className="rounded-lg border border-[#163269]/10 p-5">
          <p className="text-sm font-light text-[#4a5568]">Recent Visits (loaded)</p>
          <p className="mt-2 text-3xl font-normal text-primary">
            {loading ? "—" : visitors.length}
          </p>
        </article>
        <article className="rounded-lg border border-[#163269]/10 p-5">
          <p className="text-sm font-light text-[#4a5568]">Tracking Status</p>
          <p className={`mt-2 text-lg font-medium ${
            settings.tracking_enabled ? "text-green-600" : "text-red-500"
          }`}>
            {settings.tracking_enabled ? "Active" : "Paused"}
          </p>
        </article>
      </div>

      <StatusMessage message={message} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#163269]/10 pb-0">
        {["settings", "analytics"].map((tab) => (
          <button
            className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg border-b-2 transition ${
              activeTab === tab
                ? "border-secondary text-secondary"
                : "border-transparent text-[#4a5568] hover:text-primary"
            }`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "settings" && (
        <div className="grid gap-3">
          <h3 className="text-base font-medium text-primary">Feature Toggles</h3>
          <ToggleSwitch
            checked={settings.tracking_enabled}
            description="Record new unique visitors in the database. Disable to pause all tracking."
            disabled={loading}
            label="Enable Visitor Tracking"
            onChange={(v) => updateSetting("tracking_enabled", v)}
          />
          <ToggleSwitch
            checked={settings.notifications_enabled}
            description="Send a Telegram message for each new unique visitor. Tracking still works when off."
            disabled={loading}
            label="Enable Telegram Notifications"
            onChange={(v) => updateSetting("notifications_enabled", v)}
          />
          <ToggleSwitch
            checked={settings.show_public_counter}
            description="Show the total visitor count in the public portfolio footer."
            disabled={loading}
            label="Show Public Visitor Counter"
            onChange={(v) => updateSetting("show_public_counter", v)}
          />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-light text-[#4a5568]">
              {loading ? "Loading..." : `Showing last ${visitors.length} visits`}
            </p>
            <button
              className="rounded-lg border border-[#163269]/10 px-3 py-1.5 text-xs text-primary hover:border-[#31c0f4]/50 hover:text-secondary transition"
              disabled={loading}
              onClick={loadData}
              type="button"
            >
              Refresh
            </button>
          </div>

          {visitors.length === 0 && !loading ? (
            <p className="rounded-lg border border-[#163269]/10 p-6 text-center text-sm font-light text-[#4a5568]">
              No visitors recorded yet. Make sure tracking is enabled and the schema has been applied in Supabase.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#163269]/10">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-[#4a5568]">
                  <tr>
                    {["Time (IST)", "Location", "OS", "Browser", "Device", "Referrer", "Page"].map((h) => (
                      <th className="px-3 py-3 text-left whitespace-nowrap" key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#163269]/5">
                  {visitors.map((v) => (
                    <tr className="hover:bg-gray-50 transition" key={v.id}>
                      <td className="px-3 py-2.5 font-light text-[#4a5568] whitespace-nowrap text-xs">
                        {toIST(v.created_at)}
                      </td>
                      <td className="px-3 py-2.5 font-light text-[#4a5568] whitespace-nowrap text-xs">
                        {[v.city, v.state, v.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-3 py-2.5 font-light text-[#4a5568] whitespace-nowrap text-xs">
                        {v.os || "—"}
                      </td>
                      <td className="px-3 py-2.5 font-light text-[#4a5568] whitespace-nowrap text-xs">
                        {v.browser ? `${v.browser} ${v.browser_version || ""}`.trim() : "—"}
                      </td>
                      <td className="px-3 py-2.5 font-light text-[#4a5568] whitespace-nowrap text-xs">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          v.device_type === "Mobile"
                            ? "bg-blue-50 text-blue-700"
                            : v.device_type === "Tablet"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-gray-100 text-gray-600"
                        }`}>
                          {v.device_type || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-light text-[#4a5568] whitespace-nowrap text-xs">
                        {v.referrer || "Direct"}
                      </td>
                      <td className="px-3 py-2.5 font-light text-[#4a5568] whitespace-nowrap text-xs">
                        {v.page || "/"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Settings page ───────────────────────────────────────────────────────────

const SettingsPage = ({ onLogout, sessionUser }) => (
  <dl className="grid gap-4 rounded-lg border border-[#163269]/10 p-5 text-sm">
    {[
      ["Supabase configured", isSupabaseConfigured ? "yes" : "no"],
      ["Logged in email", sessionUser?.email || ""],
      ["Admin email from env", adminEmail],
      ["Storage bucket name", storageBucket],
      ["Public portfolio URL", "https://raafidafraaz.in"],
      ["Admin URL", "https://admin.raafidafraaz.in"],
    ].map(([label, value]) => (
      <div key={label}>
        <dt className="font-medium text-primary">{label}</dt>
        <dd className="mt-1 font-light text-[#4a5568]">{value}</dd>
      </div>
    ))}
    <button className="button-primary w-fit" onClick={onLogout} type="button">
      Logout
    </button>
  </dl>
);

const AdminApp = () => {
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState("");
  const [sessionUser, setSessionUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(
    isSupabaseConfigured ? "checking" : "missing-config",
  );
  const [authError, setAuthError] = useState("");
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [counts, setCounts] = useState({});
  const [seedMessage, setSeedMessage] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);

  const enforceAdminSession = async (user) => {
    if (!user) {
      setSessionUser(null);
      setAuthStatus("signed-out");
      return;
    }

    if (user.email !== adminEmail) {
      await supabase.auth.signOut();
      setSessionUser(null);
      setAuthError("Not authorized");
      setAuthStatus("signed-out");
      return;
    }

    setSessionUser(user);
    setAuthError("");
    setAuthStatus("signed-in");
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthError(error.message);
        setAuthStatus("signed-out");
        return;
      }

      enforceAdminSession(data.session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      enforceAdminSession(session?.user);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshCounts = async () => {
    const nextCounts = {};

    for (const table of countTables) {
      nextCounts[table] = await getTableCount(table);
    }

    setCounts(nextCounts);
  };

  useEffect(() => {
    if (authStatus === "signed-in") {
      refreshCounts().catch((error) =>
        setSeedMessage({ type: "error", text: error.message }),
      );
    }
  }, [authStatus]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthStatus("loading");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setAuthStatus("signed-out");
      return;
    }

    await enforceAdminSession(data.user);
  };

  const handleLogout = async () => {
    setAuthError("");
    setAuthStatus("loading");
    await supabase.auth.signOut();
    setPassword("");
    setSessionUser(null);
    setAuthStatus("signed-out");
  };

  const seedTable = async (table) => {
    if (table === "site_content") {
      const existing = await supabase.from("site_content").select("key");
      if (existing.error) {
        throw existing.error;
      }
      const existingKeys = new Set((existing.data || []).map((row) => row.key));
      const rows = Object.entries(localPortfolioRows.site_content)
        .filter(([key]) => !existingKeys.has(key))
        .map(([key, value]) => ({ key, value }));

      if (!rows.length) {
        return 0;
      }

      const { error } = await supabase.from("site_content").insert(rows);
      if (error) {
        throw error;
      }
      return rows.length;
    }

    const config = tableConfigs[table];
    const existingRows = await getRawTableRows(table);
    const existingKeys = new Set(existingRows.map((row) => config.unique(row)));
    const rows = localPortfolioRows[table].filter(
      (row) => !existingKeys.has(config.unique(row)),
    );

    if (!rows.length) {
      return 0;
    }

    const { error } = await supabase.from(table).insert(rows);
    if (error) {
      throw error;
    }

    return rows.length;
  };

  const seedInitialData = async () => {
    setSeedLoading(true);
    setSeedMessage(null);

    try {
      const inserted = {};
      inserted.site_content = await seedTable("site_content");
      for (const table of countTables) {
        inserted[table] = await seedTable(table);
      }
      await refreshCounts();
      setSeedMessage({
        type: "success",
        text: `Seed complete. Inserted ${Object.values(inserted).reduce(
          (sum, count) => sum + count,
          0,
        )} missing row(s).`,
      });
    } catch (error) {
      setSeedMessage({ type: "error", text: error.message });
    } finally {
      setSeedLoading(false);
    }
  };

  const activeEditor = useMemo(() => {
    if (activeSection === "Dashboard") {
      return (
        <>
          <Dashboard
            counts={counts}
            loading={seedLoading}
            onSeedInitialData={seedInitialData}
          />
          <div className="mt-5">
            <StatusMessage message={seedMessage} />
          </div>
        </>
      );
    }

    if (activeSection === "Site Content") {
      return <SiteContentEditor />;
    }

    if (activeSection === "Assets") {
      return <AssetsPage refreshProjects={refreshCounts} />;
    }

    if (activeSection === "Visitors") {
      return <VisitorsPage />;
    }

    if (activeSection === "Settings") {
      return <SettingsPage onLogout={handleLogout} sessionUser={sessionUser} />;
    }

    const tableName = activeSection.toLowerCase().replace(" ", "_");
    const config =
      activeSection === "Projects"
        ? tableConfigs.projects
        : activeSection === "Skills"
          ? tableConfigs.skills
          : activeSection === "Experience"
            ? tableConfigs.experience
            : activeSection === "Education"
              ? tableConfigs.education
              : activeSection === "Achievements"
                ? tableConfigs.achievements
                : tableConfigs[tableName];

    return (
      <CrudEditor
        config={config}
        onSeed={seedTable}
        refreshCounts={refreshCounts}
      />
    );
  }, [activeSection, counts, seedLoading, seedMessage, sessionUser]);

  if (!isSupabaseConfigured) {
    return (
      <main className="min-h-screen bg-white px-6 py-8 font-poppins text-primary sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-2xl rounded-lg border border-[#163269]/10 bg-white p-6 shadow-[0_20px_100px_-40px_rgba(22,50,105,0.3)]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary">
            Admin Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-normal tracking-tight text-primary">
            Raafid Portfolio Admin
          </h1>
          <p className="mt-4 text-sm font-light leading-6 text-[#4a5568]">
            Supabase is not configured. Add VITE_SUPABASE_URL and
            VITE_SUPABASE_ANON_KEY.
          </p>
        </div>
      </main>
    );
  }

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 font-poppins text-primary">
        <p className="text-sm font-light text-[#4a5568]">
          Checking admin session...
        </p>
      </main>
    );
  }

  if (authStatus !== "signed-in") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-8 font-poppins text-primary">
        <form
          className="w-full max-w-md rounded-lg border border-[#163269]/10 bg-white p-6 shadow-[0_20px_100px_-40px_rgba(22,50,105,0.3)]"
          onSubmit={handleSignIn}
        >
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-secondary">
            Admin Login
          </p>
          <h1 className="mt-3 text-3xl font-normal tracking-tight text-primary">
            Raafid Portfolio Admin
          </h1>
          <p className="mt-3 text-sm font-light leading-6 text-[#4a5568]">
            Sign in with the configured Supabase admin account.
          </p>

          <label className="mt-6 block text-sm font-medium text-primary">
            Email
            <input
              className="mt-2 w-full rounded-lg border border-[#163269]/10 px-4 py-3 text-sm font-light text-primary outline-none transition focus:border-[#31c0f4]"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-primary">
            Password
            <input
              className="mt-2 w-full rounded-lg border border-[#163269]/10 px-4 py-3 text-sm font-light text-primary outline-none transition focus:border-[#31c0f4]"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {authError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-light text-red-700">
              {authError}
            </p>
          ) : null}

          <button
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#31c0f4] to-[#163269] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={authStatus === "loading"}
            type="submit"
          >
            {authStatus === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <AdminShell
      activeSection={activeSection}
      onLogout={handleLogout}
      setActiveSection={setActiveSection}
    >
      {activeEditor}
    </AdminShell>
  );
};

export default AdminApp;
