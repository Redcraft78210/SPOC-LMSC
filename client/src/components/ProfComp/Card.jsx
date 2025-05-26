import clsx from 'clsx';
import PropTypes from 'prop-types';
const Card = ({ content, className }) => {
  const darkMode = true;
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={`w-full h-full rounded-2xl ${
          darkMode
            ? 'bg-gradient-to-br from-neutral-800 to-neutral-900'
            : 'bg-gradient-to-br from-neutral-400 to-neutral-500'
        }`}
      >
        <p>{content}</p>
      </div>
    </div>
  );
};
Card.propTypes = {
  content: PropTypes.object,
  className: PropTypes.string,
};
export default Card;
