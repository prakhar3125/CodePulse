import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import StudyPlanner from './CodePulseTracker';
import EditorialPage from './EditorialPage';

// Main App Content Component with Navigation
const AppContent = () => {
    const navigate = useNavigate();

    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing user data on app load
    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedAuthStatus = localStorage.getItem('isAuthenticated');

                if (storedUser && storedAuthStatus === 'true') {
                    const parsedUser = JSON.parse(storedUser);
                    setUserData(parsedUser);
                    setIsAuthenticated(true);
                    console.log("App.js: Restored user from localStorage:", parsedUser);
                } else {
                    // Clear any corrupted or incomplete data
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
                }
            } catch (error) {
                console.error("Error parsing stored user data:", error);
                // Clear corrupted data
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
                setIsAuthenticated(false);
                setUserData(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Handle successful authentication
    const handleAuthSuccess = (userInfo) => {
        console.log("App.js: handleAuthSuccess called with user data:", userInfo);
        setIsAuthenticated(true);
        setUserData(userInfo);

        // Persist authentication data
        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('isAuthenticated', 'true');

        // Navigate to main app
        setTimeout(() => {
            navigate('/track', { replace: true });
        }, 100);
    };

    // Handle logout
    const handleLogout = () => {
        console.log("App.js: handleLogout called. Clearing user data.");
        setIsAuthenticated(false);
        setUserData(null);

        // Clear all stored data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('darkMode');
        localStorage.removeItem('studyPlan');
        localStorage.removeItem('problemNotes');

        // Navigate to authentication
        setTimeout(() => {
            navigate('/authentication', { replace: true });
        }, 100);
    };

    // Debug logging
    useEffect(() => {
        console.log("App.js: Authentication state changed:", {
            isAuthenticated,
            userData: userData?.name || 'No user data'
        });
    }, [isAuthenticated, userData]);

    // Loading screen
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading CodePulse Tracker...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Authentication Route */}
            <Route 
                path="/authentication" 
                element={
                    !isAuthenticated ? (
                        <AuthPage onAuthSuccess={handleAuthSuccess} />
                    ) : (
                        <Navigate to="/track" replace />
                    )
                } 
            />

            {/* Main Tracker Route */}
            <Route 
                path="/track" 
                element={
                    isAuthenticated ? (
                        <StudyPlanner onLogout={handleLogout} user={userData} />
                    ) : (
                        <Navigate to="/authentication" replace />
                    )
                } 
            />

            {/* Editorial Route with optional problemId parameter */}
            <Route 
                path="/editorial/:problemId?" 
                element={
                    isAuthenticated ? (
                        <EditorialPage user={userData} />
                    ) : (
                        <Navigate to="/authentication" replace />
                    )
                } 
            />

            {/* Root Route */}
            <Route 
                path="/" 
                element={
                    <Navigate to={isAuthenticated ? "/track" : "/authentication"} replace />
                } 
            />

            {/* 404 Route */}
            <Route 
                path="*" 
                element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
                            <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                            <button
                                onClick={() => navigate(isAuthenticated ? '/track' : '/authentication')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                } 
            />
        </Routes>
    );
};

const App = () => {
    return (
        <Router>
            <div className="App">
                <AppContent />
            </div>
        </Router>
    );
};

export default App;
