import { useEffect, useState } from 'react';
import DocumentExplorer from '../../components/ProfComp/DocumentExplorer';
import { GetAll_DataStructure } from '../../API/VideoCaller';
import DocumentUploader from '../../components/ProfComp/DocumentUploader';
import DocumentViewer from '../../components/ProfComp/DocumentViewer';
import DocumentUpdater from '../../components/ProfComp/DocumentUpdater';

const DocumentMng = () => {
  const [idDocument, setIdDocument] = useState('');
  const [documentData, setDocumentData] = useState({});
  const [documentUrl, setDocumentUrl] = useState(null);

  const jsonExemple = {
    'cours_07e6094f-d32e-466c-b34f-fadc92fd9ab5': {
      Matière: 'Mathématiques',
      chapitre: 'Nombres Complexes',
      titre: 'Introduction aux Nombres Imaginaires',
      date_creation: '2025-04-29T09:33:29.104Z',
      description: 'Ce cours présente les bases des nombres imaginaires.',
      ID_cours: 'cours_07e6094f-d32e-466c-b34f-fadc92fd9ab5',
      documents: [
        {
          id: 'doc_001',
          title: 'Notes de cours',
          description: 'Résumé des notions clés',
          date_mise_en_ligne: '/documents/notes_complexes.pdf',
        },
        {
          id: 'doc_002',
          title: 'Exercices corrigés',
          description: "Exercices d'application sur les complexes",
          date_mise_en_ligne: '/documents/exos_complexes.pdf',
        },
      ],
    },
    'cours_215b15c7-cd1e-4439-b3e6-d219c22d6c5f': {
      Matière: 'Informatique',
      chapitre: 'Structures de Données',
      titre: 'Listes chaînées',
      date_creation: '2025-05-01T12:10:42.000Z',
      description:
        'Comprendre le fonctionnement des listes simplement chaînées.',
      ID_cours: 'cours_215b15c7-cd1e-4439-b3e6-d219c22d6c5f',
      documents: [
        {
          id: 'doc_004',
          title: 'Code source Python',
          description: 'Exemple de liste chaînée',
          date_mise_en_ligne: '/documents/liste_chainee.py',
        },
        {
          id: 'doc_005',
          title: 'Comparaison avec tableaux',
          description: 'Différences entre listes et tableaux',
          date_mise_en_ligne: '/documents/compare_list_tableau.pdf',
        },
      ],
    },
  };

  const [data, setData] = useState(jsonExemple);

  useEffect(() => {
    const handleData = async () => {
      const res = await GetAll_DataStructure();
      if (res) {
        setData(res);
      }
    };
    handleData();
  }, []);

  useEffect(() => {
    if (idDocument) {
      const found = Object.values(data)
        .flatMap(course => course.documents || [])
        .find(doc => doc.id === idDocument);

      if (found) {
        setDocumentData(found);
        setDocumentUrl(found.date_mise_en_ligne);
      }
    }
  }, [idDocument, data]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestion des documents
        </h1>
        <p className="text-gray-600 mt-2">
          Téléversez, consultez et mettez à jour les documents de vos cours.
        </p>
      </header>

      {/* Section de sélection et téléversement */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <DocumentExplorer data={data} setIdDocument={setIdDocument} />

        {/* Passer un tableau de cours à DocumentUploader */}
        <DocumentUploader courses={Object.values(data)} />
      </section>

      {/* Section de visualisation et mise à jour */}
      <section className="">
        <DocumentUpdater documentData={documentData} />
      </section>

      <div className="mt-2 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Prévisualisation
        </h2>
        <DocumentViewer url={documentUrl} />
      </div>
    </div>
  );
};

export default DocumentMng;
