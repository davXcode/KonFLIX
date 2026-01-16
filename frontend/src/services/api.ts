import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:3000/api',
// });
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const getHomepage = () => api.get('/moviebox/homepage');
export const getTrending = () => api.get('/moviebox/trending');
export const searchMovie = (q: string) =>
  api.get('/moviebox/search?query=' + encodeURIComponent(q));
export const getDetail = (id: string) =>
  api.get('/moviebox/detail?subjectId=' + id);
// export const getSources = (id: string) => api.get("/moviebox/sources?subjectId=" + id);
export const getSources = (id: string, season?: number, episode?: number) => {
  let url = '/moviebox/sources?subjectId=' + id;

  if (season && episode) {
    url += `&season=${season}&episode=${episode}`;
  }

  return api.get(url);
};

export const generateStream = (url: string) =>
  api.get(
    '/moviebox/generate-link-stream-video?url=' + encodeURIComponent(url)
  );
