import React from 'react'
import NavbarFooterLogo from '../../Images/logo-tr.png'

const Currency = ({currency, onClick}) => {
    return (
            <div className='flex justify-center gap-3'>
            <button className='bg-blue-500 text-[white] ps-4 pe-4 pt-2 pb-2 rounded-md' disabled>
                {currency}
            </button>
            <button className='-btn-unselected' onClick={onClick}>
                {currency === 'UZS' ? 'USD' : 'UZS'}
            </button>
        </div>

        
    )
}

export default Currency
