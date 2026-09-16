import React, { useEffect, useState } from 'react';
import { Heart, Search, Sparkles, AlertCircle, Package } from 'lucide-react';
import { favoriteService } from '../../services/favoriteService';
import { donationService } from '../../services/donationService';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export const SavedDonationsPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [claimDonation, setClaimDonation] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteService.getAll();
      setFavorites(res.data?.data?.favorites || []);
    } catch {
      toast.error('Failed to load saved donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleClaim = async () => {
    if (!claimDonation) return;
    setClaimLoading(true);
    try {
      await donationService.claim(claimDonation._id);
      toast.success('Food request submitted!');
      setClaimDonation(null);
      fetchFavorites();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request food');
    } finally {
      setClaimLoading(false);
    }
  };

  const filtered = favorites.filter((d) => {
    if (!d) return false;
    const term = search.toLowerCase();
    return (
      (d.title && d.title.toLowerCase().includes(term)) ||
      (d.foodName && d.foodName.toLowerCase().includes(term)) ||
      (d.location?.city && d.location.city.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            <Heart className="h-3.5 w-3.5 fill-rose-600" />
            Bookmarked Listings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Saved Food Donations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quickly monitor and request your bookmarked surplus food donations
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <LoadingSpinner message="Loading your saved bookmarks..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4 max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
            <Heart className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Saved Donations Yet</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Click the heart icon on any food card in Available Food to bookmark listings for fast access.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((donation) => (
            <DonationCard
              key={donation._id}
              donation={donation}
              isFavoriteInitial={true}
              onRequest={(d) => setClaimDonation(d)}
              showDonor={true}
            />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {claimDonation && (
        <ConfirmDialog
          isOpen={!!claimDonation}
          onClose={() => setClaimDonation(null)}
          onConfirm={handleClaim}
          title="Confirm Food Request"
          message={`Would you like to request "${claimDonation.title || claimDonation.foodName}" (${claimDonation.quantity} ${claimDonation.quantityUnit})?`}
          confirmLabel="Request Food"
        />
      )}
    </div>
  );
};

export default SavedDonationsPage;
