import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import PropTypes from 'prop-types';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set worker source with matching version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
  };

  const changePage = offset => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-[600px] text-gray-500">
        Sélectionnez un document à prévisualiser
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="pdf-container border rounded-lg p-4 bg-white shadow-sm">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={error => {
            console.error('Error loading PDF:', error);
            setError(error.data.message);
          }}
          loading={
            <div className="flex items-center justify-center h-[600px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          {error ? (
            <div className="flex items-center justify-center h-[600px] text-red-500">
              Erreur lors du chargement du PDF: {error}
            </div>
          ) : (
            <Page
              pageNumber={pageNumber}
              width={550}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>

      {numPages && !error && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
          >
            Précédent
          </button>

          <p className="text-sm">
            Page {pageNumber} sur {numPages}
          </p>

          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

DocumentViewer.propTypes = {
  url: PropTypes.string,
};

export default DocumentViewer;
