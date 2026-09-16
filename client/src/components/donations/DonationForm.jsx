import React, { useState } from 'react';
import {
  Utensils, Calendar, MapPin, Camera, ShieldCheck, Check,
  ArrowRight, ArrowLeft, Trash2, Eye, Upload, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LocationPickerModal from '../map/LocationPickerModal';
import toast from 'react-hot-toast';

const FOOD_CATEGORIES = [
  'Cooked food',
  'Packaged food',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Other',
];

const QUANTITY_UNITS = ['meals', 'servings', 'kg', 'packets', 'boxes', 'liters', 'units'];
const DIETARY_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan'];
const DONOR_TYPES = ['Hostel', 'Restaurant', 'Hotel', 'Marriage/Function Hall', 'College', 'Canteen', 'Event Organizer', 'Individual', 'Other'];

export const DonationForm = ({ initialValues = {}, onSubmit, loading = false }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const defaultPrepared = new Date(Date.now() - 30 * 60000).toISOString().slice(0, 16);
  const defaultAvailable = new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: initialValues.title || initialValues.foodName || '',
    foodName: initialValues.foodName || initialValues.title || '',
    donorType: initialValues.donorType || user?.donorType || 'Restaurant',
    foodCategory: initialValues.foodCategory || initialValues.foodType || 'Cooked food',
    foodType: initialValues.foodType || 'Cooked food',
    dietaryType: initialValues.dietaryType || 'Vegetarian',
    description: initialValues.description || '',
    quantity: initialValues.quantity || '',
    quantityUnit: initialValues.quantityUnit || 'meals',
    preparedAt: initialValues.preparedAt ? new Date(initialValues.preparedAt).toISOString().slice(0, 16) : defaultPrepared,
    pickupDeadline: initialValues.pickupDeadline ? new Date(initialValues.pickupDeadline).toISOString().slice(0, 16) : defaultAvailable,
    availableUntil: initialValues.availableUntil ? new Date(initialValues.availableUntil).toISOString().slice(0, 16) : defaultAvailable,
    address: initialValues.location?.address || user?.location?.address || '',
    city: initialValues.location?.city || user?.location?.city || '',
    pincode: initialValues.location?.pincode || user?.location?.pincode || '',
    pickupInstructions: initialValues.pickupInstructions || '',
    contactNumber: initialValues.contactNumber || user?.phone || '',
    latitude: initialValues.location?.coordinates?.[1] || 0,
    longitude: initialValues.location?.coordinates?.[0] || 0,
    safetyConfirmed: false,
    images: initialValues.images || (initialValues.imageUrl ? [initialValues.imageUrl] : []),
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(initialValues.images || (initialValues.imageUrl ? [initialValues.imageUrl] : []));
  const [sampleImageUrls, setSampleImageUrls] = useState([]);

  const setField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  // Preset food image helper
  const addSampleImage = (url) => {
    if (previewUrls.length >= 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }
    setPreviewUrls((prev) => [...prev, url]);
    setSampleImageUrls((prev) => [...prev, url]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (previewUrls.length + files.length > 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        toast.error(`${file.name} is not a supported format (JPG, PNG, WEBP only)`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setImageFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...validPreviews]);
  };

  const removeImage = (index) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setSampleImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Step Validations
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter the Food Name');
        return false;
      }
    } else if (step === 2) {
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        toast.error('Please enter a valid positive quantity');
        return false;
      }
      if (!formData.preparedAt) {
        toast.error('Please enter preparation date & time');
        return false;
      }
      if (!formData.pickupDeadline) {
        toast.error('Please enter available-until deadline');
        return false;
      }
      if (new Date(formData.pickupDeadline) <= new Date(formData.preparedAt)) {
        toast.error('Available Until must be after Prepared Date/Time');
        return false;
      }
    } else if (step === 3) {
      if (!formData.address.trim()) {
        toast.error('Please enter street address');
        return false;
      }
      if (!formData.city.trim()) {
        toast.error('Please enter city');
        return false;
      }
      if (!formData.pincode.trim() || formData.pincode.length < 4) {
        toast.error('Please enter a valid pincode');
        return false;
      }
    } else if (step === 4) {
      if (previewUrls.length === 0) {
        toast.error('Please upload or select at least 1 food photo');
        return false;
      }
    } else if (step === 5) {
      if (!formData.safetyConfirmed) {
        toast.error('Please confirm the food safety declaration');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('foodName', formData.title.trim());
    fd.append('donorType', formData.donorType);
    fd.append('foodType', formData.foodCategory);
    fd.append('foodCategory', formData.foodCategory);
    fd.append('dietaryType', formData.dietaryType);
    fd.append('description', formData.description.trim());
    fd.append('quantity', formData.quantity);
    fd.append('quantityUnit', formData.quantityUnit);
    fd.append('preparedAt', formData.preparedAt);
    fd.append('pickupDeadline', formData.pickupDeadline);
    fd.append('availableUntil', formData.pickupDeadline);
    fd.append('address', formData.address.trim());
    fd.append('city', formData.city.trim());
    fd.append('pincode', formData.pincode.trim());
    fd.append('pickupInstructions', formData.pickupInstructions.trim());
    fd.append('contactNumber', formData.contactNumber.trim());
    fd.append('latitude', formData.latitude);
    fd.append('longitude', formData.longitude);
    fd.append('safetyConfirmed', 'true');

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => fd.append('image', file));
    }

    if (sampleImageUrls.length > 0) {
      fd.append('imageUrl', sampleImageUrls[0]);
      sampleImageUrls.forEach((url) => fd.append('images[]', url));
    } else if (previewUrls.length > 0 && typeof previewUrls[0] === 'string' && previewUrls[0].startsWith('http')) {
      fd.append('imageUrl', previewUrls[0]);
    }

    onSubmit(fd);
  };

  const steps = [
    { num: 1, label: 'Food Details', icon: Utensils },
    { num: 2, label: 'Quantity & Time', icon: Calendar },
    { num: 3, label: 'Location', icon: MapPin },
    { num: 4, label: 'Photos', icon: Camera },
    { num: 5, label: 'Food Safety', icon: ShieldCheck },
    { num: 6, label: 'Review & Post', icon: Sparkles },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Wizard Progress Steps Bar */}
      <div className="bg-slate-900 px-4 sm:px-8 py-5 border-b border-slate-800">
        <div className="grid grid-cols-6 gap-2">
          {steps.map(({ num, label, icon: Icon }) => {
            const isActive = currentStep === num;
            const isDone = currentStep > num;
            return (
              <div
                key={num}
                onClick={() => {
                  if (isDone) setCurrentStep(num);
                }}
                className={`flex flex-col items-center text-center cursor-pointer transition-all ${
                  isActive
                    ? 'text-emerald-400 font-bold scale-105'
                    : isDone
                    ? 'text-emerald-600 hover:text-emerald-400 font-medium'
                    : 'text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-1 text-xs transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                      : isDone
                      ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-[10px] sm:text-xs truncate max-w-full hidden md:inline">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* STEP 1: Food Details */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 1 of 6</span>
              <h2 className="text-xl font-bold text-slate-900">Food Details</h2>
              <p className="text-xs text-slate-500">Provide basic information about the surplus food</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Food Name / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Vegetable Biryani & Paneer Curry, Fresh Bagels, Boxed Sandwiches"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Donor Organization / Type
                </label>
                <select
                  value={formData.donorType}
                  onChange={(e) => setField('donorType', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                >
                  {DONOR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Food Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.foodCategory}
                  onChange={(e) => setField('foodCategory', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                >
                  {FOOD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dietary Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setField('dietaryType', opt)}
                    className={`p-3 rounded-xl border text-center transition-all font-semibold text-xs ${
                      formData.dietaryType === opt
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {opt === 'Vegetarian' && '🥦 '}
                    {opt === 'Non-Vegetarian' && '🍗 '}
                    {opt === 'Vegan' && '🌱 '}
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description & Ingredients (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Mention storage state (hot/refrigerated), packaging details, or allergen notes..."
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Quantity & Timing */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 2 of 6</span>
              <h2 className="text-xl font-bold text-slate-900">Quantity & Timing</h2>
              <p className="text-xs text-slate-500">Specify rescue volume and collection window</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={formData.quantity}
                  onChange={(e) => setField('quantity', e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.quantityUnit}
                  onChange={(e) => setField('quantityUnit', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                >
                  {QUANTITY_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Prepared Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.preparedAt}
                  onChange={(e) => setField('preparedAt', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Available Until (Pickup Deadline) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.pickupDeadline}
                  onChange={(e) => setField('pickupDeadline', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Automatic Expiry Protection:
              </p>
              <p>
                When <em>Available Until</em> deadline passes, uncollected listings automatically expire to prevent spoiled food distributions.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Location */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 3 of 6</span>
                <h2 className="text-xl font-bold text-slate-900">Pickup Location</h2>
                <p className="text-xs text-slate-500">Address where the volunteer will collect the food</p>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5" />
                Pin on Map
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Building name, Floor/Door number, Street or Landmark"
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setField('city', e.target.value)}
                  placeholder="e.g. Hyderabad, Bengaluru, Mumbai, Narasaraopet"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setField('pincode', e.target.value)}
                  placeholder="e.g. 500081"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Phone for Pickup
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setField('contactNumber', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pickup Instructions
                </label>
                <input
                  type="text"
                  value={formData.pickupInstructions}
                  onChange={(e) => setField('pickupInstructions', e.target.value)}
                  placeholder="e.g. Enter through kitchen back door, ask for Manager"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Food Photo & Proof */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 4 of 6</span>
              <h2 className="text-xl font-bold text-slate-900">Food Photo & Proof</h2>
              <p className="text-xs text-slate-500">Upload up to 3 real photos of the food containers</p>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="food-photo-upload"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="food-photo-upload" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Click to Take or Upload Food Photos
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, WEBP (Max 3 photos, up to 5MB each)
                </p>
              </label>
            </div>

            {/* Photo Previews */}
            {previewUrls.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Uploaded Photos ({previewUrls.length}/3):
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-sm">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-500 transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Sample Presets */}
            {previewUrls.length < 3 && (
              <div className="pt-2">
                <span className="text-xs text-slate-500 block mb-1.5">Or choose sample food photos for testing:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addSampleImage('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                  >
                    🍛 Rice & Biryani
                  </button>
                  <button
                    type="button"
                    onClick={() => addSampleImage('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                  >
                    🍞 Fresh Bakery Bread
                  </button>
                  <button
                    type="button"
                    onClick={() => addSampleImage('https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format&fit=crop&q=80')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                  >
                    🥗 Fresh Meal Boxes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Food Safety */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 5 of 6</span>
              <h2 className="text-xl font-bold text-slate-900">Food Safety Confirmation</h2>
              <p className="text-xs text-slate-500">Ensure food is fresh, hygienic, and safe for consumption</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">Food Quality Standards</h3>
                  <p className="text-xs text-emerald-800">Please review before confirming donation</p>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-emerald-900/90 pl-2">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Food was prepared in a hygienic kitchen environment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Food has been stored at appropriate temperature (hot holding or refrigeration).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Food has not been consumed from or contaminated by guests.</span>
                </li>
              </ul>
            </div>

            {/* Mandatory Checkbox */}
            <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/40">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.safetyConfirmed}
                  onChange={(e) => setField('safetyConfirmed', e.target.checked)}
                  className="mt-1 h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900 leading-relaxed">
                  "I confirm that this food is intended for human consumption and has been stored appropriately."
                </span>
              </label>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Note: Verification confirms the submitted listing details were reviewed. It does not replace proper food-safety judgment.
            </p>
          </div>
        )}

        {/* STEP 6: Review & Post */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 6 of 6</span>
              <h2 className="text-xl font-bold text-slate-900">Review & Post Food Donation</h2>
              <p className="text-xs text-slate-500">Confirm all details before publishing to verified NGOs</p>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Food Details
                </span>
                <p className="text-base font-bold text-slate-900">{formData.title}</p>
                <p className="text-emerald-700 font-semibold">
                  {formData.dietaryType} • {formData.foodCategory}
                </p>
                {formData.description && <p className="text-slate-500 pt-1">{formData.description}</p>}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Quantity & Timing
                </span>
                <p className="text-base font-bold text-slate-900">
                  {formData.quantity} {formData.quantityUnit}
                </p>
                <p className="text-slate-600">
                  Prepared: {new Date(formData.preparedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <p className="text-amber-700 font-semibold">
                  Available Until: {new Date(formData.pickupDeadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Pickup Address
                </span>
                <p className="font-bold text-slate-900">
                  {formData.address}, {formData.city} - {formData.pincode}
                </p>
                {formData.pickupInstructions && (
                  <p className="text-slate-500">Instructions: {formData.pickupInstructions}</p>
                )}
              </div>
            </div>

            {/* Photo Previews in Review */}
            {previewUrls.length > 0 && (
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-2">
                  Food Photos ({previewUrls.length})
                </span>
                <div className="flex gap-2">
                  {previewUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Food ${idx + 1}`}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black shadow-xl shadow-emerald-950/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing Donation...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Post Food Donation
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Map Location Picker Modal */}
      {locationModalOpen && (
        <LocationPickerModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          onSelectLocation={(loc) => {
            setField('latitude', loc.lat);
            setField('longitude', loc.lng);
            if (loc.address) setField('address', loc.address);
            if (loc.city) setField('city', loc.city);
            setLocationModalOpen(false);
            toast.success('Location pinned from map!');
          }}
          initialPosition={[formData.latitude || 17.385, formData.longitude || 78.4867]}
        />
      )}
    </div>
  );
};

export default DonationForm;
