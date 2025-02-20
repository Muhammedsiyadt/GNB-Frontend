import { ImageList, ImageListItem } from '@mui/material'
import { Card, Empty, Flex, Image, Rate, Spin, Typography } from 'antd'
import React from 'react'
import { useSelector } from 'react-redux'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'

function LocationMedia() {

    const { loading, error, data } = useSelector((state) => state.getLocation)

    function srcset(image, size, rows = 1, cols = 1) {
        return {
            src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
            srcSet: `${image}?w=${size * cols}&h=${size * rows
                }&fit=crop&auto=format&dpr=2 2x`,
        };
    }

    const images = [
        "https://picsum.photos/200/300?image=1050",
        "https://picsum.photos/400/400?image=1039",
        "https://picsum.photos/400/400?image=1080",
        "https://picsum.photos/200/200?image=997",
        "https://picsum.photos/500/400?image=287",
        "https://picsum.photos/400/500?image=955",
        "https://picsum.photos/200/300?image=916",
        "https://picsum.photos/300/300?image=110",
        "https://picsum.photos/300/300?image=206",
    ]


    return (


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

 

                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                    <Masonry columnsCount={3} gutter="10px">
                        {data?.media?.mediaItems ? data?.media?.mediaItems?.map((item, key) => (
                            <Image
                                key={key+1}
                                src={item.googleUrl}
                            />
                        )) : null}
                    </Masonry>
                </ResponsiveMasonry>

                {data?.media?.mediaItems ? null : <div className='d-flex justify-content-center align-items-center mt-5'><Empty description="No media" /></div>}

            </>}
        </Card>
    )
}

export default LocationMedia