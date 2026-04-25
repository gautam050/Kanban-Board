const labels = ['bug', 'urgent', 'feature', 'frontend', 'api', 'accessibility'];
const titles = ['Build filter dropdown', 'Fix drag and drop', 'Create card modal', 'Improve table loading', 'Write API tests', 'Add audit log', 'Keyboard navigation', 'Optimize CSV parser'];

export function createSeedBoard() {
  const columns = {
    backlog: { id: 'backlog', title: 'To Do', cardIds: [] },
    todo: { id: 'todo', title: 'In Progress', cardIds: [] },
    progress: { id: 'progress', title: 'In Review', cardIds: [] },
    done: { id: 'done', title: 'Done', cardIds: [] }
  };
  const cards = {};
  const colIds = Object.keys(columns);
  for (let i = 1; i <= 80; i++) {
    const id = `card-${i}`;
    const l1 = labels[i % labels.length];
    const l2 = labels[(i + 2) % labels.length];
    cards[id] = {
      id,
      title: `${titles[i % titles.length]} #${i}`,
      description: '',
      labels: [l1, l2],
      subtasks: [
        { id: `${id}-s1`, title: 'Review requirement', done: i % 2 === 0 },
        { id: `${id}-s2`, title: 'Test edge case', done: i % 5 === 0 }
      ],
      updatedAt: Date.now()
    };
    columns[colIds[i % 4]].cardIds.push(id);
  }
  return { columns, cards };
}

export function loadBoard() {
  try {
    const raw = localStorage.getItem('kanban-board-redux-final');
    const board = raw ? JSON.parse(raw) : createSeedBoard();
    board.columns.backlog.title = 'To Do';
    board.columns.todo.title = 'In Progress';
    board.columns.progress.title = 'In Review';
    board.columns.done.title = 'Done';
    return board;
  } catch {
    return createSeedBoard();
  }
}

export function saveBoard(board) {
  localStorage.setItem('kanban-board-redux-final', JSON.stringify(board));
}
