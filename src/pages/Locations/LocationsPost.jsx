import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Card, DatePicker, Select, Upload } from 'antd';
import { Modal } from 'antd';
import { LoadingOutlined, PlusOutlined, RobotFilled } from '@ant-design/icons';
import { Input } from 'antd';
import { TimePicker } from 'antd/lib';
import { CardActions, CardContent, CardMedia } from '@mui/material';
const { TextArea } = Input;
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { createGMBPost } from 'app/gmbSlice/postCreate';
import PostsList from 'components/PostsList';
import AIPostModel from 'components/AIPostModel';
import { fetchLocation } from 'app/gmbSlice/locationSlice';



function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function LocationsPost() {
    let { id } = useParams();
    const [imageUrl, setImageUrl] = React.useState();   


    const { loading, error, data } = useSelector((state) => state.getLocation)

    const [value, setValue] = React.useState(0);

    const [loading2, setLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [open1, setOpen1] = React.useState(false);

    const [selectedAction, setSelectedAction] = React.useState(null);
    const [actionLink, setActionLink] = React.useState(null);
    const [phoneNumber, setPhoneNumber] = React.useState(null);
    const [date, setDate] = React.useState(null);
    const [time, setTime] = React.useState(null);
    const [image, setImage] = React.useState(null);

    const loading3 = useSelector((state) => state.createPost.loading);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    React.useEffect(() => {
        dispatch(fetchLocation({ id: id }));
    }, [])

    const validationSchema = Yup.object().shape({
        avatar: Yup.string().nullable('Please upload an image'),
        postContent: Yup.string().required('Please write your post'),
        actionButton: Yup.string().nullable('Please select an action button'),
        publicationDate: Yup.string().nullable('Please select a publication date'),
        publicationTime: Yup.string().nullable('Please select a publication time'),
        actionLink: Yup.string().nullable('Please select a action link').url(),
        callPhone: Yup.string().nullable('Please enter a phone number'),
    });


    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
        }, 3000);
    };

    const showModal = () => {
        setOpen(true);
    };

    const showModal1 = () => {
        setOpen1(true);
    };



    const handleCancel = () => {
        setOpen(false);
    };

    const handleChange1 = (info) => {

    };

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
        >
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </button>
    );

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


    let buttonToShow = null;

    const handleActionChange = (action) => {
        setSelectedAction(action);
    }




    const [content, setContent] = React.useState(null);
    const dispatch = useDispatch(null);

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


    return (
        <Box sx={{ width: '100%' }}>

            <AIPostModel setIsOpen1={setOpen1} isOpen={open1} id={id} keywords={data?.keywords} />


            <div className='mb-4 mt-4 d-flex align-items-center justify-content-between'>
                <div>
                    <h2>Manage Posts</h2>
                </div>
                <div className='d-flex gap-4'>
                    <Button type='primary' className='fw-bold' size='large' onClick={showModal1} icon={<RobotFilled />}>Generate AI Post</Button>
                    <Button type='primary' className='fw-bold' size='large' onClick={showModal} icon={<PlusOutlined />}>New Post</Button>
                </div>
            </div>


            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="All Posts" {...a11yProps(0)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <PostsList id={id} />
            </CustomTabPanel>

            <Modal
                open={open}
                width={1200}
                title={<h2>Create Post</h2>}
                onOk={handleOk}
                footer={null}
                onCancel={handleCancel}
            >
                <Formik
                    initialValues={{
                        avatar: image,
                        postContent: '',
                        actionButton: null,
                        publicationDate: date,
                        publicationTime: time,
                        actionLink: null,
                        callPhone: null,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        let accounts = localStorage.getItem('gmb_account_name');
                        let gmb_access_token = localStorage.getItem('gmb_access_token');
                        const formData = new FormData();
                        formData.append('avatar', image);
                        formData.append('postContent', values.postContent);
                        formData.append('actionButton', selectedAction);
                        formData.append('publicationDate', date);
                        formData.append('publicationTime', time);
                        formData.append('actionLink', actionLink);
                        formData.append('callPhone', phoneNumber);
                        formData.append('account', accounts);
                        formData.append('location', `locations/${id}`);
                        formData.append('accessToken', gmb_access_token);
                        formData.append('has_imageurl', false);

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
                                        <Field name="postContent" as={TextArea} size="large" onInput={(value) => { setContent(value.target.value) }} />
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
                                <div className="col-md-4">
                                    <h3 className="fw-bold">Post preview</h3>
                                    <div className="mt-4">
                                        <div className="card">
                                            {imageUrl && <img src={imageUrl} className="card-img-top" alt="..." />}
                                            <div className="card-body">

                                                <p className="card-text"> {content ? content : 'Post content'}</p>
                                                {selectedAction && <>{
                                                    renderButton()
                                                }</>}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>

                            <div className="mt-4 d-flex gap-2">
                                <Button key="back" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button key="submit" type="primary" htmlType="submit" loading={loading3}>
                                    Submit
                                </Button>
                            </div>

                        </Form>
                    )}
                </Formik>
            </Modal>

        </Box>
    );
}