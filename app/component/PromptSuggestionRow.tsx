import PromptSuggestionButton from "./PromptSuggestionButton";
const PromptSuggestionRow = ({ onPromptClick }) => {
  const prompts = [
    "Entry requirement Oxford Computer science MSc",
    "Program Duration at St Andrew Computer science Msc"
  ];
  return (
    <div className="prompt-suggestion-row">
      {prompts.map((prompt, index) =>
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      )}
    </div>
  );
};
export default PromptSuggestionRow;
