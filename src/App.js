import './App.css';
import { Game } from './components/Game';
import { Home } from "./components/Home"
import { HashRouter, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route index element={<Home />}></Route>
          <Route path="/game" element={<Game />}></Route>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
