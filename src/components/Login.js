import React, { useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext'; // Adjust the import path if necessary

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext); // Access the login function from context

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
        // console.log('Logging in with username:', values.username);

        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Network response was not ok');
        }

        const data = await response.json();
        // console.log('Login success:', data);

        // Assuming the backend returns user_id, username, role, and access_token in the response
        const { access_token, id, username, role } = data;

        // Call the login function from UserContext
        login({ access_token, id, username, role });

        // Navigate based on user role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'technician') {
          navigate('/technician');
        } else if (role === 'receptionist') {
          navigate('/receptionist');
        } else {
          // Default navigation for other roles, e.g., clerk
          navigate('/');
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                formik.touched.username && formik.errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="mt-1 text-sm text-red-500">{formik.errors.username}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="mt-1 text-sm text-red-500">{formik.errors.password}</div>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
