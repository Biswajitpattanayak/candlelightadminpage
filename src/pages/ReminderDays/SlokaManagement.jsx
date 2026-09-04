// pages/ReminderDays/SlokaManagement.jsx
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSpinner,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { getSlokas, createSloka, updateSloka, deleteSloka } from "../../service/api";

export default function SlokaManagement() {
  const [slokas, setSlokas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Form state
  const [formData, setFormData] = useState({
    line: "",
    date: "",
  });

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch slokas on mount
  useEffect(() => {
    fetchSlokas();
  }, []);

  const fetchSlokas = async () => {
    setLoading(true);
    try {
      const response = await getSlokas();
      if (response.status) {
        setSlokas(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching slokas:", error);
      showToast("Failed to load slokas", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter slokas
  const filteredSlokas = slokas.filter((sloka) =>
    sloka.line?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open Add Modal
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      line: "",
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEdit = (sloka) => {
    setEditingItem(sloka);
    setFormData({
      line: sloka.line || "",
      date: sloka.date || new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  // Delete sloka
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteSloka(deleteId);
      if (response.status) {
        showToast("Sloka deleted successfully!", "success");
        fetchSlokas();
      }
    } catch (error) {
      console.error("Error deleting sloka:", error);
      showToast("Failed to delete sloka", "error");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.line.trim()) {
      showToast("Please enter sloka line", "error");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editingItem) {
        // Update
        response = await updateSloka(editingItem.id, {
          line: formData.line,
          date: formData.date,
        });
        if (response.status) {
          showToast("Sloka updated successfully!", "success");
        }
      } else {
        // Create
        response = await createSloka({
          line: formData.line,
          date: formData.date,
        });
        if (response.status) {
          showToast("Sloka created successfully!", "success");
        }
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        line: "",
        date: "",
      });
      fetchSlokas();
    } catch (error) {
      console.error("Error saving sloka:", error);
      showToast(error.response?.data?.message || "Failed to save sloka", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-[99999] px-6 py-3 rounded-xl shadow-lg text-white font-medium ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Word of the Day </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage spiritual verses and shlokas
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-200 transition-all hover:scale-105"
          >
            <FaPlus className="text-sm" />
            Add Sloka
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Total Slokas</p>
            <p className="text-2xl font-bold text-gray-900">{slokas.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Today's Slokas</p>
            <p className="text-2xl font-bold text-orange-600">
              {slokas.filter(s => s.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">With Dates</p>
            <p className="text-2xl font-bold text-blue-600">
              {slokas.filter(s => s.date).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Last Updated</p>
            <p className="text-sm font-semibold text-gray-700 truncate">
              {slokas.length > 0 ? formatDate(slokas[0]?.updated_at || slokas[0]?.created_at) : "N/A"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search slokas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FaSpinner className="animate-spin text-3xl text-orange-500" />
            </div>
          ) : filteredSlokas.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📖</div>
              <p className="text-gray-500 font-medium">No slokas found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? "Try adjusting your search" : "Click 'Add Sloka' to create one"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sloka
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSlokas.map((sloka, index) => (
                    <motion.tr
                      key={sloka.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800 max-w-md">
                          {sloka.line}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          {formatDate(sloka.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(sloka.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(sloka)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(sloka.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingItem(null);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg">📖</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingItem ? "✏️ Edit Sloka" : "✨ Add Sloka"}
                  </h3>
                  <p className="text-xs text-white/80">
                    {editingItem ? "Update sloka details" : "Add a new spiritual verse"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-90"
              >
                <FaTimes className="text-white text-sm" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Sloka Line */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Sloka Line <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={formData.line}
                  onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                  placeholder="Enter the sloka or verse..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50 resize-none"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Date <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50"
                  disabled={submitting}
                />
              </div>

              {/* Preview */}
              {formData.line && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-xs font-medium text-orange-600 mb-1">Preview:</p>
                  <p className="text-sm text-gray-700 italic">"{formData.line}"</p>
                  {formData.date && (
                    <p className="text-xs text-gray-400 mt-1">📅 {formatDate(formData.date)}</p>
                  )}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-200 transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {editingItem ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <FaSave className="text-sm" />
                    {editingItem ? "Update Sloka" : "Create Sloka"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setDeleteId(null);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Sloka</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this sloka?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all hover:scale-105"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}