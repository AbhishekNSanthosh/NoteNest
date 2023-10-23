import React from 'react'
import styles from './TopNavBar.module.css'
import SearchField from '../../../../components/SearchField/SearchField'

const TopNavBar = () => {
  return (
    <div className={styles.topNavBar}>
      <div className={styles.topLeft}>
        <SearchField />
      </div>
      <div className={styles.topRight}>
        <div className={styles.userBox}>
          <span className={styles.username}>Hello, Abhishek Santhosh 👋</span>
        </div>
        <div className={styles.userBox}>
          <img src="https://cloudfront-us-east-2.images.arcpublishing.com/reuters/YFUHMKIBVNKZFBGRC26PMCJURQ.jpg" alt="" className={styles.userLogo} />
        </div>
      </div>
    </div>
  )
}

export default TopNavBar