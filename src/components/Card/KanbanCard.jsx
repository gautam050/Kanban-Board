import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { actions, moveCardOptimistic } from '../../store/boardSlice';
import { Highlight } from '../../utils/highlight';

function KanbanCardBase({ cardId, columnId, index, query }) {
  const dispatch = useDispatch();
  const card = useSelector((s) => s.board.board.cards[cardId], shallowEqual);
  const activeDragCardId = useSelector((s) => s.board.activeDragCardId);
  const columnIds = ['backlog', 'todo', 'progress', 'done'];
  if (!card) return null;

  const onKeyDown = (e) => {
    const currentColIndex = columnIds.indexOf(columnId);
    if (e.key === 'Enter') dispatch(actions.setSelectedCardId(card.id));
    if (e.key === 'ArrowRight' && currentColIndex < columnIds.length - 1) {
      dispatch(moveCardOptimistic({ cardId: card.id, toColumnId: columnIds[currentColIndex + 1], toIndex: 0 }));
    }
    if (e.key === 'ArrowLeft' && currentColIndex > 0) {
      dispatch(moveCardOptimistic({ cardId: card.id, toColumnId: columnIds[currentColIndex - 1], toIndex: 0 }));
    }
    if (e.key === 'ArrowUp') dispatch(moveCardOptimistic({ cardId: card.id, toColumnId: columnId, toIndex: Math.max(0, index - 1) }));
    if (e.key === 'ArrowDown') dispatch(moveCardOptimistic({ cardId: card.id, toColumnId: columnId, toIndex: index + 1 }));
  };

  return (
    <article
      className="card"
      data-card-row="true"
      data-index={index}
      draggable
      tabIndex={0}
      role="listitem"
      aria-grabbed={card.id === activeDragCardId}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id }));
        e.dataTransfer.effectAllowed = 'move';
        dispatch(actions.setDragging(card.id));
        setTimeout(() => e.currentTarget.classList.add('dragging'), 0);
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('dragging');
        dispatch(actions.setDragging(null));
      }}
      onDoubleClick={() => dispatch(actions.setSelectedCardId(card.id))}
      onKeyDown={onKeyDown}
    >
      <div className="card-title">
        <Highlight text={card.title || 'Untitled task'} query={query} />
      </div>

      <div className="card-labels">
        {card.labels.map((l) => <span key={l} className={`label-${l}`}>{l}</span>)}
      </div>

      <small>{card.subtasks.filter((s) => s.done).length}/{card.subtasks.length} subtasks</small>

      <div className="card-actions">
        <button onClick={(e) => { e.stopPropagation(); dispatch(actions.setSelectedCardId(card.id)); }}>Edit</button>
        <button className="danger" onClick={(e) => { e.stopPropagation(); dispatch(actions.deleteCard(card.id)); }}>Delete</button>
      </div>
    </article>
  );
}

export const KanbanCard = React.memo(KanbanCardBase);
