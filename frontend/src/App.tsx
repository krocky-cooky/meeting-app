
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import Top from './components/Top';
import Stats from './components/Stats';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Top/>} />
        <Route path='/stats' element={<Stats/>} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
