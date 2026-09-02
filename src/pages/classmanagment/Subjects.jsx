// src/pages/classmanagment/Subjects.jsx
import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getBoards, getClasses, getSubjects, addSubject, editSubject, deleteSubject } from '../../service/api';

export default function Subjects() {
  // State
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectImage, setNewSubjectImage] = useState(null);
  const [newSubjectImagePreview, setNewSubjectImagePreview] = useState(null);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch boards on mount
  useEffect(() => {
    fetchBoards();
  }, []);

  // Fetch classes when board is selected
  useEffect(() => {
    if (selectedBoardId) {
      fetchClasses(selectedBoardId);
    } else {
      setClasses([]);
      setSelectedClassId('');
    }
  }, [selectedBoardId]);

  // Fetch subjects when BOTH board and class are selected
  useEffect(() => {
    if (selectedBoardId && selectedClassId) {
      fetchSubjects(selectedBoardId, selectedClassId);
    } else {
      setSubjects([]);
    }
  }, [selectedBoardId, selectedClassId]);

  // ============================================
  // API CALLS
  // ============================================

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBoards();
      console.log('📚 Boards response:', response);
      if (response?.status) {
        setBoards(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch boards');
      }
    } catch (err) {
      console.error('❌ Fetch Boards Error:', err);
      setError(err?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async (boardId) => {
    setLoadingClasses(true);
    setError(null);
    try {
      const response = await getClasses(boardId);
      console.log('📚 Classes response for board', boardId, ':', response);
      if (response?.status) {
        setClasses(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch classes');
        setClasses([]);
      }
    } catch (err) {
      console.error('❌ Fetch Classes Error:', err);
      setError(err?.message || 'Network error occurred');
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // ✅ UPDATED: Fetch subjects with both board_id and class_id
  const fetchSubjects = async (boardId, classId) => {
    setLoadingSubjects(true);
    setError(null);
    try {
      // ✅ Pass both board_id and class_id as an object
      const response = await getSubjects({ 
        board_id: parseInt(boardId), 
        class_id: parseInt(classId) 
      });
      console.log('📚 Subjects response for board', boardId, 'class', classId, ':', response);
      
      if (response?.status) {
        // ✅ The API returns data in 'data' field
        setSubjects(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch subjects');
        setSubjects([]);
      }
    } catch (err) {
      console.error('❌ Fetch Subjects Error:', err);
      setError(err?.message || 'Network error occurred');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleAddSubject = async () => {
    const trimmedName = newSubjectName.trim();
    if (!trimmedName) {
      setError('Subject name is required');
      return;
    }

    if (!selectedClassId) {
      setError('Please select a class first');
      return;
    }

    if (!newSubjectImage) {
      setError('Subject image is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('class_id', parseInt(selectedClassId));
      formData.append('image', newSubjectImage);

      const response = await addSubject(formData);
      console.log('✅ Add Subject response:', response);
      
      if (response?.status) {
        // ✅ Refresh subjects after adding
        await fetchSubjects(selectedBoardId, selectedClassId);
        setNewSubjectName('');
        setNewSubjectImage(null);
        setNewSubjectImagePreview(null);
        setShowAddSubjectModal(false);
        setSuccess('Subject added successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || 'Failed to add subject');
      }
    } catch (err) {
      console.error('❌ Add Subject Error:', err);
      setError(err?.message || 'Failed to add subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubject = async (id) => {
    const trimmedName = editingSubjectName.trim();
    if (!trimmedName) {
      setError('Subject name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await editSubject(id, { name: trimmedName });
      console.log('✅ Edit Subject response:', response);
      
      if (response?.status) {
        setSubjects(prev => 
          prev.map(sub => 
            sub.id === id ? { ...sub, name: trimmedName } : sub
          )
        );
        setEditingSubjectId(null);
        setEditingSubjectName('');
        setSuccess('Subject updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || 'Failed to update subject');
      }
    } catch (err) {
      console.error('❌ Edit Subject Error:', err);
      setError(err?.message || 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete "${subjectName}"?`)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await deleteSubject(id);
      console.log('✅ Delete Subject response:', response);
      if (response?.status) {
        setSubjects(prev => prev.filter(sub => sub.id !== id));
        setSuccess('Subject deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || 'Failed to delete subject');
      }
    } catch (err) {
      console.error('❌ Delete Subject Error:', err);
      setError(err?.message || 'Failed to delete subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Handlers
  const startEditing = (subject) => {
    setEditingSubjectId(subject.id);
    setEditingSubjectName(subject.name);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingSubjectId(null);
    setEditingSubjectName('');
    setError(null);
  };

  const handleBoardChange = (e) => {
    const value = e.target.value;
    setSelectedBoardId(value);
    setSelectedClassId('');
    setSubjects([]);
    setError(null);
    setSuccess(null);
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    setSelectedClassId(value);
    setError(null);
    setSuccess(null);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        e.target.value = '';
        return;
      }

      setNewSubjectImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSubjectImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const openViewModal = (subject) => {
    setSelectedSubject(subject);
    setShowViewModal(true);
  };

  const selectedBoard = boards.find(b => b.id === parseInt(selectedBoardId));
  const selectedClass = classes.find(c => c.id === parseInt(selectedClassId));

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get gradient based on subject name
  const getGradient = (name) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-indigo-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-cyan-500',
      'from-amber-500 to-orange-500',
    ];
    const index = name ? name.length % gradients.length : 0;
    return gradients[index];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BookOpenIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Subject Management</h1>
            <p className="text-sm text-gray-400">Manage subjects for each class</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700 flex-1">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selection Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          {/* Select Board */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Select Board
            </label>
            {loading ? (
              <div className="flex items-center gap-2 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-gray-400">Loading boards...</span>
              </div>
            ) : (
              <select
                value={selectedBoardId}
                onChange={handleBoardChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">Select a board</option>
                {boards.map(b => (
                  <option key={b.id} value={b.id}>{b.board_name || b.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Select Class */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={handleClassChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              disabled={!selectedBoardId || loadingClasses}
            >
              <option value="">Select a class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {loadingClasses && (
              <p className="text-xs text-gray-400 mt-1">Loading classes...</p>
            )}
          </div>

          <button
            onClick={() => {
              if (!selectedClassId) {
                setError('Please select a class first');
                return;
              }
              setShowAddSubjectModal(true);
              setNewSubjectName('');
              setNewSubjectImage(null);
              setNewSubjectImagePreview(null);
              setError(null);
            }}
            disabled={!selectedClassId || isSubmitting}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              selectedClassId && !isSubmitting
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            Add Subject
          </button>
        </div>
        
        {selectedBoard && selectedClass && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-sm">
            <span className="font-medium text-gray-700">{selectedBoard.board_name || selectedBoard.name}</span>
            <span className="text-gray-300">→</span>
            <span className="font-medium text-gray-700">{selectedClass.name}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Subjects List */}
      {selectedBoard && selectedClass ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Subjects</span>
            </div>
            {!loadingSubjects && subjects.length > 0 && (
              <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
                {subjects.length}
              </span>
            )}
          </div>

          {loadingSubjects ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpenIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No subjects added yet</p>
              <p className="text-xs text-gray-300 mt-1">Click "Add Subject" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group border border-gray-100"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Image */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {subject.image ? (
                        <img 
                          src={subject.image} 
                          alt={subject.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.className = 'hidden';
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradient(subject.name)} text-white font-medium text-sm`}>
                          {subject.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      {editingSubjectId === subject.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingSubjectName}
                            onChange={(e) => setEditingSubjectName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleEditSubject(subject.id);
                            }}
                            className="text-sm font-medium text-gray-700 border-b-2 border-indigo-500 focus:outline-none bg-transparent px-0 py-0.5 w-full max-w-xs"
                            autoFocus
                            disabled={isSubmitting}
                            placeholder="Enter subject name"
                          />
                          <button
                            onClick={() => handleEditSubject(subject.id)}
                            disabled={isSubmitting || !editingSubjectName.trim()}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isSubmitting}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-800 truncate block">{subject.name}</span>
                          <p className="text-xs text-gray-400">ID: #{subject.id}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {editingSubjectId !== subject.id && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      <button
                        onClick={() => openViewModal(subject)}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                        title="View details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(subject)}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit subject"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete subject"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Select a board and class to view its subjects</p>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && selectedBoard && selectedClass && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <PlusIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Add New Subject</h2>
                <p className="text-xs text-gray-400">
                  to <span className="font-medium text-gray-600">{selectedClass.name}</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g., Mathematics, Physics"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => handleKeyPress(e, handleAddSubject)}
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    disabled={isSubmitting}
                  />
                  {newSubjectImagePreview && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={newSubjectImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">JPEG, PNG, GIF, WEBP • Max 5MB</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAddSubjectModal(false);
                  setNewSubjectName('');
                  setNewSubjectImage(null);
                  setNewSubjectImagePreview(null);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                disabled={isSubmitting || !newSubjectName.trim() || !newSubjectImage}
                className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  'Add Subject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Subject Modal */}
      {showViewModal && selectedSubject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-50 rounded-lg">
                  <EyeIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Subject Details</h2>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                {selectedSubject.image ? (
                  <img 
                    src={selectedSubject.image} 
                    alt={selectedSubject.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '';
                      e.target.className = 'hidden';
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getGradient(selectedSubject.name)} text-white text-2xl font-bold`}>
                    {selectedSubject.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 bg-gray-50/50 rounded-lg p-3">
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Name</span>
                <span className="text-sm font-medium text-gray-800">{selectedSubject.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">ID</span>
                <span className="text-sm font-medium text-gray-700">#{selectedSubject.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Class</span>
                <span className="text-sm font-medium text-gray-700">{selectedSubject.class?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Board</span>
                <span className="text-sm font-medium text-gray-700">{selectedSubject.board?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-700">{formatDate(selectedSubject.created_at)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-gray-500">Updated</span>
                <span className="text-sm text-gray-700">{formatDate(selectedSubject.updated_at)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}