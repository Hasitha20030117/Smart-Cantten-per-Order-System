import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Trash2,
  User,
  Filter,
  Edit,
  X,
} from "lucide-react";
import { generateUsersPDF } from "./userPDF";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phoneNumber: "",
    role: "customer",
    password: "",
    confirmPassword: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8070/user/AllUser", {
          credentials: "include",
        });
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Unique roles and years for dropdowns
  const uniqueRoles = [...new Set(users.map((u) => u.role))];
  const uniqueYears = [
    ...new Set(
      users
        .filter((u) => u.createdAt)
        .map((u) => new Date(u.createdAt).getFullYear())
    ),
  ];

  // Filtering logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      (u.role || "").toLowerCase() === roleFilter.toLowerCase();

    const createdAt = u.createdAt ? new Date(u.createdAt) : null;
    const matchesYear =
      yearFilter === "all" ||
      (createdAt && createdAt.getFullYear().toString() === yearFilter);

    const matchesMonth =
      monthFilter === "all" ||
      (createdAt && (createdAt.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesRole && matchesYear && matchesMonth;
  });

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      address: user.address || "",
      phoneNumber: user.phoneNumber || "",
      role: user.role || "Customer",
      password: "",
      confirmPassword: "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`http://localhost:8070/user/deleteUser/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      if (editingUser) {
        const bodyData = { ...formData };
        if (!bodyData.password) delete bodyData.password;
        if (!bodyData.confirmPassword) delete bodyData.confirmPassword;

        const res = await fetch(
          `http://localhost:8070/user/updateUser/${editingUser._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(bodyData),
          }
        );
        const updatedUser = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
        );
        alert("User updated successfully");
      } else {
        const res = await fetch(`http://localhost:8070/user/addUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData),
        });
        const newUser = await res.json();
        setUsers((prev) => [...prev, newUser]);
        alert("User added successfully");
      }
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error saving user");
    }
  };

  const handleDownloadPDF = async () => {
    const doc = await generateUsersPDF(filteredUsers);
    doc.save("Users_Report.pdf");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage and view all registered users
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="all">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="all">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Download className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] max-w-6xl mx-auto table-auto border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 flex items-center">
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </div>
                      <div className="ml-3 font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.address}</td>
                    <td className="px-4 py-3">{user.phoneNumber}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role.toLowerCase() === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role.toLowerCase() === "manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-xs transition"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="inline-flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs transition"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">No users found</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4 text-center text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <form className="grid grid-cols-1 gap-4" onSubmit={handleFormSubmit}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Customer">Customer</option>
                </select>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
                <div className="flex justify-end gap-4 mt-2">
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
                  >
                    {editingUser ? "Update" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
