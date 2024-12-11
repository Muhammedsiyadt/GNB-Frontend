// material-ui
import { Breadcrumbs, Grid, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Button } from 'antd';
import LocationsList from 'components/LocationsList';

// project import
import MainCard from 'components/MainCard';
import { Link } from 'react-router-dom';

// ==============================|| SAMPLE PAGE ||============================== //

export default function Locations() {
  return (
    <>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Typography variant="h3">GMB Locations</Typography>
          </div>
          <div>
            <Link to={'/add/locations'} className=' text-white text-decoration-none'>
              <Tooltip title="Add New Location">
                <Button type="primary" className='fw-bold' size='large'>
                  Add Location
                </Button>
              </Tooltip>
            </Link>
          </div>
        </div>
        <LocationsList />
      </Grid>
    </>
  );
}
