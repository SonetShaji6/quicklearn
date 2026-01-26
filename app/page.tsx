import Link from "next/link";
import { Header } from "@/app/components/Header";

const features = [
	{
		title: "Secure login system",
		description: "Protected access so your study progress and quiz results stay private.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
			</svg>
		),
	},
	{
		title: "MCA LBS crash course videos",
		description: "Concise, exam-focused video lessons that cover the latest MCA LBS blueprint.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
	{
		title: "Downloadable materials",
		description: "Structured PDFs, formula sheets, and revision checklists ready to save offline.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
			</svg>
		),
	},
	{
		title: "Quiz engine with instant results",
		description: "Timed quizzes with immediate feedback so you know exactly what to fix next.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
	{
		title: "Progress tracking dashboard",
		description: "Visual dashboards that show completion, weak areas, and streaks to keep you on pace.",
		icon: (
			<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
		),
	},
];

export default function Home() {
	return (
		<div className="relative min-h-screen text-slate-900 bg-white dark:bg-slate-950 dark:text-slate-50 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 font-sans">
			{/* Modern Gradient Background */}
			<div className="fixed inset-0 z-0 pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-900/20"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-3xl dark:bg-blue-900/20"></div>
			</div>

			<Header />

			<main className="relative z-10" id="home">
				{/* Hero Section */}
				<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
					<div className="animate-fade-in-up space-y-8 max-w-4xl mx-auto">
						<div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/50 px-3 py-1 text-sm font-medium text-indigo-600 backdrop-blur-sm shadow-sm ring-1 ring-white/50 dark:bg-slate-900/50 dark:border-slate-800 dark:text-indigo-400 dark:ring-slate-800">
							<span className="relative flex h-2.5 w-2.5">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
							</span>
							Registration Open for MCA LBS 2026 Batch
						</div>

						<h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] dark:text-slate-100">
							Crack MCA LBS With <br className="hidden sm:block" />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
								Confidence & Speed
							</span>
						</h1>

						<p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed dark:text-slate-400">
							Structured video lessons, intelligent quizzes, and real-time progress tracking designed to simplify your preparation journey.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Link
								href="/signup"
								className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 dark:shadow-indigo-900/40"
							>
								Start Learning Free
							</Link>
							<Link
								href="/login"
								className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
							>
								Existing Student Login
							</Link>
						</div>
					</div>

                    {/* Hero Visual / Abstract UI Representation */}
                    <div className="mt-20 relative mx-auto w-full max-w-5xl animate-fade-in-up delay-200">
                        <div className="rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:rounded-3xl lg:p-4 dark:bg-slate-100/5 dark:ring-slate-100/10">
                            <div className="rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden dark:bg-slate-900 dark:ring-slate-100/10">
                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-2 dark:bg-slate-800 dark:border-slate-700">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="mx-auto text-xs font-medium text-slate-400">QuickLearn Dashboard</div>
                                </div>
                                <div className="aspect-[16/9] bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center relative dark:from-slate-900 dark:to-slate-900">
                                    <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg?t=st=1719730000~exp=1719733600~hmac=a4c2c6...')] bg-cover opacity-5 bg-center"></div> {/* Fallback pattern */}
                                    <div className="text-center p-8">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg mb-4">
                                             <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Personal Classroom</h3>
                                        <p className="text-slate-500 mt-2 dark:text-slate-400">Track progress, watch lessons, and take quizzes all in one place.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
				</section>

				{/* Features Grid */}
				<section id="features" className="py-24 bg-slate-50 relative overflow-hidden dark:bg-slate-900">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center max-w-3xl mx-auto mb-16">
							<h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
								All the tools you need to succeed
							</h2>
							<p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
								We&apos;ve stripped away the clutter to focus on what actually helps you learn faster and retain more.
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{features.map((feature) => (
								<div
									key={feature.title}
									className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-indigo-100 hover:-translate-y-1 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-900"
								>
									<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 mb-6 dark:bg-indigo-900/30 dark:text-indigo-400 dark:group-hover:text-white">
										{feature.icon}
									</div>
									<h3 className="text-xl font-bold text-slate-900 mb-3 dark:text-slate-100">
										{feature.title}
									</h3>
									<p className="text-slate-600 leading-relaxed text-sm dark:text-slate-400">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Minimal CTA */}
				<section className="py-24 px-4">
					<div className="mx-auto max-w-5xl rounded-3xl bg-indigo-600 px-6 py-16 sm:px-16 text-center shadow-2xl shadow-indigo-200 relative overflow-hidden dark:shadow-indigo-900/40">
                        {/* Abstract Shapes */}
						<div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>

						<div className="relative z-10 space-y-8">
							<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
								Ready to start your preparation?
							</h2>
							<p className="text-indigo-100 text-lg max-w-2xl mx-auto">
								Join the community of students mastering the MCA LBS syllabus with QuickLearn today.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/signup"
                                    className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-indigo-600 shadow-md transition-all hover:bg-slate-50 hover:scale-105 active:scale-95"
                                >
                                    Create Free Account
                                </Link>
                            </div>
						</div>
					</div>
				</section>
			</main>

			<footer className="bg-white border-t border-slate-100 py-12 dark:bg-slate-950 dark:border-slate-800">
				<div className="mx-auto max-w-6xl px-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                            QL
                        </span>
                        <span className="font-bold text-slate-900 text-xl dark:text-slate-100">QuickLearn</span>
                    </div>
                    <div className="flex gap-6 mb-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Link href="/#home" className="hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">Home</Link>
                        <Link href="/login" className="hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">Login</Link>
                        <Link href="/signup" className="hover:text-indigo-600 transition-colors dark:hover:text-indigo-400">Sign Up</Link>
                    </div>
					<p className="text-sm text-slate-400 dark:text-slate-500">
						© {new Date().getFullYear()} QuickLearn. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
