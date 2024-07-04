import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const PrivateRoute = ({ element }) => {
  const { auth } = useContext(AuthContext);

  return auth ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
