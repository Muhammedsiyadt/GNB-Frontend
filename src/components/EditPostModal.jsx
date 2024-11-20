import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, DatePicker, Select, Spin, message } from 'antd';
import { Form, Field, Formik, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AxiosInstance } from 'utils/AxiosInstance';
import dayjs from 'dayjs';
const { TextArea } = Input;

const EditPostModal = ({ isOpen, onClose, post, onSuccess }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(post?.actionButton || 'none');

  useEffect(() => {
    if (post?.imageUrl) {
      setImageUrl(post.imageUrl);
    }

    setSelectedAction(post?.actionButton || 'none');
  }, [post]);

  const validationSchema = Yup.object().shape({
    avatar: Yup.mixed().nullable(),
    postContent: Yup.string().required('Please write your post'),
    actionButton: Yup.string().nullable(),
    publicationDate: Yup.string().required('Please select a publication date'),
    actionLink: Yup.string().when('actionButton', {
      is: (value) => value && value !== 'call' && value !== 'none',
      then: () => Yup.string().required('Please enter action link').url('Must be a valid URL'),
    }),
    callPhone: Yup.string().when('actionButton', {
      is: 'call',
      then: () => Yup.string().required('Please enter phone number'),
    }),
  });

  const handleActionChange = (action, setFieldValue) => {
    setSelectedAction(action);
    setFieldValue('actionButton', action);

    if (action === 'none') {
      setFieldValue('actionLink', '');
      setFieldValue('callPhone', '');
    }
  };

  const onImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      message.error('Image must be smaller than 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      message.error('Please upload an image file (JPEG, PNG, or GIF)');
      return;
    }

    setImageUrl(URL.createObjectURL(file));
    setFieldValue('avatar', file);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (values.avatar instanceof File) {
        formData.append('image', values.avatar);
      }

      const formattedDate =
        values.publicationDate instanceof dayjs
          ? values.publicationDate.format('YYYY-MM-DD HH:mm:ss')
          : values.publicationDate;

      formData.append('postContent', values.postContent);
      formData.append('actionButton', values.actionButton || 'none');
      formData.append('publicationDate', formattedDate);

      let gmb_access_token = localStorage.getItem('gmb_access_token');

      if (values.actionButton === 'call') {
        formData.append('callPhone', values.callPhone);
      } else if (values.actionButton !== 'none') {
        formData.append('actionLink', values.actionLink);
      }

      if (post.account) formData.append('account', post.account);
      if (post.location) formData.append('location', post.location);
      formData.append('accessToken', gmb_access_token);

      const response = await AxiosInstance.put(
        `/gmb/edit/scheduled-posts/${post.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Check if the response is successful
      if (response.status === 200) {
        message.success('Post updated successfully');
        onSuccess(); // Call only on success
        onClose();
      } else {
        message.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      message.error(error.response?.data?.error || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal
      open={isOpen}
      width={1200}
      title="Edit Post"
      onCancel={onClose}
      footer={null}
    >
      <Formik
        initialValues={{
          avatar: null, // Changed to null since we handle the image separately
          postContent: post?.postContent || '',
          actionButton: post?.actionButton || 'none',
          publicationDate: post?.publicationDate ? dayjs(post.publicationDate) : null,
          actionLink: post?.actionLink || '',
          callPhone: post?.callPhone || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true} // Important for updating form when post changes
      >
        {({ setFieldValue, values }) => (
          <Form encType="multipart/form-data">
            <div className="row">
              <div className="col-md-8">
                <div className="mt-4">
                  <h3 className="fw-bold">Picture</h3>
                  <input
                    type="file"
                    onChange={(e) => onImageChange(e, setFieldValue)}
                    accept="image/jpeg,image/png,image/gif"
                  />
                  <ErrorMessage name="avatar" component="div" className="text-danger" />
                </div>

                <div className="mt-4">
                  <h3 className="fw-bold">Post Content</h3>
                  <Field
                    name="postContent"
                    as={TextArea}
                    size="large"
                    className="w-100"
                    rows={4}
                  />
                  <ErrorMessage name="postContent" component="div" className="text-danger" />
                </div>

                <div className="mt-4">
                  <h3 className="fw-bold">Publication Date</h3>
                  <Field name="publicationDate">
                    {({ field }) => (
                      <DatePicker
                        format="YYYY-MM-DD" // Only display date
                        size="large"
                        className="w-100"
                        value={values.publicationDate}
                        onChange={(date) => setFieldValue("publicationDate", date)}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />

                    )}
                  </Field>

                  <ErrorMessage name="publicationDate" component="div" className="text-danger" />
                </div>

                <div className="mt-4">
                  <h3 className="fw-bold">Action Button</h3>
                  <Select
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
                  <ErrorMessage name="actionButton" component="div" className="text-danger" />

                  {selectedAction && selectedAction !== 'none' && (
                    <div className="mt-3">
                      {selectedAction === "call" ? (
                        <>
                          <h3 className="fw-bold">Phone Number</h3>
                          <Field
                            name="callPhone"
                            as={Input}
                            size="large"
                            type="tel"
                            className="w-100"
                          />
                          <ErrorMessage name="callPhone" component="div" className="text-danger" />
                        </>
                      ) : (
                        <>
                          <h3 className="fw-bold">Action Link</h3>
                          <Field
                            name="actionLink"
                            as={Input}
                            size="large"
                            type="url"
                            className="w-100"
                          />
                          <ErrorMessage name="actionLink" component="div" className="text-danger" />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <h3 className="fw-bold">Preview</h3>
                <div className="card mt-4">
                  {imageUrl && <img src={imageUrl} className="card-img-top" alt="Post preview" />}
                  <div className="card-body">
                    <p className="card-text">{values.postContent}</p>
                    {selectedAction && selectedAction !== 'none' && (
                      <Button type="primary">
                        {selectedAction.split('-').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Post
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default EditPostModal;