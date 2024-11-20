import Profile from 'layout/Dashboard/Header/HeaderContent/Profile';
import React, { useState } from 'react'
import Avatar from 'react-avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

function TopHeader({ setIsOpen, isOpen }) {

    const [menu , setMenu] = useState(false);

    const { user } = useSelector(state => state.userProfile);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    const handleMenu = () => {
        setMenu(!menu);
    };

    return (
        <header className="navbar navbar-expand-md d-print-none">
            <div className="container-xl">
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    onClick={toggleNavbar}
                    data-bs-target="#navbar-menu"
                    aria-controls="navbar-menu"
                    aria-expanded={isOpen ? 'true' : 'false'}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
                    <Link to={'/locations'}>
                        LocalSEO
                    </Link>
                </h1>
                <div className="navbar-nav flex-row order-md-last">
                    <div className="d-none d-md-flex">
                        <a
                            href="?theme=dark"
                            className="nav-link px-0 hide-theme-dark"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            aria-label="Enable dark mode"
                            data-bs-original-title="Enable dark mode"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                            </svg>
                        </a>
                        <a
                            href="?theme=light"
                            className="nav-link px-0 hide-theme-light"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            aria-label="Enable light mode"
                            data-bs-original-title="Enable light mode"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                                <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
                            </svg>
                        </a>
                        <div className="nav-item dropdown d-none d-md-flex me-3">
                            <a
                                href="#"
                                className="nav-link px-0 show"
                                data-bs-toggle="dropdown"
                                tabIndex={-1}
                                aria-label="Show notifications"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                                    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                                </svg>
                                <span className="badge bg-red" />
                            </a>

                        </div>
                    </div>
                    <div>
                        <Profile />
                    </div>
                </div>
            </div>
        </header>

    )
}

export default TopHeader