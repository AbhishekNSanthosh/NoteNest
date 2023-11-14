import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import Layout from "./modules/Dashboard/layout/Layout";
import './App.css'
import AllNotes from "./modules/Dashboard/modules/AllNotes/AllNotes";
import Profile from "./modules/Dashboard/modules/Profile/Profile";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <AllNotes />
        },
        {
          path: '/profile',
          element: <Profile />
        }
      ]
    },
  ]);
  return (
    <RouterProvider router={router} />
  )
}

export default App
