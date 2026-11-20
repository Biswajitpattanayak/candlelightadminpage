// src/pages/ReminderDays/SpecialDays.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  PlusIcon, 
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  getSentences, 
  createSentenceOfDay, 
  updateSentence, 
  deleteSentence 
} from '../../service/api';

export default function SpecialDays() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  
  // Validation errors
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    part_of_speech: '',
    sentence: '',
    date: '',
    category: '',
    priority: '',
    image: ''
  });
  
  // Form Data (Author form me nahi hai, par backend me jayega)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    part_of_speech: '',
    sentence: '',
    date: '',
    category: 'National', // Purana category style
    priority: 'Medium',  // Purana priority
    image: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await getSentences();

      
      
      if (response && response.status && response.data) {
        setWords(response.data);
      } else if (Array.isArray(response)) {
        setWords(response);
      } else {
        setWords([]);
      }
    } catch (err) {
      console.error('Error fetching:', err);
      setError('Failed to load data. Please refresh.');
      setWords([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // Purane Color/Emoji functions
  const getCategoryColor = (category) => {
    const colors = {
      National: 'bg-red-100 text-red-800',
      Festival: 'bg-orange-100 text-orange-800',
      Birthday: 'bg-pink-100 text-pink-800',
      Event: 'bg-purple-100 text-purple-800',
      Holiday: 'bg-green-100 text-green-800',
      Personal: 'bg-blue-100 text-blue-800',
      Work: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-red-100 text-red-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Low: 'bg-green-100 text-green-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityEmoji = (priority) => {
    const emojis = { High: '🔴', Medium: '🟡', Low: '🟢' };
    return emojis[priority] || '⚪';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      National: '🇮🇳', Festival: '🎊', Birthday: '🎂', Event: '📅', Holiday: '🌴', Personal: '❤️', Work: '💼'
    };
    return emojis[category] || '📌';
  };

  const getDaysRemaining = (date) => {
    if (!date) return '📅 No date';
    const today = new Date();
    const targetDate = new Date(date);
    const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '🎉 Today!';
    if (diffDays === 1) return '✨ Tomorrow!';
    if (diffDays < 0) return '📅 Past';
    return `${diffDays} days left`;
  };

  const validateForm = () => {
    const errors = { title: '', description: '', part_of_speech: '', sentence: '', date: '', category: '', priority: '', image: '' };
    let isValid = true;

    if (!formData.title.trim()) { errors.title = 'Title is required'; isValid = false; }
    if (!formData.description.trim()) { errors.description = 'Description is required'; isValid = false; }
    if (!formData.date) { errors.date = 'Date is required'; isValid = false; }
    if (!formData.category) { errors.category = 'Category is required'; isValid = false; }
    if (!formData.priority) { errors.priority = 'Priority is required'; isValid = false; }
    if (!formData.image && !imagePreview) { errors.image = 'Image is required'; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

  const clearFieldError = (field) => {
    setFormErrors({ ...formErrors, [field]: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({...formData, image: file});
        setFormErrors({ ...formErrors, image: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '', description: '', part_of_speech: '', sentence: '', date: '', category: 'National', priority: 'Medium', image: null
    });
    setImagePreview('');
    setFormErrors({ title: '', description: '', part_of_speech: '', sentence: '', date: '', category: '', priority: '', image: '' });
    setSuccess(null);
    setError(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      part_of_speech: item.part_of_speech || '',
      sentence: item.sentence || '',
      date: item.date || '',
      category: item.category || 'National',
      priority: item.priority || 'Medium',
      image: null
    });
    setImagePreview(item.image || '');
    setFormErrors({ title: '', description: '', part_of_speech: '', sentence: '', date: '', category: '', priority: '', image: '' });
    setSuccess(null);
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;

    setLoading(true);
    setError(null);
    try {
      const response = await deleteSentence(id);
      if (response && response.status) {
        setSuccess('Deleted successfully! 🗑️');
        setWords(words.filter(w => w.id !== id));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting:', err);
      setError(err.message || 'Failed to delete');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const submitData = new FormData();
      
      // Frontend fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('part_of_speech', formData.part_of_speech);
      submitData.append('sentence', formData.sentence);
      submitData.append('date', formData.date);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      
      // 👇 BACKEND REQUIREMENT: Author aur is_delivered_today bhej rahe hain (bina form me dikhaye)
      submitData.append('author', 'Admin');
      submitData.append('is_delivered_today', true);

      if (formData.image && typeof formData.image !== 'string') {
        submitData.append('image', formData.image);
      }

         // 👇 YAHAN CONSOLE LAGAO 👇
      console.log("========== POST REQUEST DATA ==========");
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ' : ' + pair[1]);
      }
      console.log("=======================================");
      // 👆 YAHAN TAK 👆
      let response;
      
      if (editingItem) {
        response = await updateSentence(editingItem.id, submitData);
        if (response && response.status) {
          setSuccess(response.message || 'Updated successfully! ✏️');
          const updated = { id: editingItem.id, ...formData, image: response.data?.image || imagePreview || null };
          setWords(words.map(item => item.id === editingItem.id ? updated : item));
        }
      } else {
        response = await createSentenceOfDay(submitData);
        if (response && response.status) {
          setSuccess(response.message || 'Created successfully! 🎉');
          const newWord = { id: response.data?.id || Date.now(), ...formData, image: response.data?.image || imagePreview || null };
          setWords([newWord, ...words]);
        }
      }
      
      setTimeout(() => {
        setShowModal(false);
        setLoading(false);
        setSuccess(null);
        setImagePreview('');
        setEditingItem(null);
        setFormData({ title: '', description: '', part_of_speech: '', sentence: '', date: '', category: 'National', priority: 'Medium', image: null });
        setFormErrors({ title: '', description: '', part_of_speech: '', sentence: '', date: '', category: '', priority: '', image: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to save. Please try again.');
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📖 Word of the Day</h1>
          <p className="text-sm text-gray-500 mt-1">Manage daily words and sentences</p>
        </div>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm hover:shadow">
          <PlusIcon className="w-5 h-5" /> Add Word
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Words</p>
          <p className="text-2xl font-bold text-gray-900">{words.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-green-600">
            {words.filter(day => new Date(day.date) >= new Date()).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">High Priority</p>
          <p className="text-2xl font-bold text-red-600">
            {words.filter(day => day.priority === 'High').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(words.map(day => day.category).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-600">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Grid */}
      {words.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Words Added</h3>
          <p className="text-gray-500 mb-4">Start adding words</p>
          <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition">
            <PlusIcon className="w-5 h-5" /> Add First Word
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {words.map((day) => (
            <div key={day.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                {day.image ? (
                  <img src={day.image} alt={day.title} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = ''; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(day.category)} flex items-center gap-1`}>
                    {getCategoryEmoji(day.category)} {day.category || 'General'}
                  </span>
                  <span className="bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {getDaysRemaining(day.date)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {day.title} {day.part_of_speech && <span className="text-sm text-gray-500 font-normal">({day.part_of_speech})</span>}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{day.description}</p>
                    {day.sentence && <p className="text-xs text-gray-500 italic mt-2 line-clamp-1">"{day.sentence}"</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(day)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(day.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                  <span className="text-gray-500">📅 {day.date || 'No Date'}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-medium ${getPriorityColor(day.priority)}`}>
                    {getPriorityEmoji(day.priority)} {day.priority || 'Medium'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? '✏️ Edit Word' : '✨ Add Word'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input type="text" value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); clearFieldError('title'); }} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter title" required />
                {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea rows="2" value={formData.description} onChange={(e) => { setFormData({ ...formData, description: e.target.value }); clearFieldError('description'); }} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter description" required />
                {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
              </div>

              {/* Part of Speech & Sentence */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Part of Speech</label>
                  <select value={formData.part_of_speech} onChange={(e) => setFormData({ ...formData, part_of_speech: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select</option>
                    <option value="noun">noun</option>
                    <option value="adj">adj</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sentence</label>
                  <input type="text" value={formData.sentence} onChange={(e) => setFormData({ ...formData, sentence: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Example sentence" />
                </div>
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.date} onChange={(e) => { setFormData({ ...formData, date: e.target.value }); clearFieldError('date'); }} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`} required />
                  {formErrors.date && <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select value={formData.category} onChange={(e) => { setFormData({ ...formData, category: e.target.value }); clearFieldError('category'); }} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`} required>
                    <option value="National">🇮🇳 National</option>
                    <option value="Festival">🎊 Festival</option>
                    <option value="Birthday">🎂 Birthday</option>
                    <option value="Event">📅 Event</option>
                    <option value="Holiday">🌴 Holiday</option>
                    <option value="Personal">❤️ Personal</option>
                    <option value="Work">💼 Work</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority <span className="text-red-500">*</span></label>
                <select value={formData.priority} onChange={(e) => { setFormData({ ...formData, priority: e.target.value }); clearFieldError('priority'); }} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white ${formErrors.priority ? 'border-red-500' : 'border-gray-300'}`} required>
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image <span className="text-red-500">*</span></label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer ${formErrors.image ? 'border-red-500' : 'border-gray-300'}`} onClick={() => !loading && fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(''); setFormData({ ...formData, image: null }); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload image</p>
                    </div>
                  )}
                </div>
                {formErrors.image && <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50" disabled={loading}>
                  {loading ? 'Saving...' : (editingItem ? 'Update Word' : 'Create Word')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}