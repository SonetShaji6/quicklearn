"use client";

import { useState, useMemo } from "react";
import { updateUserAction } from "./actions";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  status: string;
  payment_proof: string | null;
  signedUrl: string | null;
  created_at: string;
};

export function UserManagementClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.college.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, filterStatus]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    setMessage(null);
  };

  const handleUpdate = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    const res = await updateUserAction(formData);
    
    if (res.success) {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === formData.get("userId")
            ? { ...u, 
                name: formData.get("name") as string,
                college: formData.get("college") as string,
                degree: formData.get("degree") as string,
                phone: formData.get("phone") as string,
                status: formData.get("status") as string
              }
            : u
        )
      );
      setMessage({ type: "success", text: res.message });
      // Close modal after brief delay or let user close
      setTimeout(() => closeModal(), 1500);
    } else {
      setMessage({ type: "error", text: res.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border-slate-200 py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:bg-slate-900 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                        <span className="text-xs text-slate-400 mt-1 dark:text-slate-500">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase text-slate-400 w-12">College:</span>
                            <span className="truncate max-w-[150px]" title={user.college}>{user.college}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-medium uppercase text-slate-400 w-12">Degree:</span>
                             <span>{user.degree}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-medium uppercase text-slate-400 w-12">Phone:</span>
                             <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${
                            user.status === "approved"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : user.status === "rejected"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                        >
                            {user.status}
                        </span>
                        {user.signedUrl ? (
                            <a
                            href={user.signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                            View Proof
                            </a>
                        ) : (
                            <span className="text-xs text-slate-400 italic">No proof</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden ring-1 ring-slate-900/5 dark:ring-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit User Details</h3>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form action={handleUpdate} className="p-6 space-y-4">
              <input type="hidden" name="userId" value={selectedUser.id} />
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                    <input 
                        name="name" 
                        defaultValue={selectedUser.name} 
                        className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        required
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                    <input 
                        name="phone" 
                        defaultValue={selectedUser.phone} 
                        className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        required
                    />
                 </div>
              </div>

               <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Email (Read-only)</label>
                    <input 
                        defaultValue={selectedUser.email} 
                        readOnly
                        disabled
                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
                    />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">College</label>
                    <input 
                        name="college" 
                        defaultValue={selectedUser.college} 
                        className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        required
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Degree</label>
                    <input 
                        name="degree" 
                        defaultValue={selectedUser.degree} 
                        className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        required
                    />
                 </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select 
                    name="status" 
                    defaultValue={selectedUser.status}
                    className="w-full rounded-lg border-slate-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-amber-600 uppercase dark:text-amber-400">Reset Password (Optional)</label>
                    <input 
                        name="password" 
                        type="password"
                        placeholder="Enter new password to reset"
                        className="w-full rounded-lg border-slate-300 text-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <p className="text-[10px] text-slate-400">Leave blank to keep current password.</p>
                  </div>
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {message.text}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
