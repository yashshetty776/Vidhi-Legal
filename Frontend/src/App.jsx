// src/App.js
import { Route, Routes, useLocation } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Cases from './pages/Cases';
import CreateCase from './pages/CreateCase';
import Lawyer from './pages/Lawyer';
import Profile from './pages/Profile';
import NewsFeed from './components/NewsFeed';
import Nyaya from './components/Nyayadut';
import Notification from './pages/Notification';
import ChatApp from './pages/chat';
import NotFound from './pages/NotFound';

function App() {
  const location = useLocation();
  const isAuthenticationPage = location.pathname === '/' || location.pathname === '/signin' || location.pathname === '/signup';
  return (
    <div>
    {!isAuthenticationPage && <Nyaya />}
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<ProtectedRoute><><Navbar /><Home /></></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
      <Route path="/create-case" element={<ProtectedRoute><CreateCase /></ProtectedRoute>} />
      <Route path="/lawyers" element={<ProtectedRoute><Lawyer /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><NewsFeed /></ProtectedRoute>} />
      <Route path="/notification" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
      <Route path="/chat/:caseId" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </div>
  );
}

export default App;
