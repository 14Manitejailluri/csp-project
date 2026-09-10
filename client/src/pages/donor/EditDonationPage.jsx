import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DonationForm from '../../components/donations/DonationForm';
import { donationService } from '../../services/donationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const EditDonationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    donationService.getById(id)
      .then((r) => setDonation(r.data.data))
      .catch(() => {
        toast.error('Donation not found');
        navigate('/donor/my-donations');
      })
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await donationService.update(id, formData);
      toast.success('Donation updated successfully!');
      navigate('/donor/my-donations');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <LoadingSpinner message="Loading donation…" />;

  const initialValues = donation
    ? {
        title: donation.title,
        description: donation.description || '',
        category: donation.category,
        quantity: donation.quantity,
        unit: donation.unit,
        expiresAt: donation.expiresAt ? new Date(donation.expiresAt).toISOString().slice(0, 16) : '',
        storageCondition: donation.storageCondition,
        allergens: donation.allergens || [],
        isVegetarian: donation.isVegetarian || false,
        isVegan: donation.isVegan || false,
        isHalal: donation.isHalal || false,
        pickupInstructions: donation.pickupInstructions || '',
        address: donation.address || {},
        location: donation.location || null,
        images: donation.images || [],
      }
    : {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Donation</h1>
          <p className="text-sm text-slate-500 mt-0.5">Update the details of your food listing</p>
        </div>
      </div>

      <DonationForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default EditDonationPage;
