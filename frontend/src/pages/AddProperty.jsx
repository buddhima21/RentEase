import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1BasicInfo from '../components/owner/AddProperty/Step1BasicInfo';
import Step2PricingAmenities from '../components/owner/AddProperty/Step2PricingAmenities';
import Step3Photos from '../components/owner/AddProperty/Step3Photos';
import UserDropdown from '../components/UserDropdown';
import OwnerNotificationsBell from '../components/owner/dashboard/OwnerNotificationsBell';
import { useAuth } from '../context/AuthContext';
import { ownerProfile } from '../data/ownerDashboardData';
import { createProperty } from '../services/api';

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
    termsAndConditions: '',
    monthlyRent: '',
    securityDeposit: '',
    maxOccupants: '',
    amenities: {
      electricity: false,
      water: false,
      wifi: false,
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const parsedPrice = parseFloat(formData.monthlyRent);
      const parsedDeposit = parseFloat(formData.securityDeposit);
      const parsedBedrooms = parseInt(formData.maxOccupants, 10);

      const selectedAmenities = Object.entries(formData.amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const imageUrls = (formData.images || [])
        .map((img) => (typeof img === 'string' ? img : img?.url))
        .filter((url) => typeof url === 'string' && url.length > 0);

      const payload = {
        title: formData.title && formData.title.length >= 5 ? formData.title : 'New Property Listing',
        description: formData.description || 'No description provided.',
        address: formData.fullAddress || '123 Main St',
        city: formData.fullAddress?.split(',').pop()?.trim() || 'Colombo',
        price: isNaN(parsedPrice) || parsedPrice <= 0 ? 1000 : parsedPrice,
        securityDeposit: isNaN(parsedDeposit) || parsedDeposit < 0 ? 0 : parsedDeposit,
        bedrooms: isNaN(parsedBedrooms) || parsedBedrooms < 0 ? 1 : parsedBedrooms,
        bathrooms: 1,
        area: 1200,
        propertyType: formData.category || 'Apartment',
        amenities: selectedAmenities,
        imageUrls,
        termsAndConditions: formData.termsAndConditions?.trim() || undefined,
      };

      const response = await createProperty(payload);
      if (response.data.success) {
        navigate('/owner/properties', {
          state: { successMessage: 'Property published successfully and is pending admin approval.' },
        });
      }
    } catch (error) {
      console.error('Error creating property:', error);
      let errorMsg = 'Failed to publish property';
      if (error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).join(', ');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response) {
        errorMsg = `Status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      } else {
        errorMsg += ` - ${error.message}`;
      }
      alert(`Error detail: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
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
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-[#f6f8f7] text-slate-900 min-h-screen flex flex-col"
      style={{ "--color-primary": "#26C289" }}
    >
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
              <h2 className="text-xl font-bold tracking-tight text-slate-900">RentEase</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-medium text-slate-500 mr-2">
                Owner Dashboard
              </span>
                <OwnerNotificationsBell />
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
        {renderStep()}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>© 2024 RentEase Sri Lanka. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AddProperty;


