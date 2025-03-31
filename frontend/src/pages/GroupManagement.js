import React, { useState, useEffect } from 'react';
import { groupService, permissionService } from '../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch groups and permissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsResponse, permissionsResponse] = await Promise.all([
          groupService.getAll(),
          permissionService.getAll()
        ]);
        setGroups(groupsResponse.data);
        setPermissions(permissionsResponse.data);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new group form
  const createGroupForm = useFormik({
    initialValues: {
      name: '',
      permissions: []
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      permissions: Yup.array().of(Yup.number())
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        // Create the group
        const response = await groupService.create(values);
        
        // Set permissions for the group
        if (values.permissions.length > 0) {
          await groupService.setPermissions(response.data.id, values.permissions);
        }
        
        // Update the groups list
        setGroups([...groups, response.data]);
        
        // Reset form and show success message
        resetForm();
        setIsCreating(false);
        showSuccess('Group created successfully');
      } catch (err) {
        setError(err.response?.data || { detail: 'Failed to create group' });
      }
    }
  });

  // Edit group form
  const editGroupForm = useFormik({
    initialValues: {
      id: '',
      name: '',
      permissions: []
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      permissions: Yup.array().of(Yup.number())
    }),
    onSubmit: async (values) => {
      try {
        // Update group details
        await groupService.update(values.id, {
          name: values.name
        });
        
        // Update group permissions
        await groupService.setPermissions(values.id, values.permissions);
        
        // Update the groups list
        const updatedGroups = groups.map(group => 
          group.id === values.id 
            ? { ...group, ...values, permissions: permissions.filter(p => values.permissions.includes(p.id)) } 
            : group
        );
        
        setGroups(updatedGroups);
        setIsEditing(false);
        setCurrentGroup(null);
        showSuccess('Group updated successfully');
      } catch (err) {
        setError(err.response?.data || { detail: 'Failed to update group' });
      }
    }
  });

  // Handle edit group button click
  const handleEditGroup = (group) => {
    setCurrentGroup(group);
    editGroupForm.resetForm({
      values: {
        id: group.id,
        name: group.name,
        permissions: group.permissions ? group.permissions.map(p => p.id) : []
      }
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    
    try {
      await groupService.delete(groupToDelete.id);
      setGroups(groups.filter(group => group.id !== groupToDelete.id));
      setGroupToDelete(null);
      setShowDeleteConfirm(false);
      showSuccess('Group deleted successfully');
    } catch (err) {
      setError(err.response?.data || { detail: 'Failed to delete group' });
    }
  };

  // Show success message then clear it after 3 seconds
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Group Management
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Create, edit and delete user groups and their permissions
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setIsEditing(false);
            createGroupForm.resetForm();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {isCreating ? 'Cancel' : 'Add Group'}
        </button>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="m-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="m-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <div>
            {typeof error === 'string' ? (
              <span>{error}</span>
            ) : (
              <ul className="list-disc pl-5">
                {Object.entries(error).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {Array.isArray(value) ? value[0] : value}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={clearError}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-red-700">×</span>
          </button>
        </div>
      )}
      
      {/* Create Group Form */}
      {isCreating && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Group</h3>
          <form onSubmit={createGroupForm.handleSubmit}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="form-label">
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className={`form-input ${
                    createGroupForm.touched.name && createGroupForm.errors.name ? 'border-red-500' : ''
                  }`}
                  value={createGroupForm.values.name}
                  onChange={createGroupForm.handleChange}
                  onBlur={createGroupForm.handleBlur}
                />
                {createGroupForm.touched.name && createGroupForm.errors.name && (
                  <div className="form-error">{createGroupForm.errors.name}</div>
                )}
              </div>
              
              <div className="col-span-6">
                <label className="form-label">Permissions</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        id={`permission-${permission.id}`}
                        name="permissions"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        value={permission.id}
                        checked={createGroupForm.values.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            createGroupForm.setFieldValue('permissions', [...createGroupForm.values.permissions, permission.id]);
                          } else {
                            createGroupForm.setFieldValue(
                              'permissions',
                              createGroupForm.values.permissions.filter((id) => id !== permission.id)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`permission-${permission.id}`} className="ml-2 block text-sm text-gray-900">
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button type="submit" className="btn btn-primary">
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit Group Form */}
      {isEditing && currentGroup && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Edit Group: {currentGroup.name}
          </h3>
          <form onSubmit={editGroupForm.handleSubmit}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="name" className="form-label">
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className={`form-input ${
                    editGroupForm.touched.name && editGroupForm.errors.name ? 'border-red-500' : ''
                  }`}
                  value={editGroupForm.values.name}
                  onChange={editGroupForm.handleChange}
                  onBlur={editGroupForm.handleBlur}
                />
                {editGroupForm.touched.name && editGroupForm.errors.name && (
                  <div className="form-error">{editGroupForm.errors.name}</div>
                )}
              </div>
              
              <div className="col-span-6">
                <label className="form-label">Permissions</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        id={`edit-permission-${permission.id}`}
                        name="permissions"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        value={permission.id}
                        checked={editGroupForm.values.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            editGroupForm.setFieldValue('permissions', [...editGroupForm.values.permissions, permission.id]);
                          } else {
                            editGroupForm.setFieldValue(
                              'permissions',
                              editGroupForm.values.permissions.filter((id) => id !== permission.id)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`edit-permission-${permission.id}`} className="ml-2 block text-sm text-gray-900">
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentGroup(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Groups Table */}
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No groups found
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {group.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {group.permissions && group.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {group.permissions.map((permission) => (
                            <span key={permission.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {permission.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setGroupToDelete(group);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && groupToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Group
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the group "{groupToDelete.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteGroup}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setGroupToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;