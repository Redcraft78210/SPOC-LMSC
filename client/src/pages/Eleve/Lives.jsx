// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import ContentCard from '../../components/LiveCards.jsx';

// const Lives = () => {
//     const [lives, setLives] = useState([]);
//     const studentId = jwtDecode(sessionStorage.getItem('authToken') || localStorage.getItem('authToken')).id;
//     const classId = jwtDecode(sessionStorage.getItem('authToken') || localStorage.getItem('authToken')).classId;

//     useEffect(() => {
//         const fetchLives = async () => {
//             try {
//                 const response = await axios.get(`/api/lives/class/${classId}`, {
//                     headers: {
//                         Authorization: `Bearer ${sessionStorage.getItem('authToken') || localStorage.getItem('authToken')}`,
//                     },
//                 });
//                 // check if response.data is an array and setLives to response.data
//                 if (Array.isArray(response.data)) {
//                     setLives(response.data);
//                 }
//             } catch (error) {
//                 console.error('Error fetching lives:', error);
//             }
//         };

//         fetchLives();
//     }, [studentId, classId]);

//     return (
//         <div>
//             <h1>Available Lives</h1>
//             <div className="container mt-5">
//                 {lives.map((live) => (
//                     <ContentCard content={live} />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Lives;
