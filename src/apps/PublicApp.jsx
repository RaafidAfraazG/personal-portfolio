import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";

import styles from "../style";
import { usePortfolioData } from "../hooks/usePortfolioData";
import { useVisitorTracking } from "../hooks/useVisitorTracking";
import {
  Navbar,
  Hero,
  SkillsAndExperience,
  Footer,
  Projects,
  Achievements,
} from "../components";

const PublicApp = () => {
  const { data } = usePortfolioData();
  const { siteContent } = data;

  // Silent visitor tracking — no visible UI effect
  useVisitorTracking();

  useEffect(() => {
    import("smoothscroll-polyfill").then(({ default: smoothscroll }) => {
      smoothscroll.polyfill();
    });
  }, []);

  return (
    <div className="bg-white w-full overflow-hidden">
      <Analytics />
      <Navbar
        links={data.navLinks}
        profilePhotoUrl={siteContent.profile.profile_photo_url}
      />

      <div className={`bg-white ${styles.flexStart} pt-[80px]`}>
        <div className={`${styles.boxWidth}`}>
          <Hero heroContent={siteContent.hero} />
        </div>
      </div>

      <div
        className={`bg-white ${styles.flexCenter} ${styles.paddingX} max-w-7xl mx-auto`}
      >
        <div className={`${styles.boxWidth}`}>
          <SkillsAndExperience
            aboutContent={siteContent.about}
            educationData={data.educationList}
            experiencesData={data.experiences}
            skillsData={data.skills}
          />
        </div>
      </div>
      <Projects projectsData={data.projects} tabs={data.projectTabs} />
      <div className={`bg-white ${styles.flexCenter} ${styles.paddingX}`}>
        <div className={`${styles.boxWidth}`}>
          <Achievements achievementsData={data.achievements} />
        </div>
      </div>
      <Footer
        contact={siteContent.contact}
        profilePhotoUrl={siteContent.profile.profile_photo_url}
        resumeUrl={siteContent.resume.resume_url}
        socialLinks={data.socialMedia}
      />
    </div>
  );
};

export default PublicApp;
