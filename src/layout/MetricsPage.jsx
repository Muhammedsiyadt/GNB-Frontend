import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AxiosInstance } from 'utils/AxiosInstance';
import ClipLoader from 'react-spinners/ClipLoader'; // Import a spinner component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faGlobe, faEnvelope, faMapMarkerAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import './MetricsPage.css';

const MetricsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [web, setWeb] = useState('0');
  const [call, setCall] = useState('0');
  const [message, setMessage] = useState('0');
  const [direction, setDirection] = useState('0');
  const [booking, setBooking] = useState('0');

  const { id } = useParams();


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const gmbAccessToken = localStorage.getItem('gmb_access_token');

        if (!token || !gmbAccessToken) {
          throw new Error('Token or GMB Access Token is missing');
        }

        const response = await AxiosInstance.get(`/gmb/get-viewers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'GMB-Access-Token': gmbAccessToken,
          },
        });


        setUsers(response.data);
        const webData = response.data.multiDailyMetricTimeSeries[0].dailyMetricTimeSeries[0].timeSeries.datedValues.length

        const metrics = response.data.multiDailyMetricTimeSeries[0]?.dailyMetricTimeSeries || [];
        metrics.forEach((metric) => {
          if (metric.dailyMetric === 'CALL_CLICKS') {
            setCall(metric.timeSeries.datedValues.length);
          } else if (metric.dailyMetric === 'WEBSITE_CLICKS') {
            setWeb(metric.timeSeries.datedValues.length);
          }
        });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [id]);

  // console.log('Users :- ', users)

 

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color="#007bff" loading={loading} size={50} />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="metrics-page text-center">
      <h1 className="text-start"><b>METRICS</b></h1>
      <div className="metrics-container">
        <MetricCard title="Website Visits" value={web} icon={faGlobe} />
        <MetricCard title="Call Clicks" value={call} icon={faPhone} />
        <MetricCard title="Direction Requests" value={direction} icon={faMapMarkerAlt} />
        <MetricCard title="Bookings" value={booking} icon={faCalendarAlt} />
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon }) => (
  <div className="metric-card p-2">
    <h2 className="text-uppercase">
      <FontAwesomeIcon icon={icon} className="me-2" /> {title}
    </h2>
    <b>{value}</b>
  </div>
);

export default MetricsPage;
