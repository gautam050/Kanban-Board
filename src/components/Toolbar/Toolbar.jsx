import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions, retryFailedSave } from '../../store/boardSlice';
import React from 'react';
const allLabels = ['bug', 'urgent', 'feature', 'frontend', 'api', 'accessibility'];

export function Toolbar() {
  const dispatch = useDispatch();

  const search = useSelector((s) => s.board.search);
  const selectedLabels = useSelector((s) => s.board.selectedLabels);
  const simulateApiFailure = useSelector((s) => s.board.simulateApiFailure);
  const hasFailedSave = useSelector((s) => s.board.hasFailedSave);
  const saving = useSelector((s) => s.board.saving);

  const [theme, setTheme] = useState(
    () => localStorage.getItem('kanban-theme') || 'light'
  );

  const [open, setOpen] = useState(false);
  const selected = useMemo(() => new Set(selectedLabels), [selectedLabels]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('kanban-theme', theme);
  }, [theme]);

  const updateLabels = (labels) => {
    const url = new URL(location.href);

    if (labels.length) {
      url.searchParams.set('labels', labels.join(','));
    } else {
      url.searchParams.delete('labels');
    }

    history.replaceState(null, '', url);
    dispatch(actions.setLabels(labels));
  };

  return (
    <header className="toolbar">
      <div>
        <h1>Kanban Board</h1>
      </div>

      <input
        value={search}
        onChange={(e) => dispatch(actions.setSearch(e.target.value))}
        placeholder="Search cards..."
        aria-label="Search cards"
      />

      <div className="filter-menu">
        <button onClick={() => setOpen((v) => !v)}>
          Filter {selectedLabels.length ? `(${selectedLabels.length})` : ''}
        </button>

        {open && (
          <div className="filter-dropdown">
            {allLabels.map((label) => (
              <label key={label} className={`filter-option label-${label}`}>
                <input
                  type="checkbox"
                  checked={selected.has(label)}
                  onChange={() =>
                    updateLabels(
                      selected.has(label)
                        ? selectedLabels.filter((l) => l !== label)
                        : [...selectedLabels, label]
                    )
                  }
                />
                {label}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="selected-filters">
        {selectedLabels.map((label) => (
          <span key={label} className={`label-${label}`}>
            {label}
          </span>
        ))}
      </div>

      <button onClick={() => dispatch(actions.undo())}>Undo</button>
      <button onClick={() => dispatch(actions.redo())}>Redo</button>

      <label className="switch">
        <input
          type="checkbox"
          checked={simulateApiFailure}
          onChange={(e) => dispatch(actions.setFailure(e.target.checked))}
        />
        API fail
      </label>

      {hasFailedSave && (
        <button className="danger" onClick={() => dispatch(retryFailedSave())}>
          Retry Save
        </button>
      )}

      <button disabled>{saving ? 'Saving...' : hasFailedSave ? 'Unsaved' : 'Saved'}</button>

      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}