import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DonationForm from '../../components/donations/DonationForm';
import { donationService } from '../../services/donationService';
import toast from 'react-hot-toast';

export const CreateDonationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await donationService.create(formData);
      toast.success('Donation created! NGOs nearby will be notified.');
      navigate('/donor/my-donations');
    } catch (err) {
      toast.error(err.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Donation</h1>
          <p className="text-sm text-slate-500 mt-0.5">List your surplus food to help communities in need</p>
        </div>
      </div>

      <DonationForm onSubmit={handleSubmit} loading={loading} submitLabel="Post Donation" />
    </div>
  );
};

export default CreateDonationPage;
