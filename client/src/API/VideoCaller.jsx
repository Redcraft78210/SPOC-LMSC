import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:8000/api/video",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": Cookies.get("csrftoken"),
  },
  withCredentials: true,
});

const GetAll_DataStructure = async () => {
  try {
    const response = await api.get("/all/");
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.response.status === 404) {
      console.error("API server not found.", error.response);
    } else if (error.response.status === 400) {
      console.error("Erreur API :", error.response?.status, error.message);
    }
    console.error(error);
  }
  return null;
};

const SendVideo = async ({ file, title }) => {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("title", title);

  try {
    const request = await api.post("/send/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { status: 200, message: "video send successfully, you can refresh" };
  } catch (error) {
    if (error.response.status === 404) {
      console.error("API server not found.", error.response);
    } else if (error.response.status === 400) {
      console.error("Erreur API :", error.response?.status, error.message);
    }
    console.error(error);
  }
  return null;
};

const Get_special_Video = async ({ video_id }) => {
  try {
    const response = await api.get(`/get/${video_id}`);
    return { status: 200, data: response.data };
  } catch (error) {
    if (error.response.status === 404) {
      console.error("API server not found.", error.response);
    } else if (error.response.status === 400) {
      console.error("Erreur API :", error.response?.status, error.message);
    }
    console.error(error);
  }
  return null;
};
export { GetAll_DataStructure, SendVideo };
