import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Clock, BarChart3, Trophy, Calendar, Code2, Zap, Shield, Users, Brain, Target, NotebookPen, Repeat, CheckCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const LandingPage = ({ onAuthSuccess, isDarkMode }) => {
  const googleClientId = "994245990983-m5le37sunadq280ggv4vqrqt98m3ljch.apps.googleusercontent.com";
  const [currentDate] = useState(new Date());

const formatDate = (date) => {
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
  name: '',
  email: 'user@example.com',        // Default email
  password: 'password',             // Default password
  confirmPassword: ''
});


  // Keep existing validation and form handling functions
  const validateForm = () => {
    const newErrors = {};
    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});

    try {
      await new Promise((resolve) => {
        setTimeout(() => {
          const userData = {
            id: Date.now(),
            name: formData.name || formData.email.split('@')[0],
            email: formData.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.email)}&background=3b82f6&color=ffffff`
          };
          resolve(userData);
        }, 1500);
      }).then((userData) => {
        onAuthSuccess(userData);
      });
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    try {
      const decodedToken = jwtDecode(credentialResponse.credential);
      const userData = {
        id: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        avatar: decodedToken.picture
      };
      onAuthSuccess(userData);
    } catch (error) {
      console.error("Error decoding Google token:", error);
      setErrors({ submit: 'Google sign-in failed. Please try again.' });
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google Login Failed');
    setErrors({ submit: 'Google sign-in failed. Please ensure pop-ups are enabled and try again.' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const inputClass = (hasError) =>
    `block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
      hasError
        ? 'border-red-400 bg-red-50 text-red-800 placeholder-red-400'
        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400 focus:bg-white'
    }`;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <header className="relative z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
  <Code2 className="h-8 w-8 text-blue-400" />
  <span className="text-2xl font-bold text-white">CodePulse</span>
</div>

              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
                <a href="#auth" className="text-gray-300 hover:text-white transition-colors">Get Started</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-20">
          <div className="absolute inset-0">
            <div className="absolute top-40 left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Hero Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
  Your Personalized
  <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
    Coding Progress Tracker
  </span>
</h1>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Your comprehensive study companion for technical interviews. 
                  Personalized plans, intelligent tracking, and spaced repetition 
                  to accelerate your learning journey.
                </p>
                
                {/* Quick Stats Preview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-blue-400">42</div>
                    <div className="text-sm text-gray-400">Problems</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-purple-400">85%</div>
                    <div className="text-sm text-gray-400">Complete</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="text-2xl font-bold text-green-400">7</div>
                    <div className="text-sm text-gray-400">Day Streak</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="#auth" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Start Learning Now
                  </a>
                  <a href="#features" className="border border-gray-600 text-gray-300 px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 hover:text-white transition-all duration-200">
                    Explore Features
                  </a>
                </div>
              </div>

              {/* Right Column - Dashboard Preview */}
              <div className="relative">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-2xl">
                 <div className="flex items-center justify-between mb-6">
  <h3 className="text-lg font-semibold text-white">{formatDate(currentDate)}</h3>
  <div className="flex space-x-2">
    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
  </div>
</div>

                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 line-through">Two Sum</span>
                      </div>
                      <span className="text-green-400 text-xs">Easy</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-300">Valid Parentheses</span>
                      </div>
                      <span className="text-yellow-400 text-xs">Medium</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-gray-300">Binary Tree Max Path</span>
                      </div>
                      <span className="text-red-400 text-xs">Hard</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progress</span>
                      <span>1/3 Complete</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Excel</h2>
              <p className="text-xl text-gray-400">Comprehensive features designed for your technical interview success.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-200">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Smart Plan Generation</h3>
                <p className="text-gray-400">AI-powered study plans tailored to your skill level, timeline, and learning goals.</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Topic Customization</h3>
                <p className="text-gray-400">Focus on Arrays, Graphs, DP, or create a comprehensive curriculum across all topics.</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-200">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Progress Analytics</h3>
                <p className="text-gray-400">Visual dashboard with completion stats, progress bars, and performance insights.</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-200">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Repeat className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Spaced Repetition</h3>
                <p className="text-gray-400">Automatic review scheduling to reinforce learning and improve long-term retention.</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-200">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <NotebookPen className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Rich Note-Taking</h3>
                <p className="text-gray-400">Built-in editor with code blocks, templates, and syntax highlighting for technical notes.</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-pink-500/50 transition-all duration-200">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Daily Task Manager</h3>
                <p className="text-gray-400">Organized daily schedules with clear visual cues for past, present, and future tasks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
     <section id="how-it-works" className="py-20 bg-gray-900/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-white mb-4">Get Started in 3 Easy Steps</h2>
      <p className="text-xl text-gray-400">Begin your journey to algorithm mastery in minutes.</p>
    </div>

    <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
      {/* Step 1 */}
      <div className="flex-1 max-w-sm">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 h-full text-center group hover:border-blue-500/30 transition-all duration-300">
          <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
            <Target className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Select Your Topics</h3>
          <p className="text-gray-400 leading-relaxed">
            Choose the subjects you want to master and set your current skill level.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex-1 max-w-sm">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 h-full text-center group hover:border-purple-500/30 transition-all duration-300">
          <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 transition-colors duration-300">
            <Brain className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Generate Your Plan</h3>
          <p className="text-gray-400 leading-relaxed">
            Instantly receive a personalized study plan tailored to your needs.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex-1 max-w-sm">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 h-full text-center group hover:border-green-500/30 transition-all duration-300">
          <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/30 transition-colors duration-300">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Track and Learn</h3>
          <p className="text-gray-400 leading-relaxed">
            Follow your plan, track your progress, and retain knowledge effectively.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>



        {/* Trust Section */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Join Successful Learners Worldwide</h2>
              <p className="text-gray-400">Thousands of developers have mastered algorithms and landed their dream jobs.</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">2.5k+</div>
                <div className="text-gray-400">Active Learners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">50k+</div>
                <div className="text-gray-400">Problems Solved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">800+</div>
                <div className="text-gray-400">Job Offers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">95%</div>
                <div className="text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Section */}
        <section id="auth" className="py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Begin Your Journey to Mastery</h2>
              <p className="text-xl text-gray-400">Start with a personalized study plan designed for your success.</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-white">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h3>
                <p className="text-sm text-gray-400">
                  {isSignUp ? 'Join thousands mastering algorithms' : 'Continue your learning journey'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                {isSignUp && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={inputClass(errors.name)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={inputClass(errors.email)}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`${inputClass(errors.password)} pr-10`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                {isSignUp && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`${inputClass(errors.confirmPassword)} pr-10`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400 transition-colors" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {errors.submit && (
                  <div className="p-3 border border-red-400/50 rounded-lg bg-red-500/20">
                    <p className="text-sm text-red-400">{errors.submit}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Start Learning' : 'Continue Learning'
                  )}
                </button>

                {/* Google Login */}
                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-gray-600"></div>
                  <span className="flex-shrink mx-4 text-gray-400 font-medium">OR</span>
                  <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <div className="grid place-items-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    useOneTap
                  />
                </div>

                {/* Toggle Auth Mode */}
                <div className="text-center">
                  <p className="text-gray-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>
              </form>

              {/* Project Attribution */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-gray-400 mb-3">
                    Project by: <span className="font-semibold text-white">Prakhar Sinha</span>
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href="https://www.linkedin.com/in/prakhar3125/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/80 text-white text-sm font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                    <a
                      href="https://github.com/prakhar3125"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/80 text-white text-sm font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
       <footer className={`w-full py-6 mt-auto border-t transition-colors duration-300 ${ 'border-gray-700 bg-gray-900'}`}>
                <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        &copy; {new Date().getFullYear()} CodePulse Tracker. All Rights Reserved.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                         <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Project by <a href="https://www.linkedin.com/in/prakhar3125/" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-500 hover:text-blue-400">Prakhar Sinha</a>
                        </p>
                        <a
                            href="https://github.com/prakhar3125"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-sm transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LandingPage;
