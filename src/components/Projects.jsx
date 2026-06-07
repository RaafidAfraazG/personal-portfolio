import React, { useState, useEffect, useRef } from "react";
import { projects, projectTabs } from "../constants";
import { AiFillGithub } from "react-icons/ai";
import { BsLink45Deg } from "react-icons/bs";
import { motion } from "framer-motion";
import styles from "../style";

const Project = (props) => {
  return (
    <motion.div
      className="project-card flex-shrink-0 flex flex-col md:w-[360px] w-[300px] p-5 rounded-[18px] bg-white border border-gray-200 md:mr-8 mr-5 my-4 hover:border-secondary/50 transition-colors duration-300"
      whileInView={{ y: [20, 0], opacity: [0, 1] }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-row items-start mb-4">
        <div className="w-[56px] h-[56px] rounded-md overflow-hidden border border-gray-100 flex-shrink-0 mr-4">
          {props.image ? (
            <img
              className="w-full h-full object-cover"
              src={props.image}
              alt={props.title}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="font-poppins font-medium text-white text-[15px] tracking-normal">
                {props.thumbnailText}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <h3 className="font-poppins font-medium tracking-tight text-[18px] text-primary leading-[27px]">
            {props.title}
          </h3>
          
          <div className="flex flex-wrap gap-2.5 mt-2">
              {(props.stack || []).map((tech, index) => (
                <div
                  key={tech.id}
                  className="relative group text-gray-500 hover:text-secondary transition-colors text-[18px] cursor-pointer"
                >
                  {React.createElement(tech.icon)}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
        </div>
      </div>

      <p className="font-poppins font-normal text-[13px] text-gray-600 mb-5 flex-1 leading-relaxed">
        {props.content}
      </p>

      <div className="flex items-center gap-5 pt-4 border-t border-gray-100 mt-auto">
        {props.github && (
          <a 
            href={props.github} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-poppins font-normal text-[13px] text-gray-600 hover:text-secondary transition-colors"
          >
            <AiFillGithub size="1.5rem" />
            <span>Code</span>
          </a>
        )}
        {props.link && (
          <a 
            href={props.link} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-poppins font-normal text-[13px] text-gray-600 hover:text-secondary transition-colors"
          >
            <BsLink45Deg size="1.5rem" />
            <span>Link</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const [activeTab, setActiveTab] = useState(projectTabs[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardTotalWidth, setCardTotalWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);
  const activeProjects = projects.filter((project) => project.tab === activeTab);

  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        const card = containerRef.current.querySelector('.project-card');
        if (card) {
          const cardWidth = card.offsetWidth;
          const cardMargin = parseInt(window.getComputedStyle(card).marginRight, 10); 

          setCardTotalWidth(cardWidth + cardMargin); 
        }
      }
    };

    updateCardWidth(); 
    window.addEventListener("resize", updateCardWidth); 

    return () => {
      window.removeEventListener("resize", updateCardWidth); 
    };
  }, [activeTab]);

  useEffect(() => {
    setCurrentIndex(0);
    setDragOffset(0);
  }, [activeTab]);

  const handleNext = () => {
    if (currentIndex < activeProjects.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.pageX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50; 
    
    if (dragOffset < -threshold && currentIndex < activeProjects.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else if (dragOffset > threshold && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
    }
    
    setDragOffset(0);
  };
  
  const handleMouseLeave = () => {
      if (isDragging) handleMouseUp();
  };

  const isNextDisabled = currentIndex >= activeProjects.length - 1;
  const isPrevDisabled = currentIndex === 0;

  return (
    <section
      className="bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden py-8 md:mt-8 relative"
      id="projects"
    >
      <div className={` ${styles.flexCenter} ${styles.paddingX}`}>
        <div className={`${styles.boxWidth}`}>
          <h1 className={`${styles.heading2} text-center`}>
            Projects
          </h1>
        </div>
      </div>
      <div className={` ${styles.flexCenter} ${styles.paddingX}`}>
        <div className={`${styles.boxWidth} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {projectTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 text-[13px] font-normal rounded-full transition-all duration-300 focus:outline-none font-poppins ${
                  activeTab === tab
                    ? "bg-secondary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="my-10">
            <div
              ref={containerRef}
              className="flex"
              style={{
                transform: `translateX(calc(-${currentIndex * cardTotalWidth}px + ${dragOffset}px))`,
                transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {activeProjects.map((project, index) => (
                <Project key={project.id} index={index} {...project} />
              ))}
            </div>
            <div className="flex justify-end mb-4 gap-2">
              <button
                onClick={handlePrev}
                disabled={isPrevDisabled}
                className="w-10 h-10 rounded-full border border-secondary text-secondary flex items-center justify-center hover:bg-secondary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-secondary transition-all duration-300"
              >
                &lt;
              </button>
              <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className="w-10 h-10 rounded-full border border-secondary text-secondary flex items-center justify-center hover:bg-secondary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-secondary transition-all duration-300"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
