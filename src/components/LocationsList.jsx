import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, Input, Modal, Space, Spin, Table, Tag, theme, message, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLocations } from 'app/gmbSlice/locationsSlice';
import { Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { EyeFilled } from '@ant-design/icons';
const { Column, ColumnGroup } = Table;
import { PlusOutlined } from '@ant-design/icons';
import { saveKeywordToGMB } from 'app/keywordsSlice/keywordsSlice';
import { toast } from 'react-toastify';
import { AxiosInstance } from 'utils/AxiosInstance';

const { Option } = Select;

const tagInputStyle = {
    width: 200,
    height: 30,
    marginInlineEnd: 8,
    verticalAlign: 'top',
};


function LocationsList() {

    const { token } = theme.useToken();

    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [isModalTwoOpen, setIsModalTwoOpen] = useState(false)
    const [keywordsData, setKeywordsData] = useState([]);

    const [locationKeywordCounts, setLocationKeywordCounts] = useState([]);



    const { loading, error, data } = useSelector((state) => state.getLocations);

    const status = useSelector((state) => state.keywords.status);
    const error1 = useSelector((state) => state.keywords.error);

    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [locationId, setLocationId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState('');
    const inputRef = useRef(null);
    const editInputRef = useRef(null);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    


    const handleSortChange = (value) => {
        setSortedInfo({ order: value === 'asc' ? 'ascend' : 'descend', columnKey: 'title' });
    
        const sortedData = [...data].sort((a, b) => {
            if (value === 'asc') {
                return a.title.localeCompare(b.title);
            } else if(value === 'desc'){
                return b.title.localeCompare(a.title);
            }else{
                return setSortedInfo({})
            }
        });
    
        setData(sortedData);
    };
    

    const showModalOne = (id) => {
        setIsModalOpen(true);
        setLocationId(id);
    };

    const showModalTwo = (fullId) => {
        const id = fullId.split('/').pop();

        const fetchKeywords = async () => {
            try {
                const token = localStorage.getItem('token');
                const gmbAccessToken = localStorage.getItem('gmb_access_token');

                const response = await AxiosInstance.get(`/gmb/get-keywords/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'GMB-Access-Token': gmbAccessToken,
                    },
                });
                setKeywordsData(response.data[0]);
                setIsModalTwoOpen(true);
            } catch (error) {
                console.error('Error fetching keywords:', error);
            }
        };

        fetchKeywords();
    };





    const handleOk = (e) => {
        e.preventDefault();
        dispatch(saveKeywordToGMB({ locationId, tags }));
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };


    useEffect(() => {
        dispatch(fetchLocations());
    }, [])

    useEffect(() => {
        if (status == "succeeded") {
            setTags([]);
            setIsModalOpen(false);
            toast.success('Keyword has been successfully added');
        }
    }, [status])


    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);

    useEffect(() => {
        editInputRef.current?.focus();
    }, [editInputValue]);

    const handleClose = (removedTag) => {
        const newTags = tags.filter((tag) => tag !== removedTag);
        // console.log(newTags);
        setTags(newTags);
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
        // console.log(tags);
    };

    const handleEditInputChange = (e) => {
        setEditInputValue(e.target.value);
    };

    const handleEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;
        setTags(newTags);
        setEditInputIndex(-1);
        setEditInputValue('');
    };

    const tagPlusStyle = {
        height: 30,
        width: 200,
        background: token.colorBgContainer,
        borderStyle: 'dashed',
        padding: '4px',
        textAlign: "center"
    };

    const clearFilters = () => {
        setFilteredInfo({});
    };

    const clearAll = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    // EDIT KEYWORD AND UPDATE IN BACKEND -----------------------------------------------------------------------------------------------
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [newKeyword, setNewKeyword] = useState('');

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setNewKeyword(record.keyword);
        setIsEditModalOpen(true);
    };

    const handleSubmitEdit = async () => {
        try {
            const updatedData = { ...currentRecord, keyword: newKeyword };
            const response = await AxiosInstance.put(`/gmb/editKeywords/${currentRecord.keyword}`, updatedData);
            message.success('Keyword edited successfully');
            setIsModalTwoOpen(false)

            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating keyword:', error.response?.data || error.message);
        }
    };

    // DELETE KEYWORD AND DELETING IN DB FROM THE BACKEND
    const handleDelete = (record) => {
        const itemId = record.id;


        Modal.confirm({
            title: 'Are you sure you want to delete this keyword?',
            content: `This action will permanently delete the keyword: ${record.keyword}`,
            okText: 'Yes, Delete',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const response = await AxiosInstance.delete(`/gmb/deleteKeywords/${itemId}`);

                    if (response.status === 200) {
                        message.success(response.data.message || 'Keyword deleted successfully');
                        setIsModalTwoOpen(false);
                    }
                } catch (error) {
                    const errorMsg = error.response?.data?.message || 'An error occurred while deleting the keyword';
                    message.error(errorMsg);
                }
            },
            onCancel: () => { }
        });
    };

    // KEYWORD COUNT

    useEffect(() => {
        const fetchKeywordCounts = async () => {
            try {
                const response = await AxiosInstance.get('/gmb/get-all-keywords-count');

                setLocationKeywordCounts(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching keyword counts:', error);

                setLocationKeywordCounts([]);
            }
        };

        fetchKeywordCounts();
    }, []);
    // ---------------------------------------------------------------------------------------------------------------------------




    return (
        <>
            {/* {loading ? null : <Space className='mt-5'>
                <Button onClick={clearFilters}>Clear filters</Button>
                <Button onClick={clearAll}>Clear filters and sorters</Button>
            </Space>} */}

            <Select
                style={{ width: 150 }}
                placeholder="Sort"
                onChange={(value) => {
                    handleSortChange(value); // Call a function to handle sorting
                }}
            >
                <Option value="asc">A to Z</Option>
                <Option value="desc">Z to A</Option>
                <Option value="cancel">Cancel</Option>
            </Select>

            {loading ? <Spin>
                <Table dataSource={data} size="large" className='mt-5' bordered>

                    <Column title="Locations" dataIndex="title" key="title" render={(_, record) => (
                        <h2 fontWeight="bolder">{record.title}</h2>
                    )} />
                    <Column title="Address" dataIndex="Address" key="address" />
                    <Column title="Categories" dataIndex="categories" key="categories" />

                </Table>
            </Spin> : <Table dataSource={data} pagination={{ pageSize: 5 }} onChange={handleChange} style={{ marginTop: "30px" }} bordered>
                <Column
                    title="Locations"
                    dataIndex="title"
                    key="title"
                    sorter={(a, b) => a.title.localeCompare(b.title)}
                    sortOrder={sortedInfo.columnKey === 'title' ? sortedInfo.order : null}

                    render={(_, record) => (
                        <span>
                            <Link to={`/${record.name}`} className=' text-decoration-none fw-medium fs-3'>{record.title}</Link>
                        </span>
                    )}
                />

                <Column
                    title="Address"
                    dataIndex="Address"
                    key="address"
                    sorter={(a, b) => (a.Address || "").localeCompare(b.Address || "")}
                    sortOrder={sortedInfo.columnKey === 'address' ? sortedInfo.order : null}
                    render={(_, record) => (
                        <Space size="middle">
                            {record.storefrontAddress ? <span className=' text-decoration-none fw-medium fs-4'>{record?.storefrontAddress?.addressLines}</span> : "N/A"}
                        </Space>
                    )}
                />

                <Column
                    title="Categories"
                    dataIndex="categories"
                    key="categories"
                    render={(_, record) => (
                        <span className=' text-decoration-none fw-medium fs-4'>
                            {record?.categories?.additionalCategories ? record?.categories?.additionalCategories.length : 0}
                        </span>
                    )}
                    onFilter={(value, record) => record?.categories?.additionalCategories?.some(category => category?.displayName === value)}
                />

                <Column
                    title="Keywords"
                    key="Add keywords"
                    render={(_, record) => (

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Tooltip title="View All Keywords">
                                <Button
                                    type="primary"
                                    onClick={(e) => {
                                        showModalTwo(record?.name);
                                    }}
                                >
                                    Keywords ({(() => {
                                        if (locationKeywordCounts && locationKeywordCounts.length > 0) {
                                            const data = locationKeywordCounts[0].filter((item) => item.location_id == record.name);
                                            return data.length > 0 ? data[0].keyword_count : 0;
                                        }
                                        return 0;
                                    })()})
                                </Button>
                            </Tooltip>
                            <Tooltip title="Add New Keyword">
                                <Button
                                    type="primary"
                                    className="fw-bold"
                                    onClick={(e) => {
                                        showModalOne(record?.name);
                                    }}
                                >
                                    Add
                                </Button>
                            </Tooltip>
                        </div>
                    )}
                />



                <Column
                    title="Manage Posts"
                    key="Posts"
                    render={(_, record) => (
                        <Link to={`/${record.name}/post`}>
                            <Tooltip title="Manage Posts">
                                <Button type="primary" className='fw-bold'>
                                    Manage Posts
                                </Button>
                            </Tooltip>
                        </Link>
                    )}
                />


            </Table>}


            <Modal title="Add Keywords" width={600} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText={status === 'loading' ? <Spin /> : 'Save'}
                okButtonProps={{ disabled: status === 'loading' }}>

                <Flex gap="4px 0" style={{ marginTop: "20px" }} wrap>
                    {tags.map((tag, index) => {
                        if (editInputIndex === index) {
                            return (
                                <Input
                                    ref={editInputRef}
                                    key={tag}
                                    size="large "
                                    style={tagInputStyle}
                                    value={editInputValue}
                                    onChange={handleEditInputChange}
                                    onBlur={handleEditInputConfirm}
                                    onPressEnter={handleEditInputConfirm}
                                />
                            );
                        }
                        const isLongTag = tag.length > 20;
                        const tagElem = (
                            <Tag

                                key={tag}
                                style={{ userSelect: 'none' }}
                                onClose={() => handleClose(tag)}
                                className='px-5 py-1'
                            >
                                <span
                                    onDoubleClick={(e) => {
                                        if (index !== 0) {
                                            setEditInputIndex(index);
                                            setEditInputValue(tag);
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                </span>
                            </Tag>
                        );
                        return isLongTag ? (
                            <Tooltip title={tag} key={tag}>
                                {tagElem}
                            </Tooltip>
                        ) : (
                            tagElem
                        );
                    })}
                    {inputVisible ? (
                        <Input
                            ref={inputRef}
                            type="text"
                            size="small"
                            style={tagInputStyle}
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputConfirm}
                            onPressEnter={handleInputConfirm}
                        />
                    ) : (
                        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
                            New Keyword
                        </Tag>
                    )}
                </Flex>

            </Modal>


            <Modal
                title={
                    <div style={{ backgroundColor: '#1890ff', color: '#fff', borderRadius: '8px 8px 0 0', textAlign: 'center', marginTop: '5px', padding: '4px' }}>
                        All Keywords
                    </div>
                }
                visible={isModalTwoOpen}
                onCancel={() => setIsModalTwoOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsModalTwoOpen(false)}
                        style={{
                            backgroundColor: 'black',
                            borderColor: 'white',
                            color: 'white',
                            borderRadius: '5px',
                            padding: '10px 20px',
                            fontWeight: 'bold',
                        }}
                    >
                        Close
                    </Button>,
                ]}
                width={800}
                closable={false}

            >
                <Table
                    dataSource={keywordsData}
                    columns={[
                        {
                            title: 'ID',
                            key: 'id',
                            render: (text, record, index) => index + 1,
                        },
                        {
                            title: 'Keyword',
                            dataIndex: 'keyword',
                            key: 'keyword',
                            sorter: (a, b) => a.keyword.localeCompare(b.keyword),
                        },
                        {
                            title: 'Actions',
                            key: 'actions',
                            render: (text, record) => (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button
                                        type="primary"
                                        onClick={() => handleEdit(record)} // Function to handle edit logic
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        type="danger"
                                        style={{ background: 'red', color: 'white' }}
                                        onClick={() => handleDelete(record)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ),
                        }
                        ,
                    ]}

                    rowKey={(record, index) => index}
                    pagination={{ pageSize: 10 }}
                    style={{ borderRadius: '8px', overflow: 'hidden' }}
                    bordered
                    size="middle"
                />
            </Modal>


            <Modal
                title="Edit Keyword"
                visible={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={handleSubmitEdit} // Submit the edit
                okText="Save"
                cancelText="Cancel"
            >
                <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)} // Update keyword in state
                    placeholder="Enter new keyword"
                />
            </Modal>




        </>
    )
};
export default LocationsList;