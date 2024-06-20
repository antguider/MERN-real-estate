import Navbar from './components/navbar/Navbar';
import './index.scss';
import HomePage from './pages/homePage/homePage';

function App() {

  return (
    <>
      <div className="layout">
        <Navbar></Navbar>
        <HomePage></HomePage>
      </div>
    </>
  )
}

export default App
