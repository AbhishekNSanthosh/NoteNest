import React, { Suspense } from 'react'
import styles from './Layout.module.css'
import SideNavBar from '../components/SideNavBar/SideNavBar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <div className={styles.fullPage}>
            <SideNavBar />
            <div>
                <Suspense>
                    <Outlet />
                </Suspense>
            </div>
        </div>
    )
}

export default Layout