import { useEffect, useState } from 'react';
import FilesystemItem from './FilesystemItem';
import PropTypes from 'prop-types';

function transformData(data) {
  if (!data || typeof data !== 'object') return [];

  const transform = (obj, keyName, visited = new WeakSet()) => {
    if (obj === null || typeof obj !== 'object') {
      return { type: 'leaf', name: `${keyName}: ${obj}`, nodes: [] };
    }

    if (visited.has(obj)) return { type: 'folder', name: keyName, nodes: [] };
    visited.add(obj);

    if (typeof obj === 'object' && 'video_id' in obj) {
      const tmp_name = `${obj.video_desc} | uploadé le: (${new Date(
        obj.upload_date
      ).toLocaleDateString()})`;
      return {
        type: 'video',
        video_id: obj.video_id,
        name: tmp_name,
      };
    }

    if (Array.isArray(obj)) {
      return {
        type: 'folder',
        name: keyName,
        nodes: obj.map((item, index) => transform(item, `[${index}]`, visited)),
      };
    }

    const filteredKeys = Object.keys(obj).filter(
      key => key !== 'description' && key !== 'upload_date'
    );

    return {
      type: 'folder',
      name: keyName,
      nodes: filteredKeys.map(key => transform(obj[key], key, visited)),
    };
  };

  return Object.keys(data).map(key => transform(data[key], key, new WeakSet()));
}

export default function Page({ setIdVideo, data }) {
  const nodes = data && typeof data === 'object' ? transformData(data) : [];
  const [id, setId] = useState('');

  useEffect(() => {
    if (id) {
      setIdVideo(id);
    }
  }, [id, setIdVideo]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Explorateur de vidéos
      </h2>

      <ul className="text-gray-800 space-y-2">
        {nodes.filter(Boolean).map(node => (
          <FilesystemItem key={node.name} node={node} setId={setId} />
        ))}
      </ul>
    </div>
  );
}

Page.propTypes = {
  setIdVideo: PropTypes.func.isRequired,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};
