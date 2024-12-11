import React, { useState } from 'react';
import {
    Form,
    Input,
    Select,
    Upload,
    Button,
    message,
    Row,
    Col,
    Card
} from 'antd';
import {
    PlusOutlined,
    CloudUploadOutlined,
    FileImageOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

// Call to Action Options
const CALL_TO_ACTION_OPTIONS = [
    { value: 'none', label: 'No call to action' },
    { value: 'book-a-visit', label: 'Book a visit' },
    { value: 'call', label: 'Call' },
    { value: 'read-more', label: 'Read more' },
    { value: 'place-an-order', label: 'Place an order' },
    { value: 'shop', label: 'Shop' },
    { value: 'sign-up', label: 'Sign up' }
];

// Manual Post Component
const ManualPostForm = () => {
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageUpload = (info) => {
        const file = info.file.originFileObj;

        // Validate image
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

        // Create preview
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImagePreview(reader.result);
        });
        reader.readAsDataURL(file);

        setImageFile(file);
        return false; // Prevent default upload behavior
    };

    const handleManualSubmit = async (values) => {
        
        if (!imageFile) {
            message.error('Please upload an image');
            return;
        }

        // Create form data for backend
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('description', values.description);
        formData.append('callToAction', values.callToAction);

        try {
            // Backend call for manual post
            const response = await axios.post('/api/manual-post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            message.success('Manual post submitted successfully!');
            form.resetFields();
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            message.error('Failed to submit manual post');
            console.error('Manual Post Error:', error);
        }
    };

    return (
        <Row gutter={16}>
            <Col span={12}>
                <Card title="Manual Post">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleManualSubmit}
                    >
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
                        </Form.Item>


                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please enter a description' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Enter post description"
                            />
                        </Form.Item>

                        <Form.Item
                            name="callToAction"
                            label="Call to Action"
                            rules={[{ required: true, message: 'Please select a call to action' }]}
                        >
                            <Select placeholder="Select call to action">
                                {CALL_TO_ACTION_OPTIONS.map(option => (
                                    <Option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<CloudUploadOutlined />}
                            >
                                Submit Manual Post
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            <Col span={12}>
                <Card title="Manual Post Preview">
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="Post Preview"
                            style={{
                                maxWidth: '100%',
                                marginBottom: 16,
                                borderRadius: 8
                            }}
                        />
                    ) : (
                        <p>Your manual post preview will appear here</p>
                    )}
                </Card>
            </Col>
        </Row>
    );
};

// AI Post Component
const AIPostForm = () => {
    const [form] = Form.useForm();
    const [generatedContent, setGeneratedContent] = useState(null);
    const [aiImageFile, setAiImageFile] = useState(null);

    const handleAIGenerate = async (values) => {
        try {
            // Backend call for AI generation
            const response = await axios.post('/api/ai-generate', {
                topic: values.topic
            });

            setGeneratedContent({
                description: response.data.description,
                image: response.data.imageUrl
            });
        } catch (error) {
            message.error('Failed to generate AI content');
            console.error('AI Generation Error:', error);
        }
    };

    const handleAIImageUpload = (info) => {
        const file = info.file.originFileObj;

        // Validate image
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

        setAiImageFile(file);
        return false; // Prevent default upload behavior
    };

    const handleAISubmit = async () => {
        // Validate generated content
        if (!generatedContent) {
            message.error('Please generate AI content first');
            return;
        }

        const formData = new FormData();
        formData.append('topic', form.getFieldValue('topic'));
        formData.append('description', generatedContent.description);

        // Append either AI-generated or user-uploaded image
        if (aiImageFile) {
            formData.append('image', aiImageFile);
        } else if (generatedContent.image) {
            formData.append('imageUrl', generatedContent.image);
        } else {
            message.error('No image available');
            return;
        }

        try {
            // Backend call for AI post submission
            const response = await axios.post('/api/ai-post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            message.success('AI post submitted successfully!');
            form.resetFields();
            setGeneratedContent(null);
            setAiImageFile(null);
        } catch (error) {
            message.error('Failed to submit AI post');
            console.error('AI Post Submission Error:', error);
        }
    };

    return (
        <Row gutter={16}>
            <Col span={12}>
                <Card title="AI Post Generator">
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Form.Item
                            name="topic"
                            label="Post Topic"
                            rules={[{ required: true, message: 'Please enter a topic' }]}
                        >
                            <Input placeholder="Enter topic for AI generation" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                icon={<FileImageOutlined />}
                                onClick={() => form.validateFields().then(handleAIGenerate)}
                            >
                                Generate AI Content
                            </Button>
                        </Form.Item>

                        {generatedContent && (
                            <>
                                <Form.Item label="Generated Description">
                                    <TextArea
                                        value={generatedContent.description}
                                        rows={4}
                                        readOnly
                                    />
                                </Form.Item>

                                {generatedContent.image && (
                                    <Form.Item label="AI Generated Image">
                                        <img
                                            src={generatedContent.image}
                                            alt="AI Generated"
                                            style={{ maxWidth: '100%', marginBottom: 16 }}
                                        />
                                    </Form.Item>
                                )}

                                <Form.Item label="Optional Image Upload">
                                    <Upload
                                        listType="picture-card"
                                        showUploadList={true}
                                        beforeUpload={handleAIImageUpload}
                                        maxCount={1}
                                    >
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </>
                        )}

                        <Form.Item>
                            <Button
                                type="primary"
                                icon={<CloudUploadOutlined />}
                                onClick={handleAISubmit}
                                disabled={!generatedContent}
                            >
                                Submit AI Post
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            <Col span={12}>
                <Card title="AI Post Preview">
                    {generatedContent ? (
                        <div>
                            {generatedContent.image && (
                                <img
                                    src={generatedContent.image}
                                    alt="AI Post Preview"
                                    style={{
                                        maxWidth: '100%',
                                        marginBottom: 16,
                                        borderRadius: 8
                                    }}
                                />
                            )}
                            <p><strong>Description:</strong> {generatedContent.description}</p>
                        </div>
                    ) : (
                        <p>Your AI post preview will appear here</p>
                    )}
                </Card>
            </Col>
        </Row>
    );
};

// Main Component to Switch Between Manual and AI Posting
const BulkPost = () => {
    const [postMode, setPostMode] = useState('manual');

    return (
        <div>
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

            {postMode === 'manual' ? <ManualPostForm /> : <AIPostForm />}
        </div>
    );
};

export default BulkPost;