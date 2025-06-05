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
import { useEffect, useState } from 'react';
import CourseVisibilityManager from '../../components/ProfComp/CourseVisibilityManager';
import { GetClasses } from '../../API/ProfGestion';
import PropTypes from 'prop-types';

const DashboardProf = ({ token }) => {
  const [classeList, setClasseList] = useState({});
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
  };

  useEffect(() => {
    const fetchClasse = async () => {
      const response = await GetClasses(token);
      if (response.status === 200) {
        setClasseList(response.data);
      } else {
        console.error(response);
      }
    };
    fetchClasse();
  }, [token]);
  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseVisibilityManager
          courses={Object.values(data)}
          classes={classeList}
          onSave={(courseId, classIds) => {
            console.log(`Course ${courseId} visibility updated for classes:`, classIds);
            
          }}
        />
      </section>
    </div>
  );
};

DashboardProf.propTypes = {
  token: PropTypes.string.isRequired,
};
export default DashboardProf;
