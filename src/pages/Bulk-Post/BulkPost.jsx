import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, message, Card, Row, Col, Popconfirm, Spin, Alert } from 'antd';
import { CloudUploadOutlined, DeleteOutlined, PlusOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { AxiosInstance } from 'utils/AxiosInstance';
import AiBulk from './AiBulk';

const { TextArea } = Input;
const { Option } = Select;

const CALL_TO_ACTION_OPTIONS = [
    { value: 'none', label: 'No call to action' },
    { value: 'book-a-visit', label: 'Book a visit' },
    { value: 'call', label: 'Call' },
    { value: 'read-more', label: 'Read more' },
    { value: 'place-an-order', label: 'Place an order' },
    { value: 'shop', label: 'Shop' },
    { value: 'sign-up', label: 'Sign up' }
];

const MultiPostForm = ({ selectedLocation }) => {
    const [form] = Form.useForm();
    const [posts, setPosts] = useState([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [callToAction, setCallToAction] = useState('');
    const [desc, setDesc] = useState('');

    // Handle Image Upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];

        // Validate file type and size
        const isImage = file.type.startsWith('image/');
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }

        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return false;
        }

        // Create image preview
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImagePreview(reader.result);
        });
        reader.readAsDataURL(file);

        // Attach image file to form's field value
        form.setFieldsValue({ image: file });
        return true;
    };

    // Add Post to Array
    const addPost = (values) => {
        // Validate location
        if (!selectedLocation) {
            message.error('Please select a location first');
            return;
        }

        // Validate form
        form.validateFields().then(() => {
            const newPost = {
                ...values,
                id: Date.now(), // Unique identifier
                location: selectedLocation
            };

            const updatedPosts = [...posts, newPost];
            setPosts(updatedPosts);

            // Reset form and preview
            form.resetFields();
            setImagePreview(null);
            setCallToAction('');
            setDesc('');

            // Move to the last post
            setCurrentPostIndex(updatedPosts.length - 1);

            message.success('Post added successfully!');
        }).catch(errorInfo => {
            message.error('Please fill in all required fields');
        });
    };

    // Remove Post
    const removePost = (id) => {
        const updatedPosts = posts.filter(post => post.id !== id);
        setPosts(updatedPosts);

        // Adjust current index if needed
        if (currentPostIndex >= updatedPosts.length) {
            setCurrentPostIndex(updatedPosts.length - 1);
        }
    };

    // Submit All Posts
    const submitAllPosts = async () => {
        if (posts.length === 0) {
            message.error('No posts to submit');
            return;
        }

        // Add a check to limit posts to 4
        if (posts.length > 4) {
            message.error('You can only submit up to 4 posts at a time');
            return;
        }

        setLoading(true);
        const successfulPosts = [];
        const failedPosts = [];

        // Use Promise.all for parallel submission
        const postResults = await Promise.all(
            posts.map(async (post) => {
                try {
                    const formData = new FormData();
                    formData.append('avatar', post.image);
                    formData.append('description', post.description);
                    formData.append('callToAction', post.callToAction || 'none');
                    formData.append('account', localStorage.getItem('gmb_account_name'));
                    formData.append('location', post.location.location_id);
                    formData.append('accessToken', localStorage.getItem('gmb_access_token'));

                    // Conditionally append additional action details
                    if (post.callToAction === 'call' && post.phoneNumber) {
                        formData.append('phoneNumber', post.phoneNumber);
                    } else if (post.callToAction !== 'none' && post.callToAction !== 'call' && post.actionLink) {
                        formData.append('actionLink', post.actionLink);
                    }

                    const response = await AxiosInstance.post('/gmb/create-bulk-posts', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    return { post, success: true, response };
                } catch (error) {
                    console.error('Post Creation Error:', error);
                    return { post, success: false, error };
                }
            })
        );

        // Separate successful and failed posts
        postResults.forEach(result => {
            if (result.success) {
                successfulPosts.push(result.post);
            } else {
                failedPosts.push(result.post);
            }
        });

        // Provide summary of submission
        if (successfulPosts.length > 0) {
            message.success(`${successfulPosts.length} post(s) submitted successfully!`);
        }
        if (failedPosts.length > 0) {
            message.error(`${failedPosts.length} post(s) failed to submit`);
        }

        // Reset state after submission
        setPosts([]);
        setCurrentPostIndex(0);
        setLoading(false);
    };

    // Navigation between posts
    const goToPreviousPost = () => {
        if (currentPostIndex > 0) {
            setCurrentPostIndex(currentPostIndex - 1);
        }
    };

    const goToNextPost = () => {
        if (currentPostIndex < posts.length - 1) {
            setCurrentPostIndex(currentPostIndex + 1);
        }
    };

    return (
        <div>
            <Row gutter={16}>
                <Col span={12}>
                    <Card title={`Create Post ${posts.length > 0 ? `(${currentPostIndex + 1}/${posts.length})` : ''}`}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={addPost}
                        >
                            {/* Image Upload */}
                            <Form.Item
                                name="image"
                                label="Upload Image"
                                rules={[{ required: true, message: 'Please upload an image' }]}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'block' }}
                                />
                                <p className="ant-form-text">
                                    Recommended size: 1200 x 900 pixels (4:3 aspect ratio)
                                </p>
                            </Form.Item>

                            {/* Description */}
                            <Form.Item
                                name="description"
                                label="Post Description"
                                rules={[{ required: true, message: 'Please enter a description' }]}
                            >
                                <TextArea
                                    rows={4}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="Write your post content"
                                />
                            </Form.Item>

                            {/* Call to Action */}
                            <Form.Item
                                name="callToAction"
                                label="Call to Action (optional)"
                            >
                                <Select
                                    placeholder="Select call to action"
                                    onChange={(value) => {
                                        setCallToAction(value);
                                        form.setFieldsValue({ phoneNumber: undefined, actionLink: undefined });
                                    }}
                                >
                                    {CALL_TO_ACTION_OPTIONS.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Phone Number for Call Action */}
                            {callToAction === 'call' && (
                                <Form.Item
                                    name="phoneNumber"
                                    label="Phone Number"
                                    rules={[{ required: true, message: 'Please enter a phone number' }]}
                                >
                                    <Input placeholder="Enter phone number" type="tel" />
                                </Form.Item>
                            )}

                            {/* Action Link for Other Actions */}
                            {callToAction && callToAction !== 'none' && callToAction !== 'call' && (
                                <Form.Item
                                    name="actionLink"
                                    label="Action Link"
                                    rules={[{ required: true, message: 'Please paste your link' }]}
                                >
                                    <Input placeholder="Paste your link here" type="url" />
                                </Form.Item>
                            )}

                            {/* Action Buttons */}
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<PlusOutlined />}
                                    disabled={!selectedLocation}
                                >
                                    Add Post
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Post Preview */}
                <Col span={12}>
                    <Card title="Post Preview">
                        {imagePreview ? (
                            <div>
                                <img
                                    src={imagePreview}
                                    alt="Post Preview"
                                    style={{ maxWidth: '50%', marginBottom: 16, borderRadius: 8 }}
                                />
                                <p className='text-danger'>Description <strong className='text-black'><br />{desc}</strong></p>
                            </div>
                        ) : (
                            <div>
                                <p className='text-danger'>Upload an image to see the full preview</p>
                                <p className='text-danger'>Description <strong className='text-black'><br />{desc}</strong></p>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Posts List and Navigation */}
            {posts.length > 0 && (
                <Card className="mt-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={goToPreviousPost}
                            disabled={currentPostIndex === 0}
                        >
                            Previous
                        </Button>

                        <div>
                            {posts.map((post, index) => (
                                <Popconfirm
                                    key={post.id}
                                    title="Remove this post?"
                                    onConfirm={() => removePost(post.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type={currentPostIndex === index ? 'primary' : 'default'}
                                        style={{ margin: '0 4px' }}
                                        icon={<DeleteOutlined />}
                                    >
                                        Post {index + 1}
                                    </Button>
                                </Popconfirm>
                            ))}
                        </div>

                        <Button
                            icon={<ArrowRightOutlined />}
                            onClick={goToNextPost}
                            disabled={currentPostIndex === posts.length - 1}
                        >
                            Next
                        </Button>
                    </div>

                    {/* Current Post Details */}
                    {posts.length > 0 && (
                        <div
                            className="post-container d-flex"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '20px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px'
                            }}
                        >
                            {/* Post Details Section */}
                            <div
                                className="post-details"
                                style={{
                                    flex: '1 1 70%',
                                    maxWidth: '70%'
                                }}
                            >
                                <h2
                                    className="post-title"
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        marginBottom: '16px'
                                    }}
                                >
                                    Post Details
                                </h2>

                                <p
                                    className="post-description"
                                    style={{
                                        fontSize: '16px',
                                        color: '#333',
                                        marginBottom: '12px'
                                    }}
                                >
                                    <strong>Description:</strong> {posts[currentPostIndex].description}
                                </p>

                                <p
                                    className="post-action"
                                    style={{
                                        fontSize: '16px',
                                        color: '#333',
                                        marginBottom: '12px'
                                    }}
                                >
                                    <strong>Call to Action:</strong> {posts[currentPostIndex].callToAction || 'None'}
                                </p>

                                {posts[currentPostIndex].callToAction === 'call' && (
                                    <p
                                        className="post-phone"
                                        style={{
                                            fontSize: '16px',
                                            color: '#333',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        <strong>Phone Number:</strong> {posts[currentPostIndex].phoneNumber}
                                    </p>
                                )}

                                {posts[currentPostIndex].callToAction !== 'none' && posts[currentPostIndex].callToAction !== 'call' && (
                                    <p
                                        className="post-link"
                                        style={{
                                            fontSize: '16px',
                                            color: '#007bff',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        <strong>Action Link:</strong>
                                        <a
                                            href={posts[currentPostIndex].actionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: '#007bff',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            {posts[currentPostIndex].actionLink}
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Post Image Section */}
                            <div
                                className="post-image"
                                style={{
                                    flex: '1 1 30%',
                                    maxWidth: '30%',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}
                            >
                                <img
                                    src={posts[currentPostIndex].image ? URL.createObjectURL(posts[currentPostIndex].image) : ''}
                                    style={{
                                        width: '100%',
                                        maxWidth: '300px',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                    alt="Post Image"
                                    className="post-img"
                                />
                            </div>
                        </div>

                    )}


                    {/* Submit All Posts Button */}
                    <Button
                        type="primary"
                        onClick={submitAllPosts}
                        loading={loading}
                        style={{ marginTop: 16 }}
                    >
                        Submit All Posts
                    </Button>
                </Card>
            )}
        </div>
    );
};

const BulkPost = () => {
    const [locations, setLocations] = useState({});
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [postMode, setPostMode] = useState('manual');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const gmbAccessToken = localStorage.getItem('gmb_access_token');

                if (!token || !gmbAccessToken) {
                    throw new Error('Missing Token, GMB Access Token, or Account ID');
                }

                const response = await AxiosInstance.get(`/gmb/get-allLocations`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'gmb_access_token': gmbAccessToken,
                    },
                });
                setLocations(response.data);
                setError(null);
            } catch (error) {
                console.error('Locations Fetch Error:', error);
                setError(error.message || 'Failed to fetch locations');
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const handleSelectChange = (e) => {
        const selectedLocationId = e.target.value;

        if (selectedLocationId) {
            const selectedLocation = Object.values(locations).find(
                (location) => location.location_id === selectedLocationId
            );

            // Store the entire location object in the state
            setSelectedLocation(selectedLocation ? selectedLocation : null);
        } else {
            setSelectedLocation(null);
        }
    };

    if (loading) {
        return (
            <div className="location-selection text-center py-4">
                <Spin size="large" tip="Loading locations..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="location-selection text-center py-4 text-danger">
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div>
            <div className="location-selection-container mb-4">
                <p className='text-black mb-2 d-flex align-items-center'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="me-2 text-primary"
                    >
                        <path d="M20 10c0 6-8 10-8 10s-8-4-8-10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    Select Location
                </p>
                <div className="position-relative">
                    <select
                        onChange={handleSelectChange}
                        className="form-select custom-select appearance-none"
                        disabled={locations.length === 0}
                        style={{
                            paddingRight: '2.5rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            border: '1px solid #e0e0e0',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <option value="" className="text-muted">
                            {locations.length > 0
                                ? "-- Select a Location --"
                                : "No locations available"
                            }
                        </option>
                        {Object.values(locations).map((location) => (
                            <option
                                key={location.location_id}
                                value={location.location_id}
                                className="text-dark"
                            >
                                {location.location_name}
                            </option>
                        ))}
                    </select>
                    <div
                        className="position-absolute top-50 end-0 translate-middle-y me-3 pointer-events-none"
                        style={{ color: '#6c757d' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
                {locations.length === 0 && (
                    <div className="alert alert-warning mt-2 d-flex align-items-center" role="alert">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="me-2"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        No locations are currently available
                    </div>
                )}
            </div>

            {/* {selectedLocation ? (
                <MultiPostForm selectedLocation={selectedLocation} />
            ) : (
                <p className="text-danger">Please select a location first</p>
            )} */}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16
            }}>
                <Button
                    type={postMode === 'manual' ? 'primary' : 'default'}
                    onClick={() => setPostMode('manual')}
                >
                    Manual Post
                </Button>
                <Button
                    type={postMode === 'ai' ? 'primary' : 'default'}
                    onClick={() => setPostMode('ai')}
                >
                    AI Generate
                </Button>

            </div>

            {postMode === 'manual' && selectedLocation ? (
                <MultiPostForm selectedLocation={selectedLocation} />
            ) : postMode === 'manual' ? (
                <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="text-center p-5 bg-light rounded-4 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="100"
                            height="100"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-warning mb-4 animate-bounce"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <circle cx="12" cy="8" r="2" />
                            <path d="M10 22v-3a2 2 0 0 1 4 0v3" />
                        </svg>
                        <h2 className="display-6 text-danger mb-3">Location Selection Required</h2>
                        <p className="lead text-muted">
                            Please select a location to proceed with your manual post creation.
                        </p>
                        <div className="mt-4">
                            <span className="badge bg-primary-soft text-primary p-2">
                                🌍 Choose Your Business Location
                            </span>
                        </div>
                    </div>
                </div>
            ) : selectedLocation ? (
                <AiBulk selectedLocation={selectedLocation} />
            ) : (
                <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="text-center p-5 bg-light rounded-4 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="100"
                            height="100"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-warning mb-4 animate-bounce"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <circle cx="12" cy="8" r="2" />
                            <path d="M10 22v-3a2 2 0 0 1 4 0v3" />
                        </svg>
                        <h2 className="display-6 text-danger mb-3">Location Selection Required</h2>
                        <p className="lead text-muted">
                            Please select a location to proceed with your Ai post creation.
                        </p>
                        <div className="mt-4">
                            <span className="badge bg-primary-soft text-primary p-2">
                                🌍 Choose Your Business Location
                            </span>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
};

export default BulkPost;