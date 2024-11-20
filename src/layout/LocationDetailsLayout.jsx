import React, { useEffect, useState } from 'react';
import { DashboardOutlined, FileImageOutlined, GoldOutlined, MessageOutlined, PieChartOutlined, UnorderedListOutlined, WarningOutlined } from '@ant-design/icons';
import { Layout, Menu, Skeleton, theme } from 'antd';
import LocationDetails from 'pages/Locations/LocationDetails';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { fetchLocation } from 'app/gmbSlice/locationSlice';
import LocationMedia from 'pages/Locations/LocationMedia';
import Keywords from 'pages/Locations/Keywords';
import Reviews from 'pages/Locations/Reviews';
import DangerZone from 'components/DangerZone';
import MetricsPage from './MetricsPage';
import PostSchedule from 'components/PostSchedule';
const { Content, Sider } = Layout;

const items2 = [
    {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard'
    },
    {
        key: 'Metrics',
        icon: <PieChartOutlined />,
        label: 'Metrics'
    },
    {
        key: 'media',
        icon: <FileImageOutlined />,
        label: 'Media'
    },
    {
        key: 'posts',
        icon: <GoldOutlined />,
        label: 'Posts'
    },
    {
        key: 'keywords',
        icon: <UnorderedListOutlined />,
        label: 'Keywords'
    },
    {
        key: 'reviews',
        icon: <MessageOutlined />,
        label: 'Reviews'
    },
    {
        key: 'Schedule Posts',
        icon: <GoldOutlined />,
        label: 'Schedule Posts'
    },
    {
        key: 'danger-zone',
        icon: <WarningOutlined />,
        label: 'Danger Zone'
    }
];

const LocationDetailsLayout = () => {
    let { id } = useParams();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [count, setCount] = useState(1)

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const { loading, error, data } = useSelector((state) => state.getLocation)

    function handleMenuChange(event) {
        setActiveTab(event.key);
    }



    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchLocation({ id: id }));
    }, [count])

    const navigate = useNavigate();

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <LocationDetails />;
            case 'Metrics':
                return <MetricsPage />;
            case 'media':
                return <LocationMedia />;
            case 'posts':
                return navigate(`/${data?.data?.name}/post`);
            case 'keywords':
                return <Keywords />;
            case 'reviews':
                return <Reviews count={count} setActiveTab={setActiveTab} setCount={setCount} />;
            case 'Schedule Posts':
                return <PostSchedule id={id} /> 
            case 'danger-zone':
                return <DangerZone id={id} />;
            default:
                return null;
        }
    };

    return (
        <>

            {loading ? <div className="mt-4"><Skeleton /></div> : <>
                <Layout>
                    <Content>
                        <Layout
                            style={{
                                paddingTop: '24px',
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            <Sider
                                style={{ overflow: 'auto', position: 'sticky', left: 0, top: 0, bottom: 0 }}
                                breakpoint="lg"
                                collapsedWidth="0"

                            >
                                <Menu
                                    onClick={handleMenuChange}
                                    mode="inline"
                                    defaultSelectedKeys={[activeTab]}
                                    defaultOpenKeys={[activeTab]}
                                    style={{
                                        height: '100%',
                                        fontSize: "15px"
                                    }}
                                    items={items2}
                                    className='mb-5'
                                />
                            </Sider>
                            <Content
                            >
                                {renderContent()}
                            </Content>
                        </Layout>
                    </Content>
                </Layout>
            </>}



        </>
    );
};
export default LocationDetailsLayout;