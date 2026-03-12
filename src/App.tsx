import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ClipboardList,
  MapPin,
  User,
  Activity,
  MessageSquare,
  Filter,
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
          தேர்தல் TN 2026
        </h1>
      </Link>
      <nav className="flex gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-blue-900 font-medium transition-colors shadow-sm"
        >
          <ClipboardList size={18} />
          <span className="hidden sm:inline">கணக்கெடுப்பு</span>
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
    lawAndOrder: "",
    drugUsage: "",
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
      setError("தயவுசெய்து இந்த பிரிவில் உள்ள அனைத்து புலங்களையும் நிரப்பவும்.");
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
      setError("தயவுசெய்து அனைத்து தனிப்பட்ட விவரங்களையும் நிரப்பவும்.");
      return;
    }
    if (!formData.lastVoted || !formData.thisTimeVote || !formData.whoWillWin) {
      setError("தயவுசெய்து அனைத்து வாக்களிப்பு விருப்பக் கேள்விகளையும் நிறைவு செய்யவும்.");
      return;
    }
    if (!formData.mlaWork || !formData.expectedChanges || !formData.lawAndOrder || !formData.drugUsage) {
      setError("தயவுசெய்து அனைத்து கருத்து கேள்விகளையும் நிறைவு செய்யவும்.");
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
      setError("சமர்ப்பிக்கும் போது பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.");
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
      lawAndOrder: "",
      drugUsage: "",
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
          <h2 className="text-3xl font-bold text-gray-800 mb-4">நன்றி!</h2>
          <p className="text-gray-600 text-lg mb-8">
            உங்கள் கருத்து பதிவு செய்யப்பட்டது. TN தேர்தல் கணக்கெடுப்பு 2026-ல் பங்கேற்றதற்கு நன்றி.
          </p>
          <button
            onClick={resetSurvey}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg mb-6"
          >
            மீண்டும் கணக்கெடுப்பு எடுக்க
          </button>
          <p className="text-sm text-gray-400">
            குறிப்பு: நியாயமான முடிவுகளை உறுதிப்படுத்த, இந்த கணக்கெடுப்பை ஒரு சாதனத்தில் ஒரு முறை மட்டுமே எடுக்கலாம்.
          </p>
        </motion.div>
      </div>
    );
  }

  const districts = [
    "சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சிராப்பள்ளி", "சேலம்",
    "திருநெல்வேலி", "திருப்பூர்", "வேலூர்", "ஈரோடு", "தூத்துக்குடி",
    "திண்டுக்கல்", "தஞ்சாவூர்", "ராணிப்பேட்டை", "கன்னியாகுமரி", "மற்றவை"
  ];

  const parties = [
    { id: "bjp_alliance", name: "பாஜக + அதிமுக + பாமக" },
    { id: "dmk_alliance", name: "திமுக + காங்கிரஸ் + மக்கள் நீதி மய்யம்" },
    { id: "tvk", name: "தமிழக வெற்றிக் கழகம்" },
    { id: "ntk", name: "நாம் தமிழர் கட்சி" },
    { id: "others", name: "மற்றவர்கள்" },
    { id: "undecided", name: "முடிவு செய்யவில்லை" }
  ];

  return (
    <div className="max-w-3xl mx-auto mt-8 mb-16 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Progress Bar removed */}
        <div className="p-6 sm:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">TN தேர்தல் கணக்கெடுப்பு</h2>
            <p className="text-gray-500">வரவிருக்கும் 2026 சட்டமன்றத் தேர்தல் பற்றிய உங்கள் கருத்துகளை பகிருங்கள்.</p>
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
                <h3>தனிப்பட்ட விவரங்கள்</h3>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">முழு பெயர் *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="உங்கள் பெயரை உள்ளிடவும்"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">பாலினம் *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">பாலினம் தேர்ந்தெடுக்கவும்</option>
                        <option value="ஆண்">ஆண்</option>
                        <option value="பெண்">பெண்</option>
                        <option value="மற்றவர்">மற்றவர்</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">வயது வகை *</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["18-30", "31-60", "61 மேல்"].map((age) => (
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
                    <h3>இருப்பிட விவரங்கள்</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">மாவட்டம் *</label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">மாவட்டம் தேர்ந்தெடுக்கவும்</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">பகுதி / தொகுதி *</label>
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="எ.கா., அண்ணா நகர்"
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
                <h3>அரசியல் விருப்பங்கள்</h3>
              </div>

              <div className="space-y-4">
                <label className="text-base font-medium text-gray-800 block">
                  1. கடந்த தேர்தலில் யாருக்கு வாக்களித்தீர்கள்? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {parties.filter(p => p.id !== "tvk").map((party) => (
                    <label
                      key={`last-${party.name}`}
                      className={`cursor-pointer p-3 border rounded-xl text-center transition-all ${
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
                      <span className="text-sm font-medium">{party.name}</span>
                    </label>
                  ))}
                </div>
              </div>

                  <div className="space-y-4">
                    <label className="text-base font-medium text-gray-800 block">
                      2. இந்த முறை யாருக்கு வாக்களிக்க போகிறீர்கள்? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {parties.map((party) => (
                        <label
                          key={`this-${party.name}`}
                          className={`cursor-pointer p-3 border rounded-xl text-center transition-all ${
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
                              <span className="text-sm font-medium">{party.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-base font-medium text-gray-800 block">
                      3. வரவிருக்கும் தேர்தலில் யார் வெல்வார்கள் என்று நினைக்கிறீர்கள்? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {parties.filter(p => p.id !== "undecided").map((party) => (
                        <label
                          key={`win-${party.name}`}
                          className={`cursor-pointer p-3 border rounded-xl text-center transition-all ${
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
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-4 text-green-600 font-semibold border-b pb-2">
                <MessageSquare size={20} />
                <h3>கருத்துகள் & எதிர்பார்ப்புகள்</h3>
              </div>

              {(() => {
                const feedbackQuestions: {
                  label: string;
                  name: keyof typeof formData;
                  options: { value: string; emoji: string }[];
                }[] = [
                  {
                    label: "1. உங்கள் தற்போதைய MLA உங்கள் பகுதிக்கு என்ன செய்தார்?",
                    name: "mlaWork",
                    options: [
                      { value: "மிகவும் நன்றாக செய்தார்", emoji: "😊" },
                      { value: "ஓரளவு செய்தார்", emoji: "🙂" },
                      { value: "செய்யவில்லை / திருப்தி இல்லை", emoji: "😕" },
                      { value: "கருத்து இல்லை", emoji: "🤷" },
                    ],
                  },
                  {
                    label: "2. இந்த தேர்தலுக்கு பிறகு மாற்றம் வருமா?",
                    name: "expectedChanges",
                    options: [
                      { value: "நிச்சயம் மாற்றம் வரும்", emoji: "😄" },
                      { value: "ஓரளவு மாற்றம் வரும்", emoji: "🙂" },
                      { value: "மாற்றம் வராது", emoji: "😐" },
                      { value: "தெரியவில்லை", emoji: "🤔" },
                    ],
                  },
                  {
                    label: "3. உங்கள் பகுதியில் சட்டம் ஒழுங்கு எப்படி இருக்கு?",
                    name: "lawAndOrder",
                    options: [
                      { value: "மிகவும் நல்ல நிலையில் உள்ளது", emoji: "😊" },
                      { value: "சாதாரணமாக உள்ளது", emoji: "😐" },
                      { value: "மோசமாக உள்ளது", emoji: "😟" },
                      { value: "கருத்து இல்லை", emoji: "🤷" },
                    ],
                  },
                  {
                    label: "4. உங்கள் பகுதியில் மது / போதை பொருள் பயன்பாடு எப்படி இருக்கு?",
                    name: "drugUsage",
                    options: [
                      { value: "மிகவும் குறைவாக உள்ளது", emoji: "😊" },
                      { value: "ஓரளவு உள்ளது", emoji: "😐" },
                      { value: "அதிகமாக உள்ளது", emoji: "😟" },
                      { value: "தெரியவில்லை", emoji: "🤔" },
                    ],
                  },
                ];

                return feedbackQuestions.map((q) => (
                  <div key={q.name} className="space-y-3">
                    <label className="text-base font-medium text-gray-800 block">{q.label} *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {q.options.map((opt) => (
                        <label
                          key={opt.value}
                          className={`cursor-pointer p-3 border rounded-xl text-center transition-all ${
                            formData[q.name] === opt.value
                              ? "border-green-500 bg-green-50 text-green-700 font-medium shadow-sm"
                              : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.name}
                            value={opt.value}
                            checked={formData[q.name] === opt.value}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <span className="text-2xl">{opt.emoji}</span>
                          <span className="text-xs font-medium leading-tight">{opt.value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ));
              })()}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  கூடுதல் குறிப்புகள், கவலைகள் அல்லது செய்தி? (விருப்பமானால்)
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all resize-none"
                  placeholder="உங்கள் கருத்துகள்..."
                ></textarea>
              </div>
            </motion.div>

            <div className="mt-10 flex justify-end items-center pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "சமர்ப்பிக்கிறது..." : "கணக்கெடுப்பை சமர்ப்பிக்கவும்"} <CheckCircle2 size={18} />
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
        setError("தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்");
      }
    } catch (err) {
      setError("சேவையகத்துடன் இணைக்க முடியவில்லை");
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">நிர்வாக உள்நுழைவு</h2>
          <p className="text-gray-500">கணக்கெடுப்பு பகுப்பாய்வை பார்க்க உள்நுழையவும்</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">மின்னஞ்சல்</label>
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
            <label className="text-sm font-medium text-gray-700">கடவுச்சொல்</label>
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
            {loading ? "உள்நுழைகிறது..." : "உள்நுழைய"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  type DashboardFilters = {
    district: string;
    from_date: string;
    to_date: string;
  };

  const EMPTY_FILTERS: DashboardFilters = { district: "", from_date: "", to_date: "" };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState<"graphs" | "table">("graphs");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const buildQuery = (base: Record<string, string | number>, f: DashboardFilters) => {
    const params = new URLSearchParams();
    Object.entries(base).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    if (f.district) params.set("district", f.district);
    if (f.from_date) params.set("from_date", f.from_date);
    if (f.to_date) params.set("to_date", f.to_date);
    return params.toString();
  };

  const fetchDistricts = async () => {
    try {
      const res = await fetch("/api/districts");
      if (!res.ok) return;
      const data = await res.json();
      setDistricts(data?.districts || []);
    } catch (e) {
      console.error("Failed to load districts", e);
    }
  };

  const fetchReports = async (f: DashboardFilters) => {
    const query = buildQuery({}, f);
    const response = await fetch(`/api/reports${query ? `?${query}` : ""}`);
    if (!response.ok) throw new Error("Failed to fetch reports");
    return response.json();
  };

  const fetchTableData = async (page: number, f: DashboardFilters) => {
    setTableLoading(true);
    try {
      const query = buildQuery({ page, per_page: 20 }, f);
      const response = await fetch(`/api/surveys?${query}`);
      if (!response.ok) throw new Error("Failed to fetch survey table");
      const data = await response.json();
      setTableData(data?.surveys || []);
      setCurrentPage(data?.page || page);
      setTotalPages(data?.total_pages || 1);
      setTotalRows(data?.total || 0);
    } finally {
      setTableLoading(false);
    }
  };

  const loadDashboard = async (f: DashboardFilters, page = 1) => {
    setError("");
    setLoading(true);
    try {
      const reports = await fetchReports(f);
      setReportData(reports);
      await fetchTableData(page, f);
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) setIsAuthenticated(true);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDistricts();
    loadDashboard(appliedFilters, 1);
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const applyFilterChanges = async () => {
    setAppliedFilters(filters);
    await loadDashboard(filters, 1);
  };

  const resetFilters = async () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    await loadDashboard(EMPTY_FILTERS, 1);
  };

  const goToPage = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || tableLoading) return;
    await fetchTableData(nextPage, appliedFilters);
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

  const hasData = (reportData?.totalSurveys || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto mt-8 mb-16 px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 mt-1">Survey analytics, filters and respondent details</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-blue-50 text-blue-800 px-6 py-3 rounded-xl border border-blue-100 shadow-sm flex-1 sm:flex-none">
            <span className="text-sm uppercase tracking-wider font-semibold opacity-80 block whitespace-nowrap">Total Surveys</span>
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

      <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
          <Filter size={16} />
          <span>Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filters.district}
            onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) => setFilters((prev) => ({ ...prev, from_date: e.target.value }))}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl"
          />
          <input
            type="date"
            value={filters.to_date}
            onChange={(e) => setFilters((prev) => ({ ...prev, to_date: e.target.value }))}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl"
          />
          <div className="flex gap-2">
            <button
              onClick={applyFilterChanges}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("graphs")}
          className={`px-4 py-2 rounded-xl border transition-colors ${activeTab === "graphs" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
        >
          Graphs
        </button>
        <button
          onClick={() => setActiveTab("table")}
          className={`px-4 py-2 rounded-xl border transition-colors ${activeTab === "table" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
        >
          Details Table
        </button>
      </div>

      {!hasData ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600">No data found</h3>
          <p className="text-gray-500 mt-2">Try different filters or collect more responses.</p>
        </div>
      ) : activeTab === "graphs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Party Preference (This Time)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.byParty || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={130} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {(reportData?.byParty || []).map((_: any, index: number) => (
                      <Cell key={`party-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Win Prediction</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData?.winPrediction || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {(reportData?.winPrediction || []).map((_: any, index: number) => (
                      <Cell key={`win-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Age Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.byAge || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Gender Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportData?.byGender || []} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                    {(reportData?.byGender || []).map((_: any, index: number) => (
                      <Cell key={`gender-${index}`} fill={["#3b82f6", "#ec4899", "#9ca3af"][index % 3]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">District Breakdown</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.byDistrict || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {(reportData?.byDistrict || []).map((_: any, index: number) => (
                      <Cell key={`district-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(reportData?.problemBreakdown || []).length > 0 && (
            <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 md:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Area Problems</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData?.problemBreakdown || []}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={170} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {(reportData?.problemBreakdown || []).map((_: any, index: number) => (
                        <Cell key={`problem-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="right" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Respondent Details</h3>
            <p className="text-sm text-gray-500">Total: {totalRows}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name", "Area", "District", "Gender", "Age", "Last Vote", "This Vote", "Winner", "MLA Work", "Expected Changes", "Law & Order", "Drug Usage", "Notes", "Problems", "Date"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableLoading ? (
                  <tr>
                    <td colSpan={15} className="p-8 text-center text-gray-500">
                      Loading table...
                    </td>
                  </tr>
                ) : tableData.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="p-8 text-center text-gray-500">
                      No rows found for selected filters.
                    </td>
                  </tr>
                ) : (
                  tableData.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap">{s.name || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.area || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.district || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.gender || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.ageCategory || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.lastVoted || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.thisTimeVote || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.whoWillWin || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.mlaWork || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.expectedChanges || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.lawAndOrder || "-"}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.drugUsage || "-"}</td>
                      <td className="px-3 py-3 max-w-[240px] truncate" title={s.additionalNotes || "-"}>
                        {s.additionalNotes || "-"}
                      </td>
                      <td className="px-3 py-3 max-w-[220px] truncate" title={s.areaProblems || "-"}>
                        {s.areaProblems || "-"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || tableLoading}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || tableLoading}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
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
          <p>© 2026 TN தேர்தல் கணக்கெடுப்பு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <p className="text-sm mt-2 opacity-60">இது ஒரு சுயேச்சையான கணக்கெடுப்பு தளம்.</p>
        </footer>
      </div>
    </Router>
  );
}
