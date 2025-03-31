import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';

const Profile = () => {
  const { user, refreshAccessToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      current_password: '',
      new_password: '',
      re_new_password: '',
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required('Required'),
      last_name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      current_password: Yup.string().when('new_password', {
        is: val => val && val.length > 0,
        then: Yup.string().required('Current password is required to change password'),
        otherwise: Yup.string()
      }),
      new_password: Yup.string().min(8, 'Password must be at least 8 characters'),
      re_new_password: Yup.string().when('new_password', {
        is: val => val && val.length > 0,
        then: Yup.string()
          .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
          .required('Password confirmation is required'),
        otherwise: Yup.string()
      }),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setUpdateSuccess(false);
      setError(null);
      
      try {
        // First update user profile (email, name)
        await api.patch('/auth/users/me/', {
          first_name: values.first_name,
          last_name: values.last_name,
        });
        
        // Handle password change if new password is provided
        if (values.new_password) {
          await api.post('/auth/users/set_password/', {
            current_password: values.current_password,
            new_password: values.new_password,
            re_new_password: values.re_new_password,
          });
          
          // Reset password fields
          formik.setFieldValue('current_password', '');
          formik.setFieldValue('new_password', '');
          formik.setFieldValue('re_new_password', '');
        }
        
        // Refresh user data
        await refreshAccessToken();
        
        setUpdateSuccess(true);
        setIsEditing(false);
      } catch (err) {
        setError(err.response?.data || { detail: 'An error occurred while updating your profile.' });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleEdit = () => {
    // Reset form with current user data
    formik.resetForm({
      values: {
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        current_password: '',
        new_password: '',
        re_new_password: '',
      }
    });
    setIsEditing(true);
    setError(null);
    setUpdateSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Your Profile
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your personal information and password
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {updateSuccess && (
        <div className="m-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <p className="font-medium">Success!</p>
          <p className="text-sm">Your profile has been updated successfully.</p>
        </div>
      )}
      
      {error && (
        <div className="m-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p className="font-medium">Error updating profile:</p>
          <ul className="list-disc pl-5">
            {Object.entries(error).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value[0] : value}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="border-t border-gray-200">
        {isEditing ? (
          <form onSubmit={formik.handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="first_name" className="form-label">
                  First name
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  className={`form-input ${
                    formik.touched.first_name && formik.errors.first_name ? 'border-red-500' : ''
                  }`}
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.first_name && formik.errors.first_name && (
                  <div className="form-error">{formik.errors.first_name}</div>
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
                    formik.touched.last_name && formik.errors.last_name ? 'border-red-500' : ''
                  }`}
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.last_name && formik.errors.last_name && (
                  <div className="form-error">{formik.errors.last_name}</div>
                )}
              </div>
              
              <div className="col-span-6">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  disabled
                  className="form-input bg-gray-100"
                  value={formik.values.email}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed directly. Please contact an administrator.
                </p>
              </div>
              
              <div className="col-span-6 border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Change Password</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Leave these fields blank if you don't want to change your password.
                </p>
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="current_password" className="form-label">
                      Current password
                    </label>
                    <input
                      type="password"
                      name="current_password"
                      id="current_password"
                      className={`form-input ${
                        formik.touched.current_password && formik.errors.current_password ? 'border-red-500' : ''
                      }`}
                      value={formik.values.current_password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.current_password && formik.errors.current_password && (
                      <div className="form-error">{formik.errors.current_password}</div>
                    )}
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="new_password" className="form-label">
                      New password
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      id="new_password"
                      className={`form-input ${
                        formik.touched.new_password && formik.errors.new_password ? 'border-red-500' : ''
                      }`}
                      value={formik.values.new_password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.new_password && formik.errors.new_password && (
                      <div className="form-error">{formik.errors.new_password}</div>
                    )}
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="re_new_password" className="form-label">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      name="re_new_password"
                      id="re_new_password"
                      className={`form-input ${
                        formik.touched.re_new_password && formik.errors.re_new_password ? 'border-red-500' : ''
                      }`}
                      value={formik.values.re_new_password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.re_new_password && formik.errors.re_new_password && (
                      <div className="form-error">{formik.errors.re_new_password}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">First name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.first_name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.last_name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Account status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">User role</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.is_staff ? 'Administrator' : 'Regular User'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date joined</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.date_joined).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Groups</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.groups && user.groups.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.groups.map((group) => (
                        <span key={group.id} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          {group.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No groups assigned</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;