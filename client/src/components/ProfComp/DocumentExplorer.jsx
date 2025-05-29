import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GetCourses } from '../../API/ProfGestion';
import { Get_Document_Information } from '../../API/DocumentCaller';
import { toast } from 'react-hot-toast';

export default function DocumentExplorer({ onDocumentSelect }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger la liste des cours
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await GetCourses();
        if (result?.status === 200) {
          setCourses(result.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
        toast.error('Erreur lors du chargement des cours');
      }
    };
    fetchCourses();
  }, []);

  // Mettre à jour la liste des documents quand un cours est sélectionné
  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = courses.find(
        course => course.id === selectedCourseId
      );
      if (selectedCourse?.documents) {
        setDocuments(selectedCourse.documents);
      } else {
        setDocuments([]);
      }
      setSelectedDocument(null);
    }
  }, [selectedCourseId, courses]);

  const handleDocumentClick = async documentId => {
    

    if (!documentId) {
      console.error('No document ID provided');
      return;
    }

    if (typeof onDocumentSelect !== 'function') {
      console.error('onDocumentSelect is not a function');
      return;
    }

    setLoading(true);
    try {
      const detailsResponse = await Get_Document_Information({
        document_id: documentId,
      });

      

      if (detailsResponse?.status === 200) {
        const documentDetails = detailsResponse.data;
        setSelectedDocument(documentDetails);

        onDocumentSelect({
          ...documentDetails,
          id: documentId,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Explorateur de documents
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un cours
        </label>
        <select
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          <option value="">Choisir un cours...</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.matiere} | {course.chapitre} | {course.titre}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-4">
          <span className="text-gray-600">Chargement...</span>
        </div>
      )}

      <ul className="space-y-2">
        {documents.map(doc => (
          <li
            key={`doc-${doc.id}`}
            onClick={() => !loading && handleDocumentClick(doc.id)}
            className={`
              cursor-pointer p-2 hover:bg-gray-50 rounded-md flex items-center
              ${loading ? 'opacity-50' : ''}
              ${selectedDocument?.id === doc.id ? 'bg-blue-50 border border-blue-200' : ''}
            `}
          >
            <span className="mr-2">📄</span>
            <div>
              <p className="text-blue-600 hover:underline">{doc.commit_msg}</p>
              <p className="text-sm text-gray-500">
                Uploadé le : {new Date(doc.upload_date).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
        {!loading && documents.length === 0 && (
          <li key="no-documents" className="text-center py-4 text-gray-500">
            Aucun document disponible pour ce cours
          </li>
        )}
      </ul>
    </div>
  );
}

DocumentExplorer.propTypes = {
  onDocumentSelect: PropTypes.func.isRequired,
};
