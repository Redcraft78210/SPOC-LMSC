import PropTypes from 'prop-types';
const Checkbox = ({ isMain, setIsMain, text }) => {
  return (
    <div className="flex items-center space-x-3">
      <label className="group flex items-center cursor-pointer bg-transparent">
        <input
          className="hidden peer"
          type="checkbox"
          checked={isMain}
          onChange={() => setIsMain(!isMain)}
        />
        <span
          className={`relative w-8 h-8 flex justify-center items-center border-2 rounded-md shadow-md transition-all duration-500 ${
            isMain ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
          } peer-hover:scale-105`}
        >
          <span className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 opacity-0 peer-checked:opacity-100 rounded-md transition-all duration-500 peer-checked:animate-pulse" />
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            className={`w-5 h-5 text-white transition-transform duration-500 transform ${
              isMain ? 'scale-100' : 'scale-0'
            }`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              fillRule="evenodd"
            />
          </svg>
        </span>
        <span className="ml-3 text-gray-700 group-hover:text-blue-500 font-medium transition-colors duration-300">
          {text}
        </span>
      </label>
    </div>
  );
};

Checkbox.propTypes = {
  isMain: PropTypes.bool,
  setIsMain: PropTypes.func,
  text: PropTypes.string,
};
export default Checkbox;
