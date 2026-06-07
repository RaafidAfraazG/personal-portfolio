import { useEffect, useState } from "react";
import { raafidMark } from "../assets";
import { profilePhoto } from "../constants";

const ProfileImage = ({ className }) => {
  const [src, setSrc] = useState(raafidMark);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setSrc(profilePhoto);
    image.src = profilePhoto;
  }, []);

  return (
    <img
      src={src}
      alt="Raafid Afraaz G"
      className={className}
    />
  );
};

export default ProfileImage;
