import React, { useState, useEffect } from 'react';
import { userService, groupService } from '../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Fetch users and groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, groupsResponse] = await Promise.all([
          userService.getAll(),
          groupService.getAll()
        ]);
        setUsers(usersResponse.data);
        setGroups(groupsResponse.data);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new user form
  const createUserForm = useFormik({
    initialValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      re_password: '',
      is_active: true,
      is_staff: false,
      groups: []
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      first_name: Yup.string().required('Required'),
      last_name: Yup.string().required('Required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Required'),
      re_password: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
      is_active: Yup.boolean(),
      is_staff: Yup.boolean(),
      groups: Yup.array().of(Yup.number())
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        // Create the user
        const response = await userService.create(values);
        
        // Add the user to selected groups
        if (values.groups.length > 0) {
          await userService.setGroups(response.data.id, values.groups);
        }
        
        // Update the users list
        setUsers([...users, response.data]);
        
        // Reset form and show success message
        resetForm();
        setIsCreating(false);
        showSuccess('User created successfully');
      } catch (err) {
        setError(err.response?.data || { detail: 'Failed to create user' });
      }
    }
  });

  // Edit user form
  const editUserForm = useFormik({
    initialValues: {
      id: '',
      email: '',
      first_name: '',
      last_name: '',
      is_active: true,
      is_staff: false,
      groups: [],
      password: '',
      confirm_password: '' 
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      first_name: Yup.string().required('Required'),
      last_name: Yup.string().required('Required'),
      is_active: Yup.boolean(),
      is_staff: Yup.boolean(),
      groups: Yup.array().of(Yup.number()),
      password: Yup.string().when('$showPasswordFields', {
        is: true,
        then: Yup.string().min(8, 'Password must be at least 8 characters').required('Required')
      }),
      confirm_password: Yup.string().when('$showPasswordFields', {
        is: true,
        then: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Required')
      })
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Update user details
        await userService.update(values.id, {
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          is_active: values.is_active,
          is_staff: values.is_staff
        });
        
        // Set password if password fields are shown and password is provided
        if (showPasswordFields && values.password) {
          await userService.setPassword(values.id, values.password);
        }
        
        // Update user groups
        await userService.setGroups(values.id, values.groups);
        
        // Update the users list
        const updatedUsers = users.map(user => 
          user.id === values.id 
            ? { ...user, ...values, groups: groups.filter(g => values.groups.includes(g.id)) } 
            : user
        );
        
        setUsers(updatedUsers);
        setIsEditing(false);
        setCurrentUser(null);
        setShowPasswordFields(false); // Reset password toggle
        showSuccess('User updated successfully');
      } catch (err) {
        setError(err.response?.data || { detail: 'Failed to update user' });
      }
    }
  });

  // Handle edit user button click
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowPasswordFields(false); // Reset password toggle
    editUserForm.resetForm({
      values: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        is_staff: user.is_staff,
        groups: user.groups ? user.groups.map(g => g.id) : [],
        password: '',  // Reset password
        confirm_password: ''  // Reset confirm password
      }
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.delete(userToDelete.id);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setUserToDelete(null);
      setShowDeleteConfirm(false);
      showSuccess('User deleted successfully');
    } catch (err) {
      setError(err.response?.data || { detail: 'Failed to delete user' });
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
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            User Management
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Create, edit and delete system users
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setIsEditing(false);
            createUserForm.resetForm();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {isCreating ? 'Cancel' : 'Add User'}
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
      
      {/* Create User Form */}
      {isCreating && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New User</h3>
          <form onSubmit={createUserForm.handleSubmit}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={`form-input ${
                    createUserForm.touched.email && createUserForm.errors.email ? 'border-red-500' : ''
                  }`}
                  value={createUserForm.values.email}
                  onChange={createUserForm.handleChange}
                  onBlur={createUserForm.handleBlur}
                />
                {createUserForm.touched.email && createUserForm.errors.email && (
                  <div className="form-error">{createUserForm.errors.email}</div>
                )}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="first_name" className="form-label">
                  First name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  className={`form-input ${
                    createUserForm.touched.first_name && createUserForm.errors.first_name ? 'border-red-500' : ''
                  }`}
                  value={createUserForm.values.first_name}
                  onChange={createUserForm.handleChange}
                  onBlur={createUserForm.handleBlur}
                />
                {createUserForm.touched.first_name && createUserForm.errors.first_name && (
                  <div className="form-error">{createUserForm.errors.first_name}</div>
                )}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="last_name" className="form-label">
                  Last name
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  className={`form-input ${
                    createUserForm.touched.last_name && createUserForm.errors.last_name ? 'border-red-500' : ''
                  }`}
                  value={createUserForm.values.last_name}
                  onChange={createUserForm.handleChange}
                  onBlur={createUserForm.handleBlur}
                />
                {createUserForm.touched.last_name && createUserForm.errors.last_name && (
                  <div className="form-error">{createUserForm.errors.last_name}</div>
                )}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className={`form-input ${
                    createUserForm.touched.password && createUserForm.errors.password ? 'border-red-500' : ''
                  }`}
                  value={createUserForm.values.password}
                  onChange={createUserForm.handleChange}
                  onBlur={createUserForm.handleBlur}
                />
                {createUserForm.touched.password && createUserForm.errors.password && (
                  <div className="form-error">{createUserForm.errors.password}</div>
                )}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="re_password" className="form-label">
                  Confirm password
                </label>
                <input
                  type="password"
                  name="re_password"
                  id="re_password"
                  className={`form-input ${
                    createUserForm.touched.re_password && createUserForm.errors.re_password ? 'border-red-500' : ''
                  }`}
                  value={createUserForm.values.re_password}
                  onChange={createUserForm.handleChange}
                  onBlur={createUserForm.handleBlur}
                />
                {createUserForm.touched.re_password && createUserForm.errors.re_password && (
                  <div className="form-error">{createUserForm.errors.re_password}</div>
                )}
              </div>
              
              <div className="col-span-6">
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={createUserForm.values.is_active}
                    onChange={createUserForm.handleChange}
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="col-span-6">
                <div className="flex items-center">
                  <input
                    id="is_staff"
                    name="is_staff"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={createUserForm.values.is_staff}
                    onChange={createUserForm.handleChange}
                  />
                  <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-900">
                    Administrator
                  </label>
                </div>
              </div>
              
              <div className="col-span-6">
                <label className="form-label">Groups</label>
                <div className="mt-2 space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center">
                      <input
                        id={`group-${group.id}`}
                        name="groups"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        value={group.id}
                        checked={createUserForm.values.groups.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            createUserForm.setFieldValue('groups', [...createUserForm.values.groups, group.id]);
                          } else {
                            createUserForm.setFieldValue(
                              'groups',
                              createUserForm.values.groups.filter((id) => id !== group.id)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`group-${group.id}`} className="ml-2 block text-sm text-gray-900">
                        {group.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button type="submit" className="btn btn-primary">
                Create User
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit User Form */}
      {isEditing && currentUser && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Edit User: {currentUser.email}
          </h3>
          <form onSubmit={editUserForm.handleSubmit}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  disabled
                  className="form-input bg-gray-100"
                  value={editUserForm.values.email}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="first_name" className="form-label">
                  First name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  className={`form-input ${
                    editUserForm.touched.first_name && editUserForm.errors.first_name ? 'border-red-500' : ''
                  }`}
                  value={editUserForm.values.first_name}
                  onChange={editUserForm.handleChange}
                  onBlur={editUserForm.handleBlur}
                />
                {editUserForm.touched.first_name && editUserForm.errors.first_name && (
                  <div className="form-error">{editUserForm.errors.first_name}</div>
                )}
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="last_name" className="form-label">
                  Last name
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  className={`form-input ${
                    editUserForm.touched.last_name && editUserForm.errors.last_name ? 'border-red-500' : ''
                  }`}
                  value={editUserForm.values.last_name}
                  onChange={editUserForm.handleChange}
                  onBlur={editUserForm.handleBlur}
                />
                {editUserForm.touched.last_name && editUserForm.errors.last_name && (
                  <div className="form-error">{editUserForm.errors.last_name}</div>
                )}
              </div>
              
              <div className="col-span-6">
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={editUserForm.values.is_active}
                    onChange={editUserForm.handleChange}
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="col-span-6">
                <div className="flex items-center">
                  <input
                    id="is_staff"
                    name="is_staff"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={editUserForm.values.is_staff}
                    onChange={editUserForm.handleChange}
                  />
                  <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-900">
                    Administrator
                  </label>
                </div>
              </div>
              
              {/* Password change section */}
              <div className="col-span-6 border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center">
                  <input
                    id="show_password_fields"
                    name="show_password_fields"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={showPasswordFields}
                    onChange={() => setShowPasswordFields(!showPasswordFields)}
                  />
                  <label htmlFor="show_password_fields" className="ml-2 block text-sm text-gray-900">
                    Change user's password
                  </label>
                </div>
              </div>

              {/* Password fields - only shown when showPasswordFields is true */}
              {showPasswordFields && (
                <div className="col-span-6 grid grid-cols-6 gap-6 mt-4">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="password" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className={`form-input ${
                        editUserForm.touched.password && editUserForm.errors.password ? 'border-red-500' : ''
                      }`}
                      value={editUserForm.values.password}
                      onChange={editUserForm.handleChange}
                      onBlur={editUserForm.handleBlur}
                    />
                    {editUserForm.touched.password && editUserForm.errors.password && (
                      <div className="form-error">{editUserForm.errors.password}</div>
                    )}
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="confirm_password" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      className={`form-input ${
                        editUserForm.touched.confirm_password && editUserForm.errors.confirm_password ? 'border-red-500' : ''
                      }`}
                      value={editUserForm.values.confirm_password}
                      onChange={editUserForm.handleChange}
                      onBlur={editUserForm.handleBlur}
                    />
                    {editUserForm.touched.confirm_password && editUserForm.errors.confirm_password && (
                      <div className="form-error">{editUserForm.errors.confirm_password}</div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="col-span-6">
                <label className="form-label">Groups</label>
                <div className="mt-2 space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center">
                      <input
                        id={`edit-group-${group.id}`}
                        name="groups"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        value={group.id}
                        checked={editUserForm.values.groups.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            editUserForm.setFieldValue('groups', [...editUserForm.values.groups, group.id]);
                          } else {
                            editUserForm.setFieldValue(
                              'groups',
                              editUserForm.values.groups.filter((id) => id !== group.id)
                            );
                          }
                        }}
                      />
                      <label htmlFor={`edit-group-${group.id}`} className="ml-2 block text-sm text-gray-900">
                        {group.name}
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
                  setCurrentUser(null);
                  setShowPasswordFields(false);
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
      
      {/* Users Table */}
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Groups
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.is_staff ? 'Administrator' : 'Regular User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.groups && user.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.groups.map((group) => (
                            <span key={group.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {group.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
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
      {showDeleteConfirm && userToDelete && (
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
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the user "{userToDelete.email}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteUser}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
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

export default UserManagement;