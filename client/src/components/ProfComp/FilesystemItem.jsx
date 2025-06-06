import { useState } from 'react';
import { ChevronRight, File, Folder } from 'lucide-react';
import PropTypes from 'prop-types';

const FilesystemItem = ({ node, setId }) => {

  const [isOpen, setIsOpen] = useState(false);

  const handleClickVideo = () => {
    setId(node.video_id);
  };


  if (node.type === 'video') {
    return (
      <li>
        <div className="flex items-center gap-1.5 py-1">
          <File className="ml-[22px] w-6 h-6 text-[--gray]" />
          <button
            onClick={handleClickVideo}
            className="underline hover:text-blue-300"
          >
            {node.name || 'Vidéo sans titre'} {/* Utilisez node.name ici */}
          </button>
        </div>
      </li>
    );
  }


  const hasChildren = node.nodes && node.nodes.length > 0;

  return (
    <li>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren && (
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 -m-1">
            <ChevronRight
              className={`w-4 h-4 text-gray-500 ${isOpen ? 'rotate-90' : ''}`}
            />
          </button>
        )}
        <Folder
          className={`w-6 h-6 text-sky-500 ${!hasChildren ? 'ml-[22px]' : ''}`}
        />
        <span>{node.name}</span>
      </div>

      {isOpen && hasChildren && (
        <ul className="pl-6">
          {node.nodes
            .filter(child => child !== null)
            .map((child, index) => (
              <FilesystemItem key={index} node={child} setId={setId} />
            ))}
        </ul>
      )}
    </li>
  );
};

FilesystemItem.propTypes = {
  node: PropTypes.shape({
    video_id: PropTypes.string,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        video_id: PropTypes.string,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        nodes: PropTypes.array,
      })
    ),
  }).isRequired,
  setId: PropTypes.func.isRequired,
};

export default FilesystemItem;
