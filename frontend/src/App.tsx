import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Search from './pages/Search';
import Movie from './pages/movie';
import Browse from './pages/Browse';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Shorts from './pages/Shorts';
import LiveSport from './pages/LiveSport';

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie" element={<Movie />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/live" element={<LiveSport />} />
      </Routes>
    </div>
  );
}
