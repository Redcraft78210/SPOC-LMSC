// import React from "react";
// import { ThemeContext } from "../../contexts/ThemeContext";
// import NavBar from "../../components/ProfComp/NavBar";
// import Darkmode from "../../components/ProfComp/Darkmode";
// import Card from "../../components/ProfComp/Card";
// import Darkmode2 from "../../components/ProfComp/Darkmode2";
// import OnAir from "../../components/OnAir";
// import OnAir2 from "../../components/ProfComp/OnAir2";
// import "./styles/Dashboard.module.css";

// import PresentationCard from '../../components/PresentationCard';
import CourseVisibilityManager from '../../components/ProfComp/CourseVisibilityManager';

const DashboardProf = () => {
  const data = {
    courses: [
      {
        ID_cours: 'cours_01',
        Matière: 'Mathématiques',
        chapitre: 'Fonctions',
        titre: 'Étude des fonctions de référence',
      },
      {
        ID_cours: 'cours_02',
        Matière: 'Physique',
        chapitre: 'Cinématique',
        titre: 'Mouvement rectiligne uniforme',
      },
      {
        ID_cours: 'cours_03',
        Matière: 'SVT',
        chapitre: 'Génétique',
        titre: 'Transmission des caractères',
      },
    ],
    classes: [
      {
        id: 'classe_1',
        name: '2nde A',
      },
      {
        id: 'classe_2',
        name: '1ère S',
      },
      {
        id: 'classe_3',
        name: 'Terminale ES',
      },
      {
        id: 'classe_4',
        name: 'Terminale S',
      },
    ],
  };

  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseVisibilityManager
          courses={Object.values(data)} // ou ton appel API
          classes={[
            { id: 'classe_1', name: 'Terminale S' },
            { id: 'classe_2', name: 'Première ES' },
            { id: 'classe_3', name: 'Seconde A' },
          ]}
          onSave={(courseId, classIds) => {
            console.log('Cours sélectionné :', courseId);
            console.log('Classes autorisées :', classIds);
            // ici, tu fais un appel API pour enregistrer
          }}
        />
      </section>
    </div>
  );
};

export default DashboardProf;
