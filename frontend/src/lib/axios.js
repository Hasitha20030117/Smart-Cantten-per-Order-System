import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";
export const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || "";

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;
