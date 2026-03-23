import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1BasicInfo from '../components/owner/AddProperty/Step1BasicInfo';
import Step2PricingAmenities from '../components/owner/AddProperty/Step2PricingAmenities';
import Step3Photos from '../components/owner/AddProperty/Step3Photos';
import UserDropdown from '../components/UserDropdown';
import { useAuth } from '../context/AuthContext';
import { ownerProfile } from '../data/ownerDashboardData';

const AddProperty = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    nearbyUniversity: '',
    fullAddress: '',
    description: '',
    monthlyRent: '',
    securityDeposit: '',
    maxOccupants: '',
    utilities: {
      electricity: false,
      water: false,
      wifi: false,
    },
    amenities: {
      furnished: false,
      ac: false,
      kitchen: false,
      parking: false,
      laundry: false,
    },
    images: [],
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitForm = () => {
    console.log('Submitting property data:', formData);
    // TODO: Connect to Spring Boot backend API here
    // alert('Property published successfully!');
    // navigate('/owner/properties');
  };

  const calculateProgress = () => {
    if (step === 1) return 25;
    if (step === 2) return 50;
    if (step === 3) return 85;
    return 100;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <Step2PricingAmenities
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
      case 3:
        return (
          <Step3Photos
            formData={formData}
            updateFormData={updateFormData}
            prevStep={prevStep}
            submitForm={submitForm}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-[#f6f8f7] text-slate-900 min-h-screen flex flex-col"
      style={{ "--color-primary": "#1DBC60" }}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/owner/dashboard')}
            >
              <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">home_work</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                RentEase
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-medium text-slate-500 mr-2">
                Owner Dashboard
              </span>
              <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              {user ? (
                  <UserDropdown user={user} onLogout={logout} />
              ) : (
                  <div
                      className="w-10 h-10 rounded-full border-2 border-primary bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('${ownerProfile.avatar}')` }}
                  />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[900px] w-full mx-auto px-4 py-10 md:py-14">
        {/* Progress Stepper */}
        {step < 4 && (
          <div className="mb-12 max-w-3xl mx-auto">
            <div className="flex items-end justify-between mb-4 px-2">
              <div>
                <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                  Step {step} of 3
                </span>
                <p className="text-slate-900 mt-2 font-extrabold text-2xl tracking-tight hidden sm:block">
                    {step === 1 && "Basic Information"}
                    {step === 2 && "Pricing & Amenities"}
                    {step === 3 && "Photos & Live Preview"}
                </p>
              </div>
              <span className="text-slate-500 text-sm font-bold bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                {calculateProgress()}% Complete
              </span>
            </div>
            
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        {renderStep()}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>© 2024 RentEase Sri Lanka. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AddProperty;


