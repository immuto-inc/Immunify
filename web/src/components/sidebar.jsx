import React, { useState, useEffect } from "react";
//import { Nav, Navbar, Form, FormControl, ListGroup } from 'react-bootstrap';
import { Link } from "react-router-dom"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faList, 
    faClipboardList, 
    faSignOutAlt,
    faUser,
    faCogs
} from '@fortawesome/free-solid-svg-icons'

import logo from '../images/logo_bw.png';
import icon from '../images/logo_bw_dots.png';


// https://usehooks.com/useWindowSize/
const isClient = typeof window === 'object';
const MIN_WIDTH = 768

function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
}

function smallScreenSize(windowSize) {
    return windowSize && windowSize.width < MIN_WIDTH
}

const Sidebar = ({activeLink}) => {
    const [windowSize, setWindowSize] = useState(getSize);

    let brand = smallScreenSize(windowSize) ? icon : logo
    let iconSize = smallScreenSize(windowSize) ? "2x" : "lg"

    let linkClass = (linkName) => {
      if (linkName === activeLink) {
          return "nav-link active"
      }
      return "nav-link"
    }

    useEffect(() => {
        if (!isClient) {
          return false;
        }
        
        function handleResize() {
          setWindowSize(getSize());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return (
        <div className="wrapper">
            <ul className="navbar-nav bg-gradient-primary-dark sidebar sidebar-dark accordion" id="sidebar">

              <div className="sidebar-brand d-flex align-items-center justify-content-center">
                <Link to="/dashboard" className="m-0 p-0"><img src={brand} height="33px" alt="Immuto Logo"/></Link>
              </div>

              <hr className="sidebar-divider mt-0 mb-1"/>

              <div className="navGroup">
                  <li className="nav-item">
                    <Link className={linkClass('/dashboard')} to="/dashboard">
                    <div className="sidebarIconWrapper">
                      <FontAwesomeIcon icon={faList} size={iconSize}/>
                      </div>
                      <span className="sidebarTitle">Dashboard</span>
                    </Link>
                  </li>
              </div>

              <hr className="sidebar-divider mt-0"/>

              <div className="sidebar-heading mt-3">
                Account
              </div>

            <div className="navGroup">
              <li className="nav-item" id="sidebar-account-section">
                <Link className={linkClass('/surveys')} to="/surveys">
                      <div className="sidebarIconWrapper">
                      <FontAwesomeIcon icon={faClipboardList} size={iconSize} />
                      </div>
                      <span className="sidebarTitle align-middle">Surveys</span>
                </Link>
                <Link className={linkClass('/profile')} to="/profile">
                    <div className="sidebarIconWrapper">
                    <FontAwesomeIcon icon={faUser} size={iconSize}/></div>
                    <span className="sidebarTitle align-middle">Profile</span>
                </Link>
                <Link className={linkClass('/settings')} to="/settings">
                    <div className="sidebarIconWrapper">
                    <FontAwesomeIcon icon={faCogs} size={iconSize} />
                    </div>
                    <span className="sidebarTitle align-middle">Settings</span>
                </Link>                        
                    <Link className={linkClass('/logout')} to="/logout">
                    <div className="sidebarIconWrapper">
                    <FontAwesomeIcon icon={faSignOutAlt} size={iconSize}/>
                    </div>
                    <span className="sidebarTitle align-middle">Logout</span>
                </Link>
              </li>
              <hr className="sidebar-divider mt-4"/>
            </div>

            </ul>
        </div>
    );
}

export default Sidebar