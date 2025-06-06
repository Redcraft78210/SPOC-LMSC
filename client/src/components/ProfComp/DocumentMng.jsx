import { useState } from 'react';
import DocumentExplorer from './DocumentExplorer';
import DocumentUploader from './DocumentUploader';
import DocumentViewer from './DocumentViewer';
import DocumentUpdater from './DocumentUpdater';
import { Toaster } from 'react-hot-toast';

const DocumentMng = () => {
  const [documentData, setDocumentData] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);

  const handleDocumentSelect = documentDetails => {
    
    setDocumentUrl(documentDetails.downloadUrl);
    setDocumentData(documentDetails);
  };

  const handleRefresh = () => {

    if (documentData?.id) {

      handleDocumentSelect(documentData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <DocumentExplorer onDocumentSelect={handleDocumentSelect} />
        <DocumentUploader onUploadSuccess={handleRefresh} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Prévisualisation
          </h2>
          <DocumentViewer url={documentUrl} />
        </div>
        <DocumentUpdater documentData={documentData} onUpdate={handleRefresh} />
      </section>
    </div>
  );
};

export default DocumentMng;
