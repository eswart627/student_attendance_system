import axios from "axios";

const api = axios.create({
  baseURL: "https://student-attendance-system-kr95.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
