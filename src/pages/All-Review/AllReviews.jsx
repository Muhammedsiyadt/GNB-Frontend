import React, { useState, useEffect } from 'react';
import Navbar from 'components/Navbar';
import TopHeader from 'components/TopHeader';
import ClipLoader from 'react-spinners/ClipLoader';
import { AxiosInstance } from '../../utils/AxiosInstance';
import { Button, Modal, Spinner, Toast } from 'react-bootstrap';
import { FaUser, FaStar, FaCommentDots } from 'react-icons/fa';
import './AllReviews.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { color } from 'framer-motion';
import { Spin } from 'antd';
import { FileSearchOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';




const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [reply, setReply] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyLoading, setReplyLoading] = useState(false); // Loading state for submit reply
    const [showToast, setShowToast] = useState(false); // Toast visibility state
    const [locationArray, setLocationArray] = useState({})
    const uniqueLocations = Object.values(locationArray);
    // Fetch all reviews initially

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const gmbAccessToken = localStorage.getItem('gmb_access_token');
                const accountId = localStorage.getItem('gmb_account_id');

                if (!token || !gmbAccessToken || !accountId) {
                    throw new Error('Missing Token, GMB Access Token, or Account ID');
                }

                // Step 1: Get all reviews
                const response = await AxiosInstance.get(`/gmb/get-allviewers/${accountId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'gmb_access_token': gmbAccessToken,
                    },
                });

                const allReviews = response.data.reviews || [];
                const filteredReviews = allReviews.filter(review => !review.reviewReply);

                // Step 2: Fetch location data for each review
                const locationDataArray = await Promise.all(
                    filteredReviews.map(async (review) => {
                        const locationMatch = review.name.match(/locations\/(\d+)/);
                        const locationId = locationMatch ? locationMatch[1] : null;

                        if (!locationId) {
                            console.warn('LocationId not found in review:', review);
                            return {
                                ...review,
                                locationData: null,
                                locationError: 'Location ID not found in review name'
                            };
                        }

                        try {
                            const responseLocation = await AxiosInstance.get(`/gmb/get-locationData/${locationId}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'gmb_access_token': gmbAccessToken,
                                },
                            });

                            const locationData = responseLocation.data;

                            setLocationArray(prevState => ({
                                ...prevState,
                                [locationId]: locationData
                            }));

                            return {
                                ...review,
                                locationData
                            };

                        } catch (error) {
                            console.error(`Error fetching location data for locationId: ${locationId}`);
                        }
                    })
                );

                filteredReviews.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
                setReviews(filteredReviews);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);


    const mapStarRating = (starRating) => {
        switch (starRating) {
            case 'ONE': return 1;
            case 'TWO': return 2;
            case 'THREE': return 3;
            case 'FOUR': return 4;
            case 'FIVE': return 5;
            default: return 0;
        }
    };

    const getAIGeneratedReply = async (comment, commenter, rating) => {
        try {
            setAiLoading(true);
            const API_KEY = import.meta.env.VITE_AI_KEY;
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            let prompt;

            if (!comment || comment.trim() === '') {
                prompt = `Respond to this customer feedback with a simple thank you. Customer: ${commenter}, Rating: ${rating}.`;
            } else {
                prompt = `Respond to this customer feedback:
                Customer: ${commenter}
                Rating: ${rating}
                Comment: "${comment}"
                1. Address the customer by name.
                2. Use a friendly and professional tone.
                3. End with a thank you!
                4. If the rating is 3 or less, acknowledge the concerns and invite suggestions for improvement.
                5. No signatures or company names.`;
            }

            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();
            setReply(responseText);
        } catch (error) {
            console.error("Error generating AI reply:", error);
        } finally {
            setAiLoading(false);
        }
    };

    const generateAnotherReply = () => {
        if (selectedReview) {
            getAIGeneratedReply(selectedReview.comment, selectedReview.reviewer, selectedReview.rating);
        }
    };

    const showModal = (comment, reviewer, rating, reviewId, name) => {
        setIsModalOpen(true);
        setSelectedReview({ comment, reviewer, rating, id: reviewId, name });
        getAIGeneratedReply(comment, reviewer, rating);
    };

    const submitReply = async () => {
        try {
            setReplyLoading(true);
            const token = localStorage.getItem('token');
            const gmbAccessToken = localStorage.getItem('gmb_access_token');
            const name = selectedReview.name;
            const locationId = name.split('/')[3];
            const accountId = name.split('/')[1];

            if (!token || !gmbAccessToken || !accountId || !locationId || !selectedReview.id) {
                throw new Error('Missing required tokens, IDs, or Review ID');
            }

            await AxiosInstance.post(`/gmb/replay-review/${accountId}/${locationId}/${selectedReview.id}`,
                { reply: reply },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'gmb_access_token': gmbAccessToken,
                    },
                }
            );

            setIsModalOpen(false);
            setShowToast(true); // Show toast notification
        } catch (error) {
            console.error("Error submitting reply:", error);
        } finally {
            setReplyLoading(false); // End loading
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setReply('');
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center p-5">
                <Spin>
                </Spin>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">Error fetching reviews: {error.response?.data?.message || error.message}</div>;
    }

    return (

        <div>
            <div className="container mt-5 " style={{ marginBottom: '100px' }}>
                {/* <h1 className="text-start text-uppercase">Customer Reviews Without Replies</h1> */}


                {reviews.length === 0 ? (
                    <div className="text-center">
                        <Spin
                            tip="No reviews found"
                            size="large"
                            style={{ fontSize: '20px', color: '#1890ff' }}
                        />
                    </div>
                ) : (
                    <div className="review-list ">
                        {reviews.map((review, index) => {


                            const locationId = review.name.match(/locations\/(\d+)/)?.[1];
                            const location = locationId && locationArray[locationId] ? locationArray[locationId].data.name : null;

                            return (
                                <div key={index} className="review-item">
                                    <div className="review-location">
                                        {location ? (
                                            <h3><b style={{ color: 'blue' }}>{location}</b></h3>
                                        ) : (
                                            <h3> Unknown</h3>
                                        )}
                                    </div>
                                    <div className="review-header">
                                        <FaUser className="icon" />
                                        <span className="reviewer-name me-3 text-primary">{review.reviewer?.displayName || 'Anonymous'}</span>
                                        <span className="review-date text-secondary">
                                            <small>{new Date(review.createTime).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</small>
                                            &nbsp; &nbsp;
                                            <span className="text-secondary"><small>{new Date(review.createTime).toLocaleTimeString()}</small></span>
                                        </span>
                                    </div>


                                    <div className="review-comment">
                                        <FaCommentDots className="icon text-warning" />
                                        <span className="cmt">{review.comment || <small >'No comment provided'</small>}</span>
                                    </div>

                                    <div className="review-rating">
                                        {Array(mapStarRating(review.starRating)).fill().map((_, i) => (
                                            <FaStar key={i} className="star-icon" />
                                        ))}
                                    </div>

                                    <Button
                                        className="bg-success w-10 h-5"
                                        onClick={() => showModal(review.comment, review.reviewer?.displayName, mapStarRating(review.starRating), review.reviewId, review.name)}
                                    >
                                        Reply
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal for AI-generated replies */}
                <Modal show={isModalOpen} onHide={handleCancel}>
                    <Modal.Header>
                        <Modal.Title>Generated Reply</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {aiLoading ? (
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Generating AI reply...</span>
                            </Spinner>
                        ) : (
                            <>
                                <div>
                                    <span>{reply}</span>
                                </div>
                                <hr />
                                <Button variant='list' onClick={generateAnotherReply}>
                                    Generate Another Reply
                                </Button>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="mt-2" variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button className="mt-2" variant="primary" onClick={submitReply} disabled={replyLoading}>
                            {replyLoading ? <Spinner animation="border" size="sm" /> : 'Submit Reply'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    className="position-fixed bg-success text-white bottom-0 end-0 m-4"
                >
                    <Toast.Body>Reply submitted successfully!</Toast.Body>
                </Toast>
            </div>
        </div>

    );
};

export default AllReviews;
