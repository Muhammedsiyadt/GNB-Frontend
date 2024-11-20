import React, { useState, useEffect } from 'react';
import AIPostModal from './AiPostModal';
import { Table, Tag, Button, Space, Select, Spin, Modal, Input, DatePicker, message } from 'antd';
import { format } from 'date-fns';
import { AxiosInstance } from 'utils/AxiosInstance';
import { LoadingOutlined, PlusOutlined, RobotFilled, ExclamationCircleFilled } from '@ant-design/icons';
const { TextArea } = Input;
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup'; 
import { useDispatch, useSelector } from 'react-redux';
import { createGMBPost } from 'app/gmbSlice/schedulePost2';
import { useParams } from 'react-router';
import EditPostModal from './EditPostModal';

const PostSchedule = () => {
  let { id } = useParams();


  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [keywords] = useState([
    { keyword: 'digital marketing' },
    { keyword: 'social media' },
    { keyword: 'content strategy' }
  ]); 

  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [image, setImage] = React.useState(null);
  const [date, setDate] = React.useState(null);
  const [time, setTime] = React.useState(null);
  const [selectedAction, setSelectedAction] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState();
  const [content, setContent] = React.useState(null);
  const [actionLink, setActionLink] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState(null);

  const loading3 = useSelector((state) => state.createPost.loading);


  const validationSchema = Yup.object().shape({
    avatar: Yup.string().nullable('Please upload an image'),
    postContent: Yup.string().required('Please write your post'),
    actionButton: Yup.string().nullable('Please select an action button'),
    publicationDate: Yup.string().nullable('Please select a publication date'),
    publicationTime: Yup.string().nullable('Please select a publication time'),
    actionLink: Yup.string().nullable('Please select a action link').url(),
    callPhone: Yup.string().nullable('Please enter a phone number'),
  });

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result)); 
    reader.readAsDataURL(img);
  };  

  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleActionChange = (action) => {
    setSelectedAction(action);
  }

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

  const onImageValue = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    getBase64(file, (url) => {
      setImageUrl(url);
    });
    setImage(file);
  };

  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await AxiosInstance.get(`/gmb/scheduled-posts/${id}`);

        if (Array.isArray(response.data)) {
          setScheduledPosts(response.data);
        } else {
          throw new Error('Expected an array of posts');
        }
      } catch (err) {
        setError('Failed to load scheduled posts');
        console.error('Error fetching scheduled posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledPosts();
  }, []);

  const showModal = () => {
    setOpen(true);
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <div>
          {text}
        </div>
      ),
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text) => (
        <div>
          <img
            src={text}
            alt="Preview"
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '3px',
            }}
          />
        </div>
      ),
    },

    {
      title: 'Content',
      dataIndex: 'postContent',
      key: 'postContent',
      render: (text) => (
        <div
          style={{
            maxWidth: 400,
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'scroll',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'publicationDate',
      key: 'publicationDate',
      render: (date) => format(new Date(date), 'PPpp'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending' ? 'orange' : 'green'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        record.status === 'pending' ? (
          <Space size="middle">
            <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
            <Button type="link" danger onClick={() => showDeleteConfirm(record.id)}>Delete</Button>
          </Space>
        ) : (
          <Tag color="green"> 
            <Space>
              ✓
            </Space>
          </Tag>
        )
      ),
    },
  ];


  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleEdit = (record) => {
    setSelectedPost(record);
    setEditModalOpen(true);
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const showDeleteConfirm = (postId) => {
    setPostToDelete(postId);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setPostToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      setLoading(true);
      await AxiosInstance.delete(`/gmb/delete/scheduled-posts/${postToDelete}`);
      const response = await AxiosInstance.get('/gmb/scheduled-posts');
      setScheduledPosts(response.data);
      message.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      // message.error('Failed to delete post');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setPostToDelete(null);
    }
  };

  const handleEditSuccess = async () => {
    try {
      const response = await AxiosInstance.get('/gmb/scheduled-posts');

      if (response.status === 200) {
        setScheduledPosts(response.data);
        message.success('Posts refreshed successfully');
      } else {
        throw new Error('Failed to refresh posts');
      }
    } catch (error) {
      console.error('Error refreshing posts:', error);
      // message.error('Failed to refresh posts');
    }
  };



  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Manage Scheduled Posts</h2>

        <div className="d-flex">
          <Button type="primary" className="me-2" onClick={() => setIsAIModalOpen(true)}> Generate AI Post </Button>
          <Button type='primary' className='me-2' onClick={showModal} icon={<PlusOutlined />}>New Post</Button>
        </div>
      </div>

      {loading && <Spin tip="Loading posts..." />}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <Table
          columns={columns}
          dataSource={scheduledPosts.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1; 
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return 0; 
          })}
          rowKey="id"
          pagination={{
            pageSize: 4,
            total: scheduledPosts.length,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} posts`,
          }}
        />
      )} 


      <AIPostModal 
        isOpen={isAIModalOpen}
        setIsOpen1={setIsAIModalOpen}
        keywords={keywords}
      /> 

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
            postContent: content,
            actionButton: null,
            publicationDate: date,
            publicationTime: time,
            actionLink: null,
            callPhone: null,
            id: id
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            let accounts = localStorage.getItem('gmb_account_name');
            let gmb_access_token = localStorage.getItem('gmb_access_token');
            const formData = new FormData();


            const formattedDate = values.publicationDate.format('YYYY-MM-DD');
            formData.append('publicationDate', formattedDate);

            formData.append('avatar', image);
            formData.append('postContent', values.postContent);
            formData.append('actionButton', selectedAction);
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

                    <h3 className="mt-4 mb-3 fw-bold">Publication Date</h3>
                    <Field name="publicationDate">
                      {({ field, form: { setFieldValue } }) => (
                        <DatePicker
                          {...field}
                          size="large"
                          className="w-100"
                          onChange={(date) => setFieldValue("publicationDate", date)}
                          placeholder="Select a date"
                          disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
                        />
                      )}
                    </Field>

                    <ErrorMessage name="publicationDate" component="div" className="error" />

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


      <Modal
        title="Delete Post"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Yes, delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: '22px' }} />
          <p style={{ margin: 0 }}>Are you sure you want to delete this post? This action cannot be undone.</p>
        </div>
      </Modal>


      <EditPostModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default PostSchedule;
