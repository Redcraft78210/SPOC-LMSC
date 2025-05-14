import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Proptypes from 'prop-types';

console.log(pdfjs.version);
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_URL = 'https://localhost:8443/api';

const SecureDocumentViewer = ({ authToken, documentId }) => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);


  useEffect(() => {
    if (!containerRef.current) return;
    // Création de l'observer
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        setWidth(w);
      }
    });
    observer.observe(containerRef.current);
    // nettoyage
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchPDF = async () => {
      const controller = new AbortController();

      try {
        const response = await fetch(`${API_URL}/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to load document');
        }

        const blob = await response.blob();

        // Validation renforcée du PDF
        if (!blob.type.includes('pdf')) {
          throw new Error('Invalid file type');
        }

        setPdfData(blob);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPDF();
  }, [authToken, documentId]);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div
          className="border border-gray-300 rounded-lg bg-white shadow-sm p-4"
          ref={containerRef}
          style={{ width: '100%', height: '100%' }}
        >
          {pdfData && (
            <Document
              file={pdfData}
              onLoadSuccess={onLoadSuccess}
              className="pdf-viewer flex items-center justify-center w-full h-full"
            >
              <div className="space-y-4">
                {[...Array(numPages)].map((_, pageIndex) => (
                  <Page
                    key={pageIndex}
                    pageNumber={pageIndex + 1}
                    // renderTextLayer={false}
                    loading={
                      <div className="text-center py-8">
                        Chargement de la page...
                      </div>
                    }
                    width={width}
                  />
                ))}
              </div>
            </Document>
          )}

          {!pdfData && (
            <div className="text-center py-8 text-gray-500">
              Chargement du document...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SecureDocumentViewer.propTypes = {
  authToken: Proptypes.string.isRequired,
  documentId: Proptypes.string.isRequired,
};

export default SecureDocumentViewer;
