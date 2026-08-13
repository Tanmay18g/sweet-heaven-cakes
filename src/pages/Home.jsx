import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ExploreCakes from '../components/ExploreCakes';
import BuildCustomCake from '../components/BuildCustomCake';
import Gallery from '../components/Gallery';
import InfoSection from '../components/InfoSection';
import About from '../components/About';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import WhatsAppFab from '../components/WhatsAppFab';
import QuickEnquiryModal from '../components/QuickEnquiryModal';

export default function Home() {
  const { loading } = useSiteConfig();
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const openEnquiry = () => setEnquiryOpen(true);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      <Header onEnquire={openEnquiry} />
      <main>
        <Hero onEnquire={openEnquiry} />
        <ExploreCakes />
        <BuildCustomCake onEnquire={openEnquiry} />
        <Gallery />
        <InfoSection />
        <About />
        <FAQ />
        <Contact onEnquire={openEnquiry} />
      </main>
      <Footer />
      <WhatsAppFab />
      <QuickEnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  );
}
