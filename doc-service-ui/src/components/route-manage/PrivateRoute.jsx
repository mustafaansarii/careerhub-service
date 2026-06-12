import { Navigate } from 'react-router-dom';

import authService from '../../services/auth.service';

export default function PrivateRoute({ children }) {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
