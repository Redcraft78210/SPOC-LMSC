import axios from 'axios';
import PropTypes from 'prop-types';

const createApi = authToken => {
  return axios.create({
    baseURL: 'http://localhost:8443/api/video',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });
};

const GetAll_DataStructure = async ({ authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get('/all/');
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const SendVideo = async ({ file, title, authToken }) => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', title);

  try {
    const api = createApi(authToken);
    const response = await api.post('/send/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authToken}`,
      },
    });
    return {
      status: response.status,
      data: response.data,
      message: 'Video sent successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const Get_special_Video = async ({ video_id, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get(`/get/${video_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const Get_Video_Information = async ({ video_id, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.get(`/video-info/${video_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Success',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const updateVideo = async ({ video_id, updatedData, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.put(`/update/${video_id}/`, updatedData);
    return {
      status: response.status,
      data: response.data,
      message: 'Video updated successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

const DeleteVideo = async ({ video_id, authToken }) => {
  try {
    const api = createApi(authToken);
    const response = await api.delete(`/delete/${video_id}`);
    return {
      status: response.status,
      data: response.data,
      message: 'Video deleted successfully',
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      data: null,
      message: error.message,
    };
  }
};

// Alias pour Get_Video_Information
const getVideoDetails = async ({ video_id, authToken }) => {
  return Get_Video_Information({ video_id, authToken });
};

// Fonction pour générer l'URL de streaming d'une vidéo
const getVideoStreamUrl = videoId => {
  return `https://192.168.36.10:443/api/video/stream/${videoId}`;
};

// PropTypes
SendVideo.propTypes = {
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string])
    .isRequired,
  title: PropTypes.string.isRequired,
  authToken: PropTypes.string.isRequired,
};

Get_special_Video.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  authToken: PropTypes.string.isRequired,
};

GetAll_DataStructure.propTypes = {
  authToken: PropTypes.string.isRequired,
};

Get_Video_Information.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  authToken: PropTypes.string.isRequired,
};

updateVideo.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  updatedData: PropTypes.object.isRequired,
  authToken: PropTypes.string.isRequired,
};

DeleteVideo.propTypes = {
  video_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  authToken: PropTypes.string.isRequired,
};

export {
  GetAll_DataStructure,
  SendVideo,
  SendVideo as uploadVideo, // Add this alias for SendVideo
  Get_special_Video,
  Get_Video_Information,
  updateVideo,
  getVideoDetails,
  getVideoStreamUrl,
  DeleteVideo,
};
