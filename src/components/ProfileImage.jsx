import { useEffect, useState } from "react";
import { raafidMark } from "../assets";
import { profilePhoto } from "../constants";

const ProfileImage = ({ className, src: preferredSrc = profilePhoto }) => {
  const [src, setSrc] = useState(raafidMark);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setSrc(preferredSrc);
    image.src = preferredSrc;
  }, [preferredSrc]);

  return (
    <img
      src={src}
      alt="Raafid Afraaz G"
      className={className}
    />
  );
};

export default ProfileImage;
