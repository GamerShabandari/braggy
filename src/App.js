import './App.css';
import { Game } from './components/Game';
import { Home } from "./components/Home"
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Notfound } from './components/Notfound';


function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route index element={<Home />}></Route>
          <Route path="/game" element={<Game />}></Route>
          <Route path='/*' element={<Notfound/>} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
