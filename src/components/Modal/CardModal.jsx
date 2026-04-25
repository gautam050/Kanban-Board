import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { actions } from '../../store/boardSlice';

const allLabels = ['bug', 'urgent', 'feature', 'frontend', 'api', 'accessibility'];

export function CardModal() {
  const dispatch = useDispatch();
  const selectedCardId = useSelector((s) => s.board.selectedCardId);
  const card = useSelector((s) => selectedCardId ? s.board.board.cards[selectedCardId] : null, shallowEqual);
  const [subtask, setSubtask] = useState('');
  const [title, setTitle] = useState('');
  const [labels, setLabels] = useState(['feature']);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: { attributes: { 'data-placeholder': 'Add a description...' } }
  });

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setLabels(card.labels?.length ? card.labels : ['feature']);
      editor?.commands.setContent(card.description || '');
    }
  }, [card?.id, editor]);

  const selected = useMemo(() => new Set(labels), [labels]);

  if (!card || !selectedCardId) return null;

  const toggleLabel = (label) => {
    setLabels((prev) => prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]);
  };

  const updateAndClose = () => {
    dispatch(actions.updateCard({
      cardId: card.id,
      patch: {
        title: title.trim() || 'Untitled task',
        description: editor?.getHTML() || '',
        labels: labels.length ? labels : ['feature']
      }
    }));
    dispatch(actions.setSelectedCardId(null));
  };

  const addSubtask = () => {
    dispatch(actions.addSubtask(card.id, subtask));
    setSubtask('');
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Card detail">
      <div className="modal">
        <div className="modal-head">
          <input
            className="title-input"
            value={title}
            placeholder="New task"
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={() => dispatch(actions.setSelectedCardId(null))}>Close</button>
        </div>

        <h3>Description</h3>
        <div className="editor-toolbar">
          <button onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()}>Bullets</button>
        </div>
        <EditorContent className="editor" editor={editor} />

        <h3>Labels</h3>
        <div className="modal-labels">
          {allLabels.map((label) => (
            <button
              key={label}
              type="button"
              className={selected.has(label) ? `active label-${label}` : `label-${label}`}
              onClick={() => toggleLabel(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <h3>Subtasks</h3>
        <div className="subtask-add">
          <input
            placeholder="Add subtask"
            value={subtask}
            onChange={(e) => setSubtask(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addSubtask(); }}
          />
          <button onClick={addSubtask}>Add</button>
        </div>
        <ul className="subtasks">
          {card.subtasks.map((s) => (
            <li key={s.id}>
              <label>
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={() => dispatch(actions.toggleSubtask({ cardId: card.id, subtaskId: s.id }))}
                /> {s.title}
              </label>
            </li>
          ))}
        </ul>

        <div className="modal-actions">
          <button className="danger" onClick={() => dispatch(actions.deleteCard(card.id))}>Delete</button>
          <button onClick={updateAndClose}>Add / Update</button>
        </div>
      </div>
    </div>
  );
}
