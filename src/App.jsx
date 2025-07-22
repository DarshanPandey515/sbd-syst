// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';
import Meet from './pages/Meet';
import Venue from './pages/Venue';
import WeightClass from './pages/WeightClass';
import MeetManage from './pages/MeetManage';
import Participant from './pages/Participant';
import Game from './pages/Game';
import Result from './pages/Result';


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meets" element={<Meet />} />
            <Route path="/meets/meet-manage/:id" element={<MeetManage />} />
            <Route path="/meets/meet-manage/:id/participants" element={<Participant />} />
            <Route path="/meets/meet-manage/:id/game" element={<Game />} />
            <Route path="/meets/meet-manage/:id/results" element={<Result />} />
            <Route path="/venues" element={<Venue />} />
            <Route path="/weight-classes" element={<WeightClass />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="bottom-center"
          toastOptions={{
            className: '',
            style: {
              padding: '16px',
              background: '#1f2937',
              color: '#f3f4f6',
            },
            duration: 4000,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}