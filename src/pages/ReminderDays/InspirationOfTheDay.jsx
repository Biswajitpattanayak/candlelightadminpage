// src/pages/ReminderDays/InspirationOfTheDay.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusIcon, 
  XMarkIcon,
  SparklesIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  getInspirations,
  createInspiration
} from '../../service/api';

export default function InspirationOfTheDay() {
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    person_name: '',
    death_year: '',
    category: 'Spiritual Leader',
    quote: '',
    about: '',
    inspiration_date: new Date().toISOString().split('T')[0],
    is_active: true,
    image: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await getInspirations();
      
      // 👇 Yahan check laga diya hai ki data Array hai ya Object
      let fetchedData = [];
      
      if (Array.isArray(response)) {
        fetchedData = response;
      } else if (response && Array.isArray(response.data)) {
        fetchedData = response.data;
      } else if (response && response.data && typeof response.data === 'object') {
        // Agar object hai (jaisa Postman screenshot me tha), toh usko array me daal do
        fetchedData = [response.data];
      }

      setInspirations(fetchedData);
      
    } catch (err) {
      setError(err.message || 'Failed to load inspirations.');
      setInspirations([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({...formData, image: file});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    setFormData({
      person_name: '', 
      death_year: '', 
      category: 'Spiritual Leader', 
      quote: '', 
      about: '',
      inspiration_date: new Date().toISOString().split('T')[0], 
      is_active: true, 
      image: null
    });
    setImagePreview('');
    setSuccess(null); 
    setError(null); 
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.person_name.trim() || !formData.quote.trim() || !formData.inspiration_date) {
      setError('Person Name, Quote, and Date are required.');
      return;
    }

    setLoading(true); 
    setError(null); 
    setSuccess(null);

    try {
      const submitData = new FormData();
      submitData.append('person_name', formData.person_name);
      submitData.append('death_year', formData.death_year);
      submitData.append('category', formData.category);
      submitData.append('quote', formData.quote);
      submitData.append('about', formData.about);
      submitData.append('inspiration_date', formData.inspiration_date);
      submitData.append('is_active', formData.is_active);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await createInspiration(submitData);
      
      if (response && response.status) {
        setSuccess('Created successfully!');
        
        // Add new item to the top of the list instantly
        const newItem = { 
          id: response.data?.id || Date.now(), 
          ...formData, 
          image: response.data?.image || imagePreview 
        };
        setInspirations([newItem, ...inspirations]);
        
        setTimeout(() => {
          setShowModal(false); 
          setSuccess(null);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to save inspiration');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading inspirations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">✨ Inspiration of the Day</h1>
          <p className="text-sm text-gray-500 mt-1">Manage daily inspirations and spiritual leaders</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <PlusIcon className="w-5 h-5" /> Add Inspiration
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5"/>{success}
        </div>
      )}
      {error && !showModal && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <ExclamationCircleIcon className="w-5 h-5"/>{error}
        </div>
      )}

      {/* List Grid */}
      {inspirations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspirations Added</h3>
          <p className="text-gray-500 mb-4">Start adding daily inspirations</p>
          <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Add First Inspiration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspirations.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-48 bg-gray-100">
                {item.image ? (
                  <img src={item.image} alt={item.person_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PhotoIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                  {item.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg">{item.person_name}</h3>
                {item.death_year && <p className="text-xs text-gray-500 mt-0.5">Death Year: {item.death_year}</p>}
                <p className="text-sm text-gray-700 italic mt-2 line-clamp-3">"{item.quote}"</p>
                <div className="mt-4 flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                  <span className="flex items-center gap-1">📅 {item.inspiration_date}</span>
                  {item.is_active && <span className="text-green-600 font-medium">● Active</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">✨ Add Inspiration</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-lg">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-center gap-2">
                  <ExclamationCircleIcon className="w-5 h-5"/>{error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Person Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.person_name} 
                    onChange={(e) => setFormData({...formData, person_name: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. Swami Vivekananda"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Death Year</label>
                  <input 
                    type="text" 
                    value={formData.death_year} 
                    onChange={(e) => setFormData({...formData, death_year: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. 1863"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Spiritual Leader">Spiritual Leader</option>
                    <option value="National Leader">National Leader</option>
                    <option value="Motivational Speaker">Motivational Speaker</option>
                    <option value="Social Reformer">Social Reformer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={formData.inspiration_date} 
                    onChange={(e) => setFormData({...formData, inspiration_date: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quote <span className="text-red-500">*</span></label>
                <textarea 
                  rows="2" 
                  value={formData.quote} 
                  onChange={(e) => setFormData({...formData, quote: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  placeholder="Enter quote here..."
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">About</label>
                <textarea 
                  rows="3" 
                  value={formData.about} 
                  onChange={(e) => setFormData({...formData, about: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  placeholder="Short description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} className="max-h-40 mx-auto rounded-lg object-contain" alt="Preview" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview('');
                          setFormData({...formData, image: null});
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <CloudArrowUpIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p>Click to upload image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
                >
                  {loading ? 'Saving...' : 'Save Inspiration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}