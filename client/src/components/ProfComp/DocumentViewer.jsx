import PropTypes from 'prop-types';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pdfjs } from 'react-pdf';

const PDFViewer = ({ url }) => {
  return (
    <div className="pdf-viewer-wrapper">
      {url ? (
        <Worker
          workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}
        >
          <Viewer fileUrl={url} />
        </Worker>
      ) : (
        <div>Chargement du PDF...</div>
      )}
    </div>
  );
};

PDFViewer.propTypes = {
  url: PropTypes.string,
};

export default PDFViewer;
