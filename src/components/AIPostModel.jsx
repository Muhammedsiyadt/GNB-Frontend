import React, { useState } from 'react';
import { Alert, Button, Card, Checkbox, Input, Modal, Select, Spin, Steps, Tag, Tooltip, theme, message } from 'antd';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useDispatch, useSelector } from 'react-redux';
import Markdown from 'react-markdown'
import * as Yup from 'yup';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { createGMBPost } from 'app/gmbSlice/postCreate';
import { Typography } from 'antd';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';

const { TextArea } = Input;

const { Paragraph } = Typography;

function AIPostModel({ setIsOpen1, isOpen, keywords }) { 
    const [messageApi, contextHolder] = message.useMessage(); 
    const dispatch = useDispatch(null);
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [error, setError] = useState(null);
    const [replay, setReplay] = useState(null);
    const { data } = useSelector((state) => state.getLocation);
    const [imageUrl, setImageUrl] = useState(null);
    const [selectedContent, setSelectedContent] = useState('');
    const [selectedAction, setSelectedAction] = React.useState(null);
    const [content, setContent] = useState(selectedAction);
    const [actionLink, setActionLink] = React.useState(null);
    const [phoneNumber, setPhoneNumber] = React.useState(null);
    const [image, setImage] = React.useState(null);
    const [date, setDate] = React.useState(null);
    const [time, setTime] = React.useState(null);
    const createPostState = useSelector((state) => state.createPost)
    const { id } = useParams();

    let localtion_name = `${data?.locationData?.name}`;

 
    
    const validationSchema = Yup.object().shape({
        avatar: Yup.string().nullable('Please upload an image'),
        postContent: Yup.string().required('Please write your post'),
        actionButton: Yup.string().nullable('Please select an action button'),
        publicationDate: Yup.string().nullable('Please select a publication date'),
        publicationTime: Yup.string().nullable('Please select a publication time'),
        actionLink: Yup.string().nullable('Please select a action link').url(),
        callPhone: Yup.string().nullable('Please enter a phone number'),
    });

    const handleCheckboxChange = (isChecked, content) => {
        if (isChecked) {
            // Add content to selectedContent
            setSelectedContent(content);
            setContent(content);
        } else {
            // Remove content from selectedContent
            setSelectedContent(content);
            setContent(content);
        }
    };

    const onImageValue = (e) => {
        const file = e.target.files[0]; // Get the first file from the input
        if (!file) {
            return;
        }
        getBase64(file, (url) => {
            setImageUrl(url);
        });
        setImage(file);
    };


    const handleActionChange = (action) => {
        setSelectedAction(action);
    }



    const generateImage = async () => {
        setLoading1(true);
        let eden_token = import.meta.env.VITE_EDEN_AI_KEY
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
                text: topic,
                providers: ['amazon'],
                resolution: '512x512'
            })
        };

        fetch('https://api.edenai.run/v2/image/generation', options)
            .then(response => response.json())
            .then(response => {
                setLoading1(false);
                let image_resp = response?.amazon?.items[0].image_resource_url;
                setImageUrl(image_resp);
            })
            .catch(err => {
                setLoading1(false);
                setError(err);
            });
    };

    let companyName = data?.locationData?.name;

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };


    const renderButton = () => {
        switch (selectedAction) {
            case 'book-a-visit':
                return <a href={actionLink} target="_blank" className="btn-link text-decoration-none btn-primary">Book a visit</a>;
            case 'call':
                return <a href={`tel:${phoneNumber}`} target="_blank" className="btn-link text-decoration-none btn-primary">Call now</a>;
            case 'read-more':
                return <a href={actionLink} target="_blank" className="btn-link text-decoration-none btn-primary">Read more</a>;
            case 'place-an-order':
                return <a href={actionLink} target="_blank" className="btn-link text-decoration-none btn-primary">Place an order</a>;
            case 'shop':
                return <a href={actionLink} target="_blank" className="btn-link text-decoration-none btn-primary">Shop</a>;
            case 'sign-up':
                return <a href={actionLink} target="_blank" className="btn-link text-decoration-none btn-primary">Sign up</a>;
            default:
                return null;
        }
    };

    async function getAIGeneratedReplays() {
        try {
            setLoading(true);
            const API_KEY = import.meta.env.VITE_AI_KEY;
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" });

            const companyReference = companyName ? `${companyName}` : "our company";
            const keywordsString = keywords && keywords.length > 0
                ? keywords.map(keywordObj => keywordObj.keyword).join(", ")
                : "";

                const prompt = `
                Create an engaging single-paragraph Google My Business post (800-1200 characters) focused on ${topic} for ${companyReference}. This post should:
              
                1. Start with an engaging opening related to ${topic} to immediately draw in the reader's attention and curiosity.
                2. Highlight ${companyReference}’s unique knowledge or perspective on ${topic}, showing what sets them apart in this area.
                3. Emphasize the importance of ${topic} in the industry or how it impacts your customers, where relevant.
                ${keywordsString ? `4. Carefully integrate these keywords as they fit naturally into the content: ${keywordsString}.` : ''}
                5. Showcase a specific feature, innovation, or value-driven approach that ${companyReference} brings to ${topic}.
                6. End with a clear call-to-action that inspires readers to engage with ${companyReference}.
              
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
              

            const replies = [];

            for (let i = 0; i < 2; i++) {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = await response.text();

                if (text) {
                    replies.push(text.trim());
                }
            }

            if (replies.length === 2) {
                setLoading(false);
                setReplay(replies);
            }

        } catch (error) {
            toast.error("An error occurred while generating AI content");
            setLoading(false);
            setError(error);
        }
    }

    const steps = [
        {
            title: 'Topic',
            content: <div>
                <div className="mt-4 mb-4">
                    <h3 className='text-black fw-bold'>Enter the Topic of Your Post</h3>
                    <Input size="large" placeholder='Enter your post topic' className='mt-2' value={topic} onChange={(e) => { setTopic(e.target.value) }} />
                    <p className="mt-2">Provide a concise and descriptive title that summarizes the main theme or topic of your post.</p>
                </div>
            </div>,
        },
        {
            title: 'Generation',
            content: <div className='mt-4 mb-4'>
                <h3 className='mb-4' >Keywords</h3> 
                {keywords && Array.isArray(keywords) && keywords.map((e, key) => {
                    return (
                        <Tag key={key + 1} color="blue">{e?.keyword}</Tag>
                    )
                })}
                <div className="mt-4"> 
                    {loading == true ? <div className='d-flex justify-content-center align-items-center'><Spin /></div> : <>
                        {error == true ? <Alert>Something went wrong while generate content</Alert> : <>

                            <div>
                                {replay && replay.map((e, key) => {
                                    return (
                                        <div className='mb-4'>
                                            <Card
                                                title={`Content ${key + 1} `}
                                                extra={
                                                    <Tooltip title="Click this to use this content">
                                                        <Checkbox
                                                            onChange={c => handleCheckboxChange(c.target.checked, e)}
                                                        />
                                                    </Tooltip>
                                                }
                                                key={key}
                                            >
                                                <Markdown>{e}</Markdown>

                                            </Card>
                                        </div>
                                    )
                                })}
                            </div>

                        </>}
                    </>}
                </div>
            </div>,
        },
        {
            title: 'Post Preview',  
            content: <>
                <div className="mt-4">
                    {loading1 == true ? <div className='d-flex justify-content-center align-items-center mt-5'><Spin /></div> : <>
                        {error == true ? <Alert type="error" description="Something went wrong while generate content"></Alert> : <>
                            <Alert description="The image will generated automatically by AI. If you want to change it upload your own image"></Alert>
                            <div className='mb-5'>
                                <Formik
                                    initialValues={{
                                        avatar: image,
                                        postContent: selectedContent,
                                        actionButton: null,
                                        publicationDate: date,
                                        publicationTime: time,
                                        actionLink: null,
                                        callPhone: null,
                                        id: id,
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={(values) => {
                                        let accounts = localStorage.getItem('gmb_account_name');
                                        let gmb_access_token = localStorage.getItem('gmb_access_token');
                                        const formData = new FormData();
                                        formData.append('avatar', image);
                                        formData.append('image_url', imageUrl);
                                        formData.append('postContent', values.postContent);
                                        formData.append('actionButton', selectedAction);
                                        formData.append('publicationDate', date);
                                        formData.append('publicationTime', time);
                                        formData.append('actionLink', actionLink);
                                        formData.append('callPhone', phoneNumber);
                                        formData.append('account', accounts);
                                        formData.append('location', `locations/${id}`);
                                        formData.append('accessToken', gmb_access_token);
                                        formData.append('has_imageurl', imageUrl ? true : false);

                                        dispatch(createGMBPost(formData));

                                    }}
                                >
                                    {({ isSubmitting, setFieldValue }) => (
                                        <Form encType="multipart/form-data">
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <div className="mt-4">
                                                        <h3 className="mt-4 mb-3 fw-bold">Picture</h3>
                                                        <p>Posts that include graphics have a higher chance of drawing in readers. For a Google business profile article, 1200 x 900 pixels is the ideal image size. has an aspect ratio of 4:3.</p>
                                                        <Field name="avatar">
                                                            {({ field }) => (
                                                                <Field type="file" name="avatar" id="" onChange={onImageValue} />
                                                            )}
                                                        </Field>
                                                        <ErrorMessage name="avatar" component="div" className="error" />
                                                    </div>

                                                    <div className="mt-4">
                                                        <h3 className="mt-4 mb-3 fw-bold">Write your post</h3>
                                                        <p>We urge you to incorporate selected terms from those mentioned below in your. By using these keywords, you could make your profile more visible.</p>
                                                        <Field name="postContent" as={TextArea} size="large" cols={50} style={{ height: "200px" }} onInput={(value) => { setContent(value.target.value) }} />
                                                        <ErrorMessage name="postContent" component="div" className="error" />

                                                        <h3 className="mt-4 mb-3 fw-bold">Add the action button (optional)</h3>
                                                        <Field name="actionButton">
                                                            {({ field }) => (
                                                                <Select
                                                                    {...field}
                                                                    size="large"
                                                                    className="w-100"
                                                                    value={selectedAction}
                                                                    onChange={(value) => handleActionChange(value, setFieldValue)}
                                                                >
                                                                    <Select.Option value="none">No call to action</Select.Option>
                                                                    <Select.Option value="book-a-visit">Book a visit</Select.Option>
                                                                    <Select.Option value="call">Call</Select.Option>
                                                                    <Select.Option value="read-more">Read more</Select.Option>
                                                                    <Select.Option value="place-an-order">Place an order</Select.Option>
                                                                    <Select.Option value="shop">Shop</Select.Option>
                                                                    <Select.Option value="sign-up">Sign up</Select.Option>
                                                                </Select>
                                                            )}
                                                        </Field>
                                                        <ErrorMessage name="actionButton" component="div" className="error" />

                                                        {
                                                            selectedAction &&
                                                            <>
                                                                {selectedAction == "call" ? <>
                                                                    <h3 className="mt-4 mb-3 fw-bold">Phone number</h3>
                                                                    <Field size="large" name="callPhone" type="number" as={Input} onInput={(value) => { setPhoneNumber(value.target.value) }} />
                                                                    <ErrorMessage name="callPhone" component="div" className="error" />
                                                                </> : <>
                                                                    <h3 className="mt-4 mb-3 fw-bold">Paste your link here</h3>
                                                                    <Field size="large" name="actionLink" type="url" as={Input} onInput={(value) => { setActionLink(value.target.value) }} />
                                                                    <ErrorMessage name="actionLink" component="div" className="error" />
                                                                </>}

                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mt-4">
                                                    <h3 className="fw-bold">Post preview</h3>
                                                    <div className="mt-4">
                                                        <div className="card">
                                                            {imageUrl && <img src={imageUrl} className="card-img-top" alt="..." />}
                                                            <div className="card-body">

                                                                <p className="card-text"> {content ? <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Read more' }}>{content}</Paragraph> : 'Post content'}</p>
                                                                {selectedAction && <>{
                                                                    renderButton()
                                                                }</>}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                            </div>

                                            <Button type="primary" className='mt-4' id='post_submit_button_1' htmlType="submit">
                                                Post
                                            </Button>


                                        </Form>
                                    )}
                                </Formik>
                            </div>

                        </>}
                    </>}
                </div>
            </>,
        },
    ];

    const handleOk = () => {
        setIsOpen1(false);
    };

    const handleCancel = () => {
        setIsOpen1(false);
    };

    const next = () => {
        setCurrent(current + 1);
        if (current + 1 == 1) {
            getAIGeneratedReplays();
        }

        if (current + 1 == 2) {
            generateImage();
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const items = steps.map((item) => ({ key: item.title, title: item.title }));

    const contentStyle = {
        minHeight: '260px',
        backgroundColor: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder} `,
        marginTop: 16,
    };

    const onChange = (value) => {
        console.log('onChange:', value);
    };



    return (
        <div>
            <Modal title="AI Post" width={1200} open={isOpen} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ disabled: true }}>

                <div className='mt-4'>
                    <Steps current={current} items={items} />
                    <div style={contentStyle} className='container'>{steps[current].content}</div>
                    <div style={{ marginTop: 24 }}>
                        {current < steps.length - 1 && (
                            current == 1 ?
                                <Button type="primary" onClick={() => next()} disabled={topic == null || topic == '' || selectedContent == null || selectedContent == '' ? true : false}>
                                    Next
                                </Button>
                                :
                                <Button type="primary" onClick={() => next()} disabled={topic == null || topic == '' ? true : false}>
                                    Next
                                </Button>
                        )}

                        {current > 0 && (
                            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                                Previous
                            </Button>
                        )}
                    </div>
                </div>

            </Modal>
        </div>
    );
}

export default AIPostModel;
