import Link from "next/link";
import { assertSupabaseAdmin } from "@/lib/supabaseClient";
import { UserManagementClient } from "./UserManagementClient";

export const metadata = {
  title: "QuickLearn | User Management",
  description: "Manage registered users, approvals, and credentials.",
};

async function getAllUsers() {
  const supabase = assertSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, college, degree, status, payment_proof, created_at")
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }

  const users = data || [];
  const proofPaths = users
    .map((u) => u.payment_proof)
    .filter((p): p is string => typeof p === "string" && p.length > 0);

  const pathMap = new Map<string, string>();

  if (proofPaths.length > 0) {
    const { data: signedData } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrls(proofPaths, 3600); // 1 hour validity
      
    if (signedData) {
      signedData.forEach((item: { path: string | null; signedUrl: string }) => {
        if (item.path && item.signedUrl) {
          pathMap.set(item.path, item.signedUrl);
        }
      });
    }
  }

  return users.map((u) => ({
    ...u,
    signedUrl: u.payment_proof ? pathMap.get(u.payment_proof) ?? null : null,
  })) as {
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
  }[];
}

export default async function UserManagementPage() {
  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-20">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
             <Link 
                href="/admin" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </Link>
             <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h1>
             </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
             Total Users: <span className="text-indigo-600 dark:text-indigo-400">{users.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <UserManagementClient initialUsers={users} />
      </main>
    </div>
  );
}
