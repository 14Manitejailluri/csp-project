import React, { useEffect, useState, useCallback } from 'react';
import { Truck, MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { pickupService } from '../../services/pickupService';
import PickupTaskCard from '../../components/pickups/PickupTaskCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MapView from '../../components/map/MapView';
import { getCurrentPosition } from '../../utils/geo';
import toast from 'react-hot-toast';

export const AvailablePickupsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [acceptModal, setAcceptModal] = useState({ open: false, task: null });
  const [accepting, setAccepting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (userLoc) {
        params.lat = userLoc.lat;
        params.lng = userLoc.lng;
        params.radiusKm = 50;
      }
      const res = await pickupService.getAvailable(params);
      setTasks(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load available pickup tasks');
    } finally {
      setLoading(false);
    }
  }, [userLoc]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUseLocation = async () => {
    try {
      const pos = await getCurrentPosition();
      setUserLoc(pos);
      toast.success('Sorted by proximity to your current location');
    } catch (err) {
      toast.error('Could not determine your location. Please check browser permissions.');
    }
  };

  const handleAcceptClick = (task) => {
    setAcceptModal({ open: true, task });
  };

  const confirmAccept = async () => {
    if (!acceptModal.task?._id) return;
    setAccepting(true);
    try {
      await pickupService.accept(acceptModal.task._id);
      toast.success('Task accepted! It has been added to your Active Missions.');
      setAcceptModal({ open: false, task: null });
      fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Failed to accept task');
    } finally {
      setAccepting(false);
    }
  };

  const markers = tasks
    .filter((t) => t.donation?.location?.coordinates)
    .map((t) => ({
      lat: t.donation.location.coordinates[1],
      lng: t.donation.location.coordinates[0],
      popup: `<b>${t.donation.title}</b><br/>${t.donation.quantity} ${t.donation.unit}`,
    }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Available Pickup Runs</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pick up claimed food and transport it to the NGO partner</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseLocation}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
              userLoc
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Navigation className="h-4 w-4" />
            {userLoc ? 'Near Me (Active)' : 'Find Near Me'}
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Finding available pickup tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No available pickup runs"
          message="There are no pending pickups awaiting volunteers right now. Check back soon!"
        />
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <MapView
            markers={markers}
            center={userLoc ? [userLoc.lat, userLoc.lng] : undefined}
            zoom={userLoc ? 12 : 6}
            height="480px"
          />
          <p className="text-xs text-slate-400 text-center">
            Showing {markers.length} pickup locations on map
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="relative group">
              <PickupTaskCard pickup={task} />
              <div className="mt-3">
                <button
                  onClick={() => handleAcceptClick(task)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept This Mission
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept dialog */}
      <ConfirmDialog
        isOpen={acceptModal.open}
        onClose={() => setAcceptModal({ open: false, task: null })}
        onConfirm={confirmAccept}
        title="Accept Pickup Mission"
        message={`Are you sure you want to accept this mission for "${acceptModal.task?.donation?.title}"? Please make sure you can complete the pickup and delivery before expiration.`}
        confirmLabel="Yes, Accept Mission"
        confirmVariant="primary"
        loading={accepting}
      />
    </div>
  );
};

export default AvailablePickupsPage;
