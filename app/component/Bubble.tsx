import { BotIcon, MessageSquare, RefreshCw } from "lucide-react";

const Bubble = ({ message, onRetry }) => {
  const { content, role, isError } = message;

  const handleRetry = () => {
    if (isError && onRetry) {
      onRetry();
    }
  };

  return (
    <div className={role}>
      {role === "user" &&
        <div className="botMessageIcon">
          <MessageSquare className="bot" />
        </div>}

      <div
        className={`${role === "assistant"
          ? "botMessage"
          : "userMessage"} ${isError ? "cursor-pointer" : ""}`}
        style={{
          backgroundColor: isError
            ? "#991B1B"
            : role === "assistant" ? "#374151" : "#2563EB",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
        onClick={handleRetry}
      >
        <p className="noMainMessage">
          {isError ? "Server is busy. Try again later." : content}
        </p>
        {isError && <RefreshCw className="w-4 h-4 animate-spin-hover" />}
      </div>

      {role === "assistant" &&
        <div className="botMessageIcon">
          <BotIcon className="bot" />
        </div>}
    </div>
  );
};

export default Bubble;
