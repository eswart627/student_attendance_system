import axios from "axios";

const api = axios.create({
  baseURL: "https://ceo-immigrants-grad-critics.trycloudflare.com/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
