import React from "react";
import { BsLink45Deg } from "react-icons/bs";
import { motion } from "framer-motion";
import { aboutHighlights, aboutMe, experiences, educationList, skills } from "../constants";
import styles from "../style";

const Content = ({ text, link }) => {
  return (
    <li className="font-poppins font-normal text-[14px] text-gray-600 mb-2">
      {text}{" "}
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <BsLink45Deg
            size="1rem"
            className="inline hover:text-secondary"
          />
        </a>
      ) : (
        ""
      )}
    </li>
  );
};

const ExperienceCard = (props) => {
  return (
    <motion.div
      whileInView={{ y: [-20, 0], opacity: [0, 1] }}
      transition={{ duration: 1 }}
      className="mb-5"
    >
      <div className="flex flex-row items-center mb-5">
        <div className="w-[48px] h-[48px] flex items-center justify-center bg-white rounded-md z-[2] overflow-hidden">
            <img
            src={props.logo}
            alt={props.organisation}
            className="w-full h-full object-contain"
            />
        </div>
        <h4 className="font-poppins font-medium tracking-tight text-[18px] text-secondary leading-[28px] ml-4">
          {props.organisation}
        </h4>
      </div>
      <ol className="relative border-l border-gray-200 ml-6">
        {props.positions.map((position, index) => (
          <li
            key={index}
            className={`${
              index === props.positions.length - 1 ? "mb-0" : "mb-8"
            } ml-6`}
          >
            <div className="absolute w-4 h-4 bg-secondary rounded-full mt-1.5 -left-2 border border-white"></div>
            <h3 className="text-[17px] font-medium font-poppins text-gray-900">
              {position.title}
            </h3>
            <time className="mb-4 block text-sm font-normal leading-none text-gray-400">
              {position.duration}{props.location ? ` | ${props.location}` : ""}
            </time>
            <ul className="list-disc ml-5 space-y-2">
                {position.content.map((info, index) => (
                <Content key={index} index={index} {...info} />
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </motion.div>
  );
};

const EducationCard = (props) => {
    return (
      <motion.div
        whileInView={{ y: [-20, 0], opacity: [0, 1] }}
        transition={{ duration: 1 }}
      className="flex flex-col justify-between h-full p-6 rounded-[18px] bg-white border border-gray-100"
      >
        <div>
            <div className="flex flex-row items-center mb-5">
            <div className="w-[54px] h-[54px] flex items-center justify-center bg-white rounded-md border border-gray-100 p-2">
                <img
                src={props.icon}
                alt={props.title}
                className="w-full h-full object-contain"
                />
            </div>
            <div className="flex flex-col ml-4">
                <h4 className="font-poppins font-medium tracking-tight text-[18px] text-primary leading-[27px]">
                {props.title}
                </h4>
                <p className="font-poppins font-base text-[15px] text-gray-800">
                {props.degree}
                </p>
            </div>
            </div>
            
            <ul className="list-disc ml-5 space-y-2 mb-5">
                <li className="font-poppins font-normal text-[14px] text-gray-800">
                    {props.content1}
                </li>
                {props.content2 && (
                    <li className="font-poppins font-normal text-[14px] text-gray-800">
                        {props.content2}
                    </li>
                )}
            </ul>
        </div>

        <div className="mt-auto">
            <span className="inline-block px-3 py-2 text-[13px] font-normal font-poppins text-secondary rounded-full">
                {props.duration}
            </span>
        </div>
      </motion.div>
    );
  };

const SkillGroup = (props) => (
  <motion.div
    whileInView={{ y: [20, 0], opacity: [0, 1] }}
    transition={{ duration: 0.5 }}
    className="p-5 rounded-[18px] bg-white border border-gray-100"
  >
    <h3 className="font-poppins font-medium tracking-tight text-[17px] text-primary leading-[26px] mb-3">
      {props.title}
    </h3>
    <div className="flex flex-wrap gap-2.5">
      {props.items.map((skill) => (
        <div
          key={skill.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100"
          title={skill.name}
        >
          {skill.icon ? React.createElement(skill.icon, { size: 18 }) : null}
          <span className="font-poppins font-normal text-[13px]">{skill.name}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const AboutCard = (props) => (
  <motion.div
    whileInView={{ y: [20, 0], opacity: [0, 1] }}
    transition={{ duration: 0.5 }}
    className="p-5 rounded-[18px] bg-white border border-gray-100"
  >
    <h3 className="font-poppins font-medium tracking-tight text-[17px] text-primary leading-[26px] mb-2">
      {props.title}
    </h3>
    <p className="font-poppins font-normal text-[13px] text-gray-600 leading-relaxed">
      {props.content || props.text}
    </p>
  </motion.div>
);

const SkillsAndExperience = ({
  aboutContent,
  skillsData = skills,
  experiencesData = experiences,
  educationData = educationList,
}) => {
  const about = {
    heading: aboutMe.aboutHeading,
    paragraph: aboutMe.aboutParagraph,
    highlights: aboutHighlights,
    ...aboutContent,
  };

  return (
    <section id="skills" className="mb-10 mx-auto">
      <div className="mt-10 mb-12">
        <h2 className={`${styles.heading2} mb-5`}>About</h2>
        <p className="font-poppins font-medium tracking-tight text-[19px] text-primary leading-[30px] max-w-4xl mb-3">
          {about.heading}
        </p>
        <p className={`${styles.paragraph} max-w-4xl text-gray-600`}>
          {about.paragraph}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {about.highlights.map((highlight, index) => (
            <AboutCard key={highlight.id || `${highlight.title}-${index}`} {...highlight} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className={`${styles.heading2} mb-8`}>Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillsData.map((skillGroup) => (
            <SkillGroup key={skillGroup.title} {...skillGroup} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Experience Column */}
          <div>
            <h2 className={`${styles.heading2} mb-8`}>Experience</h2>
            <div className="flex flex-col gap-6">
                {experiencesData.map((exp, index) => (
                    <ExperienceCard key={index} index={index} {...exp} />
                ))}
            </div>
          </div>

          {/* Education Column */}
          <div>
            <h2 className={`${styles.heading2} mb-8`}>Education</h2>
             <div className="flex flex-col gap-6">
                {educationData.map((edu, index) => (
                    <EducationCard key={index} index={index} {...edu} />
                ))}
            </div>
          </div>
      </div>
    </section>
  );
};

export default SkillsAndExperience;
