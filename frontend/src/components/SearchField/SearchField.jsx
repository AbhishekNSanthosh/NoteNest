import React from 'react'
import styles from './SearchField.module.css'

const SearchField = () => {
    return (
        <div>
            <input type="text" placeholder='Search' className={styles.inputField} />
        </div>
    )
}

export default SearchField