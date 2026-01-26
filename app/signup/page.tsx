import Link from "next/link";
import { SignupForm } from "./SignupForm";

const benefits = [
	"Fast 3-step registration tailored for MCA LBS learners.",
	"Secure login with protected progress and quiz history.",
	"Instant access to crash-course videos, PDFs, and quizzes.",
	"Dashboard that highlights weak areas and tracks streaks.",
];

export const metadata = {
	title: "QuickLearn | Sign Up",
	description:
		"Create your QuickLearn account for MCA LBS crash course videos, quizzes, and progress tracking.",
};

export default function SignupPage() {
	return (
		<div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative dark:bg-slate-950">
            <Link 
                href="/" 
                className="absolute top-4 left-4 md:top-8 md:left-8 z-20 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-white/50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800/50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Home
            </Link>

			<div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950"></div>

			<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20">
				<div className="flex justify-center lg:justify-start mb-10">
					<Link href="/" className="inline-flex items-center gap-2 group">
						<span className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform dark:shadow-indigo-900/20">
							QL
						</span>
						<span className="text-2xl font-bold text-slate-900 tracking-tight dark:text-slate-100">
							QuickLearn
						</span>
					</Link>
				</div>

				<div className="grid gap-12 lg:grid-cols-2 items-start">
					{/* Left Column: Context & Payments */}
					<div className="space-y-8 animate-fade-in-up order-2 lg:order-1">
						<div>
							<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4 dark:text-slate-100">
								Join the crash course & start mastering the syllabus.
							</h1>
							<p className="text-lg text-slate-600 leading-relaxed dark:text-slate-400">
								Get access to concise video lessons, downloadable PDFs, and timed
								quizzes designed to help you ace the MCA LBS exam.
							</p>
						</div>

						<ul className="space-y-3">
							{benefits.map((item, i) => (
								<li
									key={i}
									className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
								>
									<svg
										className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2.5}
											d="M5 13l4 4L19 7"
										/>
									</svg>
									<span className="text-sm font-medium">{item}</span>
								</li>
							))}
						</ul>

						<div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm ring-1 ring-indigo-50 dark:bg-slate-900 dark:border-slate-800 dark:ring-slate-800">
							<h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4 dark:text-slate-100">
								<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
									<svg
										className="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								</span>
								Payment Information
							</h3>
							<div className="space-y-3 text-sm">
								<div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
									<span className="text-slate-500 dark:text-slate-400">Course Fee</span>
									<span className="font-bold text-slate-900 text-base dark:text-white">
										₹4,999
									</span>
								</div>
								<div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
									<span className="text-slate-500 dark:text-slate-400">Method</span>
									<span className="font-medium text-slate-900 dark:text-slate-200">
										UPI / Bank Transfer
									</span>
								</div>
								<p className="text-xs text-slate-500 leading-relaxed pt-2 dark:text-slate-400">
									You&apos;ll be asked to upload payment proof during signup.
									Admin verification takes 1-24 hours.
								</p>
							</div>
						</div>
					</div>

					{/* Right Column: Form */}
					<div className="animate-fade-in-up order-1 lg:order-2 space-y-6">
						<SignupForm />
						<div className="text-center">
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Already have an account?{" "}
								<Link
									href="/login"
									className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
								>
									Log in
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
