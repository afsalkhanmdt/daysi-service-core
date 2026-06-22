import dayjs from "dayjs";

/**
 * Returns the formatted date range of a week relative to the current week.
 * Week Offset 0 (Week 1) starts on the current week's Monday and ends on Sunday.
 */
export function getWeekRange(weekOffset: number) {
  // weekOffset is relative to Week 1. So weekOffset = 0 corresponds to Week 1.
  const start = dayjs().startOf("week").add(1, "day").add(weekOffset, "week"); // Monday
  const end = start.add(6, "day"); // Sunday

  return {
    startDate: start.format("MMM D"),
    endDate: end.format("MMM D"),
  };
}

/**
 * Generates dummy school schedules based on weekNumber.
 * Returns the exact hardcoded Week 1 dataset on weekNumber = 1,
 * and dynamically shifts subjects/times for other weeks.
 */
export function generateMockSchoolSchedule(weekNumber: number) {
  // Standard Week 1 Mock Data (Default)
  if (weekNumber === 1) {
    return {
      monday: [
        { id: 1, title: "Period 1", time: "09:00-10:30" },
        { id: 2, title: "Period 2", time: "10:00-10:30" },
        { id: 3, title: "Period 3", time: "11:00-12:30" },
        { id: 4, title: "Lunch", time: "" },
        { id: 5, title: "Period 4", time: "13:00-14:30" },
      ],
      tuesday: [
        { id: 6, title: "Period 1", time: "09:00-10:30" },
        { id: 7, title: "Period 2", time: "11:00-12:30" },
      ],
      wednesday: [
        { id: 8, title: "Period 1", time: "09:00-10:30" },
        { id: 9, title: "Period 2", time: "10:00-11:30" },
        { id: 10, title: "Period 3", time: "12:00-13:30" },
      ],
      thursday: [
        { id: 11, title: "Period 1", time: "09:00-10:30" },
        { id: 12, title: "Period 2", time: "10:00-11:30" },
      ],
      friday: [
        { id: 13, title: "Period 1", time: "09:00-10:30" },
        { id: 14, title: "Period 2", time: "10:00-11:30" },
        { id: 15, title: "Period 3", time: "12:00-13:30" },
      ],
    };
  }

  // Week 2: Math, Science, Lunch, etc.
  if (weekNumber === 2) {
    return {
      monday: [
        { id: 101, title: "Math", time: "09:00-10:30" },
        { id: 102, title: "Science", time: "10:30-12:00" },
        { id: 103, title: "Lunch", time: "" },
        { id: 104, title: "Art", time: "13:00-14:30" },
      ],
      tuesday: [
        { id: 105, title: "Math", time: "09:00-10:30" },
        { id: 106, title: "Science", time: "11:00-12:30" },
      ],
      wednesday: [
        { id: 107, title: "History", time: "09:00-10:30" },
        { id: 108, title: "Lunch", time: "" },
        { id: 109, title: "Geography", time: "12:00-13:30" },
      ],
      thursday: [
        { id: 110, title: "Math", time: "09:00-10:30" },
        { id: 111, title: "Science", time: "10:00-11:30" },
      ],
      friday: [
        { id: 112, title: "Computing", time: "09:00-10:30" },
        { id: 113, title: "Music", time: "10:00-11:30" },
        { id: 114, title: "Lunch", time: "" },
      ],
    };
  }

  // Week 3: English, Physics, Sports, Lunch, etc.
  if (weekNumber === 3) {
    return {
      monday: [
        { id: 201, title: "English", time: "09:00-10:30" },
        { id: 202, title: "Physics", time: "10:30-12:00" },
        { id: 203, title: "Sports", time: "12:00-13:30" },
        { id: 204, title: "Lunch", time: "" },
      ],
      tuesday: [
        { id: 205, title: "English", time: "09:00-10:30" },
        { id: 206, title: "Physics", time: "11:00-12:30" },
      ],
      wednesday: [
        { id: 207, title: "Biology", time: "09:00-10:30" },
        { id: 208, title: "Lunch", time: "" },
        { id: 209, title: "Drama", time: "12:00-13:30" },
      ],
      thursday: [
        { id: 210, title: "English", time: "09:00-10:30" },
        { id: 211, title: "Physics", time: "10:00-11:30" },
      ],
      friday: [
        { id: 212, title: "Chemistry", time: "09:00-10:30" },
        { id: 213, title: "Sports", time: "10:30-12:00" },
        { id: 214, title: "Lunch", time: "" },
      ],
    };
  }

  // Fallback / Week 4+ dynamic generator
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
  const schedule: Record<string, any[]> = {};
  const subjects = ["Calculus", "Chemistry", "World History", "Spanish", "Literature", "Robotics", "Gym"];
  const times = ["09:00-10:30", "11:00-12:30", "13:00-14:30"];

  days.forEach((day, dayIdx) => {
    const lessons = [
      {
        id: weekNumber * 1000 + dayIdx * 10 + 1,
        title: subjects[(dayIdx + weekNumber) % subjects.length],
        time: times[0],
      },
      {
        id: weekNumber * 1000 + dayIdx * 10 + 2,
        title: subjects[(dayIdx + weekNumber + 2) % subjects.length],
        time: times[1],
      },
      {
        id: weekNumber * 1000 + dayIdx * 10 + 3,
        title: "Lunch",
        time: "",
      },
    ];
    if ((dayIdx + weekNumber) % 2 === 0) {
      lessons.push({
        id: weekNumber * 1000 + dayIdx * 10 + 4,
        title: subjects[(dayIdx + weekNumber + 4) % subjects.length],
        time: times[2],
      });
    }
    schedule[day] = lessons;
  });

  return schedule;
}

/**
 * Generates dummy work schedules based on weekNumber.
 * Works as a 4-week cycle rotation, but can scale beyond that.
 */
export function generateMockWorkSchedule(weekNumber: number) {
  const cycleWeek = ((weekNumber - 1) % 4) + 1;
  const block = Math.floor((weekNumber - 1) / 4);

  // Rotation layouts for Weeks 1 to 4
  const baseRotation = [
    // Week 1
    {
      Monday: "Onsite",
      Tuesday: "Onsite",
      Wednesday: "Work from home",
      Thursday: "Onsite",
      Friday: "Onsite",
      Saturday: "OFF",
      Sunday: "OFF",
    },
    // Week 2
    {
      Monday: "Work from home",
      Tuesday: "Onsite",
      Wednesday: "Onsite",
      Thursday: "Work from home",
      Friday: "Onsite",
      Saturday: "OFF",
      Sunday: "OFF",
    },
    // Week 3
    {
      Monday: "Onsite",
      Tuesday: "Onsite",
      Wednesday: "Onsite",
      Thursday: "Onsite",
      Friday: "Onsite",
      Saturday: "OFF",
      Sunday: "OFF",
    },
    // Week 4
    {
      Monday: "Work from home",
      Tuesday: "Onsite",
      Wednesday: "Work from home",
      Thursday: "Work from home",
      Friday: "Onsite",
      Saturday: "OFF",
      Sunday: "OFF",
    },
  ];

  const rotation = baseRotation[cycleWeek - 1];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
  const schedule: Record<string, string> = {};

  days.forEach((day) => {
    let status = rotation[day];
    // Dynamic changes for future 4-week cycles (block > 0)
    if (block > 0 && status !== "OFF") {
      if ((weekNumber + day.length) % 2 === 0) {
        status = status === "Onsite" ? "Work from home" : "Onsite";
      }
    }
    schedule[day] = status;
  });

  return schedule;
}
