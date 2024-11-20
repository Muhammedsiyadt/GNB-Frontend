import { Comment } from '@ant-design/compatible'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Button, Card, Divider, Empty, Flex, List, Modal, Rate, Spin, Typography } from 'antd'
import axios from 'axios'
import moment from 'moment'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

function Reviews({setActiveTab, setCount, count}) {

    const { loading, error, data } = useSelector((state) => state.getLocation)
    let { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [replay, setReplay] = useState(false);
    const [error1, setError1] = useState(false);
    const [selectedText, setSelectedText] = useState(null);
    const [selectedId, setSelectedId] = useState(null);


    async function getAIGeneratedReplays(comment, commenter, rating) {
        try {
            setLoading1(true);
            const API_KEY = import.meta.env.VITE_AI_KEY;
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            let keywordsPrompt = '';
            if (data.keywords && data.keywords.length > 0) {
                const keywordsArray = data.keywords && data.keywords.map(keywordObj => keywordObj.keyword);
                const keywordsString = keywordsArray.join(', ');
                keywordsPrompt = `Feel free to draw inspiration from the provided keywords for context Keywords: ${keywordsString}. `;
            }

            let commentPrompt = comment ? `"${comment}"` : "No specific comment provided";

            const prompt = `Respond to this customer feedback:

            Customer: ${commenter}
            Rating: ${rating}
            Comment: ${commentPrompt}
            
            ${keywordsPrompt}
            
            Guidelines:
            1. Address the customer by name if provided.
            2. Tailor the tone based on the overall sentiment of the comment:
               - Positive sentiment: Express appreciation and enthusiasm
               - Negative or mixed sentiment: Show empathy and focus on improvement
               - Neutral sentiment: Maintain a professional and welcoming tone
            3. Address specific points in the comment, or acknowledge their visit if no details are given.
            4. Express gratitude for their feedback or visit.
            5. For less-than-positive experiences, subtly indicate openness to improvement without referencing ratings or specific issues not mentioned in the comment.
            6. Encourage future visits or additional feedback.
            7. Keep the response concise (2-4 sentences).
            8. Do not mention any business name, rating systems, or include placeholder data (e.g., email addresses).
            
            Compose a natural, friendly response following these guidelines, focusing on the customer's experience as described in their comment.`;

            const replies = [];

            for (let i = 0; i < 2; i++) {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = await response.text();  

                if (text) {
                    replies.push(text.replace(/,/g, ''));
                }
            }

            if (replies.length === 2) {
                setLoading1(false);
                setReplay(replies);
            }

        } catch (error) {
            setLoading1(false);
            setError1(error);
            console.log(error);
        }
    }

    const handleCheckboxChange = (text) => {
        setSelectedText(text);
    };

    const showModal = (comment, commenter, reviewId, rating) => {
        setIsModalOpen(true);
        getAIGeneratedReplays(comment, commenter, rating);
        setSelectedId(reviewId);
    };

    const handleOk = async () => {
        setLoading2(true);
        try {
            const accountId = localStorage.getItem('gmb_account_id');
            const accessToken = localStorage.getItem('gmb_access_token');

            let token = localStorage.getItem('token');

            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}gmb/reply-to-review?accountId=${accountId}&locationId=${id}&selectedId=${selectedId}&selectedText=${selectedText}&accessToken=${accessToken}`, {
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    Authorization: `${token}`
                }
            });

            if(res.status == 200){
                setError1(null);
                setLoading2(false);
                setIsModalOpen(false);
                setActiveTab("reviews")
                setCount(count+1)
            }

          

        } catch (error) {
 
            setError1(error.message);
        } finally {
            setLoading1(false);
        }
    };


    const handleCancel = () => {
        setIsModalOpen(false);
    };



    return (
        <>


            <Modal title="AI Replay" width={1000} open={isModalOpen} okText="Replay" onOk={handleOk} onCancel={handleCancel}>

                {loading2 ? <Spin tip="Replaying....."><>
                    {loading1 ? "Loading....." : <>
                        {replay && replay.map && replay.map((item, key) => {
                            return (
                                <div key={key}>
                                    <div className="row gap-4 align-items-center mt-4">
                                        <div className='col-md-1'>
                                            <Button onClick={(e) => handleCheckboxChange(item)} type="primary" className='fw-bold'>Use this</Button>
                                        </div>
                                        <div className='col-md-8'>
                                            {item}
                                        </div>
                                    </div>
                                    <Divider />
                                </div>
                            )
                        })}
                    </>}
                </></Spin> : <>
                    {loading1 ? <div className='d-flex align-items-center justify-content-center mt-5 mb-5'><Spin tip="Loading...."></Spin></div> : <>
                        {replay && replay.map && replay.map((item, key) => {
                            return (
                                <div key={key}>
                                    <div className="row gap-4 align-items-center mt-4">
                                        <div className='col-md-1'>
                                            <Button onClick={(e) => handleCheckboxChange(item)} type="primary" className='fw-bold'>Use this</Button>
                                        </div>
                                        <div className='col-md-8'>
                                            {item}
                                        </div>
                                    </div>
                                    <Divider />
                                </div>
                            )
                        })}
                    </>}
                </>}

            </Modal>


            <Card style={{ borderRadius: "0px" }} title={loading ? null : <>

                <Flex gap={"20px"} align="center" style={{ marginTop: "20px" }} className='mb-4'>
                    <div>
                        <img src={data?.locationData?.icon} alt="" srcset="" />
                    </div>
                    <div>
                        {data?.locationData?.rating && <>
                            <Flex gap={"20px"} align={"center"}>
                                <div>
                                    <Typography style={{ fontWeight: "bold", fontSize: "25px" }} >{data?.locationData?.name}</Typography>
                                </div>
                                <div>
                                    <span> <Rate defaultValue={data?.locationData?.rating} style={{ fontSize: "15px" }} disabled /> ({data?.locationData?.user_ratings_total})</span>
                                </div>
                            </Flex>
                            <Typography style={{ fontWeight: "bold", fontSize: "15px" }}>{data?.locationData?.formatted_address}</Typography>
                        </>}

                    </div>
                </Flex>

                {data && data?.data?.metadata?.hasVoiceOfMerchant == true && <div className="d-flex align-items-center gap-4 mt-4">
                    <div className="d-flex align-items-center gap-1 mb-4">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#00a82d" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
                        </div>
                        <div>
                            <div className='mt-1'>Published</div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-4">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0054a6" className="icon icon-tabler icons-tabler-filled icon-tabler-shield-lock"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11.998 2l.118 .007l.059 .008l.061 .013l.111 .034a.993 .993 0 0 1 .217 .112l.104 .082l.255 .218a11 11 0 0 0 7.189 2.537l.342 -.01a1 1 0 0 1 1.005 .717a13 13 0 0 1 -9.208 16.25a1 1 0 0 1 -.502 0a13 13 0 0 1 -9.209 -16.25a1 1 0 0 1 1.005 -.717a11 11 0 0 0 7.531 -2.527l.263 -.225l.096 -.075a.993 .993 0 0 1 .217 -.112l.112 -.034a.97 .97 0 0 1 .119 -.021l.115 -.007zm.002 7a2 2 0 0 0 -1.995 1.85l-.005 .15l.005 .15a2 2 0 0 0 .995 1.581v1.769l.007 .117a1 1 0 0 0 1.993 -.117l.001 -1.768a2 2 0 0 0 -1.001 -3.732z" /></svg>

                        </div>
                        <div>
                            <div className='mt-1'>Verified</div>
                        </div>
                    </div>
                </div>}


            </>} bordered={false}>
                {loading ? <Flex justify="center"><Spin tip="Loading please wait a moment"></Spin> </Flex> : <>


                    <List
                        className="comment-list"

                        itemLayout="horizontal"
                        dataSource={data.reviews?.reviews}
                        renderItem={item => (
                            <li>
                                <Comment
                                    author={<strong>{item?.reviewer?.displayName}</strong>}
                                    avatar={item?.reviewer?.profilePhotoUrl}
                                    content={<p>{item?.comment ? item.comment : "No Comment"}</p>}
                                    datetime={<strong>{moment(item.createTime).format('MMMM Do YYYY, h:mm:ss a')}</strong>}
                                >
                                    <Rate defaultValue={item?.starRating.replace('FIVE', '5').replace('FOUR', '4').replace('THREE', '3').replace('TWO', '2').replace('ONE', '1')} className=' fs-4 d-block' disabled />
                                    {item?.reviewReply ? (
                                        <Comment
                                            author={<strong>{data.locationData?.name}</strong>}
                                            avatar={data.locationData?.icon}
                                            content={<p>
                                                {item?.reviewReply?.comment ? item.reviewReply?.comment : "No Comment"}
                                            </p>}
                                            datetime={<strong>{moment(item?.reviewReply?.updateTime).format('MMMM Do YYYY, h:mm:ss a')}</strong>}
                                        />
                                    ) : (
                                        <Button style={{ marginTop: "5px" }} className='mt-2' onClick={() => { showModal(item?.comment, item?.reviewer?.displayName, item?.reviewId, item?.starRating) }} type="primary" size="small">
                                            Replay
                                        </Button>
                                    )}

                                </Comment>
                                <Divider />
                            </li>
                        )}
                    />


                </>}
            </Card>



        </>
    )
}

export default Reviews