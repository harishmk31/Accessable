import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import DiscoveryPage from './pages/DiscoveryPage';
import PlaceDetailsPage from './pages/PlaceDetailsPage';
import AddPlacePage from './pages/AddPlacePage';
import EditPlacePage from './pages/EditPlacePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SavedPlacesPage from './pages/SavedPlacesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
            <Navbar />
            <main id="main-content" className="flex-1" tabIndex="-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/discover" element={<DiscoveryPage />} />
                <Route path="/saved" element={<SavedPlacesPage />} />
                <Route path="/places/new" element={<AddPlacePage />} />
                <Route path="/places/:id" element={<PlaceDetailsPage />} />
                <Route path="/places/:id/edit" element={<EditPlacePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
