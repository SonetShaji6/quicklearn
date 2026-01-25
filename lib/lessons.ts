export type Lesson = {
  id: string;
  title: string;
  duration: string;
  playbackId: string; // YouTube URL
};

export type Category = {
  id: string;
  name: string;
  lessons: Lesson[];
};

// Replace the playbackId values with your real YouTube URLs (watch or youtu.be links).
export const lessonCategories: Category[] = [
  {
    id: "cs",
    name: "Computer Science",
    lessons: [
  { id: "cs-101", title: "Data Structures Overview", duration: "12:45", playbackId: "https://www.youtube.com/watch?v=videoid1" },
  { id: "cs-102", title: "Algorithms Foundations", duration: "15:10", playbackId: "https://www.youtube.com/watch?v=videoid2" },
  { id: "cs-103", title: "Databases & SQL", duration: "14:05", playbackId: "https://www.youtube.com/watch?v=videoid3" },
    ],
  },
  {
    id: "math",
    name: "Mathematics",
    lessons: [
  { id: "math-201", title: "Linear Algebra Essentials", duration: "11:20", playbackId: "https://www.youtube.com/watch?v=videoid4" },
  { id: "math-202", title: "Probability Basics", duration: "13:55", playbackId: "https://www.youtube.com/watch?v=videoid5" },
    ],
  },
  {
    id: "aptitude",
    name: "Aptitude",
    lessons: [
  { id: "apt-301", title: "Quantitative Aptitude Drills", duration: "10:30", playbackId: "https://www.youtube.com/watch?v=videoid6" },
  { id: "apt-302", title: "Logical Reasoning", duration: "09:50", playbackId: "https://www.youtube.com/watch?v=videoid7" },
    ],
  },
  {
    id: "eng",
    name: "English",
    lessons: [
  { id: "eng-401", title: "Reading Comprehension", duration: "08:40", playbackId: "https://www.youtube.com/watch?v=videoid8" },
  { id: "eng-402", title: "Grammar Refresher", duration: "07:55", playbackId: "https://www.youtube.com/watch?v=videoid9" },
    ],
  },
  {
    id: "other",
    name: "Others",
    lessons: [
      { id: "oth-501", title: "Exam Strategy", duration: "06:30", playbackId: "https://www.youtube.com/watch?v=videoid10" },
    ],
  },
];
