import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Proptypes from 'prop-types';
import { Get_special_Document } from '../API/DocumentCaller';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

const SecureDocumentViewer = ({ authToken, documentId }) => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        setWidth(w);
      }
    });
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await Get_special_Document({ document_id: documentId });

        if (response.status !== 200) {
          throw new Error(response.message || 'Failed to load document');
        }

        const blob = response.data;


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
