import clsx from 'clsx';
import PropTypes from 'prop-types';
const PresentationCard = ({ className, content, title }) => {
  return (
    <article
      className={clsx(
        'w-72 bg-gray-700 shadow p-4 space-y-2 rounded-md hover:-translate-y-2 duration-300',
        className
      )}
    >
      <h1>{title}</h1>
      {content}
    </article>
  );
};

PresentationCard.propTypes = {
  className: PropTypes.string,
  content: PropTypes.object,
  title: PropTypes.string,
};

export default PresentationCard;
