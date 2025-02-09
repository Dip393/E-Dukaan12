import React from "react";

const Community = () => {
  const whatsappLink = "https://chat.whatsapp.com/GC7BnSwsxQsCDAqBBdHQIK"; // Replace with your actual link

  return (
    <div className="flex items-center justify-center mb-9">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-9 px-6 py-3 text-white bg-black rounded-lg shadow-lg hover:bg-gray-600 transition duration-300"
      >
        Join Our Community
      </a>
    </div>
  );
};

export default Community;
