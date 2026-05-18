"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { 
  Plus, 
  Store as StoreIcon, 
  MapPin, 
  Phone, 
  Clock, 
  Power, 
  Trash2, 
  X, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { bookingApi } from "../../../../services/bookingApi";

export default function StoreManagementPage() {
  const { data: storesRes, mutate } = useSWR("/store-owner/stores", bookingApi.getStores);
  const stores = storesRes?.data?.stores || [];

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    store_name: "",
    phone: "",
    store_contact_number: "",
    store_description: "",
    store_open_time: "08:00",
    store_close_time: "22:00",
    latitude: 12.9716, // Default Bangalore coordinates
    longitude: 77.5946,
    address: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleOnline = async (storeId: string, currentStatus: boolean) => {
    try {
      await bookingApi.toggleStoreOnline(storeId, !currentStatus);
      mutate();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update online status. Ensure store is active and verified.");
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm("Are you sure you want to deactivate this store outlet? This action will set the status to inactive.")) {
      return;
    }
    try {
      await bookingApi.deleteStore(storeId);
      mutate();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate store. Ensure store is offline and has no active bookings.");
    }
  };

  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const payload = {
        phone: formData.phone,
        store_name: formData.store_name,
        store_description: formData.store_description,
        store_contact_number: formData.store_contact_number,
        store_open_time: formData.store_open_time,
        store_close_time: formData.store_close_time,
        location: {
          type: "Point",
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
          address: formData.address
        }
      };

      await bookingApi.createStore(payload);
      setSuccessMsg("Store location created successfully! Pending admin approval.");
      mutate();
      
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormData({
          store_name: "",
          phone: "",
          store_contact_number: "",
          store_description: "",
          store_open_time: "08:00",
          store_close_time: "22:00",
          latitude: 12.9716,
          longitude: 77.5946,
          address: ""
        });
        setSuccessMsg("");
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to create store. Please check the coordinates and phone number.");
    } finally {
      setLoading(false);
    }
  };

  // Coordinates Auto-filler (Simulated browser geolocator)
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
            address: prev.address || "Current Locator Location"
          }));
        },
        () => {
          alert("Unable to retrieve location. Defaulting coordinates.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Store Management</h1>
          <p className="text-slate-500 font-medium mt-1">Add, update, toggle and deactivate your luggage vault business locations.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-[#0D9488] hover:bg-[#0b7d73] text-white font-bold rounded-2xl shadow-lg shadow-[#0D9488]/20 transition-all duration-300 hover:scale-[1.02] self-start sm:self-center"
        >
          <Plus size={20} />
          Add Store Location
        </button>
      </div>

      {/* Grid of Locations */}
      {stores.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-655 flex items-center justify-center mb-4">
            <StoreIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No stores created yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md">Get started by creating your very first luggage storage point. All stores require backend validation before receiving customers.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
          >
            Create Store Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store: any) => {
            const isVerified = store.verification_status === "verified";
            const isActive = store.is_active;

            return (
              <div 
                key={store._id} 
                className={`bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md ${
                  !isActive ? "border-slate-100 opacity-60" : "border-slate-100 hover:border-slate-200"
                }`}
              >
                {/* Store Banner Ribbon */}
                <div className="p-6 pb-4 border-b border-slate-50 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-teal-50 text-teal-650" : "bg-slate-100 text-slate-400"
                    }`}>
                      <StoreIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 tracking-tight text-base leading-snug">
                        {store.store_name}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                        Capacity: {store.current_booking_count || 0} / {store.max_booking_capacity || 100}
                      </p>
                    </div>
                  </div>

                  {/* Rating pill */}
                  {store.rating > 0 && (
                    <div className="px-2.5 py-1 bg-amber-50 text-amber-650 border border-amber-100 rounded-lg text-xs font-black">
                      ★ {store.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Info List */}
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 font-medium">
                      {store.location?.address || "Address not configured"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-slate-600 font-bold">{store.phone}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={18} className="text-slate-400" />
                    <span className="text-slate-600 font-medium">
                      {store.store_open_time} - {store.store_close_time}
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      store.verification_status === "verified"
                        ? "bg-teal-50 text-teal-700 border border-teal-100"
                        : store.verification_status === "pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      {store.verification_status}
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      store.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {store.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-slate-50/50 p-6 border-t border-slate-50 flex items-center justify-between gap-4">
                  {/* Toggle Online */}
                  <button
                    disabled={!isActive || !isVerified}
                    onClick={() => handleToggleOnline(store._id, store.is_online)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      store.is_online
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-650 hover:bg-slate-200"
                    } ${(!isActive || !isVerified) && "opacity-50 cursor-not-allowed"}`}
                  >
                    <Power size={14} />
                    {store.is_online ? "Go Offline" : "Go Online"}
                  </button>

                  {/* Deactivate Button */}
                  {isActive && (
                    <button
                      onClick={() => handleDeleteStore(store._id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Deactivate Store Location"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Glassmorphic Add Store Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-655 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Create Store Vault</h3>
                  <p className="text-slate-400 text-xs font-medium">Add a new commercial storage outlet to your network.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStoreSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              {errorMsg && (
                <div className="p-4 bg-rose-50 text-rose-700 text-sm font-bold rounded-2xl flex items-center gap-2 border border-rose-100">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-teal-50 text-teal-700 text-sm font-bold rounded-2xl flex items-center gap-2 border border-teal-100">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Outlet Name</label>
                  <input
                    type="text"
                    name="store_name"
                    required
                    value={formData.store_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Airport Terminal 3 Vault"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-bold text-slate-700 placeholder-slate-350"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Login Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +919876543210"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-bold text-slate-700 placeholder-slate-350"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number for Customers</label>
                <input
                  type="tel"
                  name="store_contact_number"
                  required
                  value={formData.store_contact_number}
                  onChange={handleInputChange}
                  placeholder="e.g. +919876543211"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-bold text-slate-700 placeholder-slate-350"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Description / Directions</label>
                <textarea
                  name="store_description"
                  rows={2}
                  value={formData.store_description}
                  onChange={handleInputChange}
                  placeholder="Describe your storage room location, security measures, or drop-off guidelines..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-medium text-slate-700 placeholder-slate-350"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Opening Time</label>
                  <input
                    type="time"
                    name="store_open_time"
                    required
                    value={formData.store_open_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Closing Time</label>
                  <input
                    type="time"
                    name="store_close_time"
                    required
                    value={formData.store_close_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-650 uppercase tracking-wider">Geographic Service Location</h4>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-xs text-[#0D9488] font-black hover:underline"
                  >
                    Locate Me
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      required
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0D9488] font-bold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      required
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0D9488] font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Physical Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address of the store outlet"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0D9488] font-bold text-slate-700 placeholder-slate-350"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#0D9488] hover:bg-[#0b7d73] text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-[#0D9488]/10 disabled:opacity-55"
                >
                  {loading ? "Creating..." : "Create Outlet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
