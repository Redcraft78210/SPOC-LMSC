import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Proptypes from 'prop-types';
import { Get_special_Document } from '../API/DocumentCaller';

/** Configure le worker PDF.js pour le rendu des documents PDF */
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

/**
 * Composant pour afficher de manière sécurisée des documents PDF.
 * Récupère et affiche un document PDF spécifique avec une mise en page réactive.
 *
 * @component
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.authToken - Token d'authentification pour accéder au document
 * @param {string} props.documentId - Identifiant unique du document à afficher
 * @returns {JSX.Element} Composant d'affichage de document PDF
 */
const SecureDocumentViewer = ({ authToken, documentId }) => {
  /** @type {Blob|null} */
  /** @description État contenant les données binaires du PDF */
  const [pdfData, setPdfData] = useState(null);

  /** @type {number|null} */
  /** @description État contenant le nombre total de pages du document */
  const [numPages, setNumPages] = useState(null);

  /** @type {number} */
  /** @description État contenant la largeur du conteneur pour le rendu réactif */
  const [width, setWidth] = useState(0);

  /** @type {React.RefObject} */
  /** @description Référence vers l'élément conteneur du PDF */
  const containerRef = useRef(null);

  /**
   * Observe et réagit aux changements de taille du conteneur pour adapter la taille du PDF
   */
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

  /**
   * Récupère le document PDF depuis l'API en utilisant l'ID du document fourni
   * 
   * @throws {Error} Si le document ne peut pas être chargé ou si le type de fichier est invalide
   */
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

  /**
   * Gère le chargement réussi du document PDF
   * 
   * @param {Object} data - Données du document chargé
   * @param {number} data.numPages - Nombre total de pages du document
   */
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

/**
 * Validation des props du composant SecureDocumentViewer
 */
SecureDocumentViewer.propTypes = {
  /** Token d'authentification requis pour accéder au document */
  authToken: Proptypes.string.isRequired,
  /** Identifiant unique du document à afficher */
  documentId: Proptypes.string.isRequired,
};

export default SecureDocumentViewer;
