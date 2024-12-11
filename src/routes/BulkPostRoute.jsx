import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Index from 'pages/grid/Index';
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
import Dashboard from 'layout/Dashboard';
import BulkPost from 'pages/Bulk-Post/BulkPost';
// ==============================|| MAIN ROUTING ||============================== //

const BulkPostRoutes = {
  path: '/location/bulk-posting',
  element: <Dashboard />,
  children: [
    {
      path: '',
      element: <BulkPost />
    },
  ]
};

export default BulkPostRoutes;
