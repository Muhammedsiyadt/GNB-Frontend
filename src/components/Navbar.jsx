import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function Navbar({ isOpen }) {
  let location = useLocation();

  const locationActive = (path) => {
    const pathname = location.pathname;
    if (pathname == '/locations') {
      return true;
    } else if (pathname.startsWith('/locations')) {
      return true;
    }
    return pathname === path;
  };

  return (
    <header className="navbar-expand-md">
      <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbar-menu">
        <div className="navbar">
          <div className="container-xl">
            <div className="row flex-fill align-items-center">
              <div className="col">
                <ul className="navbar-nav">
                  <li className={`nav-item ${locationActive('/locations') ? 'active' : ''}`}>
                    <Link className="nav-link" to="/locations">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="icon icon-tabler icons-tabler-outline icon-tabler-map-pin-share"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                          <path d="M12.02 21.485a1.996 1.996 0 0 1 -1.433 -.585l-4.244 -4.243a8 8 0 1 1 13.403 -3.651" />
                          <path d="M16 22l5 -5" />
                          <path d="M21 21.5v-4.5h-4.5" />
                        </svg>
                      </span>
                      <span className="nav-link-title">Locations</span>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="icon icon-tabler icons-tabler-outline icon-tabler-file-percent"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M10 17l4 -4" />
                          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                          <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                          <path d="M10 13h.01" />
                          <path d="M14 17h.01" />
                        </svg>
                      </span>
                      <span className="nav-link-title">Bulk Posting</span>
                    </a>
                  </li>

                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
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
                          <path d="M9 11l3 3l8 -8" />
                          <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
                        </svg>
                      </span>
                      <span className="nav-link-title">Reports</span>
                    </a>
                  </li>

                  <li className={`nav-item ${location.pathname == '/run-a-scan' ? 'active' : ''}`}>
                    <Link className="nav-link" to="/run-a-scan">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="icon icon-tabler icons-tabler-outline icon-tabler-map-search"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M11 18l-2 -1l-6 3v-13l6 -3l6 3l6 -3v7.5" />
                          <path d="M9 4v13" />
                          <path d="M15 7v5" />
                          <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                          <path d="M20.2 20.2l1.8 1.8" />
                        </svg>
                      </span>
                      <span className="nav-link-title">Run a Scan</span>
                    </Link>
                  </li>

                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="icon icon-tabler icons-tabler-outline icon-tabler-brand-google"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" />
                        </svg>
                      </span>
                      <span className="nav-link-title">Google Accounts</span>
                    </a>
                  </li>

                  <li className="nav-item">
                    <a className="nav-link" href="#">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="icon icon-tabler icons-tabler-outline icon-tabler-help-hexagon"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M19.875 6.27c.7 .398 1.13 1.143 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033z" />
                          <path d="M12 16v.01" />
                          <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483" />
                        </svg>
                      </span>
                      <span className="nav-link-title">Support</span>
                    </a>
                  </li>
                  <li className={`nav-item ${location.pathname == '/reviews' ? 'active' : ''}`}>
                    <a className="nav-link" href="/reviews">
                      <span className="nav-link-icon d-md-none d-lg-inline-block">
                        <FontAwesomeIcon icon={faStar} className="icon" size="lg" />
                      </span>
                      <span className="nav-link-title">Reviews</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-2 d-none d-xxl-block">
                <div className="my-2 my-md-0 flex-grow-1 flex-md-grow-0 order-first order-md-last">
                  <Input
                    type="text"
                    defaultValue=""
                    size="large"
                    prefix={<SearchOutlined />}
                    placeholder="Global Search"
                    aria-label="Search in website"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
