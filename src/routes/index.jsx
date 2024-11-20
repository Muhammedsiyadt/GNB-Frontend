import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import LocationRoutes from './LocationRoutes';
import AddRoutes from './AddRoutes';
import NotFoundRoutes from './NotFoundRoute';
import GridRoutes from './GridRoutes';
import ReviewRoutes from './ReviewRoute';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, LoginRoutes, LocationRoutes, AddRoutes,NotFoundRoutes, GridRoutes, ReviewRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME, });

export default router;
