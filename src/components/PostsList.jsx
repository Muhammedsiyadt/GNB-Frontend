import { Button, Divider, Empty, Image, Popover, Spin, Typography } from 'antd';
import { fetchposts } from 'app/gmbSlice/postsSlice';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import moment from 'moment';
import AIPostModel from './AIPostModel';

const { Paragraph, Text } = Typography;

const { Meta } = Card;
const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
};

function PostsList({ id }) {

    const dispatch = useDispatch();
    const { loading, error, data } = useSelector((state) => state.posts)

    useEffect(() => {
        dispatch(fetchposts({ id: id }));
    }, []);


    const [rows, setRows] = useState(2);

    const [expandedKeys, setExpandedKeys] = useState({});

    const handleExpand = (key, isExpanded) => {
        setExpandedKeys({
            ...expandedKeys,
            [key]: isExpanded,
        });
    };

    const actionTypeNames = {
        'ACTION_TYPE_UNSPECIFIED': 'Action',
        'BOOK': 'Book',
        'ORDER': 'Order',
        'SHOP': 'Shop',
        'LEARN_MORE': 'Learn More',
        'SIGN_UP': 'Sign Up',
        'CALL': 'Call'
    };

    return (
        
        <div>
            {
                loading ? <div className='d-flex justify-content-center mt-5'>
                    <Spin />
                </div> : <>
                    <div className="row">
                        <div className="col-md-12">
                            <div class="row gy-4 gy-lg-0">

                                {
                                    data && data.length > 0 ? (
                                        data.some(e => e?.media && e.media.some(media => media.mediaFormat === 'PHOTO')) ? (
                                            data.map((e, key) => (
                                                e?.media && e.media.some(media => media.mediaFormat === 'PHOTO') ? (
                                                    <div className='col-12 col-lg-4' key={key}>
                                                        <article>
                                                            <div className="card border mt-4" style={{ height: "500px" }}>
                                                                <figure className="card-img-top m-0 overflow-hidden bsb-overlay-hover">
                                                                    <a>
                                                                        {e?.media &&
                                                                            e.media.map((media, index) => (
                                                                                media.mediaFormat === 'PHOTO' ? (
                                                                                    <Image
                                                                                        key={index}
                                                                                        src={media.googleUrl}
                                                                                        alt="photo"
                                                                                        className="img-fluid bsb-scale bsb-hover-scale-up"
                                                                                        style={{ width: '100%', height: '300px' }}
                                                                                    />
                                                                                ) : null
                                                                            ))}
                                                                    </a>
                                                                </figure>

                                                                <div className="card-body border bg-white p-4">

                                                                    <Paragraph
                                                                        ellipsis={{
                                                                            rows: 3,
                                                                        }}
                                                                    >
                                                                        {e?.summary}
                                                                    </Paragraph>
                                                                    <Popover
                                                                        content={<div style={{ maxWidth: '400px' }}>{e?.summary}</div>}
                                                                        trigger="click"
                                                                    >
                                                                        <Button type="link" className='p-0'>Read more</Button>
                                                                    </Popover>

                                                                    <br />
                                                                    <br />

                                                                    {e.callToAction && e.callToAction.url && (
                                                                        <Button
                                                                            type="primary"
                                                                            className='mt-2'
                                                                            onClick={() => window.open(e.callToAction.url, '_blank')}
                                                                        >
                                                                            {actionTypeNames[e.callToAction.actionType] || 'Action'}
                                                                        </Button>
                                                                    )}

                                                                </div>

                                                                <div className="card-footer border border-top-0 bg-white p-4">
                                                                    <ul className="entry-meta list-unstyled d-flex align-items-center m-0">
                                                                        <li>
                                                                            <a className="fs-7 link-secondary text-decoration-none d-flex align-items-center" href="#!">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-calendar3" viewBox="0 0 16 16">
                                                                                    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z" />
                                                                                    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                                                                                </svg>
                                                                                <span className="ms-2 fs-7">{moment(e?.createTime).format('MMMM Do YYYY')}</span>
                                                                            </a>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </article>
                                                    </div>
                                                ) : null
                                            ))
                                        ) : (
                                            <h2 className='text-center mt-4'>No posts to display.</h2>
                                        )
                                    ) : (
                                        <h2 className='text-center mt-4' >No posts to display.</h2>
                                    )
                                }



                            </div>
                        </div>
                    </div>


                </>
            }
        </div>
    )
}

export default PostsList