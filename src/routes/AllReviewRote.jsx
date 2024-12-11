import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Index from 'pages/grid/Index';
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
import Dashboard from 'layout/Dashboard';
import AllReviews from 'pages/All-Review/AllReviews';
// ==============================|| MAIN ROUTING ||============================== //

const AllReviewRoute = {
  path: '/all-reviews',
  element: <Dashboard />,
  children: [
    {
      path: '',
      element: <AllReviews />
    },
  ]
};

export default AllReviewRoute;
