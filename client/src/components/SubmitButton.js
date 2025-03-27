import { useState } from "react";
import { Check, Send } from "lucide-react";

const SubmitButton = ({ onclicl }) => {
  const [success, setSuccess] = useState(false);
  const [hover, setHover] = useState(false);

  const handleClick = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    const handleSubmited = () => {
      onclicl();
    };
    handleSubmited();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative w-full h-12 text-white text-sm font-semibold uppercase flex items-center justify-center rounded-md shadow-lg transition-all duration-300 ${
        success
          ? "bg-green-600"
          : "bg-neutral-600 hover:opacity-90 active:opacity-100"
      }`}
    >
      {!success ? (
        <>
          <span
            className={`absolute left-2/4 transform -translate-x-1/2 transition-all duration-300 ${
              hover ? "opacity-0 -translate-x-full" : "opacity-100"
            }`}
          >
            Submit
          </span>
          <div
            className={`absolute right-0 flex justify-center transition-all duration-300 ${
              hover ? "w-full" : "w-1/4"
            }`}
          >
            <Send
              className={`transition-all duration-300 ${
                hover ? "w-5 h-5" : "w-4 h-4"
              }`}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-full">
          <Check className="w-6 h-6" />
        </div>
      )}
    </button>
  );
};

export default SubmitButton;
