import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import Locations from 'pages/Locations/Locations';
import LocationDetails from 'pages/Locations/LocationDetails';
import LocationsPost from 'pages/Locations/LocationsPost';
import AddLocation from 'pages/Locations/AddLocation';
import LocationDetailsLayout from 'layout/LocationDetailsLayout';
import { element } from 'prop-types';
 

// ==============================|| MAIN ROUTING ||============================== //

const LocationRoutes = {
    path: '/locations',
    element: <Dashboard />,
    children: [
      {
        path: '',
        element: <Locations />
      },
      {
        path: ':id',
        element: <LocationDetailsLayout />
      },

      {
        path: ':id/post',
        element: <LocationsPost />
      },
      

    ]
  };
  
export default LocationRoutes;
