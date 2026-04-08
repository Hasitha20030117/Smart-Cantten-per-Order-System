import axios from "axios";

const axiosInstance = axios.create({
	baseURL:"http://localhost:8070",
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;