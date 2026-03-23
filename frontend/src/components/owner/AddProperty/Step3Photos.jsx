import React, { useRef } from 'react';

const Step3Photos = ({ formData, updateFormData, prevStep, submitForm }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
    }));

    updateFormData('images', [...formData.images, ...newImages]);
  };

  const removeImage = (id) => {
    const updatedImages = formData.images.filter((img) => img.id !== id);
    updateFormData('images', updatedImages);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const getPreviewImage = () => {
    if (formData.images.length > 0) {
      return formData.images[0].url;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Upload Area */}
      <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Upload Property Photos
          </h1>
          <p className="text-slate-500 font-medium">
            High-quality images help your listing stand out. Drag and drop or browse to upload.
          </p>
        </div>

        {/* Main Dropzone */}
        <div
          onClick={handleClickUpload}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.03] px-6 py-14 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer mb-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              Click to browse files
            </h3>
            <p className="mt-2 text-sm text-slate-500 font-medium max-w-[250px]">
              Supports: JPG, PNG, WEBP. Minimum 1200x800px recommended.
            </p>
            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:shadow hover:border-slate-300 transition-all pointer-events-none"
            >
              Select Files
            </button>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Gallery Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-800 text-lg">
              Gallery
            </h4>
            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {formData.images.length} / 15 selected
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {formData.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group shadow-sm"
              >
                <img
                  src={img.url}
                  alt="Property upload preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-white/90 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 shadow-sm"
                  aria-label="Remove image"
                >
                  <span className="material-symbols-outlined text-sm font-bold">close</span>
                </button>
              </div>
            ))}
            {formData.images.length < 15 && (
              <div
                onClick={handleClickUpload}
                className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 group hover:border-primary/50 hover:bg-primary/[0.02] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-slate-400 text-3xl group-hover:text-primary transition-colors">
                  add_photo_alternate
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary">
                  Add More
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Live Preview & Actions */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
          <h4 className="font-extrabold text-slate-800 flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-xl">visibility</span>
            Live Preview
          </h4>

          {/* Preview Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40 relative">
            <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
              {getPreviewImage() ? (
                <img
                  src={getPreviewImage()}
                  alt="Main preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                    <span className="material-symbols-outlined text-6xl">image</span>
                    <span className="text-sm font-bold">No Image Setup</span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                  Preview
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="material-symbols-outlined text-white text-sm">
                  photo_library
                </span>
                <span className="text-[11px] text-white font-bold tracking-wide">
                  {formData.images.length}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <h5 className="font-bold text-lg leading-tight text-slate-900 truncate">
                  {formData.title || 'Property Title'}
                </h5>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm truncate">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="truncate font-medium">{formData.fullAddress || 'San Francisco, CA'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-lg">hotel</span>
                  <span className="text-sm font-bold text-slate-700">
                    {formData.maxOccupants || 1} Guests
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-lg">style</span>
                  <span className="text-sm font-bold text-slate-700 capitalize">
                    {formData.category || 'Category'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    Monthly Rent
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    Rs. {formData.monthlyRent || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mt-8">
            <button
                type="button"
                onClick={submitForm}
                className="w-full py-4 rounded-xl bg-primary text-white font-extrabold shadow-[0_8px_20px_rgb(29,188,96,0.30)] hover:bg-primary/95 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-base"
            >
                Publish Listing
                <span className="material-symbols-outlined text-xl">rocket_launch</span>
            </button>
            <button
                type="button"
                onClick={prevStep}
                className="w-full py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Photos;
