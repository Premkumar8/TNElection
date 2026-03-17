import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, BarChart, Bar, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CheckCircle2, ChevronLeft, ChevronRight, BarChart3, ClipboardList, MapPin, User, MessageSquare, Filter, AlertCircle, Vote } from "lucide-react";

const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const DISTRICTS = ["சென்னை", "கோயம்புத்தூர்", "மதுரை", "திருச்சிராப்பள்ளி", "சேலம்", "திருநெல்வேலி", "திருப்பூர்", "வேலூர்", "ஈரோடு", "தூத்துக்குடி", "திண்டுக்கல்", "தஞ்சாவூர்", "ராணிப்பேட்டை", "கன்னியாகுமரி", "மற்றவை"];
const ageOptions = ["18-30", "31-45", "46-60", "61+"];
const planningOptions = ["ஆம்", "இல்லை", "உறுதி இல்லை"];
const candidateAwarenessOptions = ["ஆம்", "இல்லை", "ஒரளவு தெரியும்"];
const biggestIssueOptions = ["வேலைவாய்ப்பு இல்லாமை", "கல்வி", "மருத்துவம்", "சாலைகள் / அடிப்படை வசதிகள்", "குடிநீர்", "ஊழல்", "மற்றவை"];
const governmentPerformanceOptions = ["மிகச் சிறப்பு", "நன்று", "சராசரி", "மோசம்"];
const candidateQualityOptions = ["நேர்மையான தலைமை", "முன்னேற்ற நோக்கு", "மக்களை அணுகும் திறன்", "அனுபவம்", "இளைஞர் தலைமையியல்"];
const manifestoPriorityOptions = ["கல்வி சீர்திருத்தம்", "வேலைவாய்ப்பு உருவாக்கம்", "விவசாய ஆதரவு", "பெண்கள் பாதுகாப்பு", "தொழில்நுட்ப மேம்பாடு"];
const websiteUsefulnessOptions = ["மிகவும் பயனுள்ளது", "பயனுள்ளது", "சராசரி", "பயனில்லை"];
const homepagePollOptions = ["வேலைவாய்ப்பு", "கல்வி", "மருத்துவம்", "அடிப்படை வசதிகள்", "ஊழல்"];

type SurveyFormData = {
  name: string;
  area: string;
  district: string;
  gender: string;
  ageCategory: string;
  planningToVote: string;
  knowsCandidates: string;
  biggestIssue: string;
  biggestIssueOther: string;
  governmentPerformance: string;
  candidateQuality: string;
  manifestoPriority: string;
  mlaImmediateProblem: string;
  governanceImprovements: string;
  websiteUsefulness: string;
  platformFeatures: string;
  homepagePollIssue: string;
};

const INITIAL_FORM_DATA: SurveyFormData = {
  name: "",
  area: "",
  district: "",
  gender: "",
  ageCategory: "",
  planningToVote: "",
  knowsCandidates: "",
  biggestIssue: "",
  biggestIssueOther: "",
  governmentPerformance: "",
  candidateQuality: "",
  manifestoPriority: "",
  mlaImmediateProblem: "",
  governanceImprovements: "",
  websiteUsefulness: "",
  platformFeatures: "",
  homepagePollIssue: "",
};

const Header = () => (
  <header className="bg-gradient-to-r from-orange-500 via-white to-green-500 p-4 shadow-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">TN</div>
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight hidden sm:block">தமிழ்நாடு தேர்தல் கணக்கெடுப்பு 2026</h1>
      </Link>
      <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-blue-900 font-medium transition-colors shadow-sm">
        <ClipboardList size={18} />
        <span className="hidden sm:inline">கணக்கெடுப்பு</span>
      </Link>
    </div>
  </header>
);

const OptionGrid = ({
  name,
  value,
  options,
  onChange,
  columns = "grid-cols-1 sm:grid-cols-2",
}: {
  name: keyof SurveyFormData;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  columns?: string;
}) => (
  <div className={`grid ${columns} gap-3`}>
    {options.map((option) => (
      <label
        key={`${name}-${option}`}
        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
          value === option ? "border-blue-600 bg-blue-50 text-blue-900 shadow-sm" : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
        }`}
      >
        <input type="radio" name={name} value={option} checked={value === option} onChange={onChange} className="hidden" />
        <span className="block text-sm font-medium leading-snug break-words">{option}</span>
      </label>
    ))}
  </div>
);

const SectionTitle = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
  <div className={`flex items-center gap-2 mb-4 font-semibold border-b pb-2 ${color}`}>
    {icon}
    <h3>{title}</h3>
  </div>
);

const FieldBlock = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <label className="text-base font-medium text-gray-800 block">{label}</label>
    {children}
  </div>
);

const SurveyForm = () => {
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("tn_survey_submitted")) {
      setIsSubmitted(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "biggestIssue" && value !== "மற்றவை" ? { biggestIssueOther: "" } : {}),
    }));
  };

  const validateForm = () => {
    const requiredFields: (keyof SurveyFormData)[] = [
      "name", "area", "district", "gender", "ageCategory", "planningToVote", "knowsCandidates",
      "biggestIssue", "governmentPerformance", "candidateQuality", "manifestoPriority",
      "mlaImmediateProblem", "governanceImprovements", "websiteUsefulness", "platformFeatures", "homepagePollIssue",
    ];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError("சமர்ப்பிக்கும் முன் அனைத்து அவசியமான கேள்விகளையும் பூர்த்தி செய்யவும்.");
        return false;
      }
    }
    if (formData.biggestIssue === "மற்றவை" && !formData.biggestIssueOther.trim()) {
      setError("உங்கள் தொகுதியின் மற்றொரு முக்கிய பிரச்சினையை குறிப்பிடவும்.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to submit survey");
      localStorage.setItem("tn_survey_submitted", "true");
      setIsSubmitted(true);
    } catch (err) {
      setError("கணக்கெடுப்பை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSurvey = () => {
    localStorage.removeItem("tn_survey_submitted");
    setIsSubmitted(false);
    setFormData(INITIAL_FORM_DATA);
    setError("");
  };

  if (isSubmitted) {
    return (
      <div className="px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl text-center border-t-8 border-green-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={48} /></div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">நன்றி</h2>
          <p className="text-gray-600 text-lg mb-8">தமிழ்நாடு தேர்தல் விழிப்புணர்வு கணக்கெடுப்பிற்கான உங்கள் பதில் பதிவு செய்யப்பட்டுள்ளது.</p>
          <button onClick={resetSurvey} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md">மற்றொரு பதிலை சமர்ப்பிக்கவும்</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16 px-4">
      <div className="mb-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shrink-0"><Vote size={24} /></div>
          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">தேர்தல் விழிப்புணர்வு</h2>
            <p className="mt-2 text-base sm:text-lg text-gray-600 leading-relaxed">தமிழ்நாட்டில் வாக்காளர்களுக்கு முக்கியமான விடயங்களை பகிர்ந்து, தொகுதி முன்னுரிமைகளை வெளிப்படுத்த உதவுங்கள்.</p>
            <div className="mt-6">
              <label className="text-base sm:text-lg font-semibold text-gray-800 block mb-3 leading-snug">விரைவு கருத்துக்கணிப்பு: தமிழ்நாடு வாக்காளர்களுக்கு மிக முக்கியமான பிரச்சினை எது?</label>
              <OptionGrid name="homepagePollIssue" value={formData.homepagePollIssue} options={homepagePollOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-5 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight">தமிழ்நாடு வாக்காளர் கணக்கெடுப்பு</h2>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">கீழே நீங்கள் கேட்ட 10 தேர்தல் விழிப்புணர்வு கேள்விகள் இடம்பெற்றுள்ளன.</p>
          </div>
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5" size={18} /><p>{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionTitle icon={<User size={20} />} title="அடிப்படை விவரங்கள்" color="text-blue-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">முழு பெயர் *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="உங்கள் பெயரை உள்ளிடவும்" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">பாலினம் *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" required>
                    <option value="">பாலினத்தைத் தேர்ந்தெடுக்கவும்</option><option value="ஆண்">ஆண்</option><option value="பெண்">பெண்</option><option value="மற்றவை">மற்றவை</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">வயது பிரிவு *</label>
                <OptionGrid name="ageCategory" value={formData.ageCategory} options={ageOptions} onChange={handleChange} columns="grid-cols-2 md:grid-cols-4" />
              </div>
              <SectionTitle icon={<MapPin size={20} />} title="தொகுதி விவரங்கள்" color="text-blue-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">மாவட்டம் *</label>
                  <select name="district" value={formData.district} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" required>
                    <option value="">மாவட்டத்தைத் தேர்ந்தெடுக்கவும்</option>{DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">பகுதி / தொகுதி *</label>
                  <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="உங்கள் பகுதி அல்லது தொகுதியை உள்ளிடவும்" required />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-8">
              <SectionTitle icon={<MessageSquare size={20} />} title="கேள்விகள்" color="text-orange-600" />
              <FieldBlock label="Q1. வரவிருக்கும் தேர்தலில் நீங்கள் வாக்களிக்கத் திட்டமிட்டுள்ளீர்களா? *"><OptionGrid name="planningToVote" value={formData.planningToVote} options={planningOptions} onChange={handleChange} /></FieldBlock>
              <FieldBlock label="Q2. உங்கள் தொகுதியில் உள்ள வேட்பாளர்களை நீங்கள் அறிந்திருக்கிறீர்களா? *"><OptionGrid name="knowsCandidates" value={formData.knowsCandidates} options={candidateAwarenessOptions} onChange={handleChange} /></FieldBlock>
              <FieldBlock label="Q3. உங்கள் தொகுதியில் மிகப் பெரிய பிரச்சினை எது? *">
                <OptionGrid name="biggestIssue" value={formData.biggestIssue} options={biggestIssueOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
                {formData.biggestIssue === "மற்றவை" && <input type="text" name="biggestIssueOther" value={formData.biggestIssueOther} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="தயவு செய்து குறிப்பிடவும்" required />}
              </FieldBlock>
              <FieldBlock label="Q4. தற்போதைய அரசின் செயல்பாட்டை நீங்கள் எவ்வாறு மதிப்பிடுகிறீர்கள்? *"><OptionGrid name="governmentPerformance" value={formData.governmentPerformance} options={governmentPerformanceOptions} onChange={handleChange} columns="grid-cols-2 md:grid-cols-4" /></FieldBlock>
              <FieldBlock label="Q5. ஒரு வேட்பாளரிடமிருந்து நீங்கள் என்ன குணங்களை எதிர்பார்க்கிறீர்கள்? *"><OptionGrid name="candidateQuality" value={formData.candidateQuality} options={candidateQualityOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" /></FieldBlock>
              <FieldBlock label="Q6. அரசியல் கட்சிகள் தங்கள் தேர்தல் அறிக்கையில் எந்த துறைக்கு முன்னுரிமை தர வேண்டும்? *"><OptionGrid name="manifestoPriority" value={formData.manifestoPriority} options={manifestoPriorityOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" /></FieldBlock>
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-800 block">Q7. உங்கள் தொகுதி MLA உடனடியாக தீர்க்க வேண்டிய உள்ளூர் பிரச்சினைகள் என்ன? *</label>
                <textarea name="mlaImmediateProblem" value={formData.mlaImmediateProblem} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" placeholder="உள்ளூர் பிரச்சினையை விவரிக்கவும்" required />
              </div>
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-800 block">Q8. தமிழ்நாடு ஆட்சியில் நீங்கள் காண விரும்பும் மேம்பாடுகள் என்ன? *</label>
                <textarea name="governanceImprovements" value={formData.governanceImprovements} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" placeholder="உங்கள் பரிந்துரைகளை பகிரவும்" required />
              </div>
              <FieldBlock label="Q9. இந்த இணையதளம் எவ்வளவு பயனுள்ளதாக உள்ளது? *"><OptionGrid name="websiteUsefulness" value={formData.websiteUsefulness} options={websiteUsefulnessOptions} onChange={handleChange} columns="grid-cols-2 md:grid-cols-4" /></FieldBlock>
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-800 block">Q10. இந்த தளத்தை மேம்படுத்த நாம் சேர்க்க வேண்டிய அம்சங்கள் என்ன? *</label>
                <textarea name="platformFeatures" value={formData.platformFeatures} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" placeholder="இந்த தளத்திற்கான அம்சங்களை பரிந்துரைக்கவும்" required />
              </div>
            </motion.div>

            <div className="mt-10 flex justify-end items-center pt-6 border-t border-gray-100">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? "சமர்ப்பிக்கப்படுகிறது..." : "கணக்கெடுப்பை சமர்ப்பிக்கவும்"} <CheckCircle2 size={18} />
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
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.token);
        onLogin();
      } else {
        setError("தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்");
      }
    } catch {
      setError("சர்வருடன் இணைக்க முடியவில்லை");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 mb-16 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><User size={32} /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">நிர்வாக உள்நுழைவு</h2>
          <p className="text-gray-500">கணக்கெடுப்பு பகுப்பாய்வு மற்றும் பதிலளிப்போர் விவரங்களை பார்க்கவும்</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5" size={18} /><p>{error}</p></div>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2"><label className="text-sm font-medium text-gray-700">மின்னஞ்சல்</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="admin@example.com" required /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-gray-700">கடவுச்சொல்</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="••••••••" required /></div>
          <button type="submit" disabled={loading} className="w-full px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70">{loading ? "உள்நுழைகிறது..." : "உள்நுழையவும்"}</button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  type DashboardFilters = { district: string; from_date: string; to_date: string };
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
    Object.entries(base).forEach(([key, value]) => value !== "" && value !== undefined && value !== null && params.set(key, String(value)));
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
      setReportData(await fetchReports(f));
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

  if (!isAuthenticated) return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-8"><AlertCircle className="mx-auto mb-2" size={32} /><p>{error}</p></div>;

  const hasData = (reportData?.totalSurveys || 0) > 0;
  const tableHeaders = ["பெயர்", "பகுதி", "மாவட்டம்", "பாலினம்", "வயது", "வாக்களிப்பு திட்டம்", "வேட்பாளர்கள் அறிவு", "முக்கிய பிரச்சினை", "அரசு செயல்பாடு", "வேட்பாளர் குணங்கள்", "தேர்தல் அறிக்கை முன்னுரிமை", "MLA தீர்க்க வேண்டியது", "ஆட்சி மேம்பாடு", "இணையதள பயன்", "அம்ச பரிந்துரைகள்", "முகப்பு கருத்துக்கணிப்பு", "தேதி"];
  const chartCards = [
    { title: "வாக்களிக்க திட்டமிடுபவர்கள்", type: "bar", keyName: "byPlanningToVote" },
    { title: "முக்கிய பிரச்சினைகள்", type: "pie", keyName: "byBiggestIssue" },
    { title: "அரசு செயல்திறன் மதிப்பீடு", type: "bar", keyName: "byGovernmentPerformance" },
    { title: "இணையதள கருத்து", type: "pie", keyName: "byWebsiteUsefulness" },
    { title: "வயது விநியோகம்", type: "bar", keyName: "byAge" },
    { title: "பாலின விநியோகம்", type: "pie", keyName: "byGender" },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto mt-8 mb-16 px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b pb-4">
        <div><h2 className="text-3xl font-bold text-gray-800">நிர்வாக பலகை</h2><p className="text-gray-500 mt-1">கணக்கெடுப்பு பகுப்பாய்வு, வடிகட்டிகள் மற்றும் பதிலளிப்போர் விவரங்கள்</p></div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-blue-50 text-blue-800 px-6 py-3 rounded-xl border border-blue-100 shadow-sm flex-1 sm:flex-none"><span className="text-sm uppercase tracking-wider font-semibold opacity-80 block whitespace-nowrap">மொத்த பதில்கள்</span><span className="text-3xl font-bold">{reportData?.totalSurveys || 0}</span></div>
          <button onClick={() => { localStorage.removeItem("admin_token"); setIsAuthenticated(false); }} className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors border border-red-200 whitespace-nowrap">வெளியேறு</button>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3"><Filter size={16} /><span>வடிகட்டிகள்</span></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={filters.district} onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))} className="p-3 bg-gray-50 border border-gray-200 rounded-xl"><option value="">அனைத்து மாவட்டங்களும்</option>{districts.map((district) => <option key={district} value={district}>{district}</option>)}</select>
          <input type="date" value={filters.from_date} onChange={(e) => setFilters((prev) => ({ ...prev, from_date: e.target.value }))} className="p-3 bg-gray-50 border border-gray-200 rounded-xl" />
          <input type="date" value={filters.to_date} onChange={(e) => setFilters((prev) => ({ ...prev, to_date: e.target.value }))} className="p-3 bg-gray-50 border border-gray-200 rounded-xl" />
          <div className="flex gap-2">
            <button onClick={async () => { setAppliedFilters(filters); await loadDashboard(filters, 1); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">பயன்படுத்து</button>
            <button onClick={async () => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); await loadDashboard(EMPTY_FILTERS, 1); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">மீட்டமை</button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setActiveTab("graphs")} className={`px-4 py-2 rounded-xl border transition-colors ${activeTab === "graphs" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>வரைபடங்கள்</button>
        <button onClick={() => setActiveTab("table")} className={`px-4 py-2 rounded-xl border transition-colors ${activeTab === "table" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>விவர அட்டவணை</button>
      </div>

      {!hasData ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300"><BarChart3 size={48} className="mx-auto text-gray-400 mb-4" /><h3 className="text-xl font-medium text-gray-600">தரவு இல்லை</h3><p className="text-gray-500 mt-2">வேறு வடிகட்டிகளை முயற்சிக்கவும் அல்லது மேலும் பதில்களை சேகரிக்கவும்.</p></div>
      ) : activeTab === "graphs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chartCards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{card.title}</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {card.type === "bar" ? (
                    <BarChart data={reportData?.[card.keyName] || []} layout={card.keyName === "byPlanningToVote" ? "vertical" : "horizontal"} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={card.keyName !== "byPlanningToVote"} horizontal={card.keyName === "byPlanningToVote" ? false : true} stroke="#f0f0f0" />
                      {card.keyName === "byPlanningToVote" ? (
                        <><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" radius={[0, 6, 6, 0]}>{(reportData?.[card.keyName] || []).map((_: any, index: number) => <Cell key={`${card.keyName}-${index}`} fill={COLORS[index % COLORS.length]} />)}<LabelList dataKey="value" position="right" /></Bar></>
                      ) : (
                        <><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" fill={COLORS[0]} radius={[6, 6, 0, 0]}><LabelList dataKey="value" position="top" /></Bar></>
                      )}
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie data={reportData?.[card.keyName] || []} cx="50%" cy="50%" outerRadius={95} innerRadius={card.keyName === "byBiggestIssue" ? 58 : undefined} dataKey="value" label={card.keyName === "byBiggestIssue" ? ({ percent }) => `${((percent || 0) * 100).toFixed(0)}%` : undefined}>
                        {(reportData?.[card.keyName] || []).map((_: any, index: number) => <Cell key={`${card.keyName}-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Legend /><Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ))}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">மாவட்ட வாரியான பகிர்வு</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.byDistrict || []}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" radius={[6, 6, 0, 0]}>{(reportData?.byDistrict || []).map((_: any, index: number) => <Cell key={`district-${index}`} fill={COLORS[index % COLORS.length]} />)}<LabelList dataKey="value" position="top" /></Bar></BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(reportData?.byHomepagePoll || []).length > 0 && <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 md:col-span-2"><h3 className="text-lg font-bold text-gray-800 mb-4">முகப்பு கருத்துக்கணிப்பு முடிவு</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={reportData?.byHomepagePoll || []} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" radius={[0, 6, 6, 0]}>{(reportData?.byHomepagePoll || []).map((_: any, index: number) => <Cell key={`poll-${index}`} fill={COLORS[index % COLORS.length]} />)}<LabelList dataKey="value" position="right" /></Bar></BarChart></ResponsiveContainer></div></div>}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-800">பதிலளிப்போர் விவரங்கள்</h3><p className="text-sm text-gray-500">மொத்தம்: {totalRows}</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{tableHeaders.map((header) => <th key={header} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{header}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {tableLoading ? <tr><td colSpan={tableHeaders.length} className="p-8 text-center text-gray-500">அட்டவணை ஏற்றப்படுகிறது...</td></tr> : tableData.length === 0 ? <tr><td colSpan={tableHeaders.length} className="p-8 text-center text-gray-500">தேர்ந்தெடுத்த வடிகட்டிகளுக்கு பதிவுகள் இல்லை.</td></tr> : tableData.map((survey, idx) => (
                  <tr key={survey.id || idx} className="hover:bg-gray-50 align-top">
                    <td className="px-3 py-3 whitespace-nowrap">{survey.name || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.area || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.district || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.gender || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.ageCategory || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.planningToVote || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.knowsCandidates || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.biggestIssueDisplay || survey.biggestIssue || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.governmentPerformance || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.candidateQuality || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.manifestoPriority || "-"}</td><td className="px-3 py-3 max-w-[240px] truncate" title={survey.mlaImmediateProblem || "-"}>{survey.mlaImmediateProblem || "-"}</td><td className="px-3 py-3 max-w-[240px] truncate" title={survey.governanceImprovements || "-"}>{survey.governanceImprovements || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.websiteUsefulness || "-"}</td><td className="px-3 py-3 max-w-[240px] truncate" title={survey.platformFeatures || "-"}>{survey.platformFeatures || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.homepagePollIssue || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">பக்கம் {currentPage} / {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => currentPage > 1 && !tableLoading && fetchTableData(currentPage - 1, appliedFilters)} disabled={currentPage === 1 || tableLoading} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <button onClick={() => currentPage < totalPages && !tableLoading && fetchTableData(currentPage + 1, appliedFilters)} disabled={currentPage === totalPages || tableLoading} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"><ChevronRight size={16} /></button>
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
          <p>© 2026 தமிழ்நாடு தேர்தல் கணக்கெடுப்பு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <p className="text-sm mt-2 opacity-60">சுயாதீன பொதுமக்கள் கருத்து தளம்.</p>
        </footer>
      </div>
    </Router>
  );
}
