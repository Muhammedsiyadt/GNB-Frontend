import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, Descriptions, Alert } from 'antd';
import { AxiosInstance } from 'utils/AxiosInstance';
import { EnvironmentFilled, StarFilled } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { fetchPlace } from 'app/gmbSlice/placeSlice';
import { redirect, useLocation } from 'react-router';


const { Option } = AutoComplete;

const PlacesAutoComplete = ({ setPosition, setName }) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [placeId, setPlaceId] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const dispatch = useDispatch();
  const L_slice = useSelector((state) => state.getPlace)
  const location = useLocation();


  const handleSearch = async () => {
    if (!inputValue) return;

    const token = localStorage.getItem("token");
    const gmb_access_token = localStorage.getItem("gmb_refresh_token");
    setLoading(true);
    try {
      const response = await AxiosInstance.post(
        `gmb/search-location`,
        {
          input: inputValue,
          newAccessToken: gmb_access_token
        },
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const predictions = response.data.results.map((place) => ({
        value: place.name,
        placeId: place.place_id,
        details: place,
      }));
      if (Array.isArray(predictions) && predictions.length > 0) {
        setOptions(predictions);
        setDropdownOpen(true);
        setLoading(false);
      } else {
        setOptions([]);
        setDropdownOpen(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching places data:', error);
      setOptions([]);
      setLoading(false);
      setDropdownOpen(false);
    }
  };

  const handleSelect = async (value, option) => {
    const details = option.details;
    await dispatch(fetchPlace({ id: details?.place_id }));
    const latLng = [details?.geometry?.location?.lat, details?.geometry?.location?.lng];
    setPosition(latLng);
    setPlaceId(details?.place_id);
    setName(details.name);
  };



  const customOptions = options.map((option) => ({
    value: option.value,
    label: <>
      <div className=' d-flex align-items-center gap-1'>
        <EnvironmentFilled style={{ marginRight: 8 }} />
        <span>{option.value}</span>
      </div>
    </>,
    details: option.details,

  }));

  const handleClear = () => {
    setInputValue('');
    setOptions([]);
    setDropdownOpen(false);
    setSelectedPlaceDetails(null);
  }

  const checkPermission = async (selectedPlaceDetails) => {
    setLoading1(true);
    try {

      const gmbAccessToken = localStorage.getItem('gmb_access_token');
      const token = localStorage.getItem('token');
      const gmbAccountName = localStorage.getItem('gmb_account_name');
      const gmbAccountId = localStorage.getItem('gmb_account_id');

      if (!selectedPlaceDetails || !gmbAccountId) {
        return;
      }

      const response = await AxiosInstance.post('gmb/checkPermission', {
        placeId: placeId,
        gmbAccountId: gmbAccountId,
        gmbAccessToken: gmbAccessToken,
        gmbAccountName: gmbAccountName,
      }, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = response.data;

        if (data?.exist && data?.exist == true) {
          toast.warning(data?.message);
        }

        if (data?.exist == false && data.hasPermission) {
          setHasPermission(data.hasPermission)
          setLoading1(false);
          setSelectedPlaceDetails(null);
          setPosition([51.505, -0.09]);
          setInputValue(null);
          toast.success('Location was added successfully');
          redirect('/locations');
        } else {
          setMessage('You don\'t have permission to manage the location')
          toast.error(message);
          setHasPermission(data.hasPermission)
          setLoading1(false);
        }
      } else {
        setLoading1(false);
      }
    } catch (error) {
      setLoading1(false);
    }
  };

  useEffect(() => {
    // Effect to handle data once it's fetched
    if (L_slice.data && !L_slice.loading && !L_slice.error) {
      const { name, address, place_id, phone, website, rating } = L_slice.data;

      console.log(L_slice.data);


      // Check if any required values are missing
      if (name || address || place_id || phone || website || rating) {
        const selectedDetails1 = {
          name: name || 'N/A',
          formatted_address: address || 'N/A',
          place_id: place_id || 'N/A',
          formatted_phone_number: phone || 'N/A',
          website: website || 'N/A',
          rating: rating || 'N/A',
          placeId: placeId
        };

        setSelectedPlaceDetails(selectedDetails1);

        setName(name || 'N/A');
      } else {
        // Set selectedPlaceDetails to null if all values are missing
        setSelectedPlaceDetails(null);
        setName(null); // Optionally set name to null as well
      }
    } else if (L_slice.error) {
      // Optionally handle errors if necessary
      setSelectedPlaceDetails(null);
      setName(null);
    }
  }, [L_slice, L_slice.loading, L_slice.data, L_slice.error]);

  useEffect(() => {
    setSelectedPlaceDetails(null);
    setName(null);
    setInputValue('');
    setMessage(null);
    setPlaceId(null)
  },[location])


  return (
    <div>

      <div className="mb-4">
        {hasPermission == false && <Alert showIcon type="error" description={message} closable></Alert>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>


        <AutoComplete
          style={{ flexGrow: 1, marginRight: 8 }}
          options={customOptions}
          placeholder="Search Places"
          value={inputValue}
          onChange={(value) => {
            setInputValue(value);
            setDropdownOpen(false);
          }}
          open={dropdownOpen}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
          onSelect={handleSelect}
          size="large"
          allowClear="true"
          onClear={handleClear}
        />

        <Button type="primary" onClick={handleSearch} size="large" loading={loading}>
          Search
        </Button>
      </div>
      <div className="mt-4">
        {L_slice?.loading == true ? <><Skeleton /></> : <>
          {selectedPlaceDetails && (
            <Descriptions column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }} title="Place Details" bordered>
              <Descriptions.Item label="Name">{selectedPlaceDetails.name}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedPlaceDetails.formatted_address}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{selectedPlaceDetails.formatted_phone_number}</Descriptions.Item>
              <Descriptions.Item label="Rating">
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  {selectedPlaceDetails.rating} <StarFilled className='text-warning' />
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Website">
                <a href={selectedPlaceDetails.website} target='_blank'>{selectedPlaceDetails.website}</a>
              </Descriptions.Item>
            </Descriptions>
          )}
        </>}


        {L_slice?.loading == false && selectedPlaceDetails && (
          <div className="mt-4">
            <Button
              type="primary"
              size="large"
              className='fw-bold'
              onClick={() => checkPermission(selectedPlaceDetails)}
              loading={loading1}
            >
              Add Location
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlacesAutoComplete;
