import Navbar from './components/navbar/Navbar';
import './index.scss';
import HomePage from './pages/homePage/homePage';
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout from './pages/layout/layout';

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path:"/",
          element:<HomePage/>
        },
        // {
        //   path:"/list",
        //   element:<ListPage/>
        // },
        // {
        //   path:"/:id",
        //   element:<SinglePage/>
        // },
        // {
        //   path:"/profile",
        //   element:<ProfilePage/>
        // },
        // {
        //   path:"/login",
        //   element:<Login/>
        // },
        // {
        //   path:"/register",
        //   element:<Register/>
        // }
      ]
    }
  ])

  return (
    <RouterProvider router={router}></RouterProvider>
  )
}

export default App
