import { lazy } from 'react';

// project import
import Dashboard from 'layout/Dashboard';
import AddLocation from 'pages/Locations/AddLocation';
 

// ==============================|| MAIN ROUTING ||============================== //

const AddRoutes = {
    path: '/add',
    element: <Dashboard />,
    children: [
      {
        path: 'locations',
        element: <AddLocation />
      },
    ]
  };
  
export default AddRoutes;
