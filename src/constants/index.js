import {
  gdsc,
  raafidMark,
  vitLogo,
} from "../assets";

import {
  AiFillGithub,
  AiFillLinkedin,
  AiFillMail,
  AiFillHtml5,
} from "react-icons/ai";

import {
  DiCss3,
  DiJava,
  DiMongodb,
  DiNodejs,
} from "react-icons/di";

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

export const repoLink = "https://github.com/mittal-parth/personal-portfolio";

export const callToAction = "https://www.linkedin.com/in/RaafidAfraazG";

export const profilePhoto = "/raafid-profile.jpg";

export const resumeLink = "/resume.pdf";

export const navLinks = [
  {
    id: "linkedin",
    title: "LinkedIn",
    link: "https://www.linkedin.com/in/RaafidAfraazG",
    icon: AiFillLinkedin,
  },
  {
    id: "github",
    title: "Github",
    link: "https://github.com/RaafidAfraazG",
    icon: AiFillGithub,
  },
  {
    id: "mail",
    title: "Email",
    link: "mailto:raafid122@gmail.com",
    icon: AiFillMail,
  },
  {
    id: "resume",
    title: "Resume",
    link: resumeLink,
    icon: FaFileAlt,
    showLabel: true,
  },
];

export const educationList = [
  {
    id: "education-1",
    icon: vitLogo,
    title: "Vellore Institute of Technology, Vellore",
    degree: "Integrated M.Tech in Software Engineering",
    duration: "Aug 2022 - Jun 2027",
    content1: "CGPA: 8.49",
    content2:
      "Focused on software engineering fundamentals, backend development, databases, operating systems, computer networks, cloud computing, software testing, and full-stack project development.",
  },
  {
    id: "education-2",
    icon: raafidMark,
    title: "Islamiah Higher Secondary School, Pernambut",
    degree: "Higher Secondary Education",
    duration: "Aug 2020 - May 2022",
    content1: "Aggregate: 88.5%",
    content2:
      "Completed higher secondary education with a strong foundation in mathematics, science, and problem-solving.",
  },
];

export const achievements = [
  {
    id: "achievement-1",
    icon: gdsc,
    event: "BitNBuild'24 Tamil Nadu Regional Round, Google DSC",
    position: "Winner - 1st Place",
    content1: "Secured first place in the Tamil Nadu regional round.",
  },
  {
    id: "achievement-2",
    icon: gdsc,
    event: "BitNBuild'24 Hackathon, Mumbai",
    position: "National Finalist",
    content1: "Qualified for the national finals.",
  },
  {
    id: "achievement-3",
    thumbnailText: "NN",
    event: "Neural Nexus'24 AI/ML Hackathon, Vijaybhoomi University",
    position: "Top 3 Finalist",
    content1: "Reached the top three finalist group in the AI/ML hackathon.",
  },
  {
    id: "achievement-4",
    thumbnailText: "IBM",
    event: "IBM Skills Network",
    position: "Certification",
    content1: "SQL and Relational Databases 101.",
  },
  {
    id: "achievement-5",
    thumbnailText: "EY",
    event: "EY Techathon 5.0",
    position: "Advanced through Initial Screening Round",
    content1: "Cleared the initial screening stage.",
  },
  {
    id: "achievement-6",
    thumbnailText: "ADG",
    event: "ADGViT ML Domain",
    position: "Senior Core Member",
    content1:
      "Led technical workshops and mentored junior members on AI and software engineering practices.",
  },
];

export const skills = [
  {
    title: "Languages",
    items: [
      { id: "lang-java", icon: DiJava, name: "Java" },
      { id: "lang-python", icon: SiPython, name: "Python" },
      { id: "lang-js", icon: SiJavascript, name: "JavaScript" },
      { id: "lang-ts", icon: SiTypescript, name: "TypeScript" },
      { id: "lang-sql", icon: FaDatabase, name: "SQL" },
      { id: "lang-cpp", icon: FaCode, name: "C++" },
      { id: "lang-c", icon: FaCode, name: "C" },
    ],
  },
  {
    title: "Frontend",
    items: [
      { id: "frontend-react", icon: SiReact, name: "React.js" },
      { id: "frontend-next", icon: SiNextdotjs, name: "Next.js" },
      { id: "frontend-ts", icon: SiTypescript, name: "TypeScript" },
      { id: "frontend-tailwind", icon: SiTailwindcss, name: "Tailwind CSS" },
      { id: "frontend-html", icon: AiFillHtml5, name: "HTML" },
      { id: "frontend-css", icon: DiCss3, name: "CSS" },
    ],
  },
  {
    title: "Backend",
    items: [
      { id: "backend-node", icon: DiNodejs, name: "Node.js" },
      { id: "backend-express", icon: SiExpress, name: "Express.js" },
      { id: "backend-java", icon: DiJava, name: "Java" },
      { id: "backend-spring", icon: SiSpringboot, name: "Spring Boot" },
      { id: "backend-rest", icon: FaServer, name: "REST APIs" },
      { id: "backend-fastapi", icon: SiFastapi, name: "FastAPI" },
    ],
  },
  {
    title: "Databases",
    items: [
      { id: "db-mongodb", icon: DiMongodb, name: "MongoDB" },
      { id: "db-postgres", icon: SiPostgresql, name: "PostgreSQL" },
      { id: "db-mysql", icon: SiMysql, name: "MySQL" },
      { id: "db-supabase", icon: SiSupabase, name: "Supabase" },
    ],
  },
  {
    title: "Tools & DevOps",
    items: [
      { id: "tools-git", icon: FaTools, name: "Git" },
      { id: "tools-github", icon: AiFillGithub, name: "GitHub" },
      { id: "tools-docker", icon: FaDocker, name: "Docker" },
      { id: "tools-actions", icon: SiGithubactions, name: "GitHub Actions" },
      { id: "tools-postman", icon: SiPostman, name: "Postman" },
      { id: "tools-vercel", icon: SiVercel, name: "Vercel" },
      { id: "tools-render", icon: FaServer, name: "Render" },
    ],
  },
  {
    title: "Data / Automation / Testing",
    items: [
      { id: "data-kafka", icon: SiApachekafka, name: "Kafka" },
      { id: "data-airflow", icon: SiApacheairflow, name: "Airflow" },
      { id: "data-spark", icon: SiApachespark, name: "Spark" },
      { id: "testing-backstop", icon: FaTools, name: "BackstopJS" },
      { id: "testing-playwright", icon: FaTools, name: "Playwright" },
      { id: "testing-selenium", icon: SiSelenium, name: "Selenium" },
      { id: "testing-visual", icon: FaTools, name: "Visual Regression Testing" },
    ],
  },
];

export const aboutHighlights = [
  {
    id: "about-fullstack",
    title: "Full-Stack Development",
    content: "React, Next.js, TypeScript, Node.js, and database-backed apps.",
  },
  {
    id: "about-backend",
    title: "Backend Engineering",
    content: "REST APIs, authentication, database design, and business logic.",
  },
  {
    id: "about-automation",
    title: "Automation & Testing",
    content: "Workflow automation, visual regression testing, and CI/CD pipelines.",
  },
  {
    id: "about-data",
    title: "Data & Systems",
    content: "Kafka pipelines, C++ systems projects, and IoT prototypes.",
  },
];

export const experiences = [
  {
    organisation: "Statentics DSoft Ltd",
    logo: raafidMark,
    link: "",
    location: "India",
    positions: [
      {
        title: "Software Engineer Intern",
        duration: "Jun 2025 - Aug 2025",
        content: [
          {
            text: "Designed scalable backend services using Node.js and MongoDB, supporting high-concurrency SaaS workflows and database-backed modules.",
            link: "",
          },
          {
            text: "Delivered frontend and backend features across multiple SaaS modules, working from implementation to deployment with structured API workflows.",
            link: "",
          },
          {
            text: "Optimized database queries and API logic, improving average response time and overall application performance.",
            link: "",
          },
          {
            text: "Collaborated in an Agile-style workflow with regular deliverables, debugging, testing, and code improvements.",
            link: "",
          },
        ],
      },
    ],
  },
];

const stack = (items) =>
  items.map(({ icon, name }, index) => ({
    id: `icon-${index + 1}`,
    icon,
    name,
  }));

export const projectTabs = [
  "Major Projects",
  "Backend & APIs",
  "Frontend/UI",
  "AI/Data/Automation",
  "Systems & IoT",
];

const projectThumbnailTextById = {
  "automated-outreach-pipeline": "AOP",
  "leadflow-crm": "LF",
  stocklock: "SL",
  "gitscope-api": "GS",
  "hr-workflow-designer": "HR",
  "campus-priority-notification-system": "CN",
  "worker-attendance-engine": "WA",
  "devops-release-tracker-api": "DR",
  famcare: "FC",
  "backstopjs-visual-testing-api": "BV",
  "live-client-frontend-project": "OT",
  mindora: "MD",
  sportsfiesta: "SF",
  cinematch: "CM",
  "lost-pixel-visual-test": "LP",
  "ai-workflow-builder": "AI",
  "data-engineering-pipeline": "DE",
  "geoboundary-align": "GB",
  "realtime-stock-analysis-kafka": "RT",
  "financial-news-sentiment-analysis": "FN",
  "insider-threat-detection": "IT",
  "rainfall-prediction": "RP",
  "secure-iot-health-monitoring": "IoT",
  "concurrent-kvstore": "KV",
  "linux-system-monitor": "LM",
  "linux-diagnostics": "LD",
  "cpu-cache-simulator": "CS",
};

const projectItems = [
  {
    id: "automated-outreach-pipeline",
    tab: "Major Projects",
    title: "Automated Outreach Pipeline",
    category: "AI Automation / Backend Workflow",
    github: "https://github.com/RaafidAfraazG/automated-outreach-pipeline",
    link: "",
    content:
      "Node.js outreach pipeline that discovers companies, enriches verified emails, and safely sends outreach through real providers.",
    stack: stack([
      { icon: DiNodejs, name: "Node.js" },
      { icon: SiJavascript, name: "JavaScript" },
      { icon: FaRobot, name: "Tavily" },
      { icon: FaDatabase, name: "Prospeo" },
      { icon: FaServer, name: "APIs" },
    ]),
  },
  {
    id: "leadflow-crm",
    tab: "Major Projects",
    title: "LeadFlow CRM",
    category: "Full Stack Web App",
    github: "https://github.com/RaafidAfraazG/leadflow-crm",
    link: "",
    content:
      "Full-stack lead management CRM with CRUD, search, filters, pagination, status tracking, and backend APIs.",
    stack: stack([
      { icon: SiNextdotjs, name: "Next.js" },
      { icon: DiNodejs, name: "Node.js" },
      { icon: SiExpress, name: "Express" },
      { icon: DiMongodb, name: "MongoDB" },
      { icon: FaServer, name: "REST APIs" },
    ]),
  },
  {
    id: "stocklock",
    tab: "Major Projects",
    title: "StockLock",
    category: "Backend Reliability / System Design",
    github: "https://github.com/RaafidAfraazG/StockLock",
    link: "",
    content:
      "Inventory reservation system with atomic stock locking, idempotent checkout, countdown reservations, and expiry handling.",
    stack: stack([
      { icon: SiNextdotjs, name: "Next.js" },
      { icon: SiTypescript, name: "TypeScript" },
      { icon: SiPrisma, name: "Prisma" },
      { icon: SiSupabase, name: "Supabase" },
      { icon: FaDatabase, name: "Redis" },
    ]),
  },
  {
    id: "gitscope-api",
    tab: "Major Projects",
    title: "GitScope API",
    category: "Backend API / API Integration",
    github: "https://github.com/RaafidAfraazG/gitscope-api",
    link: "",
    content:
      "REST API that analyzes GitHub profiles, repositories, stars, forks, languages, and stores insights in MySQL.",
    stack: stack([
      { icon: DiNodejs, name: "Node.js" },
      { icon: SiExpress, name: "Express" },
      { icon: SiMysql, name: "MySQL" },
      { icon: AiFillGithub, name: "GitHub API" },
    ]),
  },
  {
    id: "hr-workflow-designer",
    tab: "Major Projects",
    title: "HR Workflow Designer",
    category: "Frontend Engineering / Workflow Builder",
    github: "https://github.com/RaafidAfraazG/HR-WORKFLOW---TREDENCE",
    link: "",
    content:
      "Visual no-code HR workflow builder with drag-and-drop nodes, dynamic forms, validation, and workflow simulation.",
    stack: stack([
      { icon: SiReact, name: "React" },
      { icon: SiTypescript, name: "TypeScript" },
      { icon: FaNetworkWired, name: "React Flow" },
      { icon: FaDatabase, name: "Zustand" },
      { icon: FaCode, name: "Vite" },
    ]),
  },
  {
    id: "campus-priority-notification-system",
    tab: "Major Projects",
    title: "Campus Priority Notification System",
    category: "Frontend Assessment / System Design",
    github: "https://github.com/RaafidAfraazG/22MIS0258",
    link: "",
    content:
      "React TypeScript notification dashboard with protected API usage, viewed-state tracking, priority inbox, and logging middleware.",
    stack: stack([
      { icon: SiReact, name: "React" },
      { icon: SiTypescript, name: "TypeScript" },
      { icon: FaServer, name: "API Integration" },
      { icon: FaTools, name: "Logging Middleware" },
    ]),
  },
  {
    id: "worker-attendance-engine",
    tab: "Backend & APIs",
    title: "Worker Attendance & Overtime Settlement Engine",
    category: "Java Backend",
    github:
      "https://github.com/RaafidAfraazG/Worker-Attendance-and-Overtime-Settlement-Engine",
    link: "",
    content:
      "Spring Boot backend for worker attendance, overtime calculation, settlement, and site management.",
    stack: stack([
      { icon: DiJava, name: "Java" },
      { icon: SiSpringboot, name: "Spring Boot" },
      { icon: FaServer, name: "REST APIs" },
      { icon: SiPostgresql, name: "PostgreSQL" },
    ]),
  },
  {
    id: "devops-release-tracker-api",
    tab: "Backend & APIs",
    title: "DevOps Release Tracker API",
    category: "Java Backend / DevOps API",
    github: "https://github.com/RaafidAfraazG/DevOps-Release-Tracker-API",
    link: "",
    content:
      "Spring Boot API for releases, deployment tasks, rollback flow, audit logs, JWT authentication, and Swagger docs.",
    stack: stack([
      { icon: DiJava, name: "Java" },
      { icon: SiSpringboot, name: "Spring Boot" },
      { icon: FaServer, name: "JWT" },
      { icon: FaCode, name: "Swagger" },
      { icon: FaServer, name: "REST APIs" },
    ]),
  },
  {
    id: "famcare",
    tab: "Backend & APIs",
    title: "FamCare",
    category: "Spring Boot Web Platform",
    github: "https://github.com/RaafidAfraazG/FamCare",
    link: "",
    content:
      "Spring Boot and Thymeleaf-based family care management system with server-side rendered workflows and role-based features.",
    stack: stack([
      { icon: DiJava, name: "Java" },
      { icon: SiSpringboot, name: "Spring Boot" },
      { icon: FaCode, name: "Thymeleaf" },
      { icon: FaServer, name: "Spring MVC" },
      { icon: FaServer, name: "Spring Security" },
    ]),
  },
  {
    id: "backstopjs-visual-testing-api",
    tab: "Backend & APIs",
    title: "BackstopJS Visual Testing API",
    category: "Visual Testing API",
    github: "https://github.com/RaafidAfraazG/backstopjs-api",
    link: "",
    content:
      "Express API that accepts screenshots, runs BackstopJS comparison, and returns pass/fail results with diff images.",
    stack: stack([
      { icon: DiNodejs, name: "Node.js" },
      { icon: SiExpress, name: "Express" },
      { icon: FaTools, name: "BackstopJS" },
      { icon: FaTools, name: "Puppeteer" },
      { icon: FaServer, name: "Multer" },
    ]),
  },
  {
    id: "live-client-frontend-project",
    tab: "Frontend/UI",
    title: "OSSVEL Tiles",
    category: "Client Frontend Work",
    github: "",
    link: "https://ossvveltiles.com/",
    content:
      "Frontend implementation for a live tiles business website with responsive layouts, product-focused sections, and clean production UI.",
    stack: stack([
      { icon: SiNextdotjs, name: "Next.js" },
      { icon: SiTypescript, name: "TypeScript" },
      { icon: SiReact, name: "React" },
    ]),
  },
  {
    id: "mindora",
    tab: "Frontend/UI",
    title: "Mindora",
    category: "Mental Health Chatbot",
    github: "https://github.com/RaafidAfraazG/Mindora",
    link: "",
    content:
      "Mental health chatbot system focused on supportive conversations and wellness-oriented user interaction.",
    stack: stack([
      { icon: SiJavascript, name: "JavaScript" },
      { icon: AiFillHtml5, name: "HTML" },
      { icon: DiCss3, name: "CSS" },
    ]),
  },
  {
    id: "sportsfiesta",
    tab: "Frontend/UI",
    title: "SportsFiesta",
    category: "Event Website",
    github: "https://github.com/RaafidAfraazG/SportsFiesta",
    link: "",
    content:
      "Sports event website with responsive pages, event sections, and clean UI presentation.",
    stack: stack([
      { icon: SiJavascript, name: "JavaScript" },
      { icon: AiFillHtml5, name: "HTML" },
      { icon: DiCss3, name: "CSS" },
    ]),
  },
  {
    id: "cinematch",
    tab: "Frontend/UI",
    title: "CineMatch",
    category: "Entertainment Web App",
    github: "https://github.com/RaafidAfraazG/cinematch",
    link: "",
    content:
      "Movie discovery interface focused on entertainment browsing and simple recommendation-style UI.",
    stack: stack([
      { icon: SiJavascript, name: "JavaScript" },
      { icon: FaServer, name: "API" },
      { icon: FaCode, name: "UI" },
    ]),
  },
  {
    id: "lost-pixel-visual-test",
    tab: "Frontend/UI",
    title: "Lost Pixel Visual Test",
    category: "Visual Testing Demo",
    github: "https://github.com/RaafidAfraazG/lost-pixel-visual-test",
    link: "",
    content:
      "Visual regression testing demo that compares UI screenshots and detects layout changes across builds.",
    stack: stack([
      { icon: FaTools, name: "Lost Pixel" },
      { icon: AiFillHtml5, name: "HTML" },
      { icon: DiCss3, name: "CSS" },
      { icon: FaTools, name: "Visual Testing" },
    ]),
  },
  {
    id: "ai-workflow-builder",
    tab: "AI/Data/Automation",
    title: "AI Workflow Builder",
    category: "AI Automation",
    github: "https://github.com/RaafidAfraazG/AI-workflow-builder",
    link: "",
    content:
      "No-code AI workflow builder for configurable AI automation flows with document processing and workflow execution.",
    stack: stack([
      { icon: SiPython, name: "Python" },
      { icon: SiFastapi, name: "FastAPI" },
      { icon: FaNetworkWired, name: "React Flow" },
      { icon: FaDatabase, name: "ChromaDB" },
      { icon: FaRobot, name: "OpenAI/Gemini" },
    ]),
  },
  {
    id: "data-engineering-pipeline",
    tab: "AI/Data/Automation",
    title: "End-to-End Data Engineering Pipeline",
    category: "Data Engineering",
    github:
      "https://github.com/RaafidAfraazG/End-to-End-Data-Engineering-Pipeline",
    link: "",
    content:
      "Data engineering pipeline covering ingestion, streaming, processing, and storage using modern data tools.",
    stack: stack([
      { icon: SiPython, name: "Python" },
      { icon: SiApacheairflow, name: "Airflow" },
      { icon: SiApachekafka, name: "Kafka" },
      { icon: SiApachespark, name: "Spark" },
      { icon: SiPostgresql, name: "PostgreSQL" },
      { icon: FaDatabase, name: "Cassandra" },
    ]),
  },
  {
    id: "geoboundary-align",
    tab: "AI/Data/Automation",
    title: "GeoBoundary Align",
    category: "Geospatial Data Processing",
    github: "https://github.com/RaafidAfraazG/geoboundary-align",
    link: "",
    content:
      "Geospatial boundary alignment solution that corrects misaligned land plot polygons using satellite imagery, boundary raster hints, shift search, confidence scoring, and GeoJSON outputs.",
    stack: stack([
      { icon: SiPython, name: "Python" },
      { icon: FaDatabase, name: "GeoPandas" },
      { icon: FaTools, name: "Rasterio" },
      { icon: FaNetworkWired, name: "Shapely" },
      { icon: FaRobot, name: "NumPy/SciPy" },
      { icon: FaDatabase, name: "GeoJSON" },
    ]),
  },
  {
    id: "realtime-stock-analysis-kafka",
    tab: "AI/Data/Automation",
    title: "Real-Time Stock Analysis Pipeline",
    category: "Real-Time Data Pipeline",
    github: "https://github.com/RaafidAfraazG/realtime-stock-analysis-kafka",
    link: "",
    content:
      "Real-time stock market data pipeline using Kafka, Python, and AWS services for storage and querying.",
    stack: stack([
      { icon: SiApachekafka, name: "Kafka" },
      { icon: SiPython, name: "Python" },
      { icon: FaAws, name: "AWS S3" },
      { icon: FaAws, name: "AWS Glue" },
      { icon: FaDatabase, name: "Athena" },
    ]),
  },
  {
    id: "financial-news-sentiment-analysis",
    tab: "AI/Data/Automation",
    title: "Financial News Sentiment Analysis",
    category: "NLP / Machine Learning",
    github:
      "https://github.com/RaafidAfraazG/Finanical_news_Sentiment_analysis",
    link: "",
    content:
      "NLP project for classifying financial news sentiment and analyzing market-related text insights.",
    stack: stack([
      { icon: SiPython, name: "Python" },
      { icon: FaRobot, name: "TensorFlow/Keras" },
      { icon: FaRobot, name: "NLP" },
      { icon: FaDatabase, name: "Pandas" },
    ]),
  },
  {
    id: "insider-threat-detection",
    tab: "AI/Data/Automation",
    title: "Insider Threat Detection",
    category: "Cybersecurity Dashboard",
    github: "https://github.com/RaafidAfraazG/Insider-Threat-Detection-",
    link: "",
    content:
      "Full-stack security monitoring system with activity tracking, risk scoring, alerts, audit logs, and admin dashboards.",
    stack: stack([
      { icon: DiNodejs, name: "Node.js" },
      { icon: SiExpress, name: "Express" },
      { icon: SiReact, name: "React" },
      { icon: FaServer, name: "JWT" },
      { icon: FaDatabase, name: "SQL" },
    ]),
  },
  {
    id: "rainfall-prediction",
    tab: "AI/Data/Automation",
    title: "Rainfall Prediction",
    category: "Machine Learning",
    github: "https://github.com/RaafidAfraazG/Rain-Fall-Prediction",
    link: "",
    content:
      "Machine learning project for rainfall prediction using historical weather-related features and predictive modeling.",
    stack: stack([
      { icon: SiPython, name: "Python" },
      { icon: FaRobot, name: "Machine Learning" },
      { icon: FaDatabase, name: "Pandas" },
      { icon: FaRobot, name: "Scikit-learn" },
    ]),
  },
  {
    id: "secure-iot-health-monitoring",
    tab: "Systems & IoT",
    title: "Secure IoT-Based Health Monitoring System",
    category: "IoT / Embedded Healthcare",
    github: "https://github.com/RaafidAfraazG/secure-iot-health-monitoring",
    link: "",
    content:
      "ESP8266 health monitoring system with heart-rate sensing, fall detection, AES-encrypted telemetry, Flask backend, and alert dashboard.",
    stack: stack([
      { icon: FaMicrochip, name: "ESP8266" },
      { icon: FaCode, name: "Arduino C" },
      { icon: SiFastapi, name: "Flask" },
      { icon: FaServer, name: "AES" },
      { icon: FaMicrochip, name: "I2C" },
    ]),
  },
  {
    id: "concurrent-kvstore",
    tab: "Systems & IoT",
    title: "Concurrent Key-Value Store",
    category: "Systems / C++",
    github: "https://github.com/RaafidAfraazG/concurrent-kvstore",
    link: "",
    content:
      "C++ key-value store focused on concurrency, thread-safe operations, and low-level system design concepts.",
    stack: stack([
      { icon: FaCode, name: "C++" },
      { icon: FaServer, name: "Concurrency" },
      { icon: FaTools, name: "Systems" },
    ]),
  },
  {
    id: "linux-system-monitor",
    tab: "Systems & IoT",
    title: "Linux System Monitor",
    category: "Systems / Linux",
    github: "https://github.com/RaafidAfraazG/Linux-System-Monitor",
    link: "",
    content:
      "C++ system monitoring tool for tracking Linux runtime metrics and resource information.",
    stack: stack([
      { icon: FaCode, name: "C++" },
      { icon: FaLinux, name: "Linux" },
      { icon: FaTools, name: "System Monitoring" },
    ]),
  },
  {
    id: "linux-diagnostics",
    tab: "Systems & IoT",
    title: "Linux Diagnostics Tool",
    category: "Systems / Linux",
    github: "https://github.com/RaafidAfraazG/linux-diagnostics",
    link: "",
    content:
      "Linux diagnostics utility for inspecting system-level information and troubleshooting runtime environment details.",
    stack: stack([
      { icon: FaCode, name: "C++" },
      { icon: FaLinux, name: "Linux" },
      { icon: FaTools, name: "Diagnostics" },
    ]),
  },
  {
    id: "cpu-cache-simulator",
    tab: "Systems & IoT",
    title: "CPU Cache Simulator",
    category: "Computer Architecture",
    github: "https://github.com/RaafidAfraazG/cpu-cache-simulator",
    link: "",
    content:
      "C++ simulator that demonstrates CPU cache behavior, memory access patterns, and cache performance concepts.",
    stack: stack([
      { icon: FaCode, name: "C++" },
      { icon: FaMicrochip, name: "Computer Architecture" },
      { icon: FaDatabase, name: "Cache Simulation" },
    ]),
  },
];

export const projects = projectItems.map((project) => ({
  ...project,
  image: project.image === raafidMark ? "" : project.image,
  thumbnailText: project.thumbnailText || projectThumbnailTextById[project.id],
}));

export const socialMedia = [
  {
    id: "social-media-linkedin",
    title: "LinkedIn",
    icon: AiFillLinkedin,
    link: "https://www.linkedin.com/in/RaafidAfraazG",
  },
  {
    id: "social-media-github",
    title: "GitHub",
    icon: AiFillGithub,
    link: "https://github.com/RaafidAfraazG",
  },
  {
    id: "social-media-mail",
    title: "Email",
    icon: AiFillMail,
    link: "mailto:raafid122@gmail.com",
  },
  {
    id: "social-media-resume",
    title: "Resume",
    icon: FaFileAlt,
    link: resumeLink,
  },
];

export const contactInfo = {
  heading: "Let's connect and build something meaningful.",
  text:
    "Thinking, Building & Exploring",
  email: "raafid122@gmail.com",
  phone: "+91 9042001900",
  github: "https://github.com/RaafidAfraazG",
  linkedin: "https://www.linkedin.com/in/RaafidAfraazG",
  resume: resumeLink,
};

export const aboutMe = {
  name: "Raafid",
  githubUsername: "RaafidAfraazG",
  tagLine: "Thinking, Building & Exploring",
  intro:
    "A software engineer focused on turning ideas into products. I enjoy building and shipping across web, app, AI, automation, and data-driven systems.",
  aboutHeading:
    "Building practical software across full-stack, backend, automation, and data-driven systems.",
  aboutParagraph:
    "I'm an Integrated M.Tech Software Engineering student at VIT, focused on building practical software through full-stack apps, backend APIs, automation tools, and data-driven systems. I like turning ideas into usable products and improving them through clean code, debugging, and continuous learning.",
  location: "Pernambut, India",
};
