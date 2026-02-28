import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  ChevronRight,
  BarChart3,
  ClipboardList,
  MapPin,
  User,
  Activity,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// --- Components ---

const Header = () => (
  <header className="bg-gradient-to-r from-orange-500 via-white to-green-500 p-4 shadow-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
          TN
        </div>
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight hidden sm:block">
          Election Pulse 2026
        </h1>
      </Link>
      <nav className="flex gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-blue-900 font-medium transition-colors shadow-sm"
        >
          <ClipboardList size={18} />
          <span className="hidden sm:inline">Survey</span>
        </Link>
      </nav>
    </div>
  </header>
);

const SurveyForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    district: "",
    gender: "",
    ageCategory: "",
    lastVoted: "",
    thisTimeVote: "",
    whoWillWin: "",
    mlaWork: "",
    expectedChanges: "",
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Check if user already submitted
  useEffect(() => {
    const hasSubmitted = localStorage.getItem("tn_survey_submitted");
    if (hasSubmitted) {
      setIsSubmitted(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.area || !formData.district || !formData.gender || !formData.ageCategory)) {
      setError("Please fill all required fields in this section.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.area || !formData.district || !formData.gender || !formData.ageCategory) {
      setError("Please fill all required personal details.");
      return;
    }
    if (!formData.lastVoted || !formData.thisTimeVote || !formData.whoWillWin) {
      setError("Please complete all voting preference questions.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }

      localStorage.setItem("tn_survey_submitted", "true");
      setIsSubmitted(true);
    } catch (err) {
      setError("An error occurred while submitting. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSurvey = () => {
    localStorage.removeItem("tn_survey_submitted");
    setIsSubmitted(false);
    setStep(1);
    setFormData({
      name: "",
      area: "",
      district: "",
      gender: "",
      ageCategory: "",
      lastVoted: "",
      thisTimeVote: "",
      whoWillWin: "",
      mlaWork: "",
      expectedChanges: "",
      additionalNotes: "",
    });
  };

  if (isSubmitted) {
    return (
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl text-center border-t-8 border-green-500"
        >
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 text-lg mb-8">
            Your voice has been recorded. We appreciate your time in participating in the TN Election Pulse 2026 survey.
          </p>
          <button
            onClick={resetSurvey}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg mb-6"
          >
            Take Another Survey
          </button>
          <p className="text-sm text-gray-400">
            Note: You can only take this survey once per device to ensure fair results.
          </p>
        </motion.div>
      </div>
    );
  }

  const districts = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi",
    "Dindigul", "Thanjavur", "Ranipet", "Kanyakumari", "Other"
  ];

  const parties = [
    { name: "DMK", symbol: "☀️" },
    { name: "AIADMK", symbol: "🍃" },
    { name: "TVK", symbol: "🐘" }, // Using elephant as placeholder for TVK
    { name: "BJP", symbol: "🪷" },
    { name: "NTK", symbol: "👨‍🌾" },
    { name: "MNM", symbol: "🔦" },
    { name: "Congress", symbol: "✋" },
    { name: "PMK", symbol: "🥭" },
    { name: "Other", symbol: "🗳️" },
    { name: "Undecided", symbol: "🤔" }
  ];

  return (
    <div className="max-w-3xl mx-auto mt-8 mb-16 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Progress Bar removed */}
        <div className="p-6 sm:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">TN Election Survey</h2>
            <p className="text-gray-500">Share your thoughts on the upcoming 2026 assembly elections.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold border-b pb-2">
                <User size={20} />
                <h3>Personal Details</h3>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Age Category *</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["18-30", "31-60", "61 above"].map((age) => (
                        <label
                          key={age}
                          className={`cursor-pointer p-4 border rounded-xl text-center transition-all ${
                            formData.ageCategory === age
                              ? "border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="ageCategory"
                            value={age}
                            checked={formData.ageCategory === age}
                            onChange={handleChange}
                            className="hidden"
                          />
                          {age}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-8 mb-4 text-blue-600 font-semibold border-b pb-2">
                    <MapPin size={20} />
                    <h3>Location Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">District *</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Select District</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Area / Constituency *</label>
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="E.g., Anna Nagar"
                        required
                      />
                    </div>
                  </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-4 text-orange-600 font-semibold border-b pb-2">
                <Activity size={20} />
                <h3>Political Preferences</h3>
              </div>

              <div className="space-y-4">
                <label className="text-base font-medium text-gray-800 block">
                  1. To whom did you vote in the LAST election? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {parties.filter(p => p.name !== "TVK").map((party) => (
                    <label
                      key={`last-${party.name}`}
                      className={`cursor-pointer p-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        formData.lastVoted === party.name
                          ? "border-orange-500 bg-orange-50 text-orange-700 font-medium shadow-sm"
                          : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="lastVoted"
                        value={party.name}
                        checked={formData.lastVoted === party.name}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-2xl">{party.symbol}</span>
                      <span className="text-sm font-medium">{party.name}</span>
                    </label>
                  ))}
                </div>
              </div>

                  <div className="space-y-4">
                    <label className="text-base font-medium text-gray-800 block">
                      2. This time, to whom are you going to vote? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {parties.map((party) => (
                        <label
                          key={`this-${party.name}`}
                          className={`cursor-pointer p-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center gap-2 ${
                            formData.thisTimeVote === party.name
                              ? "border-green-500 bg-green-50 text-green-700 font-medium shadow-sm"
                              : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="thisTimeVote"
                            value={party.name}
                            checked={formData.thisTimeVote === party.name}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <span className="text-2xl">{party.symbol}</span>
                          <span className="text-sm font-medium">{party.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-base font-medium text-gray-800 block">
                      3. Who do you think will WIN the upcoming election? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {parties.filter(p => p.name !== "Undecided").map((party) => (
                        <label
                          key={`win-${party.name}`}
                          className={`cursor-pointer p-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center gap-2 ${
                            formData.whoWillWin === party.name
                              ? "border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="whoWillWin"
                            value={party.name}
                            checked={formData.whoWillWin === party.name}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <span className="text-2xl">{party.symbol}</span>
                          <span className="text-sm font-medium">{party.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4 text-green-600 font-semibold border-b pb-2">
                <MessageSquare size={20} />
                <h3>Feedback & Expectations</h3>
              </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      What has your current MLA done for your area? (be specific)
                    </label>
                    <textarea
                      name="mlaWork"
                      value={formData.mlaWork}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                      placeholder="e.g. Built new roads, setup health camps, improved water supply, installed streetlights... or mention if nothing was done."
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      What changes do you expect after this election?
                    </label>
                    <textarea
                      name="expectedChanges"
                      value={formData.expectedChanges}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                      placeholder="e.g. Better employment, improved schools, drainage system fix, more hospitals..."
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Any additional notes, concerns or message? (optional)
                    </label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all resize-none"
                      placeholder="Your thoughts..."
                    ></textarea>
                  </div>
            </motion.div>

            <div className="mt-10 flex justify-end items-center pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Survey"} <CheckCircle2 size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.token);
        onLogin();
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 mb-16 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
          <p className="text-gray-500">Sign in to view survey analytics</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) throw new Error("Failed to fetch reports");
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-8">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 mb-16 px-4">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Survey Analytics</h2>
          <p className="text-gray-500 mt-1">Real-time insights from TN Election Pulse 2026</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-blue-50 text-blue-800 px-6 py-3 rounded-xl border border-blue-100 shadow-sm flex-1 sm:flex-none">
            <span className="text-sm uppercase tracking-wider font-semibold opacity-80 block whitespace-nowrap">Total Responses</span>
            <span className="text-3xl font-bold">{reportData?.totalSurveys || 0}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors border border-red-200 whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>

      {reportData?.totalSurveys === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600">No data available yet</h3>
          <p className="text-gray-500 mt-2">Share the survey link to start collecting responses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Party Preference */}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              Voting Intentions (This Time)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.byParty} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {reportData?.byParty.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win Prediction */}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
              Who Will Win? (Public Perception)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData?.winPrediction}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {reportData?.winPrediction.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demographics - Age */}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
              Age Demographics
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.byAge}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demographics - Gender */}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500 inline-block"></span>
              Gender Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData?.byGender}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {reportData?.byGender.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#ec4899', '#9ca3af'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-200">
        <Header />
        <main className="px-4">
          <Routes>
            <Route path="/" element={<SurveyForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <footer className="bg-gray-900 text-gray-400 py-8 text-center mt-auto">
          <p>© 2026 TN Election Pulse. All rights reserved.</p>
          <p className="text-sm mt-2 opacity-60">This is an independent survey platform.</p>
        </footer>
      </div>
    </Router>
  );
}
