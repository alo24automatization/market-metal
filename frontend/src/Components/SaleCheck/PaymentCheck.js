import { t } from 'i18next'
import React, { forwardRef } from 'react'
import { useSelector } from 'react-redux'

export const PaymentCheck = forwardRef((props, ref) => {
    const { payment } = props
    const { user, market } = useSelector((state) => state.login)
    const { currencyType } = useSelector((state) => state.currency)
    return (
        <div ref={ref} className={'bg-white-900 pb-8   rounded-md w-[10.4cm] print:ml-0  mx-auto'}>
            <div className='p-4'>
                <div className='w-36 border rounded-full h-36 mx-auto mb-6'>
                    <img
                        src={market?.image}
                        className='w-full h-full rounded-full object-cover'
                        alt='logo'
                    />
                </div>
                <ul className='w-full  space-y-4'>
                    <li className='check-ul-li'>
                        {t("Do'kon")}:
                        <span className='check-ul-li-span'>{market.name}</span>
                    </li>
                    <li className='check-ul-li'>
                        {t('Telefon')}:
                        <span className='check-ul-li-span'>
                            {market.phone1}
                        </span>
                    </li>
                    <li className='check-ul-li'>
                        {t('Manzil')}:
                        <span className='check-ul-li-span'>
                            {market?.address}
                        </span>
                    </li>
                    <li className='check-ul-li'>
                        {t('Sana')}:
                        <span className='check-ul-li-span'>
                            {new Date(payment?.createdAt).toLocaleDateString()}
                        </span>
                    </li>
                    <li className='check-ul-li'>
                        {t('Mijoz')}:{' '}
                        <span className='check-ul-li-span'>
                            {payment?.saleconnector?.client?.name ||
                                payment?.saleconnector?.packman?.name ||
                                ''}
                        </span>
                    </li>
                    <li className='check-ul-li'>
                        {t('Sotuvchi')}:{' '}
                        <span className='check-ul-li-span'>
                            {user.firstname} {user.lastname}
                        </span>
                    </li>
                    <li className='check-ul-li-foot border-t-1 !mt-4 font-bold'>
                        {t("To'lov")}:{' '}
                        <span>
                            {currencyType === 'USD'
                                ? payment?.payment?.toLocaleString()
                                : payment?.paymentuzs?.toLocaleString()}{' '}
                            {currencyType}
                        </span>
                    </li>
                    <li className='check-ul-li-foot border-t-0 font-bold'>
                        {t("To'lov turi")}:{' '}
                        <span>
                            {payment.type === 'cash'
                                ? `${t('Naqt')}`
                                : payment.type === 'card'
                                    ? `${t('Plastik')}`
                                    : payment.type === 'transfer'
                                        ? `${t("O'tkazma")}`
                                        : `${t('Aralash')}`
                            }
                        </span>
                    </li>
                </ul>
            </div>
            <div className='border-b-[2px] border-black-900 w-full ' />
        </div>
    )
})
