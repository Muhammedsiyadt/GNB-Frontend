import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Select, Form as AntForm, message, Spin, Skeleton } from 'antd';
import React, { useEffect } from 'react';
import { Formik, Field, Form } from 'formik';
import { Helmet } from 'react-helmet';
import { LayerGroup, LayersControl, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import * as Yup from 'yup';
import 'leaflet/dist/leaflet.css';
import { fetchLocations } from 'app/gmbSlice/locationsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGridData } from 'app/gridSlice/gridSlice';


const validationSchema = Yup.object().shape({
  business: Yup.string().required('Please select a business'),
  searchTerm: Yup.string().required('Please enter a search term'),
  mapSize: Yup.string().required('Please select a map size'),
});

function Index() {
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state) => state.getLocations);
  const loading2 = useSelector((state) => state.grid.loading);
  const error2 = useSelector((state) => state.grid.error);
  const status = useSelector((state) => state.grid.status);
  const gridData = useSelector((state) => state.grid.gridData);

  const handleSubmit = (values) => {

    const formatedValues = {
      keyword: values.searchTerm,
      placeid: values.business,
      grid: values.mapSize,
    }
    dispatch(fetchGridData(formatedValues));
  };




  useEffect(() => {
    dispatch(fetchLocations());
  }, [])

  useEffect(() => {
    if (status === 'error') {
      message.error('Something went wrong while fetching rankings');
    }
  }, [error2, status])


  const getColor = (rank) => {
    if (rank === 1) {
      return '#17a527'; // Green for ranking of 1
    } else if (rank >= 2 && rank <= 11) {
      return '#E3BE4F'; // Yellow for ranking between 2 and 11
    } else if (rank >= 12 && rank <= 19) {
      return '#E57800'; // Orange for ranking between 12 and 19
    } else if (rank === 20 || rank === '?') {
      return '#C71B08'; // Red for ranking of 20 or placeholder
    } else {
      return '#C71B08'; // Default to red for any other cases
    }
  };

  const createCustomIcon = (rank) => {
    const color = getColor(rank);
    return L.divIcon({
      className: 'custom-icon',
      html: `<div class="icon_round" style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;  font-size: 13px ;font-weight: bold;">${rank}</div>`
    });
  };



  return (
    <div>
      <Helmet>
        <title>{import.meta.env.VITE_APP_NAME} | Run A Scan</title>
      </Helmet>

      {loading ? <Skeleton className='mt-5'></Skeleton> : <>
        <Formik
          initialValues={{ business: '', searchTerm: '', mapSize: '3x3' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            handleChange,
            handleBlur,
            setFieldValue,
            setFieldTouched,
            errors,
            touched,
            handleSubmit
          }) => (
            <AntForm className="row align-items-center" onFinish={handleSubmit}>
              <div className="col-md-4">
                <AntForm.Item
                  validateStatus={errors.business && touched.business ? 'error' : ''}
                  help={errors.business && touched.business ? errors.business : ''}
                >
                  <span>Select a business</span>
                  <Select
                    size="large"
                    className="w-100 mt-2"
                    value={values.business}
                    onChange={(value) => {
                      setFieldValue('business', value);
                      setFieldTouched('business', true);
                    }}
                    onBlur={() => setFieldTouched('business', true)}
                    onFocus={() => setFieldTouched('business', true)}
                    placeholder="Select a business"
                  >
                    <Option value="">Select a business</Option>
                    {data && data.map((e, key) => {
                      return <Option key={key} value={e.location_id}>{e.title}</Option>
                    })}
                  </Select>
                </AntForm.Item>
              </div>

              <div className="col-md-3">
                <AntForm.Item
                  validateStatus={errors.searchTerm && touched.searchTerm ? 'error' : ''}
                  help={errors.searchTerm && touched.searchTerm ? errors.searchTerm : ''}
                >
                  <span>Search term</span>
                  <Input
                    type="text"
                    size="large"
                    className="mt-2 w-100"
                    placeholder="Please enter a search term"
                    name="searchTerm"
                    value={values.searchTerm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </AntForm.Item>
              </div>

              <div className="col-md-2">
                <AntForm.Item
                  validateStatus={errors.mapSize && touched.mapSize ? 'error' : ''}
                  help={errors.mapSize && touched.mapSize ? errors.mapSize : ''}
                >
                  <span>Map size</span>
                  <Select
                    size="large"
                    className="w-100 mt-2"
                    value={values.mapSize}
                    onChange={(value) => {
                      setFieldValue('mapSize', value);
                      setFieldTouched('mapSize', true);
                    }}
                    onBlur={() => setFieldTouched('mapSize', true)}
                    onFocus={() => setFieldTouched('mapSize', true)}
                    defaultValue="3"
                    allowClear
                  >
                    <Option value="3">3x3</Option>
                    <Option value="5">5x5</Option>
                    <Option value="7">7x7</Option>
                    <Option value="9">9x9</Option>
                    <Option value="13">13x13</Option>
                  </Select>
                </AntForm.Item>
              </div>

              <div className="col-md-3">
                <Button
                  size="large"
                  type="primary"
                  className="mt-1"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  loading={loading2}
                >
                  Search
                </Button>
              </div>
            </AntForm>
          )}
        </Formik>

        <div className="mt-4">
          <Spin spinning={loading2} tip="Loading map">
            {gridData !== null ? <>

              <MapContainer key={gridData.location.lat} center={[gridData?.location?.lat, gridData?.location?.lng]} zoom={16} scrollWheelZoom={false} style={{ minHeight: "70vh" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LayersControl position="topright">
                  <LayersControl.Overlay checked name="Layer group with circles">
                    <LayerGroup>
                      {gridData?.grid?.map((ranking, index) => (
                        <Marker
                          key={index}
                          position={[ranking?.center?.lat, ranking?.center?.lng]}
                          icon={createCustomIcon(ranking.rank)}
                        />
                      ))}
                    </LayerGroup>
                  </LayersControl.Overlay>

                </LayersControl>
              </MapContainer>

            </> : <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ minHeight: "70vh" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </MapContainer>}
          </Spin>
        </div>
      </>}

    </div>
  )
}

export default Index