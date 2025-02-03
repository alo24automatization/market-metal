import React, {forwardRef} from 'react'
import {map} from 'lodash'
import {useSelector} from 'react-redux'
import {t} from 'i18next'

export const SmallCheck2 = forwardRef((props, ref) => {
    const {
        selled,
        returned,
        selledDiscounts,
        returnedDiscounts,
        selledPayments,
        returnedPayments,
        product,
        userInfo,
        isReturned,
        totalOfBackAndDebt
    } = props;

    const {market} = useSelector((state) => state.login)
    const {currencyType} = useSelector((state) => state.currency)
    const calculateDebt = (total = 0, payment = 0, discount = 0) => {
        return (total - payment - discount).toLocaleString('ru-Ru')
    }
    const calculateAllDiscounts = (data) => {
        if (!data) {
            return 0
        }
        return data
            ? data?.reduce((acc, pr) => {
                return (
                    acc +
                    pr[currencyType === 'USD' ? 'discount' : 'discountuzs']
                )
            }, 0)
            : 0
    }
    const calculateAllPayments = (data) => {
        if (product && 'payment' in product) {
            return product.payment?.paymentuzs
        }
        return data
            ? data.reduce((acc, pr) => {
                return (
                    acc +
                    pr[currencyType === 'USD' ? 'payment' : 'paymentuzs']
                )
            }, 0)
            : 0
    }
    const calculateAllSum = (data) => {
        if (!data) {
            return 0
        }
        return Array.isArray(data)
            ? data?.reduce((acc, pr) => {
                return (
                    acc +
                    pr[
                        currencyType === 'USD'
                            ? 'totalprice'
                            : 'totalpriceuzs'
                        ]
                )
            }, 0)
            : data?.products?.reduce((acc, pr) => {
                return (
                    acc +
                    pr[
                        currencyType === 'USD'
                            ? 'totalprice'
                            : 'totalpriceuzs'
                        ]
                )
            }, 0)
    }
    return (
        <div ref={ref} className={'px-2'}>
            <div className='flex pb-2 flex-col text-center justify-center border-b-[0.8px] border-black-700'>
                <div className='py-4 object-contain flex items-center justify-center'>
                    <img src={market?.image} alt='logo' className='w-[170px] mx-auto  object-contain h-full'/>
                </div>
                <div className='flex justify-between items-center py-1 text-[12px] font-bold'>
                    {t('Telefon')}:
                    <span className='text-[12px] text-black-900 font-bold'>
                        {market.phone1}
                    </span>
                </div>
                <div className='flex justify-between items-center py-1 text-[12px] font-bold'>
                    {t('Manzil')}:
                    <span className='text-[12px] text-black-900 font-bold'>
                        {market?.address}
                    </span>
                </div>
                <div className='flex justify-between items-center py-1 text-[12px] font-bold'>
                    {t('Sana')}:
                    <span className='text-[12px] text-black-900 font-bold'>
                        {new Date(product?.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className='flex justify-between items-center py-1 text-[12px] font-bold'>
                    {t('Mijoz')}:{' '}
                    <span className='text-[12px] text-black-900 font-bold'>
                        {product?.client?.name || product?.packman?.name || ''}
                    </span>
                </div>
                <div className='flex justify-between items-center py-1 text-[12px] font-bold'>
                    {t('Mijoz telefoni')}:{' '}
                    <span className='text-[12px] text-black-900 font-bold'>
                        {product?.client?.phoneNumber || ''}
                    </span>
                </div>
                <div
                    className={
                        'flex justify-between items-center py-1 text-[12px] font-bold'
                    }
                >
                    {t('Sotuv')}{' '}
                    <span className='text-[12px] text-black-900 font-bold'>
                        {product?.saleconnector?.id}
                    </span>
                </div>
                <div
                    className={
                        'flex justify-between items-center py-1 text-[12px] font-bold'
                    }
                >
                    {t('Sotuvchi')}:{' '}
                    <span className='text-[12px] text-black-900 font-bold'>
                        {product?.user?.firstname} {product?.user?.lastname}
                    </span>
                </div>
            </div>
            {product?.products.length > 0 && (
                <div className='mt-5'>
                    <h3 className='text-[14px] text-black-900 mb-5 font-bold'>
                        {isReturned ? t('Qaytarilgan') : t('Sotilganlar')} :
                    </h3>
                    <div>
                        {map(product?.products.filter(product => product.pieces > 0), (item, index) => {
                            if (
                                item['more_parameters1'] &&
                                item?.more_parameters1?.length !== 0 &&
                                item?.more_parameters1?.size !== 0 &&
                                item?.more_parameters1?.piece !== 0
                            ) {
                                return (
                                    <div key={index}>
                                        <div className='text-left text-[12px] text-black-900 font-bold'>
                                            {index + 1}.{' '}
                                            {item?.product?.productdata?.name}
                                        </div>
                                        {item?.forWhat !== "" || item.forWhat ?
                                            <div
                                                className='flex justify-between text-[12px] border  border-b-0 !text-black-900 p-1 pr-3 border-slate-400'>
                                                <b>{item?.forWhat}</b>{" "}
                                                <b>{item?.pieces}</b>{" "}
                                            </div> : null
                                        }
                                        <table
                                            className='border-collapse border border-slate-400 w-full break-inside-auto'>
                                            <thead>
                                            <tr
                                                className={
                                                    'break-inside-avoid break-after-auto'
                                                }
                                            >

                                                <th className='check-table-rtr'>
                                                    {t('O`lcham')}
                                                </th>
                                                <th className='check-table-rtr'>
                                                    {t('Uzunligi')}
                                                </th>
                                                <th className='check-table-rtr'>
                                                    {t('Narxi')}
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        item?.more_parameters1
                                                            ?.size
                                                    }{" "}
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        item?.more_parameters1
                                                            ?.length
                                                    }
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        currencyType === 'USD'
                                                            ? item?.sizePrice?.toLocaleString(
                                                                'ru-Ru'
                                                            )
                                                            : item?.sizePrice?.toLocaleString(
                                                                'ru-Ru'
                                                            )
                                                    }
                                                    {currencyType}
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <div
                                            className='text-end text-[12px] border font-bold border-t-0 !text-black-900 p-1 pr-3 border-slate-400'>
                                            Umumiy: {item?.more_parameters1?.length} *{' '}
                                            {currencyType === 'USD'
                                                ? item?.[item?.sizePrice === "" || item?.sizePrice === undefined ? "unitprice" : "sizePrice"]?.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.[item?.sizePrice === "" || item?.sizePrice === undefined ? "unitpriceuzs" : "sizePrice"]?.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            ={' '}
                                            {currencyType === 'USD'
                                                ? item?.totalprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.totalpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            {currencyType}
                                        </div>
                                        <br/>
                                    </div>
                                )
                            } else if (item?.more_parameters2?.length > 0) {
                                return <div>
                                    <div className='text-left  text-[12px] text-black-900 font-bold'>
                                        {index + 1}.{' '}
                                        {item?.product?.productdata?.name}
                                    </div>
                                    <table className='border-collapse border border-slate-400 w-full break-inside-auto'>
                                        <thead>
                                        <tr
                                            className={
                                                'break-inside-avoid break-after-auto'
                                            }
                                        >
                                            <th className='check-table-rtr'>
                                                {t('O`lcham')}
                                            </th>
                                            <th className='check-table-rtr'>
                                                {t('Soni')}
                                            </th>
                                            <th className='check-table-rtr'>
                                                {t('Umumiy')}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            item['more_parameters2'] && item?.more_parameters2?.map((column) => <tr>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        column.col1
                                                    }
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        column.col2
                                                    }
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        column.result
                                                    }
                                                </td>
                                            </tr>)
                                        }
                                        </tbody>
                                    </table>
                                    <div
                                        className='text-end text-[12px] border border-t-0 !text-black-900 p-1 pr-3 font-bold border-slate-400'>
                                        {t("Umumiy")}: {item?.more_parameters2?.reduce((el, prev) => {
                                        return el + prev.result
                                    }, 0)}
                                    </div>
                                    <div className='text-end text-[12px] mt-4 font-bold'>
                                        <h1>{item?.more_parameters2.reduce((el, prev) => {
                                            return el + prev.result
                                        }, 0)} {" "}
                                            * {' '}
                                            {currencyType === 'USD'
                                                ? item?.unitprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.unitpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            ={' '}
                                            {currencyType === 'USD'
                                                ? item?.totalprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.totalpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            {currencyType}
                                        </h1>
                                    </div>
                                    <br/>
                                </div>
                            } else {
                                return (
                                    <div>
                                        <div className='text-left text-[12px] text-black-900 font-bold'>
                                            {index + 1}.{' '}
                                            {item?.product?.productdata?.name}
                                        </div>
                                        <div className='text-right text-[12px] text-black-900 font-bold'>
                                            {item?.pieces} *{' '}
                                            {currencyType === 'USD'
                                                ? item?.unitprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.unitpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            ={' '}
                                            {currencyType === 'USD'
                                                ? item?.totalprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.totalpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            {currencyType}
                                        </div>
                                        <br/>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            )}
            {returned?.length > 0 && (
                <div className='mt-5'>
                    <h3 className='text-[14px] text-black-900 mb-5 font-bold'>
                        {t('Qaytarilgan')} :
                    </h3>
                    <div>
                        {map(returned, (item, index) => {
                            if (
                                item['more_parameters1'] &&
                                item?.more_parameters1?.length !== 0 &&
                                item?.more_parameters1?.size !== 0 &&
                                item?.more_parameters1?.piece !== 0
                            ) {
                                return (
                                    <div>
                                        <div className='text-left text-[12px] text-black-900 font-bold'>
                                            {index + 1}.{' '}
                                            {item?.product?.productdata?.name}
                                        </div>
                                        {item?.forWhat !== "" || item.forWhat ?
                                            <div
                                                className='text-start text-[12px] border  border-b-0 !text-black-900 p-1 pr-3 border-slate-400'>
                                                <b>{item?.forWhat}</b>{" "}
                                            </div> : null
                                        }
                                        <table
                                            className='border-collapse border border-slate-400 w-full break-inside-auto'>
                                            <thead>
                                            <tr
                                                className={
                                                    'break-inside-avoid break-after-auto'
                                                }
                                            >

                                                <th className='check-table-rtr'>
                                                    {t('O`lcham')}
                                                </th>
                                                <th className='check-table-rtr'>
                                                    {t('Uzunligi')}
                                                </th>
                                                <th className='check-table-rtr'>
                                                    {t('Narxi')}
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        item?.more_parameters1
                                                            ?.size
                                                    }{" "}
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        item?.more_parameters1
                                                            ?.length
                                                    }
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        currencyType === 'USD'
                                                            ? item?.sizePrice?.toLocaleString(
                                                                'ru-Ru'
                                                            )
                                                            : item?.sizePrice?.toLocaleString(
                                                                'ru-Ru'
                                                            )
                                                    }
                                                    {currencyType}
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <div
                                            className='text-end text-[12px] border font-bold border-t-0 !text-black-900 p-1 pr-3 border-slate-400'>
                                            Umumiy: {item?.more_parameters1?.length} *{' '}
                                            {currencyType === 'USD'
                                                ? item?.[item?.sizePrice === "" || item?.sizePrice === undefined ? "unitprice" : "sizePrice"]?.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.[item?.sizePrice === "" || item?.sizePrice === undefined ? "unitpriceuzs" : "sizePrice"]?.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            ={' '}
                                            {currencyType === 'USD'
                                                ? item?.totalprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.totalpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            {currencyType}
                                        </div>
                                        <br/>
                                    </div>
                                )
                            } else if (item?.more_parameters2?.length > 0) {
                                return <div>
                                    <div className='text-left  text-[12px] text-black-900 font-bold'>
                                        {index + 1}.{' '}
                                        {item?.product?.productdata?.name}
                                    </div>
                                    <table className='border-collapse border border-slate-400 w-full break-inside-auto'>
                                        <thead>
                                        <tr
                                            className={
                                                'break-inside-avoid break-after-auto'
                                            }
                                        >
                                            <th className='check-table-rtr'>
                                                {t('O`lcham')}
                                            </th>
                                            <th className='check-table-rtr'>
                                                {t('Soni')}
                                            </th>
                                            <th className='check-table-rtr'>
                                                {t('Umumiy')}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            item['more_parameters2'] && item?.more_parameters2?.map((column) => <tr>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        column.col1
                                                    }
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        column.col2
                                                    }
                                                </td>
                                                <td className='check-table-body text-center'>
                                                    {
                                                        column.result
                                                    }
                                                </td>
                                            </tr>)
                                        }
                                        </tbody>
                                    </table>
                                    <div
                                        className='text-end text-[12px] border border-t-0 !text-black-900 p-1 pr-3 font-bold border-slate-400'>
                                        {t("Umumiy")}: {item?.more_parameters2?.reduce((el, prev) => {
                                        return el + prev.result
                                    }, 0)}
                                    </div>
                                    <div className='text-end text-[12px] mt-4 font-bold'>
                                        <h1>{item?.more_parameters2.reduce((el, prev) => {
                                            return el + prev.result
                                        }, 0)} {" "}
                                            * {' '}
                                            {currencyType === 'USD'
                                                ? item?.unitprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.unitpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            ={' '}
                                            {currencyType === 'USD'
                                                ? item?.totalprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.totalpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            {currencyType}
                                        </h1>
                                    </div>
                                    <br/>
                                </div>
                            } else {
                                return (
                                    <div>
                                        <div className='text-left text-[12px] text-black-900 font-bold'>
                                            {index + 1}.{' '}
                                            {item?.product?.productdata?.name}
                                        </div>
                                        <div className='text-right text-[12px] text-black-900 font-bold'>
                                            {item?.pieces} *{' '}
                                            {currencyType === 'USD'
                                                ? item?.unitprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.unitpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            ={' '}
                                            {currencyType === 'USD'
                                                ? item?.totalprice.toLocaleString(
                                                    'ru-Ru'
                                                )
                                                : item?.totalpriceuzs.toLocaleString(
                                                    'ru-Ru'
                                                )}{' '}
                                            {currencyType}
                                        </div>
                                        <br/>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            )}
            <div className='border-t-[0.8px] border-black-700 w-full mt-4 mb-4 text-left'>
                <h3
                    style={{fontWeight: 'bolder'}}
                    className='text-black-900 text-[12px] font-bold pt-4'
                >
                    {t('Jami')} :{' '}
                    <span style={{fontWeight: "bolder"}} className='text-black-900 text-[12px] font-bold'>
                        {calculateAllSum(product).toLocaleString('ru-Ru')}{' '}
                        {currencyType}
                    </span>
                </h3>
                <h3
                    style={{fontWeight: 'bolder', display: isReturned ? "none" : "block"}}
                    className='text-black-900 text-[12px] font-bold pt-4'
                >
                    {' '}
                    {t('Chegirma')}:{' '}
                    <span
                        style={{fontWeight: 'bolder'}}
                        className='text-black-900 text-[12px] font-bold'
                    >
                        {product && 'payment' in product ? (product?.hasOwnProperty('discount')
                            ? currencyType === 'USD'
                                ? product?.discount.discount
                                : product?.discount.discountuzs
                            : 0) : (
                            calculateAllDiscounts(selledDiscounts) +
                            calculateAllDiscounts(returnedDiscounts)
                        ).toLocaleString('ru-Ru')}{' '}
                        {currencyType}
                    </span>
                </h3>
                <h3
                    style={{fontWeight: 'bolder'}}
                    className='text-black-900 text-[12px] font-bold pt-4'
                >
                    {' '}
                    {t("To'langan")}:{' '}
                    <span
                        style={{fontWeight: 'bolder'}}
                        className='text-black-900 text-[12px] font-bold'
                    >
                        {product && 'payment' in product ? calculateAllPayments() : (
                            calculateAllPayments(selledPayments) +
                            calculateAllPayments(returnedPayments)
                        ).toLocaleString('ru-Ru')}{' '}
                        {currencyType}
                    </span>
                </h3>

                <h3
                    style={{
                        fontWeight: 'bolder',
                        display: returned?.length > 0 ? "block" : "none"
                    }}
                    className='text-black-900 text-[12px] font-bold pt-4'
                >
                    {' '}
                    {t('Qarzdan qaytarilganlar')}:{' '}
                    <span
                        style={{fontWeight: 'bolder'}}
                        className='text-black-900 text-[12px] font-bold'
                    >
                          {totalOfBackAndDebt?.toLocaleString('ru-Ru')}{' '}
                        {currencyType}
                    </span>
                </h3>
                <h3
                    style={{fontWeight: 'bolder', display: isReturned ? "none" : "block"}}
                    className='text-black-900 text-[12px] font-bold pt-4'
                >
                    {' '}
                    {t('Qarz')}:{' '}
                    <span
                        style={{fontWeight: 'bolder'}}
                        className='text-black-900 text-[12px] font-bold'
                    >
                        {currencyType === 'USD'
                            ? calculateDebt(
                                product?.payment?.totalprice,
                                product?.payment?.payment,
                                product?.discount?.discount
                            )
                            : product && 'payment' in product ? calculateDebt(
                                product?.payment?.totalpriceuzs,
                                product?.payment?.paymentuzs,
                                product?.discount?.discountuzs
                            ) : (
                                calculateAllSum(selled) +
                                calculateAllSum(returned) -
                                (calculateAllPayments(selledPayments) +
                                    calculateAllPayments(returnedPayments)) -
                                (calculateAllDiscounts(selledDiscounts) +
                                    calculateAllDiscounts(returnedDiscounts))
                            ).toLocaleString('ru-Ru')}{' '}
                        {currencyType}
                    </span>
                </h3>
                <h3
                    style={{fontWeight: 'bolder', display: isReturned ? "none" : "block"}}
                    className='text-black-900 text-[12px] font-bold pt-4'
                >
                    {' '}
                    {t('Umumiy qarz')}:{' '}
                    <span className='text-black-900 text-[12px] font-bold'>
                    {(currencyType === 'USD' ? product?.totaldebtusd || 0 : product?.totaldebtuzs || 0).toLocaleString("ru-Ru")}{' '}
                        {currencyType}
                </span>
                </h3>
            </div>

            {market.qrcode && (
                <div className='w-[120px] h-[120px] mx-auto'>
                    <img src={market.qrcode} alt='qrcode'/>
                </div>
            )}
        </div>
    )
})
