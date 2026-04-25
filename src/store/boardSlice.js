import { createSlice, nanoid, createListenerMiddleware } from '@reduxjs/toolkit';
import { loadBoard, saveBoard } from '../utils/storage';
import { findColumnOfCard, moveCardImmutable } from '../utils/boardLogic';

const clone = (board) => JSON.parse(JSON.stringify(board));
const initialLabels =
  new URLSearchParams(location.search).get('labels')?.split(',').filter(Boolean) || [];

const initialState = {
  board: loadBoard(),
  past: [],
  future: [],
  search: '',
  selectedLabels: initialLabels,
  activeDragCardId: null,
  conflictCardId: null,
  selectedCardId: null,
  simulateApiFailure: false,
  hasFailedSave: false,
  saving: false,
  toasts: []
};

const pushHistory = (state) => {
  state.past.push(clone(state.board));
  if (state.past.length > 40) state.past.shift();
  state.future = [];
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },

    setLabels(state, action) {
      state.selectedLabels = action.payload;
    },

    setSelectedCardId(state, action) {
      state.selectedCardId = action.payload;
    },

    setDragging(state, action) {
      state.activeDragCardId = action.payload;
      state.conflictCardId = null;
    },

    setFailure(state, action) {
      state.simulateApiFailure = action.payload;
    },

    setSaving(state, action) {
      state.saving = action.payload;
    },

    markSaveFailed(state) {
      state.hasFailedSave = true;
      state.saving = false;
    },

    markSaveSuccess(state) {
      state.hasFailedSave = false;
      state.saving = false;
    },

    moveCard(state, action) {
      const { cardId, toColumnId, toIndex } = action.payload;
      pushHistory(state);
      state.board = moveCardImmutable(state.board, cardId, toColumnId, toIndex);
    },

    createCard: {
      reducer(state, action) {
        const { id, columnId, title, description, labels } = action.payload;
        pushHistory(state);

        state.board.cards[id] = {
          id,
          title: title?.trim() || 'Untitled task',
          description: description || '',
          labels: labels?.length ? labels : ['feature'],
          subtasks: [],
          updatedAt: Date.now()
        };

        state.board.columns[columnId].cardIds.unshift(id);
        state.selectedCardId = id;
      },
      prepare(columnId, title = '', description = '', labels = ['feature']) {
        return {
          payload: {
            id: nanoid(),
            columnId,
            title,
            description,
            labels
          }
        };
      }
    },

    updateCard(state, action) {
      const { cardId, patch } = action.payload;
      if (!state.board.cards[cardId]) return;

      pushHistory(state);
      state.board.cards[cardId] = {
        ...state.board.cards[cardId],
        ...patch,
        updatedAt: Date.now()
      };
    },

    deleteCard(state, action) {
      const cardId = action.payload;
      const col = findColumnOfCard(state.board, cardId);
      if (!col) return;

      pushHistory(state);
      delete state.board.cards[cardId];
      state.board.columns[col].cardIds =
        state.board.columns[col].cardIds.filter((id) => id !== cardId);

      if (state.selectedCardId === cardId) state.selectedCardId = null;
    },

    addSubtask: {
      reducer(state, action) {
        const { cardId, subtask } = action.payload;
        if (!state.board.cards[cardId] || !subtask.title.trim()) return;

        pushHistory(state);
        state.board.cards[cardId].subtasks.push(subtask);
        state.board.cards[cardId].updatedAt = Date.now();
      },
      prepare(cardId, title) {
        return {
          payload: {
            cardId,
            subtask: {
              id: nanoid(),
              title,
              done: false
            }
          }
        };
      }
    },

    toggleSubtask(state, action) {
      const { cardId, subtaskId } = action.payload;
      const card = state.board.cards[cardId];
      if (!card) return;

      pushHistory(state);
      card.subtasks = card.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, done: !s.done } : s
      );
      card.updatedAt = Date.now();
    },

    undo(state) {
      const previous = state.past[state.past.length - 1];
      if (!previous) return;

      state.future.unshift(clone(state.board));
      state.board = previous;
      state.past.pop();
    },

    redo(state) {
      const next = state.future[0];
      if (!next) return;

      state.past.push(clone(state.board));
      state.board = next;
      state.future.shift();
    },

    markConflict(state, action) {
      state.conflictCardId = action.payload;
    },

    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(message, type = 'info') {
        return {
          payload: {
            id: nanoid(),
            message,
            type
          }
        };
      }
    },

    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const actions = boardSlice.actions;
export const boardReducer = boardSlice.reducer;

export const moveCardOptimistic =
  ({ cardId, toColumnId, toIndex, actor = 'me' }) =>
  (dispatch, getState) => {
    const state = getState().board;

    if (actor === 'remote' && state.activeDragCardId === cardId) {
      dispatch(actions.markConflict(cardId));
      dispatch(
        actions.addToast(
          'Conflict detected: another user moved the card you are dragging.',
          'error'
        )
      );
      return;
    }

    dispatch(actions.moveCard({ cardId, toColumnId, toIndex }));
    dispatch(
      actions.addToast(
        actor === 'remote' ? 'Remote user moved a card' : 'Card moved optimistically',
        'info'
      )
    );
  };

export const simulateRemoteMove = () => (dispatch, getState) => {
  const { board } = getState().board;
  const cardIds = Object.keys(board.cards);
  if (!cardIds.length) return;

  const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
  const columnIds = Object.keys(board.columns);
  const toColumnId = columnIds[Math.floor(Math.random() * columnIds.length)];
  const toIndex = Math.floor(
    Math.random() * (board.columns[toColumnId].cardIds.length + 1)
  );

  dispatch(moveCardOptimistic({ cardId, toColumnId, toIndex, actor: 'remote' }));
};

export const retryFailedSave = () => async (dispatch, getState) => {
  const { board, simulateApiFailure, hasFailedSave } = getState().board;

  if (!hasFailedSave) {
    dispatch(actions.addToast('No failed save to retry.', 'info'));
    return;
  }

  dispatch(actions.setSaving(true));
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (simulateApiFailure) {
    dispatch(actions.markSaveFailed());
    dispatch(actions.addToast('Retry failed. Turn off API fail and try again.', 'error'));
    return;
  }

  saveBoard(board);
  dispatch(actions.markSaveSuccess());
  dispatch(actions.addToast('Retry successful. Board saved.', 'success'));
};

export const listenerMiddleware = createListenerMiddleware();

const persistenceActions = [
  actions.moveCard.type,
  actions.createCard.type,
  actions.updateCard.type,
  actions.deleteCard.type,
  actions.addSubtask.type,
  actions.toggleSubtask.type,
  actions.undo.type,
  actions.redo.type
];

listenerMiddleware.startListening({
  predicate: (action) => persistenceActions.includes(action.type),
  effect: async (action, api) => {
    const { board, simulateApiFailure } = api.getState().board;

    api.dispatch(actions.setSaving(true));
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (simulateApiFailure) {
      api.dispatch(actions.markSaveFailed());
      api.dispatch(
        actions.addToast(
          'API failed. Optimistic UI is kept. Click Retry Save.',
          'error'
        )
      );
      return;
    }

    saveBoard(board);
    api.dispatch(actions.markSaveSuccess());
    api.dispatch(actions.addToast('Saved successfully.', 'success'));
  }
});

listenerMiddleware.startListening({
  actionCreator: actions.addToast,
  effect: async (action, api) => {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    api.dispatch(actions.removeToast(action.payload.id));
  }
});