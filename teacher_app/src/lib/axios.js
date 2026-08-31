import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

export default api;


// $2b$10$/QfuCsWOxgwrwj0UoLvbHuynSEeCmeOpdn2C8LsjzfIw6a7uUMyDm
// $2b$10$/QfuCsWOxgwrwj0UoLvbHuynSEeCmeOpdn2C8LsjzfIw6a7uUMyDm