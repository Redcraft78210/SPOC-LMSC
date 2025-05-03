import { useState } from 'react';
import { SendVideo } from '../../API/VideoCaller';

const FIleUploader = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState('');

  const handleSend = async () => {
    if (!file || !title) {
      alert('Veuillez fournir un fichier et un titre.');
      return;
    }
    const request = await SendVideo({ file, title, desc });
    if (request) {
      alert('Vidéo envoyée avec succès !');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Envoyer une vidéo
      </h2>

      <input
        type="text"
        onChange={e => setTitle(e.target.value)}
        placeholder="Titre de la vidéo"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        onChange={e => setDesc(e.target.value)}
        placeholder="Description"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="file"
        accept="video/*"
        onChange={e => setFile(e.target.files[0])}
        className="w-full mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />

      <button
        onClick={handleSend}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        Envoyer
      </button>
    </div>
  );
};

export default FIleUploader;
