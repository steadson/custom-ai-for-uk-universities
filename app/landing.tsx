"use client";

import { useRouter } from "next/navigation";

const LandingPage = () => {
  const router = useRouter();

  const handleStartChat = () => {
    router.push("/chat");
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">Welcome to UniBot</h1>
      <p className="landing-subtitle">
        Your guide to UK Computer Science programs.
      </p>
      <button onClick={handleStartChat} className="start-button">
        Start Chat with UniBot
      </button>
    </div>
  );
};

export default LandingPage;
