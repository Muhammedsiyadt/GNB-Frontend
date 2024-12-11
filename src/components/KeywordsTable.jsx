import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Tag, Tooltip, Spin } from 'antd';
import { DeleteFilled, ReloadOutlined } from "@ant-design/icons";
import { deleteKeyword } from 'app/keywordsDeleteSlice/keywordDeleteSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AxiosInstance } from 'utils/AxiosInstance';
import { useParams } from 'react-router';
import { fetchLocation } from 'app/gmbSlice/locationSlice';
import { fetchUserDetails } from 'app/authSlice/UserSlice';

function KeywordsTable({ keywords }) {

    let { id } = useParams();
    const { data } = useSelector((state) => state.getLocation);

    const [deleteKeywordId, setDeleteKeywordId] = useState(null);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const deleting = useSelector(state => state.keywordDelete.deleting);
    const [tableData, setTableData] = useState(Array.isArray(keywords) ? keywords : []);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [keywordRanks, setKeywordRanks] = useState({});

    const handleRemove = async (id) => {
        setDeleteKeywordId(id);
        setConfirmDeleteVisible(true);
    }


    const confirmRemove = async () => {
        try {
            await dispatch(deleteKeyword(deleteKeywordId));
            // Filter out the deleted keyword from the table data
            const updatedData = tableData.filter(item => item.id !== deleteKeywordId);
            setTableData(updatedData);
        } catch (error) {
            toast.error('Failed to delete keyword');
        } finally {
            setConfirmDeleteVisible(false);
        }
    };






    useEffect(() => {
        const fetchRank = async () => {
            try {
                if (keywords && keywords.length > 0) {
                    const token = localStorage.getItem('token');
                    const response = await AxiosInstance.post('gmb/fetchRank', { data }, {
                        headers: {
                            Authorization: `${token}`,
                        },
                    });

                    const baseUrl = data.locationData.website
                        ? data.locationData.website.split('/')[0] + '//' + data.locationData.website.split('/')[2]
                        : null;

                    const rankData = {};

                    response.data.local_results.forEach(result => {
                        if (baseUrl) {
                            const resultBaseUrl = result.links?.website
                                ? result.links.website.split('/')[0] + '//' + result.links.website.split('/')[2]
                                : null;

                                const matchingKeyword = (resultBaseUrl?.toLowerCase() || '') === (baseUrl?.toLowerCase() || '');


                            if (matchingKeyword) {
                                if (!rankData[result.originalKeyword]) {
                                    rankData[result.originalKeyword] = result.position;
                                }
                            }

                        }else{
                            return
                        }
                        // else {


                        //     keywords.forEach(keyword => {
                        //         const matchingKeyword = result.title.toLowerCase().includes(keyword.keyword.toLowerCase()) ||
                        //             keyword.keyword.toLowerCase().includes(result.title.toLowerCase());

                        //         const resultBaseUrl = (result.links?.website || '').split('/')[0] + '//' + (result.links?.website || '').split('/')[2];

                        //         if (matchingKeyword && resultBaseUrl.toLowerCase() === baseUrl.toLowerCase()) {

                        //             if (!rankData[keyword.keyword]) {
                        //                 rankData[keyword.keyword] = result.position;
                        //             }
                        //         }
                        //     });

                        // }

                        // console.log('RankData: ', rankData)

                    });

                    setKeywordRanks(rankData);

                    if (response?.data?.success) {
                        console.log('Rank data fetched successfully');
                    }
                }
            } catch (error) {
                console.error('Error fetching rank data', error);
                // toast.error('Failed to fetch rank data');
            }
        };

        fetchRank();
    }, [keywords, data]);



    // useEffect(() => {
    //   const fetchData = async () => {
    //     const key = 'digital marketing course in wayanad';
    //     const token = localStorage.getItem('token');

    //     try {
    //       const response = await AxiosInstance.post('gmb/fetchmapDetails', { key }, {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           'Content-Type': 'application/json'
    //         },
    //       });

    //       // Handle successful response
    //       console.log('Places Data:', response.data.places);

    //       // If you want to store or use the places data
    //       // setPlaces(response.data.places);
    //     } catch (error) {
    //       console.error('Map Details Fetch Error:', {
    //         message: error.response?.data?.error || error.message,
    //         status: error.response?.status
    //       });

    //       // Optional: Set an error state to show user-friendly message
    //       // setMapError('Could not fetch location details');
    //     }
    //   }; 

    //   fetchData();
    // }, []);





    const cancelRemove = () => {
        setDeleteKeywordId(null);
        setConfirmDeleteVisible(false);
    };

    async function updateRank() {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const requestData = {
                locationId: 'locations/' + id,
                lat: data?.locationData?.geometry?.location?.lat,
                lng: data?.locationData?.geometry?.location?.lng
            };

            const response = await AxiosInstance.post('gmb/updateRank', requestData, {
                headers: {
                    Authorization: `${token}`
                }
            });



            if (response?.data?.success === true) {
                dispatch(fetchLocation({ id }));
                dispatch(fetchUserDetails({ id }));
                toast.success('Keywords rank has been updated');
            }

        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    }

    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            render: (text, record, index) => <span>{index + 1}</span>,
        },
        {
            title: 'Keyword',
            dataIndex: 'keyword',
            key: 'keyword',
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            render: (text, record) => {
                const rank = keywordRanks[record.keyword] || keywordRanks[record.baseUrl] || 'Not Available';

                // Check if ranks are being fetched
                const isLoading = Object.keys(keywordRanks).length === 0;

                return isLoading ? <Spin size="small" /> : <Tag color="blue">{rank}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Button type="primary" onClick={() => handleRemove(record.id)} className='fw-bold' danger>
                    Delete
                </Button>
            ),
        },
    ];


    return (
        <div>
            <div className="mt-4 mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h1 className=' fw-semibold'>
                        <strong>Keywords</strong>
                    </h1>
                </div>
                <div>
                    <Tooltip title="Refresh the local rank data">
                        <Button type="primary" icon={<ReloadOutlined />} disabled={loading} onClick={updateRank} loading={loading} iconPosition="start">
                            Refresh Rank
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {data?.data?.last_rank_updated && <h4><strong>Last Updated: {data?.data?.last_rank_updated}</strong></h4>}

            <Table
                dataSource={tableData} // Use updated table data
                columns={columns}
                rowKey="id"
                pagination={false}
            />

            <Modal
                title="Confirm Delete"
                visible={confirmDeleteVisible}
                onOk={confirmRemove}
                onCancel={cancelRemove}
                okText="Delete"
                confirmLoading={deleting}
            >
                <p>Are you sure you want to delete this keyword?</p>
            </Modal>
        </div>
    );
}

export default KeywordsTable;
