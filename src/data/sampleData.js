import { v4 as uuidv4 } from 'uuid';

// Initial sample data for Aurora
export const initialProjects = [
  {
    id: uuidv4(),
    name: 'Web Platform Launch',
    description: 'Launch of the new web platform with core features',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    color: '#2952A3',
    categories: [
      {
        id: uuidv4(),
        name: 'Planning',
        color: '#8064A2',
        tasks: [
          { id: uuidv4(), name: 'Discovery & requirements', startDay: 0, duration: 5, buffer: 0, completed: true },
          { id: uuidv4(), name: 'Architecture spike', startDay: 5, duration: 4, buffer: 0, completed: true },
          { id: uuidv4(), name: 'Roadmap sign-off', startDay: 9, duration: 2, buffer: 1, completed: true },
        ]
      },
      {
        id: uuidv4(),
        name: 'Design',
        color: '#C0504D',
        tasks: [
          { id: uuidv4(), name: 'Wireframes', startDay: 6, duration: 5, buffer: 0, completed: true },
          { id: uuidv4(), name: 'Visual design', startDay: 11, duration: 6, buffer: 0, completed: false },
          { id: uuidv4(), name: 'Design system', startDay: 17, duration: 4, buffer: 2, completed: false },
        ]
      },
      {
        id: uuidv4(),
        name: 'Build',
        color: '#4BACC6',
        tasks: [
          { id: uuidv4(), name: 'Project scaffold', startDay: 11, duration: 3, buffer: 0, completed: true },
          { id: uuidv4(), name: 'Core components', startDay: 14, duration: 10, buffer: 0, completed: false },
          { id: uuidv4(), name: 'Feature: dashboard', startDay: 24, duration: 8, buffer: 0, completed: false },
          { id: uuidv4(), name: 'Feature: onboarding', startDay: 32, duration: 6, buffer: 3, completed: false },
        ]
      },
      {
        id: uuidv4(),
        name: 'Content',
        color: '#F79646',
        tasks: [
          { id: uuidv4(), name: 'Copywriting', startDay: 20, duration: 6, buffer: 0, completed: false },
          { id: uuidv4(), name: 'Marketing pages', startDay: 26, duration: 5, buffer: 2, completed: false },
        ]
      },
      {
        id: uuidv4(),
        name: 'QA & Testing',
        color: '#1B4F8A',
        tasks: [
          { id: uuidv4(), name: 'Component tests', startDay: 30, duration: 6, buffer: 0, completed: false },
          { id: uuidv4(), name: 'End-to-end QA pass', startDay: 44, duration: 8, buffer: 0, completed: false },
          { id: uuidv4(), name: 'Bug-fix window', startDay: 52, duration: 5, buffer: 3, completed: false },
        ]
      },
      {
        id: uuidv4(),
        name: 'Launch',
        color: '#9BBB59',
        tasks: [
          { id: uuidv4(), name: 'Staging deploy', startDay: 57, duration: 3, buffer: 0, completed: false },
          { id: uuidv4(), name: 'Beta rollout', startDay: 60, duration: 4, buffer: 0, completed: false },
          { id: uuidv4(), name: 'Public beta', startDay: 64, duration: 3, buffer: 3, completed: false },
        ]
      },
    ]
  }
];

export const CATEGORY_COLORS = {
  plan: '#8064A2',
  design: '#C0504D',
  build: '#4BACC6',
  content: '#F79646',
  test: '#1B4F8A',
  launch: '#9BBB59',
};

export const PROJECT_STATUS = {
  active: 'Active',
  completed: 'Completed',
  onHold: 'On Hold',
  archived: 'Archived',
};
