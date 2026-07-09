import React, { useEffect, useState } from "react";
import { contactInfo, socialMedia } from "../constants";
import { layout } from "../style";
import ProfileImage from "./ProfileImage";
import { supabase } from "../lib/supabase";

const currentYear = new Date().getFullYear();

const Footer = ({
  contact = contactInfo,
  socialLinks = socialMedia,
  profilePhotoUrl,
  resumeUrl,
}) => {
  const [visitorCount, setVisitorCount] = useState(null);
  const [showCounter, setShowCounter] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    async function loadVisitorData() {
      try {
        // Check if public counter is enabled
        const { data: settings } = await supabase
          .from("visitor_settings")
          .select("key, value")
          .eq("key", "show_public_counter")
          .single();

        if (!settings?.value) return;

        // Fetch total count (now using total_visits)
        const { data: countData } = await supabase
          .from("visitor_count_cache")
          .select("total_visits")
          .eq("id", 1)
          .single();

        if (countData?.total_visits != null) {
          setVisitorCount(Number(countData.total_visits));
          setShowCounter(true);
        }
      } catch {
        // Silently ignore — visitor counter is non-critical
      }
    }

    loadVisitorData();
  }, []);

  return (
  <footer id="contactMe" className="relative bg-white sm:px-12 px-6 py-5 border-t border-gray-200">
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-50 -z-10"></div>

    <div
      className={`${layout.sectionReverse} xl:max-w-275 w-full mx-auto gap-y-4 relative z-10`}
    >
      <div className={` ${layout.sectionInfo}`}>
        <h2 className="text-[22px] font-medium tracking-tight text-primary font-poppins">
          {contact.heading}
        </h2>
        <p
          className={`font-poppins italic font-light text-gray-600 text-[15px] leading-6.5 max-w-117.5 mt-2`}
        >
          {contact.text}
        </p>
        <div className="font-poppins font-light text-gray-600 text-[13px] leading-6 mt-3">
          <a href={`mailto:${contact.email}`} className="hover:text-secondary transition-colors">
            {contact.email}
          </a>
          <span className="mx-2 text-gray-300">|</span>
          <a href={`tel:${(contact.phone || "").replace(/\s/g, "")}`} className="hover:text-secondary transition-colors">
            {contact.phone}
          </a>
        </div>
        <div className="font-poppins font-light text-gray-600 text-[13px] leading-6 mt-1">
          <a href={contact.github} target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
            GitHub
          </a>
          <span className="mx-2 text-gray-300">|</span>
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
            LinkedIn
          </a>
          <span className="mx-2 text-gray-300">|</span>
          <a href={resumeUrl || contact.resume} target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
            Resume
          </a>
        </div>

        <div className="flex flex-row mt-4 gap-3">
          {socialLinks.map((social, index) => (
            <a
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              key={social.id}
              index={index}
              title={social.title}
              className="w-9 h-9 rounded-full bg-gray-100 flex justify-center items-center text-gray-600 hover:bg-secondary hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              {React.createElement(social.icon, { size: 18 })}
            </a>
          ))}
        </div>
      </div>

      <div className="md:ml-auto mt-6 md:mt-0 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-secondary rounded-full blur-xl opacity-20 animate-pulse"></div>
          <ProfileImage className="w-32.5 h-32.5 border-4 border-white shadow-2xl relative z-5 rounded-full object-cover" src={profilePhotoUrl} />
        </div>
      </div>
    </div>

    <div className="w-full h-px bg-gray-200 my-5"></div>

    <div className="text-center font-poppins font-normal text-gray-600 text-xs">
      <p>&copy; {currentYear} Raafid Afraaz G. All rights reserved.</p>
      {showCounter && visitorCount !== null && (
        <p className="mt-1 text-gray-400 text-[11px] flex items-center justify-center gap-1">
          <span>👁</span>
          <span>{visitorCount.toLocaleString()} total visits</span>
        </p>
      )}
    </div>
  </footer>
  );
};

export default Footer;
