import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from '../../hooks/useDebounce';
import { actions, simulateRemoteMove } from '../../store/boardSlice';
import { Column } from './Column';
import React from 'react';
export function Board() {
  const dispatch = useDispatch();
  const search = useSelector((s) => s.board.search);
  const selectedLabels = useSelector((s) => s.board.selectedLabels);
  const debounced = useDebounce(search, 300);

  useEffect(() => {
    const id = window.setInterval(() => dispatch(simulateRemoteMove()), 10000);
    return () => window.clearInterval(id);
  }, [dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); dispatch(actions.undo()); }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); dispatch(actions.redo()); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  return (
    <main className="board" aria-label="Kanban Board">
      {['backlog', 'todo', 'progress', 'done'].map((id) => (
        <Column key={id} columnId={id} query={debounced} selectedLabels={selectedLabels} />
      ))}
    </main>
  );
}
