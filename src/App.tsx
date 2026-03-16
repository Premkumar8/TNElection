import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, BarChart, Bar, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CheckCircle2, ChevronLeft, ChevronRight, BarChart3, ClipboardList, MapPin, User, MessageSquare, Filter, AlertCircle, Vote } from "lucide-react";

const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const DISTRICTS = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet", "Kanyakumari", "Other"];
const ageOptions = ["18-30", "31-45", "46-60", "61+"];
const planningOptions = ["Yes", "No", "Not sure"];
const candidateAwarenessOptions = ["Yes", "No", "Partially"];
const biggestIssueOptions = ["Unemployment", "Education", "Healthcare", "Roads / Infrastructure", "Water supply", "Corruption", "Other"];
const governmentPerformanceOptions = ["Excellent", "Good", "Average", "Poor"];
const candidateQualityOptions = ["Honest leadership", "Development focus", "Accessibility to people", "Experience", "Youth leadership"];
const manifestoPriorityOptions = ["Education reform", "Job creation", "Agriculture support", "Women safety", "Technology development"];
const websiteUsefulnessOptions = ["Very useful", "Useful", "Average", "Not useful"];
const homepagePollOptions = ["Jobs", "Education", "Healthcare", "Infrastructure", "Corruption"];

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
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight hidden sm:block">Tamil Nadu Election Survey 2026</h1>
      </Link>
      <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-blue-900 font-medium transition-colors shadow-sm">
        <ClipboardList size={18} />
        <span className="hidden sm:inline">Survey</span>
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
        <span className="text-sm font-medium">{option}</span>
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
      ...(name === "biggestIssue" && value !== "Other" ? { biggestIssueOther: "" } : {}),
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
        setError("Please complete all required questions before submitting.");
        return false;
      }
    }
    if (formData.biggestIssue === "Other" && !formData.biggestIssueOther.trim()) {
      setError("Please specify the other issue in your constituency.");
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
      setError("Survey submission failed. Please try again.");
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
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Thank you</h2>
          <p className="text-gray-600 text-lg mb-8">Your response has been recorded for the Tamil Nadu Election Awareness survey.</p>
          <button onClick={resetSurvey} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md">Submit another response</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-16 px-4">
      <div className="mb-8 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Vote size={24} /></div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900">Election Awareness</h2>
            <p className="mt-2 text-gray-600">Share what matters to voters in Tamil Nadu and help highlight constituency priorities.</p>
            <div className="mt-6">
              <label className="text-base font-semibold text-gray-800 block mb-3">Quick Poll: Which issue matters most for Tamil Nadu voters?</label>
              <OptionGrid name="homepagePollIssue" value={formData.homepagePollIssue} options={homepagePollOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tamil Nadu Voter Survey</h2>
            <p className="text-gray-500">The questionnaire below includes the 10 election-awareness questions you requested.</p>
          </div>
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5" size={18} /><p>{error}</p></div>}

          <form onSubmit={handleSubmit} className="space-y-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionTitle icon={<User size={20} />} title="Basic Details" color="text-blue-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Enter your name" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" required>
                    <option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Age group *</label>
                <OptionGrid name="ageCategory" value={formData.ageCategory} options={ageOptions} onChange={handleChange} columns="grid-cols-2 md:grid-cols-4" />
              </div>
              <SectionTitle icon={<MapPin size={20} />} title="Constituency Details" color="text-blue-600" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">District *</label>
                  <select name="district" value={formData.district} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" required>
                    <option value="">Select district</option>{DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Area / Constituency *</label>
                  <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Enter your area or constituency" required />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-8">
              <SectionTitle icon={<MessageSquare size={20} />} title="Survey Questions" color="text-orange-600" />
              <FieldBlock label="Q1. Are you planning to vote in the upcoming election? *"><OptionGrid name="planningToVote" value={formData.planningToVote} options={planningOptions} onChange={handleChange} /></FieldBlock>
              <FieldBlock label="Q2. Do you know the candidates in your constituency? *"><OptionGrid name="knowsCandidates" value={formData.knowsCandidates} options={candidateAwarenessOptions} onChange={handleChange} /></FieldBlock>
              <FieldBlock label="Q3. What is the biggest issue in your constituency? *">
                <OptionGrid name="biggestIssue" value={formData.biggestIssue} options={biggestIssueOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
                {formData.biggestIssue === "Other" && <input type="text" name="biggestIssueOther" value={formData.biggestIssueOther} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Please specify" required />}
              </FieldBlock>
              <FieldBlock label="Q4. How do you rate the current government's performance? *"><OptionGrid name="governmentPerformance" value={formData.governmentPerformance} options={governmentPerformanceOptions} onChange={handleChange} columns="grid-cols-2 md:grid-cols-4" /></FieldBlock>
              <FieldBlock label="Q5. What qualities do you expect from a candidate? *"><OptionGrid name="candidateQuality" value={formData.candidateQuality} options={candidateQualityOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" /></FieldBlock>
              <FieldBlock label="Q6. Which area should political parties prioritize in their manifesto? *"><OptionGrid name="manifestoPriority" value={formData.manifestoPriority} options={manifestoPriorityOptions} onChange={handleChange} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" /></FieldBlock>
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-800 block">Q7. What local problems should your MLA address immediately? *</label>
                <textarea name="mlaImmediateProblem" value={formData.mlaImmediateProblem} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" placeholder="Describe the local problem" required />
              </div>
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-800 block">Q8. What improvements would you like to see in Tamil Nadu governance? *</label>
                <textarea name="governanceImprovements" value={formData.governanceImprovements} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" placeholder="Share your suggestions" required />
              </div>
              <FieldBlock label="Q9. How useful is this website? *"><OptionGrid name="websiteUsefulness" value={formData.websiteUsefulness} options={websiteUsefulnessOptions} onChange={handleChange} columns="grid-cols-2 md:grid-cols-4" /></FieldBlock>
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-800 block">Q10. What features should we add to improve this platform? *</label>
                <textarea name="platformFeatures" value={formData.platformFeatures} onChange={handleChange} rows={3} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none" placeholder="Suggest features for the platform" required />
              </div>
            </motion.div>

            <div className="mt-10 flex justify-end items-center pt-6 border-t border-gray-100">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? "Submitting..." : "Submit survey"} <CheckCircle2 size={18} />
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
        setError("Invalid email or password");
      }
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 mb-16 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><User size={32} /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
          <p className="text-gray-500">Access survey analytics and respondent details</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5" size={18} /><p>{error}</p></div>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="admin@example.com" required /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="••••••••" required /></div>
          <button type="submit" disabled={loading} className="w-full px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70">{loading ? "Signing in..." : "Sign in"}</button>
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
  const tableHeaders = ["Name", "Area", "District", "Gender", "Age", "Plan To Vote", "Know Candidates", "Biggest Issue", "Govt Performance", "Candidate Quality", "Manifesto Priority", "MLA Problem", "Governance Improvements", "Website Usefulness", "Feature Requests", "Homepage Poll", "Date"];
  const chartCards = [
    { title: "Planning To Vote", type: "bar", keyName: "byPlanningToVote" },
    { title: "Biggest Issue", type: "pie", keyName: "byBiggestIssue" },
    { title: "Government Performance", type: "bar", keyName: "byGovernmentPerformance" },
    { title: "Website Feedback", type: "pie", keyName: "byWebsiteUsefulness" },
    { title: "Age Distribution", type: "bar", keyName: "byAge" },
    { title: "Gender Distribution", type: "pie", keyName: "byGender" },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto mt-8 mb-16 px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b pb-4">
        <div><h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2><p className="text-gray-500 mt-1">Survey analytics, filters and respondent details</p></div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-blue-50 text-blue-800 px-6 py-3 rounded-xl border border-blue-100 shadow-sm flex-1 sm:flex-none"><span className="text-sm uppercase tracking-wider font-semibold opacity-80 block whitespace-nowrap">Total Surveys</span><span className="text-3xl font-bold">{reportData?.totalSurveys || 0}</span></div>
          <button onClick={() => { localStorage.removeItem("admin_token"); setIsAuthenticated(false); }} className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors border border-red-200 whitespace-nowrap">Logout</button>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3"><Filter size={16} /><span>Filters</span></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={filters.district} onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))} className="p-3 bg-gray-50 border border-gray-200 rounded-xl"><option value="">All Districts</option>{districts.map((district) => <option key={district} value={district}>{district}</option>)}</select>
          <input type="date" value={filters.from_date} onChange={(e) => setFilters((prev) => ({ ...prev, from_date: e.target.value }))} className="p-3 bg-gray-50 border border-gray-200 rounded-xl" />
          <input type="date" value={filters.to_date} onChange={(e) => setFilters((prev) => ({ ...prev, to_date: e.target.value }))} className="p-3 bg-gray-50 border border-gray-200 rounded-xl" />
          <div className="flex gap-2">
            <button onClick={async () => { setAppliedFilters(filters); await loadDashboard(filters, 1); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Apply</button>
            <button onClick={async () => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); await loadDashboard(EMPTY_FILTERS, 1); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">Reset</button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setActiveTab("graphs")} className={`px-4 py-2 rounded-xl border transition-colors ${activeTab === "graphs" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>Graphs</button>
        <button onClick={() => setActiveTab("table")} className={`px-4 py-2 rounded-xl border transition-colors ${activeTab === "table" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>Details Table</button>
      </div>

      {!hasData ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300"><BarChart3 size={48} className="mx-auto text-gray-400 mb-4" /><h3 className="text-xl font-medium text-gray-600">No data found</h3><p className="text-gray-500 mt-2">Try different filters or collect more responses.</p></div>
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">District Breakdown</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.byDistrict || []}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" radius={[6, 6, 0, 0]}>{(reportData?.byDistrict || []).map((_: any, index: number) => <Cell key={`district-${index}`} fill={COLORS[index % COLORS.length]} />)}<LabelList dataKey="value" position="top" /></Bar></BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {(reportData?.byHomepagePoll || []).length > 0 && <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 md:col-span-2"><h3 className="text-lg font-bold text-gray-800 mb-4">Homepage Poll Result</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={reportData?.byHomepagePoll || []} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="value" radius={[0, 6, 6, 0]}>{(reportData?.byHomepagePoll || []).map((_: any, index: number) => <Cell key={`poll-${index}`} fill={COLORS[index % COLORS.length]} />)}<LabelList dataKey="value" position="right" /></Bar></BarChart></ResponsiveContainer></div></div>}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-800">Respondent Details</h3><p className="text-sm text-gray-500">Total: {totalRows}</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{tableHeaders.map((header) => <th key={header} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{header}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {tableLoading ? <tr><td colSpan={tableHeaders.length} className="p-8 text-center text-gray-500">Loading table...</td></tr> : tableData.length === 0 ? <tr><td colSpan={tableHeaders.length} className="p-8 text-center text-gray-500">No rows found for selected filters.</td></tr> : tableData.map((survey, idx) => (
                  <tr key={survey.id || idx} className="hover:bg-gray-50 align-top">
                    <td className="px-3 py-3 whitespace-nowrap">{survey.name || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.area || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.district || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.gender || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.ageCategory || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.planningToVote || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.knowsCandidates || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.biggestIssueDisplay || survey.biggestIssue || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.governmentPerformance || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.candidateQuality || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.manifestoPriority || "-"}</td><td className="px-3 py-3 max-w-[240px] truncate" title={survey.mlaImmediateProblem || "-"}>{survey.mlaImmediateProblem || "-"}</td><td className="px-3 py-3 max-w-[240px] truncate" title={survey.governanceImprovements || "-"}>{survey.governanceImprovements || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.websiteUsefulness || "-"}</td><td className="px-3 py-3 max-w-[240px] truncate" title={survey.platformFeatures || "-"}>{survey.platformFeatures || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.homepagePollIssue || "-"}</td><td className="px-3 py-3 whitespace-nowrap">{survey.createdAt ? new Date(survey.createdAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
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
          <p>© 2026 Tamil Nadu Election Survey. All rights reserved.</p>
          <p className="text-sm mt-2 opacity-60">Independent public opinion platform.</p>
        </footer>
      </div>
    </Router>
  );
}
