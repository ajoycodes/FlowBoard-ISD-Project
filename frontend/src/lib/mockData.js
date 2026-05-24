export const initialData = {
  user: {
    name: 'Fariha',
    email: 'fariha@flowboard.local',
    role: 'Frontend Developer'
  },
  dashboard: {
    workspaces: [
      {
        id: 'flowboard-core',
        name: 'FlowBoard Core',
        description: 'Sprint planning, board tracking, and team coordination for any project.',
        progress: 68,
        deadline: 'Jun 06',
        tasks: 12,
        members: 4,
        status: 'Active'
      },
      {
        id: 'presentation-kit',
        name: 'Presentation Kit',
        description: 'Diagrams, slides, and screenshots for the final submission.',
        progress: 42,
        deadline: 'Jun 18',
        tasks: 7,
        members: 3,
        status: 'In Review'
      },
      {
        id: 'qa-handoff',
        name: 'QA Handoff',
        description: 'Testing checklist, bug log, and deployment notes.',
        progress: 26,
        deadline: 'Jun 26',
        tasks: 5,
        members: 2,
        status: 'Queued'
      }
    ],
    recentActivity: [
      { id: 1, title: 'SCRUM-41 dashboard UI scaffold committed', time: '2h ago', detail: 'feature/dashboard-local-2207034' },
      { id: 2, title: 'Jira story moved to In Progress', time: 'Today', detail: 'Login & Authentication' },
      { id: 3, title: 'Kanban columns mapped from project brief', time: 'Today', detail: 'Board design approved' }
    ]
  },
  workspaces: {
    'flowboard-core': {
      id: 'flowboard-core',
      name: 'FlowBoard Core',
      description: 'Main workspace for the collaborative task organizer.',
      deadline: 'Jun 06',
      progress: 68,
      stats: { tasks: 12, notes: 5, members: 4, activity: 18 },
      board: {
        todo: [
          { id: 't1', title: 'Design login screen', summary: 'Match the project branding and include helpful microcopy.', priority: 'High', assignee: 'Fariha', deadline: 'May 28' },
          { id: 't2', title: 'Add workspace creation flow', summary: 'Quick modal to create a new project workspace.', priority: 'Medium', assignee: 'Fariha', deadline: 'Jun 01' }
        ],
        progress: [
          { id: 't3', title: 'Wire dashboard cards', summary: 'Show active workspaces, upcoming deadlines, and activity.', priority: 'High', assignee: 'Fariha', deadline: 'May 30' },
          { id: 't4', title: 'Build notes editor', summary: 'Create an editable note panel with autosave UI.', priority: 'Medium', assignee: 'Fariha', deadline: 'Jun 03' }
        ],
        done: [
          { id: 't5', title: 'Project brief and README updated', summary: 'Documented scope, tech stack, and team roles.', priority: 'Low', assignee: 'Ajoy', deadline: 'May 24' }
        ]
      },
      notes: [
        { id: 'n1', title: 'Sprint 0 checklist', content: 'Finalize diagrams, GitHub branch strategy, and frontend scaffold.', updatedBy: 'Fariha', updatedAt: 'Today' },
        { id: 'n2', title: 'API contract draft', content: 'Laravel endpoints should return JSON with task, note, and activity payloads.', updatedBy: 'Suhita', updatedAt: 'Today' }
      ],
      members: [
        { id: 'm1', name: 'Ajoy', email: 'ajoy@flowboard.local', role: 'Scrum Master', status: 'Owner' },
        { id: 'm2', name: 'Fariha', email: 'fariha@flowboard.local', role: 'Frontend Developer', status: 'Active' },
        { id: 'm3', name: 'Suhita', email: 'suhita@flowboard.local', role: 'Backend Developer', status: 'Active' }
      ],
      activity: [
        { id: 'a1', date: '2026-05-24', action: 'Created FlowBoard Core workspace', user: 'Ajoy' },
        { id: 'a2', date: '2026-05-24', action: 'Updated dashboard layout to include statistics cards', user: 'Fariha' },
        { id: 'a3', date: '2026-05-23', action: 'Outlined Laravel API endpoints for tasks and notes', user: 'Suhita' }
      ]
    }
  }
}
