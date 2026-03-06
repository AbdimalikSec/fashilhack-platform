import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadReport, notifyReport } from "../../api/index";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import PortalLayout from "../../components/layout/PortalLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import SectionTag from "../../components/ui/SectionTag";

const PHASES = [
  "Discovery",
  "Reconnaissance",
  "Exploitation",
  "Reporting",
  "Remediation",
  "Completed",
];
const STATUSES = ["scoping", "active", "reporting", "completed"];
const TYPES = [
  "External",
  "Internal",
  "Web App",
  "Cloud",
  "Social Engineering",
  "Full Scope",
];

const EMPTY = {
  title: "",
  clientUid: "",
  clientName: "",
  type: "",
  scope: "",
  description: "",
  phase: "Discovery",
  status: "scoping",
  startDate: "",
  endDate: "",
};

export default function ManageEngagements() {
  const { user } = useAuth();
  const [engagements, setEngagements] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [reportFile, setReportFile] = useState(null);
  const [reportType, setReportType] = useState("technical");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [eSnap, uSnap] = await Promise.all([
        getDocs(collection(db, "engagements")),
        getDocs(collection(db, "users")),
      ]);
      setEngagements(eSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setClients(
        uSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.role === "client"),
      );
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleClientSelect = (e) => {
    const client = clients.find((c) => c.id === e.target.value);
    if (client)
      setForm((f) => ({
        ...f,
        clientUid: client.id,
        clientName: client.displayName,
      }));
  };

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  const handleReportUpload = async () => {
    if (!reportFile || !selected) {
      flash("⚠ Select a file and an engagement first.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("report", reportFile);
      formData.append("engagementId", selected.id);
      formData.append("engagementTitle", selected.title);
      formData.append("clientUid", selected.clientUid);
      formData.append("clientName", selected.clientName);
      formData.append("type", reportType);

      const result = await uploadReport(formData);

      // Notify client
      await notifyReport({
        clientUid: selected.clientUid,
        clientName: selected.clientName,
        engagementTitle: selected.title,
        reportType,
        fileUrl: result.fileUrl,
      });

      flash("✓ Report uploaded and client notified.");
      setReportFile(null);
    } catch (err) {
      flash(`⚠ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.clientUid) {
      flash("⚠ Title and client are required.");
      return;
    }
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, "engagements"), {
        ...form,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      const created = { id: ref.id, ...form };
      setEngagements((prev) => [created, ...prev]);
      setSelected(created);
      setShowForm(false);
      setForm(EMPTY);
      flash("✓ Engagement created.");
    } catch (err) {
      flash("⚠ Error creating engagement.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (field, value) => {
    if (!selected) return;
    try {
      await updateDoc(doc(db, "engagements", selected.id), { [field]: value });
      const updated = { ...selected, [field]: value };
      setSelected(updated);
      setEngagements((prev) =>
        prev.map((e) => (e.id === selected.id ? updated : e)),
      );
      flash("✓ Updated.");
    } catch (err) {
      flash("⚠ Update failed.");
    }
  };

  const inputClass = `
    w-full bg-white border border-slate-200
    text-primary font-sans text-sm px-4 py-3 rounded-xl outline-none
    focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder-slate-300
  `;
  const labelClass = `
    font-sans text-[10px] tracking-widest uppercase text-slate-400 font-black block mb-2
  `;

  if (loading)
    return (
      <PortalLayout title="Manage Engagements">
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-xs text-dim animate-pulse tracking-widest">
            LOADING...
          </p>
        </div>
      </PortalLayout>
    );

  return (
    <PortalLayout title="Manage Engagements">
      {/* Flash message */}
      <div className="fixed top-24 right-8 z-50">
        {msg && (
          <div
            className="
            font-sans text-xs font-black px-6 py-4 rounded-xl shadow-2xl
            bg-white border border-slate-100 text-primary
            animate-in fade-in slide-in-from-right-4 duration-300
          "
          >
            {msg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <SectionTag text={`${engagements.length} Assets`} />
            <button
              onClick={() => {
                setShowForm(true);
                setSelected(null);
              }}
              className="p-2 bg-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all font-sans text-xl leading-none"
            >
              +
            </button>
          </div>

          <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {engagements.map((e) => (
              <Card
                key={e.id}
                onClick={() => {
                  setSelected(e);
                  setShowForm(false);
                }}
                className={`
                  cursor-pointer transition-all border-l-4
                  ${
                    selected?.id === e.id
                      ? "border-l-primary bg-primary/5 shadow-md"
                      : "border-l-transparent hover:border-l-slate-200"
                  }
                `}
              >
                <h4 className="font-sans font-black text-md text-primary tracking-tight leading-tight mb-2 truncate">
                  {e.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <p className="font-sans text-[10px] text-slate-400 font-black uppercase tracking-widest truncate max-w-[100px]">
                      {e.clientName || "—"}
                    </p>
                  </div>
                  <Badge label={e.status} type={e.status} />
                </div>
              </Card>
            ))}
            {engagements.length === 0 && (
              <Card>
                <p className="font-sans text-sm text-slate-400">
                  No active engagements.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Detail / Create form */}
        <div className="md:col-span-2">
          {/* Create form */}
          {showForm && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <Card className="p-8 lg:p-12">
                <SectionTag text="Protocol Initialization" />
                <h2 className="font-heading font-black text-3xl mb-10 mt-2 text-primary tracking-tight">
                  New Engagement
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Mission Title *</label>
                    <input
                      name="title"
                      placeholder="e.g. Infrastructure Audit Q4"
                      value={form.title}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Client Assignment *</label>
                    <select
                      onChange={handleClientSelect}
                      className={`${inputClass} cursor-pointer`}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select client...
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Engagement Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">Select type...</option>
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Operational Phase</label>
                    <select
                      name="phase"
                      value={form.phase}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {PHASES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Commencement Date</label>
                    <input
                      name="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Deadline (ETA)</label>
                    <input
                      name="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className={labelClass}>Engagement Scope</label>
                  <input
                    name="scope"
                    placeholder="e.g. corporate-subnets, *.fashilhack.com"
                    value={form.scope}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="mb-10">
                  <label className={labelClass}>Mission Profile / Notes</label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Describe the mission parameters, rules of engagement, and shared objectives..."
                    value={form.description}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="px-8 py-4 bg-primary text-white font-sans text-sm font-black rounded-xl hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                  >
                    {saving ? "INITIALIZING..." : "START ENGAGEMENT"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-8 py-4 border border-slate-200 text-slate-500 font-sans text-sm font-black rounded-xl hover:bg-slate-50 transition-all"
                  >
                    DISCARD
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Engagement detail + edit */}
          {selected && !showForm && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-8 lg:p-12">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-12">
                  <div>
                    <SectionTag text="Active Protocol" />
                    <h2 className="font-heading font-black text-4xl mt-3 text-primary tracking-tight leading-tight">
                      {selected.title}
                    </h2>
                    <p className="font-sans text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">
                      {selected.type || "General Audit"}
                    </p>
                  </div>
                  <Badge label={selected.status} type={selected.status} />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {[
                    { label: "Partner", value: selected.clientName || "—" },
                    { label: "Phase", value: selected.phase || "—" },
                    { label: "Commenced", value: selected.startDate || "TBD" },
                    { label: "Deadline", value: selected.endDate || "—" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl"
                    >
                      <p className="font-sans text-[10px] text-slate-400 font-black tracking-widest uppercase mb-2">
                        {label}
                      </p>
                      <p className="font-sans text-sm text-primary font-black truncate">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-12">
                  {/* Scope info */}
                  <div className="border-t border-slate-100 pt-8">
                    <SectionTag text="Critical Scope" />
                    <div className="mt-4 p-6 bg-slate-900 rounded-2xl">
                      <code className="text-white font-sans text-sm font-bold tracking-tight">
                        {selected.scope ||
                          "No specific scope defined for this mission."}
                      </code>
                    </div>
                  </div>

                  {/* Settings / Controls */}
                  <div className="border-t border-slate-100 pt-8">
                    <p className="font-sans text-[10px] text-slate-400 font-black tracking-widest uppercase mb-8">
                      Protocol Management
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className={labelClass}>Transition Phase</label>
                        <select
                          value={selected.phase || "Discovery"}
                          onChange={(e) =>
                            handleUpdate("phase", e.target.value)
                          }
                          className={`${inputClass} cursor-pointer`}
                        >
                          {PHASES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Global Status</label>
                        <select
                          value={selected.status || "scoping"}
                          onChange={(e) =>
                            handleUpdate("status", e.target.value)
                          }
                          className={`${inputClass} cursor-pointer`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ── REPORT UPLOAD ── */}
                  <div className="border-t border-slate-100 pt-8">
                    <p className="font-sans text-[10px] text-slate-400 font-black tracking-widest uppercase mb-8">
                      Deliver Report
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      {/* Report type */}
                      <div>
                        <label className={labelClass}>Report Type</label>
                        <select
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                          className={`${inputClass} cursor-pointer`}
                        >
                          <option value="technical">Technical</option>
                          <option value="executive">Executive Summary</option>
                        </select>
                      </div>

                      {/* File picker */}
                      <div>
                        <label className={labelClass}>PDF File</label>
                        <label className="
                          flex items-center gap-3 cursor-pointer
                          w-full bg-white border border-slate-200
                          text-sm px-4 py-3 rounded-xl
                          hover:border-primary/30 transition-all
                        ">
                          <span className="
                            bg-slate-100 text-slate-600 font-sans font-black
                            text-xs px-3 py-1 rounded-lg whitespace-nowrap
                          ">
                            Choose File
                          </span>
                          <span className="font-sans text-sm text-slate-400 truncate">
                            {reportFile ? reportFile.name : "No file selected"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => setReportFile(e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>

                    {/* File info */}
                    {reportFile && (
                      <div className="
                        flex items-center gap-3 mb-6
                        bg-slate-50 border border-slate-100
                        px-4 py-3 rounded-xl
                      ">
                        <span className="text-lg">📄</span>
                        <div>
                          <p className="font-sans text-xs font-black text-primary">
                            {reportFile.name}
                          </p>
                          <p className="font-sans text-xs text-slate-400">
                            {(reportFile.size / 1024 / 1024).toFixed(2)} MB
                            &nbsp;·&nbsp; PDF
                          </p>
                        </div>
                        {/* Remove file */}
                        <button
                          onClick={() => setReportFile(null)}
                          className="ml-auto text-slate-300 hover:text-red-400 transition-colors text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Upload button */}
                    <button
                      onClick={handleReportUpload}
                      disabled={uploading || !reportFile}
                      className="
                        px-8 py-4 bg-primary text-white
                        font-sans text-sm font-black rounded-xl
                        hover:shadow-2xl hover:shadow-primary/30
                        transition-all disabled:opacity-40
                        disabled:cursor-not-allowed
                        flex items-center gap-3
                      "
                    >
                      {uploading ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          📤 Upload & Notify Client
                        </>
                      )}
                    </button>

                    {/* Info note */}
                    <p className="font-sans text-xs text-slate-400 mt-4">
                      The report will be uploaded to secure storage and the
                      client will be notified by email automatically.
                    </p>
                  </div>

                </div>
              </Card>
            </div>
          )}

          {!selected && !showForm && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 grayscale text-primary">
                💼
              </div>
              <p className="font-sans text-lg font-black text-primary tracking-tight mb-2">
                Operational Silence
              </p>
              <p className="font-sans text-sm text-slate-500 max-w-xs">
                Select a mission from the asset list or initialize a new audit
                protocol.
              </p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}