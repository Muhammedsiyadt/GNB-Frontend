import React, { useState, useEffect } from 'react';
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Input,
    Select,
    Spin,
    Tag,
    Tooltip,
    message,
    Typography
} from 'antd';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Markdown from 'react-markdown';
import { AxiosInstance } from 'utils/AxiosInstance';

const { TextArea } = Input;
const { Paragraph } = Typography;

function AiBulkPosts({ selectedLocation }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initialPostState = {
        topic: '',
        content: null,
        image: null,
        imageUrl: null,
        selectedAction: null,
        actionLink: null,
        phoneNumber: null
    };

    // Validation Schema
    const validationSchema = Yup.object().shape({
        topic: Yup.string().required('Topic is required'),
        content: Yup.string().required('Post content is required'),
        image: Yup.mixed().nullable(),
        selectedAction: Yup.string().nullable(),
        actionLink: Yup.string().when('selectedAction', {
            is: (val) => val && val !== 'call' && val !== 'none',
            then: () => Yup.string().url('Must be a valid URL').required('Action link is required')
        }),
        phoneNumber: Yup.string().when('selectedAction', {
            is: 'call',
            then: () => Yup.string().required('Phone number is required')
        })
    });

    const addNewPost = () => {
        if (posts.length < 4) {
            setPosts([...posts, { ...initialPostState }]);
        } else {
            message.warning('Maximum 4 posts allowed');
        }
    };

    const removePost = (index) => {
        const newPosts = posts.filter((_, i) => i !== index);
        setPosts(newPosts);
    };

    const updatePost = (index, updates) => {
        const newPosts = [...posts];
        newPosts[index] = { ...newPosts[index], ...updates };
        setPosts(newPosts);
    };



    const generatePostContent = async (index, topic) => {
        try {
            setLoading(true);
            const API_KEY = import.meta.env.VITE_AI_KEY;
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" });

            const companyReference = selectedLocation.location_name || "our company";

            const prompt = `
            Create an engaging single-paragraph Google My Business post (800-1200 characters) focused on ${topic} for ${companyReference}. This post should:
          
            1. Start with an engaging opening related to ${topic} to immediately draw in the reader's attention and curiosity.
            2. Highlight ${companyReference}’s unique knowledge or perspective on ${topic}, showing what sets them apart in this area.
            3. Emphasize the importance of ${topic} in the industry or how it impacts your customers, where relevant.
            
            6. Showcase a specific feature, innovation, or value-driven approach that ${companyReference} brings to ${topic}.
            7. End with a clear call-to-action that inspires readers to engage with ${companyReference}.
          
            Writing guidance:
          
            - Balance professional and conversational tones to create a relatable yet credible voice.
            - Ensure ideas flow logically with smooth transitions.
            - Focus on providing valuable, informative content that meets customer needs or sparks interest in ${topic}.
            - Emphasize a key benefit or unique selling point tied to ${topic}.
            - Keep all details tightly relevant to ${companyReference} and the interests of their target audience.
          
            Additional tips:
          
            - Avoid hashtags, emojis, or placeholder text to keep the tone polished and professional.
            - Organically blend keywords to maintain readability and flow.
            - Double-check for grammar, spelling, and clarity.
            - Use varied sentence structures to make the post feel naturally written and engaging.
            - Stick to an American English style for spelling and vocabulary.
            - Avoid jargon unless necessary and ensure clarity for a broad audience.
            - Incorporate data or examples only when they genuinely add value.
          
            The goal is to craft a polished, compelling post that feels human-written and connects naturally with the reader, offering real value and motivating them to take action with ${companyReference}.
          `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = await response.text();

            const newPosts = [...posts];
            newPosts[index].content = text.trim();
            setPosts(newPosts);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
            message.error('Failed to generate post content');
        }
    };

    const [generated, setGenerated] = useState(false)

    const generatePostImage = async (index, topic) => {
        try {
            setLoading(true);
            let eden_token = import.meta.env.VITE_EDEN_AI_KEY;
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: `Bearer ${eden_token}`
                },
                body: JSON.stringify({
                    response_as_dict: true,
                    attributes_as_list: false,
                    show_original_response: false,
                    num_images: 1,
                    text: `${topic} unique image variation ${Date.now()}`, // Add timestamp or random variation
                    providers: ['amazon'],
                    resolution: '512x512'
                })
            };
    
            const response = await fetch('https://api.edenai.run/v2/image/generation', options);
            const data = await response.json();
    
            // Check if image was actually generated
            if (!data?.amazon?.items || data.amazon.items.length === 0) {
                throw new Error('No image generated');
            }
    
            const newPosts = [...posts];
            const newImageUrl = data.amazon.items[0].image_resource_url;
    
            // Ensure the new image is different from the previous one
            if (newImageUrl === newPosts[index].imageUrl) {
                console.warn('Generated same image, retrying...');
                return generatePostImage(index, topic); // Recursive retry
            }
    
            newPosts[index].imageUrl = newImageUrl;
            
            setPosts(newPosts);
            setLoading(false);
            setGenerated(true);
        } catch (error) {
            console.error('Image generation error:', error);
            setError(error);
            setLoading(false);
            message.error('Failed to generate post image');
        }
    };


    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const accounts = localStorage.getItem('gmb_account_name');
            const gmb_access_token = localStorage.getItem('gmb_access_token');

            const formData = new FormData();
            formData.append('account', accounts);
            formData.append('location', selectedLocation.location_id);
            formData.append('accessToken', gmb_access_token);


            formData.append('posts', JSON.stringify(posts.map(post => ({
                postContent: post.content,
                actionButton: post.selectedAction,
                actionLink: post.selectedAction !== 'call' ? post.actionLink : undefined,
                phoneNumber: post.selectedAction === 'call' ? post.phoneNumber : undefined,
                imageUrl: post.imageUrl
            }))));

            const response = await AxiosInstance.post('gmb/create-bulk-aiPosts', formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                message.success('Bulk posts created successfully!');
                setPosts([]);
            } else {
                message.error('Bulk post creation failed!');
            }
        } catch (error) {
            console.error('Error in bulk post creation:', error);
            message.error('Failed to create bulk posts');
        }
    };

    return (
        <div className="container">

            {posts.map((post, index) => (
                <Card
                    key={index}
                    title={`Post ${index + 1}`}
                    extra={
                        <Button
                            type="text"
                            danger
                            onClick={() => removePost(index)}
                        >
                            Remove
                        </Button>
                    }
                    className="mb-4"
                >
                    <Formik

                        initialValues={{
                            topic: post.topic,
                            content: post.content,
                            selectedAction: post.selectedAction,
                            actionLink: post.actionLink,
                            phoneNumber: post.phoneNumber
                        }}
                        validationSchema={validationSchema}
                        onSubmit={() => { }} // Handled in main form submission
                    >
                        {({ values, setFieldValue }) => (
                            <Form>
                                <div className="row">
                                    <div className="col-md-6">
                                        <Field
                                            name="topic"
                                            as={Input}
                                            placeholder="Enter post topic"
                                            value={values.topic}
                                            onChange={(e) => {
                                                setFieldValue('topic', e.target.value);
                                                updatePost(index, { topic: e.target.value });
                                            }}
                                        />
                                        <ErrorMessage name="topic" component="div" className="text-danger" />

                                        <div className="mt-3">
                                            <Button
                                                onClick={() => generatePostContent(index, values.topic)}
                                                disabled={!values.topic}
                                            >
                                                Generate Content
                                            </Button>
                                            <Button
                                                className="ml-2"
                                                onClick={() => generatePostImage(index, values.topic)}
                                                disabled={!values.topic || loading}
                                            >
                                                {loading ? 'Generating...' : (generated === true ? 'Regenerate Image' : 'Generate Image')}
                                            </Button>
                                        </div>

                                        {/* Replace the conditional rendering with a direct rendering */}
                                        <Field
                                            name="content"
                                            as={TextArea}
                                            rows={4}
                                            className="mt-3"
                                            placeholder="Enter or generate post content"
                                            value={values.content || post.content || ''}
                                            onChange={(e) => {
                                                const newContent = e.target.value;
                                                setFieldValue('content', newContent);
                                                updatePost(index, { content: newContent });
                                            }}
                                        />

                                        <Field
                                            name="selectedAction"
                                            as={Select}
                                            className="mt-3 w-100"
                                            placeholder="Select Action Button"
                                            value={values.selectedAction}
                                            onChange={(value) => {
                                                setFieldValue('selectedAction', value);
                                                updatePost(index, { selectedAction: value });
                                            }}
                                        >
                                            <Select.Option value="none">No call to action</Select.Option>
                                            <Select.Option value="book-a-visit">Book a visit</Select.Option>
                                            <Select.Option value="call">Call</Select.Option>
                                            <Select.Option value="read-more">Read more</Select.Option>
                                            <Select.Option value="place-an-order">Place an order</Select.Option>
                                            <Select.Option value="shop">Shop</Select.Option>
                                            <Select.Option value="sign-up">Sign up</Select.Option>
                                        </Field>

                                        {values.selectedAction && values.selectedAction !== 'none' && (
                                            <Field
                                                name={values.selectedAction === 'call' ? 'phoneNumber' : 'actionLink'}
                                                as={Input}
                                                placeholder={values.selectedAction === 'call' ? 'Phone Number' : 'Action Link'}
                                                className="mt-3"
                                                value={values.selectedAction === 'call' ? values.phoneNumber : values.actionLink}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (values.selectedAction === 'call') {
                                                        setFieldValue('phoneNumber', value);
                                                        updatePost(index, { phoneNumber: value });
                                                    } else {
                                                        setFieldValue('actionLink', value);
                                                        updatePost(index, { actionLink: value });
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        {post.imageUrl && (
                                            <img
                                                src={post.imageUrl}
                                                alt="Generated Post"
                                                className="img-fluid mb-3"
                                                style={{
                                                    maxWidth: '300px',
                                                    maxHeight: '300px',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                    width: '100%',
                                                    height: 'auto'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>
            ))}

            <div className="row mb-4">
                <div className="col" >
                    <Button

                        type="primary"
                        onClick={addNewPost}
                        disabled={posts.length >= 4}
                    >
                        Add New Post
                    </Button>
                </div>
            </div>

            {posts.length > 0 && (
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={posts.some(post => !post.content || !post.imageUrl)}
                >
                    Submit Bulk Posts
                </Button>
            )}

            {loading && <Spin fullscreen />}
        </div>
    );
}

export default AiBulkPosts;