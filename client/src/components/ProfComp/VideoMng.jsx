import { useEffect, useState } from 'react';
import FileExplorer from '../../components/ProfComp/FileExplorer';
import {
  GetAll_DataStructure,
  Get_Video_Information,
} from '../../API/VideoCaller';
import FIleUploader from '../../components/ProfComp/FIleUploader';
import VideoPlayer from '../../components/ProfComp/VideoPlayer';
import VideoUpdater from '../../components/ProfComp/VideoUpdater';

const VideoMng = () => {
  const [data, setData] = useState({});
  const [idVideo, setIdVideo] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoData, setVideoData] = useState({});

  const jsonExemple = {
    'cours_07e6094f-d32e-466c-b34f-fadc92fd9ab5': {
      Matière: 'Mathématiques',
      chapitre: 'Nombres Complexes',
      titre: 'Introduction aux Nombres Imaginaires',
      date_creation: '2025-04-29T09:33:29.104Z',
      description: 'Ce cours présente les bases des nombres imaginaires.',
      ID_cours: 'cours_07e6094f-d32e-466c-b34f-fadc92fd9ab5',
      video: {
        video_id: 'vid_001',
        video_desc: 'Présentation générale des complexes',
        upload_date: '2025-04-28T10:00:00.000Z',
      },
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

    'cours_0ae8a9c4-b6df-4fd0-bc3d-2a567eb25e3f': {
      Matière: 'Physique',
      chapitre: 'Optique',
      titre: 'Lentilles convergentes',
      date_creation: '2025-04-30T14:21:11.504Z',
      description: "Étude des lentilles et des lois de l'optique géométrique.",
      ID_cours: 'cours_0ae8a9c4-b6df-4fd0-bc3d-2a567eb25e3f',
      video: {
        video_id: 'vid_002',
        video_desc: 'Fonctionnement des lentilles convergentes',
        upload_date: '2025-04-30T15:00:00.000Z',
      },
      documents: [
        {
          id: 'doc_003',
          title: 'Fiche résumé optique',
          description: 'Tableaux et formules à connaître',
          date_mise_en_ligne: '/documents/fiche_optique.pdf',
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
      video: {
        video_id: 'vid_003',
        video_desc: 'Implémentation en Python',
        upload_date: '2025-05-01T12:30:00.000Z',
      },
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

  useEffect(() => {
    const handleData = async () => {
      const res = await GetAll_DataStructure();
      if (res) {
        setData(res);
      }
    };
    handleData();
    setData(jsonExemple);
  }, []);

  useEffect(() => {
    const handleData = async () => {
      const res = await Get_Video_Information(idVideo);
      if (res) {
        setVideoData(res.data);
      }
    };

    if (idVideo) {
      setVideoUrl(`http://localhost:8000/api/video/view/${idVideo}/`);
      handleData();
    }
  }, [idVideo]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des vidéos</h1>
        <p className="text-gray-600 mt-2">
          Téléversez, consultez et mettez à jour les vidéos de vos cours.
        </p>
      </header>

      {/* Section de sélection et téléversement */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <FileExplorer data={data} setIdVideo={setIdVideo} />

        <FIleUploader />
      </section>

      {/* Section de visualisation et mise à jour */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Prévisualisation
          </h2>
          <VideoPlayer url={videoUrl} />
        </div>
        <VideoUpdater videoData={videoData} />
      </section>
    </div>
  );
};

export default VideoMng;
