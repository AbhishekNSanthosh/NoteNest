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
s
      </div>
    </div>
  )
}

export default TopNavBar