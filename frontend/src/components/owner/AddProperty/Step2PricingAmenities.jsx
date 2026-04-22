import React from 'react';

const Step2PricingAmenities = ({ formData, updateFormData, prevStep, nextStep }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    updateFormData('amenities', {
      ...formData.amenities,
      [name]: checked
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const inputClasses = 
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary px-4 py-3.5 outline-none transition-all font-medium placeholder:text-slate-400";
  const labelClasses = "block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2";

  return (
    <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Pricing & Amenities
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Set your price and highlight what makes your place special.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100/80">
          <div className="space-y-1">
            <label className={labelClasses}>
              Monthly Rent (LKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-hover:text-primary transition-colors">
                Rs.
              </span>
              <input
                type="number"
                name="monthlyRent"
                value={formData.monthlyRent}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-12`}
                placeholder="50000"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>
              Security Deposit (LKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-hover:text-primary transition-colors">
                Rs.
              </span>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-12`}
                placeholder="100000"
              />
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="max-w-[200px]">
          <div className="space-y-1">
            <label className={labelClasses}>
              Max Occupants <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="maxOccupants"
              value={formData.maxOccupants}
              onChange={handleChange}
              required
              min="1"
              className={inputClasses}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        {/* Amenities Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-slate-900 dark:text-white text-lg font-extrabold flex items-center gap-2 mb-4">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
            Amenities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['electricity', 'water', 'wifi', 'furnished', 'ac', 'kitchen', 'parking', 'laundry'].map((amenity) => (
              <label 
                key={amenity} 
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  formData.amenities[amenity]
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900 hover:border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  name={amenity}
                  checked={formData.amenities[amenity]}
                  onChange={handleAmenityChange}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary transition-all cursor-pointer"
                />
                <span className={`font-bold capitalize ${formData.amenities[amenity] ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>
                  {amenity === 'ac' ? 'AC' : amenity}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-4">
          <label className={labelClasses}>
            Terms &amp; conditions <span className="text-slate-400 font-normal">(optional — shown to tenants)</span>
          </label>
          <textarea
            name="termsAndConditions"
            value={formData.termsAndConditions || ''}
            onChange={handleChange}
            rows={5}
            className={`${inputClasses} resize-none`}
            placeholder="e.g. Notice period, guest policy, utility responsibilities…"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between items-center mt-10">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:border-slate-600 transition-all w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Back
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-10 py-3.5 rounded-xl font-bold hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgb(29,188,96,0.30)] w-full sm:w-auto"
          >
            Next Step
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2PricingAmenities;
