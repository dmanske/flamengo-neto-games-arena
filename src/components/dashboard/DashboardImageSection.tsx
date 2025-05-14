
import React from "react";

interface DashboardImageSectionProps {
  imageUrl?: string;
}

export const DashboardImageSection = ({
  imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRULonro80DLVex706fDQXv1GEjjAhog4ON_g&s",
}: DashboardImageSectionProps) => {
  return (
    <div className="flex justify-center items-center my-8">
      <img
        src={imageUrl}
        alt="Flamengo Image"
        className="h-auto max-w-full rounded-lg shadow-lg"
      />
    </div>
  );
};
