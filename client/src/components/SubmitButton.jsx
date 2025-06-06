import { useState, useEffect } from "react";
import { Check, Send } from "lucide-react";
import PropTypes from "prop-types";

const SubmitButton = ({ onSubmission }) => {
  const [status, setStatus] = useState("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);


  useEffect(() => () => clearTimeout(timeoutId), [timeoutId]);

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      setStatus("pending");
      const success = await Promise.resolve(onSubmission(e));

      if (success) {
        setStatus("success");
        setTimeoutId(setTimeout(() => setStatus("idle"), 2000));
      } else {
        setStatus("error");
        setTimeoutId(setTimeout(() => setStatus("idle"), 2000));
      }
    } catch (error) {
      setStatus("error");
      console.error("Submission error:", error);
    }
  };

  const getButtonState = () => {
    switch (status) {
      case "success":
        return {
          className: "bg-green-600",
          content: <Check className="w-6 h-6 animate-checkmark" />,
        };
      case "error":
        return {
          className: "bg-red-600",
          content: "Erreur",
        };
      case "pending":
        return {
          className: "bg-neutral-600 opacity-75",
          content: "Envoi...",
        };
      default:
        return {
          className: `bg-neutral-600 hover:opacity-90 active:opacity-100 ${
            isHovered ? "pr-16" : "pr-4"
          }`,
          content: (
            <>
              <span
                className={`absolute left-2/4 transform -translate-x-1/2 transition-all duration-300 ${
                  isHovered ? "opacity-0 -translate-x-full" : "opacity-100"
                }`}
              >
                Valider
              </span>
              <div
                className={`absolute right-0 flex justify-center transition-all duration-300 ${
                  isHovered ? "w-full" : "w-1/4"
                }`}
              >
                <Send
                  className={`transition-all duration-300 ${
                    isHovered ? "w-6 h-6" : "w-0 h-0"
                  }`}
                />
              </div>
            </>
          ),
        };
    }
  };

  const { className, content } = getButtonState();

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={status === "pending"}
      aria-live="polite"
      className={`relative w-full h-12 text-white text-sm font-semibold uppercase flex items-center justify-center rounded-md shadow-lg transition-all duration-300 ${className}`}
    >
      {content}
    </button>
  );
};

SubmitButton.propTypes = {
  onSubmission: PropTypes.func.isRequired,
};

export default SubmitButton;
