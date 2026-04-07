import { ArrowLeft, Check, Clock, Crown, Mail, ShoppingBag, Star, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

function MealSelectionPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  const [menu, setMenu] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [subscriptionInfo, setSubscriptionInfo] = useState({ hasPriority: false, plan: "base" });

  useEffect(() => {
    const load = async () => {
      try {
        const [groupResponse, menuResponse] = await Promise.all([
          axios.get(`/api/bulk-order/group/${groupId}`),
          axios.get("/api/bulk-order/menu"),
        ]);

        setGroupInfo(groupResponse.data.group);
        setMembers(groupResponse.data.members);
        setMenu(menuResponse.data);

        const initialSelections = {};
        groupResponse.data.members.forEach((member) => {
          if (member.meal !== "Not selected") {
            const menuItem = menuResponse.data.find((item) => item.name === member.meal);
            if (menuItem) initialSelections[member.email] = menuItem;
          }
        });
        setSelectedMeals(initialSelections);

        const email = groupResponse.data.group?.leader?.includes("@")
          ? groupResponse.data.group.leader
          : groupResponse.data.members?.[0]?.email;
        if (email) {
          const subscriptionResponse = await axios.get(
            `/api/subscription/check/${encodeURIComponent(email)}`
          );
          setSubscriptionInfo(subscriptionResponse.data);
        }
      } catch (error) {
        console.error("Meal selection load error:", error);
        toast.error("Failed to load group or menu data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [groupId]);

  const handleMealSelect = (memberEmail, item) => {
    setSelectedMeals((current) => ({ ...current, [memberEmail]: item }));
  };

  const handleSubmitSelections = async () => {
    const unselected = members.filter((member) => !selectedMeals[member.email]);
    if (unselected.length > 0) {
      toast.error(`${unselected.length} member(s) still need meal selections.`);
      return;
    }

    try {
      setSubmitting(true);
      await Promise.all(
        members.map((member) =>
          axios.post("/api/bulk-order/select-meal", {
            groupId,
            memberEmail: member.email,
            memberName: member.name,
            mealId: selectedMeals[member.email]._id,
            specialInstructions: "",
          })
        )
      );

      navigate("/tokens", {
        state: {
          eventDetails: {
            id: groupId,
            name: groupInfo?.name,
            date: groupInfo?.eventDate,
            leader: groupInfo?.leader,
          },
          members: members.map((member) => ({
            ...member,
            selectedMeal: selectedMeals[member.email],
          })),
          groupInfo,
          hasPriority: subscriptionInfo?.hasPriority || false,
          autoStartPayment: true,
        },
      });
      toast.success("All meal selections saved.");
    } catch (error) {
      console.error("Submit selections error:", error);
      toast.error("Failed to submit selections.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-slate-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full bg-orange-100 p-4">
            <ShoppingBag className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900">Meal Selection</h1>
          <p className="mt-2 text-slate-600">
            {groupInfo?.name} • {new Date(groupInfo?.eventDate).toLocaleDateString()}
          </p>

          {subscriptionInfo?.hasPriority && (
            <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-white shadow-lg">
              <Star className="h-5 w-5 fill-current" />
              Priority Preparation Active
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="rounded-[2rem] bg-white shadow-xl">
            <div className="rounded-t-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <User size={20} />
                Members
              </h2>
            </div>
            <div className="space-y-3 p-4">
              {members.map((member) => {
                const selected = selectedMeals[member.email];
                return (
                  <div
                    key={member.email}
                    className={`rounded-2xl border-2 p-4 ${
                      selected ? "border-green-400 bg-green-50" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          {subscriptionInfo?.hasPriority ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                              <Crown size={12} />
                              Priority
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Mail size={14} />
                          {member.email}
                        </p>
                        <p className="mt-2 text-sm text-green-700">
                          {selected ? `Selected: ${selected.name}` : "Meal pending"}
                        </p>
                      </div>
                      {selected ? <Check className="text-green-500" size={18} /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => navigate("/subscription")}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-700"
              >
                <Crown size={16} />
                Upgrade Subscription
              </button>
              <button
                type="button"
                onClick={handleSubmitSelections}
                disabled={submitting || Object.keys(selectedMeals).length !== members.length}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm All Selections"}
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white shadow-xl">
            <div className="rounded-t-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Utensils size={20} />
                Menu
              </h2>
            </div>
            <div className="space-y-8 p-6">
              {members.map((member) => (
                <div key={member.email} className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 border-b border-slate-100 pb-3">
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {menu.map((item) => (
                      <button
                        key={`${member.email}-${item._id}`}
                        type="button"
                        onClick={() => handleMealSelect(member.email, item)}
                        className={`rounded-2xl border-2 p-4 text-left transition ${
                          selectedMeals[member.email]?._id === item._id
                            ? "border-orange-500 bg-orange-50"
                            : "border-slate-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                            <p className="mt-2 font-bold text-orange-600">Rs {item.price}</p>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={12} />
                            {item.preparationTime}m
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default MealSelectionPage;
