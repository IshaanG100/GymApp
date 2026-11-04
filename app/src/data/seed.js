export const WORKOUT_ROUTINES = [
  {
    id: 'legs-1',
    sessionName: 'Legs',
    exercises: [
      { name: 'Leg Press', sets: 2, repRange: '10–12' },
      { name: 'Leg Curl', sets: 2, repRange: '10–12' },
      { name: 'Leg Extension', sets: 2, repRange: '12–15' },
      { name: 'Machine Adductor', sets: 2, repRange: '12–15' },
      { name: 'Calf Raise', sets: 2, repRange: '15–20' },
      { name: 'Abs', sets: 2, repRange: '20–30' }
    ],
    theme: 'teal'
  },
  {
    id: 'push-1',
    sessionName: 'Push',
    exercises: [
      { name: 'Incline Bench Press', sets: 2, repRange: '8–12' },
      { name: 'Tricep Extension', sets: 2, repRange: '10–15' },
      { name: 'DB Hex Press', sets: 2, repRange: '12–15' },
      { name: 'Lateral Raise', sets: 3, repRange: '12–15' },
      { name: 'Overhead Tricep Press', sets: 2, repRange: '10–12' }
    ],
    theme: 'lime'
  },
  {
    id: 'pull-1',
    sessionName: 'Pull',
    exercises: [
      { name: 'Unilateral Seated Row', sets: 3, repRange: '10–12' },
      { name: 'Unilateral Pull Down', sets: 3, repRange: '10–12' },
      { name: 'Preacher Curl', sets: 2, repRange: '10–12' },
      { name: 'Incline DB Curl', sets: 1, repRange: '10–12' },
      { name: 'Incline DB Hammer Curl', sets: 1, repRange: '10–12' }
    ],
    theme: 'orange'
  },
  {
    id: 'upper-1',
    sessionName: 'Upper',
    exercises: [
      { name: 'Incline Bench Press', sets: 3, repRange: '8–12' },
      { name: 'Seated Row', sets: 2, repRange: '10–12' },
      { name: 'Cable Flys', sets: 3, repRange: '12–15' },
      { name: 'Narrow Grip Lat Pulldown', sets: 2, repRange: '10–12' },
      { name: 'Back Hyperextension', sets: 2, repRange: '12–15' }
    ],
    theme: 'purple'
  },
  {
    id: 'arms-1',
    sessionName: 'Arms',
    exercises: [
      { name: 'Lateral Raise', sets: 3, repRange: '12–15' },
      { name: 'Overhead Tricep Press', sets: 2, repRange: '10–12' },
      { name: 'Preacher Curl', sets: 2, repRange: '10–12' },
      { name: 'Tricep Extension', sets: 2, repRange: '10–15' },
      { name: 'Incline DB Curl', sets: 1, repRange: '10–12' },
      { name: 'Incline DB Hammer Curl', sets: 1, repRange: '10–12' }
    ],
    theme: 'pink'
  }
];

export const GYM_EXERCISES = [
  'Leg Press', 'Leg Curl', 'Leg Extension', 'Calf Raise', 'Abs',
  'Incline Bench Press', 'Tricep Extension', 'Cable Flys', 'Lateral Raise', 'Overhead Tricep Press',
  'Seated Row', 'Wide Grip Lat Pulldown', 'Chest Supported Row', 'Narrow Grip Lat Pulldown', 'T-Bar Row',
  'Unilateral Seated Row', 'Unilateral Pull Down',
  'Preacher Curl', 'Incline DB Curl', 'Incline DB Hammer Curl', 'Back Hyperextension',
  'Machine Adductor', 'DB Hex Press'
];

export const PHYSIO_EXERCISES = [
  'Pressure Release', 'Draw Your Sword', 'External Rotation'
];
