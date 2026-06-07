import { useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';

import styles from "./style";
import {
  Navbar,
  Hero,
  SkillsAndExperience,
  Footer,
  Projects,
  Achievements,
} from "./components";

const App = () => {
  useEffect(() => {
    import("smoothscroll-polyfill").then(({ default: smoothscroll }) => {
      smoothscroll.polyfill();
    });
  }, []);

  return (
    <div className="bg-white w-full overflow-hidden">
      <Analytics />
      <Navbar />

      <div className={`bg-white ${styles.flexStart} pt-[80px]`}>
        <div className={`${styles.boxWidth}`}>
          <Hero />
        </div>
      </div>

      <div
        className={`bg-white ${styles.flexCenter} ${styles.paddingX} max-w-7xl mx-auto`}
      >
        <div className={`${styles.boxWidth}`}>
          <SkillsAndExperience />
        </div>
      </div>
      <Projects />
      <div className={`bg-white ${styles.flexCenter} ${styles.paddingX}`}>
        <div className={`${styles.boxWidth}`}>
          <Achievements />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
