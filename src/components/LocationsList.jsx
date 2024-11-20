import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, Input, Modal, Space, Spin, Table, Tag, theme } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLocations } from 'app/gmbSlice/locationsSlice';
import { Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { EyeFilled } from '@ant-design/icons';
const { Column, ColumnGroup } = Table;
import { PlusOutlined } from '@ant-design/icons';
import { saveKeywordToGMB } from 'app/keywordsSlice/keywordsSlice';
import { toast } from 'react-toastify';

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

    const showModal = (id) => {
        setIsModalOpen(true);
        setLocationId(id);
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
        console.log(newTags);
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
        console.log(tags);
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
        width:200,
        background: token.colorBgContainer,
        borderStyle: 'dashed',
        padding: '4px',
        textAlign:"center"
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

    return (
        <>
            {loading ? null : <Space className='mt-5'>
                <Button onClick={clearFilters}>Clear filters</Button>
                <Button onClick={clearAll}>Clear filters and sorters</Button>
            </Space>}
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
                    title="Add keywords"
                    key="Add keywords"
                    render={(_, record) => (
                        <Tooltip title="View Keywords For More Accurate Results" onClick={(e) => { showModal(record?.name) }}>
                            <Button type="primary" className='fw-bold' >
                                Add keywords
                            </Button>
                        </Tooltip>
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


            <Modal title="Add Keywords" width={600}  open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText={status === 'loading' ? <Spin /> : 'Save'}
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

        </>
    )
};
export default LocationsList;