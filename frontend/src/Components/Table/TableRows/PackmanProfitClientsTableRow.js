import React from 'react'
import {map, uniqueId} from 'lodash'

const PackmanProfitClientsTableRow = ({
    data,
    currentPage,
    countPage,
    Edit,
    Delete,
    showClients,
    currency,
    changeCheckbox,
    selectedSale,
}) => {
    const result = (prev, usd, uzs) => {
        return currency === 'USD' ? prev + usd : prev + uzs
    }
    const reduceEl = (arr, usd, uzs) => {
        return (
            (arr?.length > 0 &&
                arr?.reduce((prev, item) => {
                    return result(prev, item[usd], item[uzs])
                }, 0)) ||
            0
        )
    }
    const isPayed = (clientSaleconnector) => {
        return (
            data?.payments?.some((payment) =>
                payment?.packman_saleconnectors?.some(
                    (saleconnector) => saleconnector === clientSaleconnector
                )
            ) || 0
        )
    }
    const findPayment = (clientSaleconnector) => {
        return (
            data?.payments?.find((payment) =>
                payment?.packman_saleconnectors?.some(
                    (saleconnector) => saleconnector === clientSaleconnector
                )
            ) || 0
        )
    }
    const totalNotPayments = (packman) => {
        if (!packman.commission) return 0
        const paymentsTotal =
            packman?.payments?.reduce(
                (prev, item) => prev + item.paymentuzs,
                0
            ) || 0
        return packman.commissionProfit - paymentsTotal
    }

    return (
        <>
            {map(data.clients, (client, index) => (
                <tr className='tr !p-2' key={uniqueId('packmanProfitClients')}>
                    <td className='text-left td'>{index + 1}</td>
                    <td className='text-left td'>
                        {new Date(
                            client.saleconnector.createdAt
                        ).toLocaleDateString()}
                    </td>
                    <td className='text-left td'>{client.name}</td>
                    <td className='text-left td'>{client.phoneNumber}</td>
                    <td className='text-left td'>
                        {' '}
                        {reduceEl(
                            client.saleconnector.products,
                            'totalprice',
                            'totalpriceuzs'
                        ).toLocaleString('ru-Ru')}{' '}
                        {currency}
                    </td>
                    <td className='text-left td'>
                        {(reduceEl(
                            client.saleconnector.products,
                            'totalprice',
                            'totalpriceuzs'
                        ) *
                            data.commission) /
                            100}{' '}
                        {currency}
                    </td>
                    <td className='text-left td '>
                        {data?.payments?.find((payment) =>
                            payment.packman_saleconnectors.some(
                                (saleconnector) =>
                                    saleconnector === client.saleconnector._id
                            )
                        )
                            ? (reduceEl(
                                  client.saleconnector.products,
                                  'totalprice',
                                  'totalpriceuzs'
                              ) *
                                  data.commission) /
                              100
                            : null}{' '}
                        {currency}
                    </td>
                    <td className='text-center td p-2'>
                        {isPayed(client?.saleconnector?._id) ? (
                            new Date(
                                findPayment(
                                    client?.saleconnector?._id
                                )?.createdAt
                            ).toLocaleDateString()
                        ) : (
                            <input
                                checked={selectedSale.some(
                                    (item) =>
                                        item.saleconnector._id ===
                                        client.saleconnector._id
                                )}
                                onChange={() =>
                                    changeCheckbox(data, client.saleconnector)
                                }
                                type='checkbox'
                            />
                        )}
                    </td>
                </tr>
            ))}
        </>
    )
}

export default PackmanProfitClientsTableRow
