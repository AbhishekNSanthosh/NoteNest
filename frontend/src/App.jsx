import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import Layout from "./modules/Dashboard/layout/Layout";
import './App.css'
import AllNotes from "./modules/Dashboard/modules/AllNotes/AllNotes";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path:'/notes',
          element:<AllNotes/>
        }
      ]
    },
  ]);
  return (
    <RouterProvider router={router} />
  )
}

export default App
