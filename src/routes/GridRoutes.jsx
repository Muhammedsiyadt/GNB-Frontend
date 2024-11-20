import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Index from 'pages/grid/Index';
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
import Dashboard from 'layout/Dashboard';
// ==============================|| MAIN ROUTING ||============================== //

const GridRoutes = {
  path: '/run-a-scan',
  element: <Dashboard />,
  children: [
    {
      path: '',
      element: <Index />
    },
  ]
};

export default GridRoutes;
