import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertCircle, Calendar, Clock, Mail, Sparkles, Trash2, User, Users } from "lucide-react";
import axios from "../../lib/axios";

const emptyMember = { name: "", email: "" };

function BulkOrderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    eventTime: "12:00",
    leaderName: "",
    leaderEmail: "",
    numberOfGroups: 1,
    maxMembersPerGroup: 4,
    description: "",
  });
  const [members, setMembers] = useState([emptyMember]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    setMembers((current) =>
      current.map((member, currentIndex) =>
        currentIndex === index ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    if (members.length >= Number(formData.maxMembersPerGroup)) {
      toast.error(`Maximum ${formData.maxMembersPerGroup} members allowed.`);
      return;
    }
    setMembers((current) => [...current, emptyMember]);
  };

  const removeMember = (index) => {
    if (members.length === 1) {
      toast.error("At least one member is required.");
      return;
    }
    setMembers((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.eventName ||
      !formData.eventDate ||
      !formData.leaderName ||
      !validateEmail(formData.leaderEmail)
    ) {
      toast.error("Please complete the event and leader details.");
      return;
    }

    const hasInvalidMembers = members.some(
      (member) => !member.name.trim() || !validateEmail(member.email)
    );
    if (hasInvalidMembers) {
      toast.error("Please fill all member names and valid emails.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/bulk-order/create-event", {
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        leaderName: formData.leaderName,
        leaderEmail: formData.leaderEmail,
        maxMembers: Number(formData.maxMembersPerGroup),
        numberOfGroups: Number(formData.numberOfGroups),
        description: formData.description,
        members,
      });

      toast.success("Event created successfully!");
      navigate(`/meal-selection/${response.data.group._id}`);
    } catch (error) {
      console.error("Bulk event create error:", error);
      toast.error(error.response?.data?.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full bg-orange-100 p-4">
            <Sparkles className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900">Create Bulk Event</h1>
          <p className="mt-2 text-slate-600">Organize meals for a team, class, or event.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              icon={Calendar}
              label="Event Name"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="Q2 Team Lunch"
            />
            <Field
              icon={Calendar}
              type="date"
              label="Event Date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
            />
            <Field
              icon={Clock}
              type="time"
              label="Event Time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
            />
            <Field
              icon={User}
              label="Leader Name"
              name="leaderName"
              value={formData.leaderName}
              onChange={handleChange}
              placeholder="Event leader"
            />
            <Field
              icon={Mail}
              type="email"
              label="Leader Email"
              name="leaderEmail"
              value={formData.leaderEmail}
              onChange={handleChange}
              placeholder="leader@example.com"
            />
            <Field
              icon={Users}
              type="number"
              label="Number of Groups"
              name="numberOfGroups"
              value={formData.numberOfGroups}
              onChange={handleChange}
            />
            <Field
              icon={Users}
              type="number"
              label="Max Members"
              name="maxMembersPerGroup"
              value={formData.maxMembersPerGroup}
              onChange={handleChange}
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Optional notes about the event"
            />
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Members</h2>
              <button
                type="button"
                onClick={addMember}
                className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700"
              >
                Add Member
              </button>
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={`${member.email}-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) => handleMemberChange(index, "name", event.target.value)}
                    placeholder="Member name"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
                  />
                  <input
                    type="email"
                    value={member.email}
                    onChange={(event) => handleMemberChange(index, "email", event.target.value)}
                    placeholder="member@example.com"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                Every member will receive an individual token after meal selection.
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 font-semibold text-white transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
}

export default BulkOrderPage;
