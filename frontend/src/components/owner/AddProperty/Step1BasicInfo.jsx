import React from 'react';

const Step1BasicInfo = ({ formData, updateFormData, nextStep }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const inputClasses = 
    "w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 font-medium";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Basic Information</h2>
        <p className="text-slate-500 font-medium">Start by telling us the essential details about your property.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-1">
          <label className={labelClasses}>
            Property Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="e.g. Modern Annex near SLIIT Malabe"
          />
          <p className="text-xs text-slate-500 pt-1 font-medium pl-1">
            A catchy title helps your property stand out in searches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClasses}>
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="" disabled>Select category</option>
                <option value="single">Single Room</option>
                <option value="annex">Annex</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">expand_more</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>
              Nearby University <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <select
                name="nearbyUniversity"
                value={formData.nearbyUniversity}
                onChange={handleChange}
                required
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="" disabled>Select proximity</option>
                <option value="sliit">SLIIT (Malabe)</option>
                <option value="nsbm">NSBM (Homagama)</option>
                <option value="uom">University of Moratuwa</option>
                <option value="iit">IIT (Colombo)</option>
                <option value="horizon">Horizon Campus</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            Full Address <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <input
              type="text"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              required
              className={`${inputClasses} pl-12`}
              placeholder="No 123, New Kandy Road, Malabe"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            Property Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            className={`${inputClasses} resize-none`}
            placeholder="Describe the facilities, environment, and rules (e.g. WiFi available, electricity bill included, for female students only...)"
          ></textarea>
          <div className="flex justify-between items-center text-xs text-slate-500 pt-1 font-medium pl-1">
            <span>Minimum 50 characters recommended</span>
            <span className={formData.description?.length > 500 ? 'text-red-500' : ''}>
              {formData.description?.length || 0} / 500
            </span>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-end items-center mt-10">
          <button
            type="button"
            className="px-8 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all w-full sm:w-auto"
          >
            Save Draft
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

export default Step1BasicInfo;
