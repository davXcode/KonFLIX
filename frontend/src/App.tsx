import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Search from './pages/Search';
import Movie from './pages/Movie';
import Browse from './pages/Browse';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Shorts from './pages/Shorts';
import LiveSport from './pages/LiveSport';
import CatalogPage from './components/CatalogPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie" element={<Movie />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/search" element={<Search />} />

        {/* Generic browse pages */}
        <Route path="/browse" element={<Browse />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/live" element={<LiveSport />} />

        {/* Category pages using CatalogPage */}
        <Route path="/kdrama" element={<CatalogPage title="K-Drama" />} />
        <Route path="/cdrama" element={<CatalogPage title="C-Drama" />} />
        <Route path="/thai" element={<CatalogPage title="Thai Drama" />} />
        <Route path="/jdrama" element={<CatalogPage title="J-Drama" />} />
        <Route path="/western" element={<CatalogPage title="Western" />} />
        <Route path="/anime" element={<CatalogPage title="Anime" />} />

        {/* account */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}
