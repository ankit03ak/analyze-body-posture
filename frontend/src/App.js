import { ToastContainer } from 'react-toastify';
import MainUI from './components/MainUI';
function App() {
  return (
    <div className="min-h-screen bg-gray-500">
      <ToastContainer />
      <MainUI />
    </div>
  );
}

export default App;
