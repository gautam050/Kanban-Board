import { Board } from '../components/Board/Board';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { CardModal } from '../components/Modal/CardModal';
import { Toasts } from '../components/ui/Toast';

export function App() {
  return (
    <>
      <Toolbar />
      <Board />
      <CardModal />
      <Toasts />
    </>
  );
}
