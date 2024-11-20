import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Tag, Tooltip, Badge } from 'antd';
import { DeleteFilled, ReloadOutlined } from "@ant-design/icons"
import { deleteKeyword } from 'app/keywordsDeleteSlice/keywordDeleteSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AxiosInstance } from 'utils/AxiosInstance';
import { useParams } from 'react-router';
import { fetchLocation } from 'app/gmbSlice/locationSlice';
import { fetchUserDetails } from 'app/authSlice/UserSlice';


function KeywordsTable({ keywords }) {

    let { id } = useParams();
    const { data } = useSelector((state) => state.getLocation)

    const [deleteKeywordId, setDeleteKeywordId] = useState(null);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [tableData, setTableData] = useState(Array.isArray(keywords) ? keywords : []);
    const dispatch = useDispatch();
    const keywords1 = useSelector(state => state.keywordDelete.keywords);
    const deleting = useSelector(state => state.keywordDelete.deleting);
    const error = useSelector(state => state.keywordDelete.error);
    const success = useSelector(state => state.keywordDelete.success);
    const [loading, setLoading] = useState(false);


    const lat = data?.locationData?.geometry?.location?.lat;
    const lng = data?.locationData?.geometry?.location?.lng;
    const name = data?.locationData?.name || 'N/A';


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
        if (success == true) {
            toast.success('Keyword deleted successfully');
        }
    }, [success]); // Added success dependency for useEffect

    const cancelRemove = () => {
        setDeleteKeywordId(null);
        setConfirmDeleteVisible(false);
    };

    async function updateRank() {
        setLoading(true);
        try {

            let token = localStorage.getItem('token');


            const requestData = {
                locationId: 'locations/' + id,
                lat: lat,
                lng: lng
            };

            const response = await AxiosInstance.post('gmb/updateRank', requestData, {
                headers: {
                    Authorization: `${token}`
                }
            });

             if(response?.data?.success == true){
                dispatch(fetchLocation({ id: id }));
                dispatch(fetchUserDetails({ id: id }));
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
            render: (text, record, index) => (
                <span>{index + 1}</span>
            ),
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
            render: (text, record) => (
                text == null ? 'Empty' : <Tag color="blue">{text}</Tag>
            ),
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

            {data?.data?.last_rank_updated && <h4>
                <strong>
                    Last Updated: {data?.data?.last_rank_updated }
                </strong>
            </h4>}



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
                okText="Save"
                confirmLoading={deleting}
            >
                <p>Are you sure you want to delete this keyword?</p>
            </Modal>





        </div>
    )
}

export default KeywordsTable;
