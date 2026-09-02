// src/pages/classmanagment/Classes.jsx
import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getBoards, getClasses, addClass, editClass, deleteClass } from '../../service/api';

export default function Classes() {
  // State
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [selectedBoardId, setSelectedBoardId] = useState('');
  
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassImage, setNewClassImage] = useState(null);
  const [newClassImagePreview, setNewClassImagePreview] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingClassName, setEditingClassName] = useState('');
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
    }
  }, [selectedBoardId]);

  // API Calls
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
        // ✅ Only set classes that belong to the selected board
        const classesData = response.data || [];
        setClasses(classesData);
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

  const handleAddClass = async () => {
    const trimmedName = newClassName.trim();
    if (!trimmedName) {
      setError('Class name is required');
      return;
    }

    if (!selectedBoardId) {
      setError('Please select a board first');
      return;
    }

    if (!newClassImage) {
      setError('Class image is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('board_id', parseInt(selectedBoardId));
      formData.append('image', newClassImage);

      const response = await addClass(formData);
      console.log('✅ Add Class response:', response);
      
      if (response?.status) {
        // ✅ Refresh classes for the selected board
        await fetchClasses(selectedBoardId);
        setNewClassName('');
        setNewClassImage(null);
        setNewClassImagePreview(null);
        setShowAddClassModal(false);
        setSuccess('Class added successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || 'Failed to add class');
      }
    } catch (err) {
      console.error('❌ Add Class Error:', err);
      setError(err?.message || 'Failed to add class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClass = async (id) => {
    const trimmedName = editingClassName.trim();
    if (!trimmedName) {
      setError('Class name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await editClass(id, { name: trimmedName });
      console.log('✅ Edit Class response:', response);
      
      if (response?.status) {
        // ✅ Update the class in the list
        setClasses(prev => 
          prev.map(cls => 
            cls.id === id ? { ...cls, name: trimmedName } : cls
          )
        );
        setEditingClassId(null);
        setEditingClassName('');
        setSuccess('Class updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || 'Failed to update class');
      }
    } catch (err) {
      console.error('❌ Edit Class Error:', err);
      setError(err?.message || 'Failed to update class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (id, className) => {
    if (!window.confirm(`Are you sure you want to delete "${className}"? All subjects under this class will also be deleted.`)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await deleteClass(id);
      console.log('✅ Delete Class response:', response);
      if (response?.status) {
        // ✅ Remove the class from the list
        setClasses(prev => prev.filter(cls => cls.id !== id));
        setSuccess('Class deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || 'Failed to delete class');
      }
    } catch (err) {
      console.error('❌ Delete Class Error:', err);
      setError(err?.message || 'Failed to delete class');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Handlers
  const startEditing = (cls) => {
    setEditingClassId(cls.id);
    setEditingClassName(cls.name);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingClassId(null);
    setEditingClassName('');
    setError(null);
  };

  const handleBoardChange = (e) => {
    const value = e.target.value;
    setSelectedBoardId(value);
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

      setNewClassImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewClassImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const openViewModal = (cls) => {
    setSelectedClass(cls);
    setShowViewModal(true);
  };

  const selectedBoard = boards.find(b => b.id === parseInt(selectedBoardId));

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Class Management</h1>
            <p className="text-sm text-gray-400">Manage classes across different boards</p>
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

      {/* Board Selection & Add Button */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select a board</option>
                {boards.map(b => (
                  <option key={b.id} value={b.id}>{b.board_name || b.name}</option>
                ))}
              </select>
            )}
          </div>
          
          <button
            onClick={() => {
              if (!selectedBoardId) {
                setError('Please select a board first');
                return;
              }
              setShowAddClassModal(true);
              setNewClassName('');
              setNewClassImage(null);
              setNewClassImagePreview(null);
              setError(null);
            }}
            disabled={!selectedBoardId || isSubmitting}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              selectedBoardId && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            Add Class
          </button>
        </div>
        
        {selectedBoard && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-sm">
            <span className="font-medium text-gray-700">{selectedBoard.board_name || selectedBoard.name}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">{classes.length} class{classes.length !== 1 ? 'es' : ''}</span>
          </div>
        )}
      </div>

      {/* Classes List */}
      {selectedBoardId ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Classes</span>
            </div>
            {!loadingClasses && classes.length > 0 && (
              <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
                {classes.length}
              </span>
            )}
          </div>

          {loadingClasses ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="py-12 text-center">
              <AcademicCapIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No classes added yet</p>
              <p className="text-xs text-gray-300 mt-1">Click "Add Class" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {classes.map((classItem) => (
                <div 
                  key={classItem.id} 
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Image */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {classItem.image ? (
                        <img 
                          src={classItem.image} 
                          alt={classItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.className = 'hidden';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium text-sm">
                          {classItem.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      {editingClassId === classItem.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingClassName}
                            onChange={(e) => setEditingClassName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleEditClass(classItem.id);
                            }}
                            className="text-sm font-medium text-gray-700 border-b-2 border-blue-500 focus:outline-none bg-transparent px-0 py-0.5 w-full max-w-xs"
                            autoFocus
                            disabled={isSubmitting}
                            placeholder="Enter class name"
                          />
                          <button
                            onClick={() => handleEditClass(classItem.id)}
                            disabled={isSubmitting || !editingClassName.trim()}
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
                          <span className="text-sm font-medium text-gray-800">{classItem.name}</span>
                          <p className="text-xs text-gray-400">ID: #{classItem.id}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {editingClassId !== classItem.id && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      <button
                        onClick={() => openViewModal(classItem)}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="View details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(classItem)}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit class"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                        disabled={isSubmitting}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete class"
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
          <BookOpenIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Select a board to view its classes</p>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && selectedBoard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <PlusIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Add New Class</h2>
                <p className="text-xs text-gray-400">
                  to <span className="font-medium text-gray-600">{selectedBoard.board_name || selectedBoard.name}</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., STD 6, Grade 7"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => handleKeyPress(e, handleAddClass)}
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Class Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={isSubmitting}
                  />
                  {newClassImagePreview && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={newClassImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">JPEG, PNG, GIF, WEBP • Max 5MB</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAddClassModal(false);
                  setNewClassName('');
                  setNewClassImage(null);
                  setNewClassImagePreview(null);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                disabled={isSubmitting || !newClassName.trim() || !newClassImage}
                className="px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  'Add Class'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedClass && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-50 rounded-lg">
                  <EyeIcon className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Class Details</h2>
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
                {selectedClass.image ? (
                  <img 
                    src={selectedClass.image} 
                    alt={selectedClass.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '';
                      e.target.className = 'hidden';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                    {selectedClass.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 bg-gray-50/50 rounded-lg p-3">
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Name</span>
                <span className="text-sm font-medium text-gray-800">{selectedClass.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">ID</span>
                <span className="text-sm font-medium text-gray-700">#{selectedClass.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Board</span>
                <span className="text-sm font-medium text-gray-700">{selectedClass.board?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-700">{formatDate(selectedClass.created_at)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-sm text-gray-500">Updated</span>
                <span className="text-sm text-gray-700">{formatDate(selectedClass.updated_at)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}