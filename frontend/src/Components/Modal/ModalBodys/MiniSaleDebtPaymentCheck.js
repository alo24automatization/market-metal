import {t} from 'i18next'
import {map} from 'lodash'
import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {useReactToPrint} from 'react-to-print'
import TableBtn from '../../Buttons/TableBtn'
import SmallLoader from '../../Spinner/SmallLoader'
import {IoPrint} from 'react-icons/io5'
import PrintBtn from '../../Buttons/PrintBtn'

const MiniSaleDebtPaymentCheck = ({data, type}) => {
    const [totalCard, setTotalCard] = useState(0)
    const [totalCash, setTotalCash] = useState(0)
    const [totalTransfer, setTotalTransfer] = useState(0)
    const {user, market} = useSelector((state) => state.login)
    const {currencyType} = useSelector((state) => state.currency)
    const componentRef = useRef()
    const [loadContent, setLoadContent] = useState(false)
    const onBeforeGetContentResolve = useRef(null)
    useEffect(() => {
        calcTotalPayments()
    }, [data, type, currencyType])

    const handleOnBeforeGetContent = useCallback(() => {
        setLoadContent(true)
        return new Promise((resolve) => {
            onBeforeGetContentResolve.current = resolve
            setTimeout(() => {
                setLoadContent(false)
                resolve()
            }, 2000)
        })
    }, [])

    const reactToPrintContent = useCallback(() => {
        return componentRef.current
    }, [componentRef])

    const print = useReactToPrint({
        content: reactToPrintContent,
        documentTitle: 'All Checks',
        onBeforeGetContent: handleOnBeforeGetContent,
        removeAfterPrint: false,
        pageStyle: '@page { size: A4; margin: 0mm; }'
    })

    useEffect(() => {
        if (
            loadContent &&
            typeof onBeforeGetContentResolve.current === 'function'
        ) {
            onBeforeGetContentResolve.current()
        }
    }, [loadContent])

    const calcTotalPayments = useCallback(() => {
        const calculate = (key) => {
            if (type === 'all') {
                return (data?.saleconnector || data)?.payments?.reduce((prev, el) => {
                    return prev + el[currencyType === 'USD' ? key : `${key}uzs`]
                }, 0)
            } else if (type === 'debtPayed') {
                return data[currencyType === 'USD' ? key : `${key}uzs`]
            } else {
                return (data?.saleconnector || data)?.payments?.filter((item) => item.totalpriceuzs === undefined).reduce((prev, payment) => {
                    return prev + payment[currencyType === 'USD' ? key : `${key}uzs`]
                }, 0)
            }
        }
        setTotalCard(calculate('card'))
        setTotalCash(calculate('cash'))
        setTotalTransfer(calculate('transfer'))
    }, [data, type, currencyType])

    const findProductById = useCallback((products, productId) => {
        return products.find((p) => p._id === productId)
    }, [])
    const generatePaymentItem = useCallback((payment) => {
        return (
            <li className='border-b mt-3' key={`${payment._id}`}>
                    <span className='check-ul-li'>
                        <span>{new Date(payment?.createdAt).toLocaleDateString()}</span>
                        <span>
                            {payment['paymentuzs']?.toLocaleString('ru-RU')} {currencyType}
                        </span>
                    </span>
            </li>
        )
    }, [data.products, findProductById])

    const paymentItems = useMemo(() => {
        return data?.saleconnector?.payments?.filter((item) => item.totalpriceuzs === undefined)?.flatMap(
            (payment) =>
                generatePaymentItem(payment)
        )
    }, [data, currencyType, generatePaymentItem])
    const parseToIntOrFloat = (value) => {
        if (!value || value === 0) return 0
        else if (value % 1 === 0) {
            return parseInt(value)
        } else {
            return Number(parseFloat(value).toFixed(2))
        }
    }
    return (
        <div>
            {loadContent && (
                <div
                    className='fixed backdrop-blur-[2px] left-0 top-0 bg-white-700 flex flex-col items-center justify-center w-full h-full'>
                    <SmallLoader/>
                </div>
            )}
            <div className='w-full grid'>
                <div
                    className='w-[10.4cm] py-10 rounded-md bg-white-900 h-full mx-auto print:ml-0'
                    ref={componentRef}
                >
                    <div className='w-36 border rounded-full h-36 mx-auto'>
                        <img
                            src={market?.image}
                            className='w-full h-full rounded-full object-cover'
                            alt='logo'
                        />
                    </div>
                    <div className='mx-auto px-3'>
                        <ul className='w-full '>
                            <li className='check-ul-li'>
                                {t("Do'kon")}:
                                <span className='check-ul-li-span'>
                                    {market.name}
                                </span>
                            </li>
                            <li className='check-ul-li'>
                                {t('Telefon')}:
                                <span className='check-ul-li-span'>
                                    {market.phone1}
                                </span>
                            </li>
                            <li className='check-ul-li'>
                                {t('Sana')}:
                                <span className='check-ul-li-span'>
                                    {new Date(Array.isArray(data) ? data[data.length - 1]?.createdAt : data?.createdAt).toLocaleDateString()}
                                </span>
                            </li>
                        </ul>
                        <hr/>
                        <h2 className='text-center text-lg mt-2 font-medium'>
                            {t("Qarzdan to'lov")}
                        </h2>
                        <ul className='my-4'>
                            {type === 'all' ? (
                                map(data?.payments, (payment, index) => (
                                    <li className='border-b mt-3' key={index}>
                                        <span className='check-ul-li'>
                                            <span>{new Date(payment?.createdAt).toLocaleDateString()}</span>
                                            <span>
                                                {parseToIntOrFloat(payment[currencyType === 'USD' ? 'payment' : 'paymentuzs'])}{' '}
                                                {currencyType}
                                            </span>
                                        </span>
                                    </li>
                                ))
                            ) : type === 'debtPayed' ? (
                                <li className='check-ul-li text-lg'>
                                    <span className='font-semibold'>{t("Umumiy")}:</span>
                                    <span> {
                                        parseToIntOrFloat(data[currencyType === 'USD' ? 'payment' : 'paymentuzs'])
                                    } {currencyType}</span>
                                </li>
                            ) : (
                                paymentItems
                            )}
                        </ul>

                        <div className={type === "debtPayed" ? 'border-t space-y-1 mt-1 pt-4' : 'space-y-1 mt-1'}>
                            <div className='font-semibold flex justify-between items-center'>
                                <span>{t('Naqt')}:</span>
                                <span>
                                    {parseToIntOrFloat(totalCash)?.toLocaleString("ru-Ru")} {currencyType}
                                </span>
                            </div>
                            <div className='font-semibold flex justify-between items-center'>
                                <span>{t('Plastik')}:</span>
                                <span>
                                    {parseToIntOrFloat(totalCard)?.toLocaleString("ru-Ru")} {currencyType}
                                </span>
                            </div>
                            <div className='font-semibold flex justify-between items-center pb-4'>
                                <span>{t("O'tkazma")}:</span>
                                <span>
                                    {parseToIntOrFloat(totalTransfer)?.toLocaleString("ru-Ru")} {currencyType}
                                </span>
                            </div>
                        </div>
                    </div>
                    <hr className="w-full h-[5px] print:h-[10px] mt-[5cm] bg-[#000]"/>
                </div>
            </div>
            <div className='w-full flex justify-end'>
                <PrintBtn onClick={print}/>
            </div>
        </div>
    )
}

export default MiniSaleDebtPaymentCheck
