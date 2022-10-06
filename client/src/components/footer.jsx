import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const footerItems = [
    {
        title: "今天事項",
        link: "/dashboard",
        image: "bi bi-list-stars",
    },
	{
        title: "見客記錄",
        link: "/addrecord",
        image: "bi bi-person-check-fill",
    },
    {
        title: "客戶列表",
        link: "/meetinglist",
        image: "bi bi-person-lines-fill",
    },
    {
        title: "招募記錄",
        link: "/addcandidate",
        image: "bi bi-clipboard2-heart",
    },
    {
        title: "招募列表",
        link: "/candidatelist",
        image: "bi bi-clipboard2-data"
    },
    {
        title: "設定",
        link: "/settings",
        image: "bi bi-gear",
    }
]

export default function Footer(props) {

    let location = useLocation();

    return (
        <div className='w-100  fixed-bottom shadow-lg bg-black rounded'
            style={{ height: "80px" }}>
            <div className='w-100 d-flex flex-row justify-content-around'>
                {
                    footerItems.map((item, index) => {
                        return (
                            <div className='p-2 m-20 h-100' key={index}>
                                <Link className='d-inline-flex flex-column justify-content-center align-items-center rounded' 
                                style={location.pathname.includes (item.link) ? {
                                    color: '#727272',
                                    textDecoration: 'none',
                                }: {
                                    color: 'white',
                                    textDecoration: 'none',
                                }}
                                to={item.link}>
                                    <div className={item.image} style={{fontSize:"30px"}}/>
                                    <small>{item.title}</small>
                                </Link>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}
