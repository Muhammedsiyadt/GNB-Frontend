import { Card, Descriptions, Flex, Rate, Spin, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector } from 'react-redux';
import MarkerIcon from 'assets/images/marker-icon.png';
import { Icon } from 'leaflet';

function LocationDetails() {
    const { loading, error, data } = useSelector((state) => state.getLocation)
    const lat = data?.locationData?.geometry?.location?.lat;
    const lng = data?.locationData?.geometry?.location?.lng;
    const name = data?.locationData?.name || 'N/A';

    const blueIcon = new Icon({
        iconUrl: MarkerIcon,
        iconAnchor: [12, 25],
        popupAnchor: [-3, -76],
    });

    return (

        <>

            <Card style={{ borderRadius: "0px" }} title={loading ? null : <>
                <Flex gap={"20px"} align="center" className='mb-4' style={{ marginTop: "20px" }}>
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
                </div>

                }

            </>} bordered={false}>
                {loading ? <Flex justify="center"><Spin tip="Loading please wait a moment"></Spin> </Flex> : <>


                    <div className="row gap-2">
                        <div className="col-md-7">
                            <Descriptions layout="vertical" size="default">
                                <Descriptions.Item label="Address">
                                    {data?.locationData?.formatted_address ? data?.locationData?.formatted_address : 'N/A'}
                                </Descriptions.Item>

                            </Descriptions>

                            <Descriptions layout="vertical" size="default">

                                <Descriptions.Item label="Store Code">{data?.locationData?.store_code ? data?.locationData?.store_code : 'N/A'}</Descriptions.Item>

                            </Descriptions>

                            <Descriptions layout="vertical" size="default">
                                <Descriptions.Item label="Phone">{data?.locationData?.international_phone_number ? data?.locationData?.international_phone_number : 'N/A'}</Descriptions.Item>

                                <Descriptions.Item label="Business Status">{data?.locationData?.business_status ? data?.locationData?.business_status : 'N/A'}</Descriptions.Item>
                            </Descriptions>

                            <Descriptions layout="vertical" size="default">
                                <Descriptions.Item label="Website">{data?.locationData?.website ? <a href={data?.locationData?.website} target='_blank'>{data?.locationData?.website}</a> : "N/A"}</Descriptions.Item>
                            </Descriptions>


                            <Descriptions layout="vertical" size="default">
                                <Descriptions.Item label="Description">{data?.locationData?.website ? data?.data?.profile?.description : "N/A"}</Descriptions.Item>
                            </Descriptions>

                        </div>
                        <div className="col-md-4">
                            <h3>
                                <strong>Place ID: {data?.locationData?.place_id ? data?.locationData?.place_id : 'N/A'}</strong>
                            </h3>

                            {
                                lat !== undefined && lng !== undefined ? (
                                    <MapContainer
                                        style={{ height: "300px" }}
                                        key={data?.locationData?.place_id}
                                        center={[lat, lng]}
                                        zoom={14}
                                        icon={MarkerIcon}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[lat, lng]} icon={blueIcon}>
                                            <Tooltip direction="bottom" offset={[0, 20]} opacity={1} permanent>
                                                {name}
                                            </Tooltip>
                                        </Marker>
                                    </MapContainer>
                                ) : (
                                    <div>Loading map...</div>
                                )
                            }

                            <div className="d-flex mt-3 gap-3 align-items-center flex-wrap">
                                <div className="d-flex align-items-center gap-1 mt-3">
                                    <div>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF0000" className="icon icon-tabler icons-tabler-filled icon-tabler-brand-google"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" /></svg>
                                    </div>
                                    <div>
                                        <div className='mt-1'>
                                            <a href={data?.data?.metadata?.mapsUrl} className='fw-medium' target="_blank">Google Map</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-1 mt-3">
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-message-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5.821 4.91c3.899 -2.765 9.468 -2.539 13.073 .535c3.667 3.129 4.168 8.238 1.152 11.898c-2.841 3.447 -7.965 4.583 -12.231 2.805l-.233 -.101l-4.374 .931l-.04 .006l-.035 .007h-.018l-.022 .005h-.038l-.033 .004l-.021 -.001l-.023 .001l-.033 -.003h-.035l-.022 -.004l-.022 -.002l-.035 -.007l-.034 -.005l-.016 -.004l-.024 -.005l-.049 -.016l-.024 -.005l-.011 -.005l-.022 -.007l-.045 -.02l-.03 -.012l-.011 -.006l-.014 -.006l-.031 -.018l-.045 -.024l-.016 -.011l-.037 -.026l-.04 -.027l-.002 -.004l-.013 -.009l-.043 -.04l-.025 -.02l-.006 -.007l-.056 -.062l-.013 -.014l-.011 -.014l-.039 -.056l-.014 -.019l-.005 -.01l-.042 -.073l-.007 -.012l-.004 -.008l-.007 -.012l-.014 -.038l-.02 -.042l-.004 -.016l-.004 -.01l-.017 -.061l-.007 -.018l-.002 -.015l-.005 -.019l-.005 -.033l-.008 -.042l-.002 -.031l-.003 -.01v-.016l-.004 -.054l.001 -.036l.001 -.023l.002 -.053l.004 -.025v-.019l.008 -.035l.005 -.034l.005 -.02l.004 -.02l.018 -.06l.003 -.013l1.15 -3.45l-.022 -.037c-2.21 -3.747 -1.209 -8.391 2.413 -11.119z" /></svg>
                                    </div>
                                    <div>
                                        <div className='mt-1'>
                                            <a href={data?.data?.metadata?.newReviewUri} className='fw-medium' target="_blank">Reviews</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <Descriptions layout="vertical" size="default">
                                    <Descriptions.Item label="Categories">{data?.data?.categories ? <>
                                        <div className="d-flex flex-wrap gap-2">
                                            {data?.data?.categories?.additionalCategories?.map((e, key) => {
                                                return <Tag color="processing">{e?.displayName}</Tag>
                                            })}
                                        </div>
                                    </> : "N/A"}</Descriptions.Item>
                                </Descriptions>
                            </div>




                        </div>
                    </div>

                </>}
            </Card>

        </>
    )
}

export default LocationDetails