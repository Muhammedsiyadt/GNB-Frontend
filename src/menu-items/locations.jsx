// assets
import { EnvironmentOutlined } from '@ant-design/icons';

// icons
const icons = {
    EnvironmentOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const locations = {
  id: 'group-dashboard',
  title: 'Main',
  type: 'group',
  children: [
    {
      id: 'locations',
      title: 'Locations',
      type: 'item',
      url: '/locations',
      icon: icons.EnvironmentOutlined,
      breadcrumbs: false
    }
  ]
};

export default locations;
