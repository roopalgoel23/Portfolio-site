import React from 'react';
import { useEffect } from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar       from './components/Navbar';
import HeroSection  from './components/HeroSection';
import TrustBar     from './components/TrustBar';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import FeaturedBridesSection from './components/FeaturedBridesSection';
import PortfolioSection from './components/PortfolioSection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import useScrollReveal from './hooks/useScrollReveal';

import { AuthProvider } from './admin/context/AuthContext';
import PrivateRoute from './admin/components/PrivateRoute';
const AdminLayout  = React.lazy(() => import('./admin/AdminLayout'));
const AdminLogin   = React.lazy(() => import('./admin/pages/AdminLogin'));
const ContentPage  = React.lazy(() => import('./admin/pages/ContentPage'));
const ServicesPage = React.lazy(() => import('./admin/pages/ServicesPage'));
const PortfolioPage = React.lazy(() => import('./admin/pages/PortfolioPage'));
const BridesPage   = React.lazy(() => import('./admin/pages/BridesPage'));
const TestimonialsPage = React.lazy(() => import('./admin/pages/TestimonialsPage'));
const FaqsPage     = React.lazy(() => import('./admin/pages/FaqsPage'));

function PublicSite() {
  useScrollReveal();
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <AboutSection />
        <ServicesSection />
        <FeaturedBridesSection />
        <PortfolioSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2C2A2A',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif'
          },
          success: { iconTheme: { primary: '#D8C4B6', secondary: '#fff' } }
        }}
      />

      <AuthProvider>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <React.Suspense fallback={<AdminLoading />}>
                  <AdminLayout />
                </React.Suspense>
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/admin/content" replace />} />
            <Route path="content"      element={<React.Suspense fallback={<AdminLoading />}><ContentPage /></React.Suspense>} />
            <Route path="services"     element={<React.Suspense fallback={<AdminLoading />}><ServicesPage /></React.Suspense>} />
            <Route path="portfolio"    element={<React.Suspense fallback={<AdminLoading />}><PortfolioPage /></React.Suspense>} />
            <Route path="brides"       element={<React.Suspense fallback={<AdminLoading />}><BridesPage /></React.Suspense>} />
            <Route path="testimonials" element={<React.Suspense fallback={<AdminLoading />}><TestimonialsPage /></React.Suspense>} />
            <Route path="faqs"         element={<React.Suspense fallback={<AdminLoading />}><FaqsPage /></React.Suspense>} />
          </Route>

        {/* Public — catch-all */}
        <Route path="*" element={<PublicSite />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-primary" />
    </div>
  );
}
