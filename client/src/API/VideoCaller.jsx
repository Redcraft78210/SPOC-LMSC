import React from "react";
import axios from "axios";
const GetAll_DataStructure = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/video/all");
    if (response.status === 200){
      return response.data
    }
  } catch (error) {
    if (error.response.status === 404){
      console.error("API server not found." , error.response)
    } else if(error.response.status === 400){
      console.error("")
    }
    console.error(error);
  }
  return { status: 200, message: "Success", data: "" };
};
