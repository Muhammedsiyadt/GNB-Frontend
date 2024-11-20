import { lazy } from 'react';

// project import
import NotFound from 'pages/errors/NotFound';
 

// ==============================|| MAIN ROUTING ||============================== //

const NotFoundRoutes = {
  path: '*',
  element: <NotFound />,
  
};

export default NotFoundRoutes;
