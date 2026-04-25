export function findColumnOfCard(board, cardId) {
  return Object.keys(board.columns).find((columnId) => board.columns[columnId].cardIds.includes(cardId));
}

export function moveCardImmutable(board, cardId, toColumnId, toIndex) {
  const fromColumnId = findColumnOfCard(board, cardId);
  if (!fromColumnId || !board.columns[toColumnId]) return board;

  const next = {
    ...board,
    columns: Object.fromEntries(
      Object.entries(board.columns).map(([id, col]) => [id, { ...col, cardIds: [...col.cardIds] }])
    ),
    cards: { ...board.cards }
  };

  next.columns[fromColumnId].cardIds = next.columns[fromColumnId].cardIds.filter((id) => id !== cardId);
  const target = next.columns[toColumnId].cardIds;
  const safeIndex = Math.max(0, Math.min(toIndex, target.length));
  target.splice(safeIndex, 0, cardId);
  return next;
}

export function getDropIndex(listEl, clientY) {
  const cards = [...listEl.querySelectorAll('[data-card-row="true"]')];
  if (!cards.length) return 0;
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return Number(cards[i].dataset.index || i);
  }
  const last = cards[cards.length - 1];
  return Number(last.dataset.index || cards.length - 1) + 1;
}
