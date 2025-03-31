import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Register = () => {
  const { register, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      re_password: '',
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
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await register(values);
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Registration error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (success) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Registration Successful!</h2>
        <p className="text-gray-600 mb-4">
          An activation email has been sent to your email address. Please check your inbox to activate your account.
        </p>
        <p className="text-gray-600">
          Redirecting to login page in 3 seconds...
          <br />
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Click here if you're not redirected automatically
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Create your account</h2>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <ul className="list-disc pl-5">
            {Object.entries(error).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {Array.isArray(value) ? value[0] : value}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`form-input ${
                formik.touched.email && formik.errors.email ? 'border-red-500' : ''
              }`}
              placeholder="Email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="form-error">{formik.errors.email}</div>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="form-label">
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                className={`form-input ${
                  formik.touched.first_name && formik.errors.first_name ? 'border-red-500' : ''
                }`}
                placeholder="First name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.first_name && formik.errors.first_name && (
                <div className="form-error">{formik.errors.first_name}</div>
              )}
            </div>
            
            <div>
              <label htmlFor="last_name" className="form-label">
                Last name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                className={`form-input ${
                  formik.touched.last_name && formik.errors.last_name ? 'border-red-500' : ''
                }`}
                placeholder="Last name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <div className="form-error">{formik.errors.last_name}</div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={`form-input ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : ''
              }`}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="form-error">{formik.errors.password}</div>
            )}
          </div>
          
          <div>
            <label htmlFor="re_password" className="form-label">
              Confirm password
            </label>
            <input
              id="re_password"
              name="re_password"
              type="password"
              autoComplete="new-password"
              required
              className={`form-input ${
                formik.touched.re_password && formik.errors.re_password ? 'border-red-500' : ''
              }`}
              placeholder="Confirm password"
              value={formik.values.re_password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.re_password && formik.errors.re_password && (
              <div className="form-error">{formik.errors.re_password}</div>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary w-full ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </form>
    </>
  );
};

export default Register;