import React from "react";
import { BsLink45Deg } from "react-icons/bs";
import { achievements } from "../constants";
import { AiFillGithub } from "react-icons/ai";
import { FaYoutube } from "react-icons/fa";
import { TiNews } from "react-icons/ti";
import styles from "../style";
import { motion } from "framer-motion";

const AchievementCard = (props) => {
  return (
    <motion.div
      className="flex flex-col p-6 rounded-[20px] bg-white border border-gray-200 h-full hover:border-secondary/50 transition-colors duration-300"
      whileInView={{ y: [20, 0], opacity: [0, 1] }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-row items-center mb-4">
        <div className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center bg-gray-50">
          {props.icon ? (
            <img
              src={props.icon}
              alt={props.event}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="font-poppins font-medium text-white text-[13px] tracking-normal">
                {props.thumbnailText}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col ml-4">
            <h3 className="font-poppins font-medium tracking-tight text-[18px] text-primary leading-[26px]">
            {props.event}
            </h3>
            <p className="font-poppins font-normal text-[14px] text-secondary">
            {props.position}
            </p>
        </div>
      </div>
      
      <div className="flex-1 mb-6">
        <ul className="space-y-2">
            {props.content1 && (
            <li className="font-poppins font-normal text-gray-600 text-[14px] flex items-start gap-2">
                <span className="text-secondary mt-1 text-[10px]">●</span>
                <span>{props.content1}</span>
            </li>
            )}
            {props.content2 && (
            <li className="font-poppins font-normal text-gray-600 text-[14px] flex items-start gap-2">
                <span className="text-secondary mt-1 text-[10px]">●</span>
                <span>{props.content2}</span>
            </li>
            )}
            {props.content3 && (
            <li className="font-poppins font-normal text-gray-600 text-[14px] flex items-start gap-2">
                <span className="text-secondary mt-1 text-[10px]">●</span>
                <span>{props.content3}</span>
            </li>
            )}
        </ul>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-gray-100 mt-auto">
        {props.article && (
          <a
            className="text-gray-500 hover:text-secondary transition-colors"
            href={props.article}
            target="_blank"
            rel="noopener noreferrer"
            title="Article"
          >
            <TiNews size="1.5rem" />
          </a>
        )}
        {props.youtube && (
          <a
            className="text-gray-500 hover:text-secondary transition-colors"
            href={props.youtube}
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube"
          >
            <FaYoutube size="1.5rem" />
          </a>
        )}
        {props.github && (
          <a
            className="text-gray-500 hover:text-secondary transition-colors"
            href={props.github}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
          >
            <AiFillGithub size="1.5rem" />
          </a>
        )}
        {props.project && (
          <a
            className="text-gray-500 hover:text-secondary transition-colors"
            href={props.project}
            target="_blank"
            rel="noopener noreferrer"
            title="Project Link"
          >
            <BsLink45Deg size="1.5rem" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

const Achievements = () => {
  return (
    <section id="achievements">
      <h1 className={`${styles.heading2} text-center pt-10`}>
        Hackathon Achievements
      </h1>

      <div className="container px-2 py-10 mx-auto mb-8">
        <div className="grid grid-cols-1 gap-8 mt-8 md:mt-16 md:grid-cols-2">
          {achievements.map((achievement, index) => (
            <AchievementCard key={achievement.id} {...achievement} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
