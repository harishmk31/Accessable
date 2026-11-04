import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AppLayout from './components/AppLayout';

// Pages
import HomePage from './pages/HomePage';
import DiscoveryPage from './pages/DiscoveryPage';
import TamilNaduHubPage from './pages/TamilNaduHubPage';
import AccessibilityMapPage from './pages/AccessibilityMapPage';
import ReviewsPage from './pages/ReviewsPage';
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
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoveryPage />} />
              <Route path="/accessibility-map" element={<AccessibilityMapPage />} />
              <Route path="/map" element={<AccessibilityMapPage />} />
              <Route path="/regions" element={<TamilNaduHubPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/saved" element={<SavedPlacesPage />} />
              <Route path="/saved-places" element={<SavedPlacesPage />} />
              <Route path="/places/new" element={<AddPlacePage />} />
              <Route path="/places/:id" element={<PlaceDetailsPage />} />
              <Route path="/places/:id/edit" element={<EditPlacePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
