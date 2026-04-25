import { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { actions, moveCardOptimistic } from '../../store/boardSlice';
import { getDropIndex } from '../../utils/boardLogic';
import { KanbanCard } from '../Card/KanbanCard';

const ITEM_HEIGHT = 170;
const BUFFER = 6;

export function Column({ columnId, query, selectedLabels }) {
  const dispatch = useDispatch();
  const column = useSelector((s) => s.board.board.columns[columnId], shallowEqual);
  const cards = useSelector((s) => s.board.board.cards);
  const listRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isOver, setIsOver] = useState(false);

  const visibleIds = useMemo(() => column.cardIds.filter((id) => {
    const card = cards[id];
    const matchesSearch = !query || card.title.toLowerCase().includes(query.toLowerCase());
    const matchesLabels = selectedLabels.length === 0 || selectedLabels.every((l) => card.labels.includes(l));
    return matchesSearch && matchesLabels;
  }), [column.cardIds, cards, query, selectedLabels]);

  const height = listRef.current?.clientHeight || 600;
  const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
  const end = Math.min(visibleIds.length, Math.ceil((scrollTop + height) / ITEM_HEIGHT) + BUFFER);
  const windowIds = visibleIds.slice(start, end);

  const openNewCard = () => {
    dispatch(actions.createCard(columnId, '', '', ['feature']));
  };

  return (
    <section className={`column ${isOver ? 'drop-over' : ''}`} aria-label={column.title}>
      <header className="column-header">
        <h2>{column.title}</h2>
        <button onClick={openNewCard}>+ Add</button>
      </header>
      <div
        className="card-list"
        ref={listRef}
        role="list"
        aria-dropeffect="move"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        onDragEnter={() => setIsOver(true)}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          const raw = e.dataTransfer.getData('text/plain');
          if (!raw) return;
          const { cardId } = JSON.parse(raw);
          const index = listRef.current ? getDropIndex(listRef.current, e.clientY) : visibleIds.length;
          dispatch(moveCardOptimistic({ cardId, toColumnId: columnId, toIndex: index }));
        }}
      >
        <div style={{ height: Math.max(visibleIds.length * ITEM_HEIGHT, 160), position: 'relative' }}>
          <div style={{ transform: `translateY(${start * ITEM_HEIGHT}px)` }}>
            {windowIds.map((id, offset) => (
              <KanbanCard key={id} cardId={id} columnId={columnId} index={start + offset} query={query} />
            ))}
            {visibleIds.length === 0 && <div className="empty-column">Drop cards here</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
