import { configureStore } from '@reduxjs/toolkit';
import { boardReducer, listenerMiddleware } from './boardSlice';

export const store = configureStore({
  reducer: { board: boardReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
});
