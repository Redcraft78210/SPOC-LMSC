import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const SecureDocumentViewer = ({ documentId, authToken }) => {
  const [docUrl, setDocUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) throw new Error('Document non trouvé');
        const { url } = await response.json();
        setDocUrl(url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, authToken]);

  if (loading)
    return <div className="text-center p-4">Chargement du document...</div>;
  if (error) return <div className="text-red-600 p-4">Erreur : {error}</div>;

  return (
    <div className="border rounded-lg overflow-hidden my-4">
      <div className="bg-gray-100 p-2 text-sm">
        Prévisualisation sécurisée :
      </div>
      <iframe
        src={docUrl}
        className="w-full h-96 border-0" // Style via Tailwind
        style={{ border: 'none' }} // Double protection CSS
        title="Aperçu du document"
        onContextMenu={e => e.preventDefault()}
      />
    </div>
  );
};

SecureDocumentViewer.propTypes = {
  documentId: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
};

export default SecureDocumentViewer;
