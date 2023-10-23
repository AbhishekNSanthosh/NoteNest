import React from 'react'
import styles from './SideNavBar.module.css'
import logo from '/NoteNest.svg?url'
import data from '../../Utils/Data'


const SideNavBar = () => {

  const tags = [
    "Passwords",
    "Travel",
  ]

  return (
    <div className={styles.SideNavBar}>
      <div className={styles.navWrap}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="" className={styles.logo} />
        </div>
        <div className={styles.navItemCol}>
          {data && data.map((nav, index) => (
            <div className={styles.navItem} key={index}>
              <div className={styles.iconBox}>
                <span className={`${nav.iconClass} icon`}>
                  {nav.iconName}
                </span>
              </div>
              <span className={styles.navTitle}>{nav.title}</span>
            </div>
          ))}
        </div>

        <div className={styles.tagsCol}>
          <div className={styles.tagTitle} >
            <span className={styles.navTitle}>TAGS</span>
          </div>
          <div className={styles.tagsWrap}>
            {tags.map((tag, index) => (
              <div className={styles.tagItem} key={index}>
                <span className={styles.navTitle}>#{tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.tagTitle} >
            <span className="material-symbols-outlined coloured">
              add
            </span>
            <span className={styles.actionTitle}>New Tag</span>
          </div>
          <div className={styles.tagTitle} >
            <span className="material-symbols-outlined coloured">
              groups
            </span>
            <span className={styles.actionTitle}>Collaborate</span>
          </div>
          <div className={styles.tagTitle} >
            <span className="material-symbols-outlined delete">
              delete
            </span>
            <span className={styles.archive}>Archive</span>
          </div>
        </div>
        <div className={styles.logout}>
          <button className={styles.logBtn}>
            <span class="material-symbols-outlined delete">
              logout
            </span>
            Logout</button>
          <span className={styles.credits}>All Rights Reserved.</span>
          <span className={styles.credits}>Designed & Developed By Abhishek Santhosh</span>
        </div>
      </div>
    </div>
  )
}

export default SideNavBar