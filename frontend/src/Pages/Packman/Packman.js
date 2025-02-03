import React, {useEffect, useState} from 'react'
import Button from '../../Components/Buttons/BtnAddRemove'
import Table from '../../Components/Table/Table'
import FieldContainer from '../../Components/FieldContainer/FieldContainer'
import Pagination from '../../Components/Pagination/Pagination'
import SearchForm from '../../Components/SearchForm/SearchForm'
import {useDispatch, useSelector} from 'react-redux'
import UniversalModal from '../../Components/Modal/UniversalModal'
import Spinner from '../../Components/Spinner/SmallLoader'
import NotFind from '../../Components/NotFind/NotFind'
import {motion} from 'framer-motion'
import {
    successAddPackmanMessage,
    successDeletePackmanMessage,
    successUpdatePackmanMessage,
    universalToast,
    warningEmptyInput,
    warningMorePayment,
} from '../../Components/ToastMessages/ToastMessages'
import {
    addPackman,
    clearErrorPackmans,
    clearSearchedPackmans,
    clearSuccessAddPackmans,
    clearSuccessDeletePackmans,
    clearSuccessUpdatePackmans,
    deletePackman,
    getPackmans,
    getPackmansByFilter,
    payAgentProfit,
    updatePackman,
} from './packmanSlice'
import {
    checkEmptyString,
    UsdToUzs,
    UzsToUsd,
} from '../../App/globalFunctions.js'
import {useTranslation} from 'react-i18next'
import {filter} from 'lodash'
import TableMobile from '../../Components/Table/TableMobile.js'
import SelectForm from '../../Components/Select/SelectForm.js'
import CustomerPayment from '../../Components/Payment/CustomerPayment.js'

function Packman() {
    const {t} = useTranslation(['common'])
    const dispatch = useDispatch()
    const {market, user} = useSelector((state) => state.login)
    const {
        errorPackmans,
        packmans,
        successAddPackman,
        successUpdatePackman,
        successDeletePackman,
        loading,
        searchedPackmans,
        total,
        totalSearched,
    } = useSelector((state) => state.packmans)

    const headers = [
        {styles: 'w-[10%] text-start', filter: '', title: '№'},
        {styles: 'w-[80%] text-start', filter: '', title: t('Agentlar')},
        {styles: 'w-[100%] text-start', filter: '', title: t('Umumiy savdo')},
        {styles: 'w-[100%] text-start', filter: '', title: t('Agent ulushi')},
        {styles: 'w-[10%]', filter: '', title: ' '},
    ]
    const agentClientsTableHeaders = [
        {
            title: '№',
        },
        {
            title: t('Sana'),
        },
        {
            title: t('Mijoz'),
        },
        {
            title: t('Telefon'),
        },
        {
            title: t('Jami'),
        },
        {
            title: t('Komissiya'),
        },
        {
            title: t("To'langan"),
        },
        {
            title: "Komissiya to'langan sana",
        },
    ]
    //states
    const [data, setData] = useState([])
    const [searchedData, setSearchedData] = useState('')
    const [packmanName, setPackmanName] = useState('')
    const [packmanCommission, setPackmanCommission] = useState('')
    const [currentPackman, setCurrentPackman] = useState('')
    const [deletedPackman, setDeletedPackman] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [stickyForm, setStickyForm] = useState(false)
    const [showByTotal, setShowByTotal] = useState('10')
    const [currentPage, setCurrentPage] = useState(0)
    const [filteredDataTotal, setFilteredDataTotal] = useState(total)
    const [searchByName, setSearchByName] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [clickedPackman, setClickedPackman] = useState([])
    const [agentClientsModalVisible, setAgentClientsModalVisible] =
        useState(false)
    // Payments STATES
    const [paymentModalVisible, setPaymentModalVisible] = useState(false)
    const [paymentType, setPaymentType] = useState('cash')
    const [paymentCashUzs, setPaymentCashUzs] = useState('')
    const [paymentCardUzs, setPaymentCardUzs] = useState('')
    const [paymentTransfer, setPaymentTransfer] = useState('')
    const [paymentTransferUzs, setPaymentTransferUzs] = useState('')
    const [allPaymentUzs, setAllPaymentUzs] = useState(0)
    const [approveModalVisible, setApproveModalVisible] = useState(false)
    const [paidUzs, setPaidUzs] = useState(0)
    const currencyType = 'UZS'
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])
    // modal toggle
    const toggleModal = () => setModalVisible(!modalVisible)

    // handle changed input
    const handleChangePackmanName = (e) => {
        setPackmanName(e.target.value)
    }
    const handleChangeAgentCommission = (e) =>
        setPackmanCommission(e.target.value)

    // table edit and delete
    const handleEditPackman = (packman) => {
        setCurrentPackman(packman)
        setPackmanName(packman.name)
        setPackmanCommission(packman.commission)
        setStickyForm(true)
    }

    const handleDeletePackman = (packman) => {
        setDeletedPackman(packman)
        toggleModal()
    }

    // show clients and profit
    const showClients = (packman) => {
        setAgentClientsModalVisible(true)
        setClickedPackman(packman)
    }
    const handleClickPayment = (packman) => {
        setPaymentModalVisible(true)
        setAgentClientsModalVisible(false)
    }
    const handleClickApproveToDelete = () => {
        const body = {
            _id: deletedPackman._id,
            currentPage,
            countPage: showByTotal,
            search: {
                name: searchByName.replace(/\s+/g, ' ').trim(),
            },
        }
        dispatch(deletePackman(body))
        handleClickCancelToDelete()
    }

    const handleClickCancelToDelete = () => {
        setModalVisible(false)
        setDeletedPackman(null)
    }

    // handle change of inputs

    const addNewPackman = (e) => {
        e.preventDefault()
        const {failed, message} = checkEmptyString([
            {
                value: packmanName,
                message: t('Agent ismi'),
            },
        ])
        if (failed) {
            warningEmptyInput(message)
        } else {
            const body = {
                name: packmanName,
                currentPage,
                countPage: showByTotal,
                commission: packmanCommission,
                search: {
                    name: searchByName.replace(/\s+/g, ' ').trim(),
                },
            }
            dispatch(addPackman(body))
            setPackmanName('')
            setPackmanCommission('')
        }
    }

    const handleEdit = (e) => {
        e.preventDefault()
        const {failed, message} = checkEmptyString([
            {
                value: packmanName,
                message: t('Agent ismi'),
            },
        ])
        if (failed) {
            warningEmptyInput(message)
        } else {
            const body = {
                name: packmanName,
                _id: currentPackman._id,
                currentPage,
                countPage: showByTotal,
                commission: packmanCommission,
                search: {
                    name: searchByName.replace(/\s+/g, ' ').trim(),
                },
                market: currentPackman.market,
            }
            dispatch(updatePackman(body))
        }
    }

    const clearForm = (e) => {
        e && e.preventDefault()
        setPackmanName('')
        setStickyForm(false)
        setPackmanCommission('')
        setDeletedPackman(null)
        setCurrentPackman(null)
        setPaymentTransferUzs(0)
        setAllPaymentUzs(0)
        setPaidUzs(0)
        setPaymentCardUzs(0)
        setPaymentCardUzs(0)
        setPaymentCashUzs(0)
        setPaymentTransferUzs(0)
        setApproveModalVisible(false)
    }

    //filter by total
    const filterByTotal = ({value}) => {
        setShowByTotal(value)
        setCurrentPage(0)
    }

    // handle change of search inputs
    const filterByName = (e) => {
        let val = e.target.value
        setSearchByName(val)
        let valForSearch = val.toLowerCase().replace(/\s+/g, ' ').trim()
        ;(searchedData.length > 0 || totalSearched > 0) &&
            dispatch(clearSearchedPackmans())
        if (valForSearch === '') {
            setData(packmans)
            setFilteredDataTotal(total)
        } else {
            const filteredPackmans = filter(packmans, (packman) => {
                return packman.name.toLowerCase().includes(valForSearch)
            })
            setData(filteredPackmans)
            setFilteredDataTotal(filteredPackmans.length)
        }
    }

    const filterByNameWhenPressEnter = (e) => {
        if (e.key === 'Enter') {
            const body = {
                currentPage,
                countPage: showByTotal,
                search: {
                    name: searchByName.replace(/\s+/g, ' ').trim(),
                },
            }
            dispatch(getPackmansByFilter(body))
        }
    }
    const result = (prev, usd, uzs) => {
        return prev + uzs
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
    const [selectedSale, setSelectedSale] = useState([])
    const [selectedPackman, setSelectedPackman] = useState(null)
    const changeCheckbox = (packman, saleconnector) => {
        setSelectedPackman(packman)
        if (
            !selectedSale.some(
                (item1) => item1.saleconnector._id === saleconnector._id
            )
        ) {
            setSelectedSale((prev) => [
                ...prev,
                {
                    ...packman.clients.find(
                        (item) => item.saleconnector._id === saleconnector._id
                    ),
                    commission: packman.commission,
                },
            ])
        } else {
            setSelectedSale((prev) =>
                prev.filter(
                    (item) => item.saleconnector._id !== saleconnector._id
                )
            )
        }
    }
    useEffect(() => {
        let totalSum = 0
        for (let client of selectedSale) {
            totalSum +=
                (reduceEl(
                    client.saleconnector.products,
                    'totalprice',
                    'totalpriceuzs'
                ) *
                    client.commission) /
                100
        }
        setPaidUzs(totalSum)
        setAllPaymentUzs(totalSum)
        setPaymentCashUzs(totalSum)
        setAllPaymentUzs(totalSum)
    }, [selectedSale])
    const handleClickPay = () => {
        setApproveModalVisible(true)
    }
    const [clickdelay, setClickDelay] = useState(false)
    const handleApprovePay = () => {
        setApproveModalVisible(false)
        setClickDelay(true)
        const body = {
            payment: {
                totalprice: 0,
                totalpriceuzs: Number(allPaymentUzs),
                type: paymentType,
                cash: 0,
                cashuzs: Number(paymentCashUzs),
                card: 0,
                carduzs: Number(paymentCardUzs),
                transfer: Number(paymentTransfer),
                transferuzs: Number(paymentTransferUzs),
                discount: 0,
                discountuzs: 0,
                packman: selectedPackman,
                packman_saleconnectors: selectedSale,
            },
            market,
            user,
        }
        dispatch(payAgentProfit(body)).then(({payload}) => {
            setTimeout(() => {
                togglePaymentModal()
                setClickDelay(false)
                setSelectedSale([])
                const body = {
                    currentPage,
                    countPage: showByTotal,
                    search: {
                        name: searchByName.replace(/\s+/g, ' ').trim(),
                    },
                }
                dispatch(getPackmans(body))
            }, 500)
        })
    }
    // payment
    const togglePaymentModal = (bool) => {
        bool
            ? setPaymentModalVisible(!paymentModalVisible)
            : setPaymentModalVisible(bool)
        setPaymentType('cash')
        clearForm()
        setSelectedSale([])
        setSelectedPackman(null)
    }
    // dont use
    const handleChangePaymentInput = (value, key) => {
        writePayment(value, key)
    }
    const {currency} = useSelector((state) => state.currency)
    const writePayment = (value, type) => {
        const maxSumUzs = Math.abs(allPaymentUzs)
        if (currencyType === 'UZS') {
            if (type === 'cash') {
                const all =
                    Number(value) +
                    Number(paymentCardUzs) +
                    Number(paymentTransferUzs)
                if (all <= maxSumUzs) {
                    setPaymentCashUzs(value)
                    setPaidUzs(all)
                } else {
                    warningMorePayment()
                }
            } else if (type === 'card') {
                const all =
                    Number(value) +
                    Number(paymentCashUzs) +
                    Number(paymentTransferUzs)
                if (all <= maxSumUzs) {
                    setPaymentCardUzs(value)
                    setPaidUzs(all)
                } else {
                    warningMorePayment()
                }
            } else {
                const all =
                    Number(value) +
                    Number(paymentCashUzs) +
                    Number(paymentCardUzs)
                if (all <= maxSumUzs) {
                    setPaymentTransfer(UzsToUsd(value, currency))
                    setPaymentTransferUzs(value)
                    setPaidUzs(all)
                } else {
                    warningMorePayment()
                }
            }
        }
    }
    // change payment type
    const handleChangePaymentType = (type) => {
        if (paymentType !== type) {
            setPaymentType(type)
            switch (type) {
                case 'cash':
                    setPaymentCashUzs(allPaymentUzs)
                    setPaymentCardUzs('')
                    setPaymentTransfer('')
                    setPaymentTransferUzs('')
                    setPaidUzs(allPaymentUzs)
                    break
                case 'card':
                    setPaymentCardUzs(allPaymentUzs)
                    setPaymentCashUzs('')
                    setPaymentTransfer('')
                    setPaymentTransferUzs('')
                    setPaidUzs(allPaymentUzs)
                    break
                case 'transfer':
                    setPaymentTransferUzs(allPaymentUzs)
                    setPaymentCashUzs('')
                    setPaymentCardUzs('')
                    setPaidUzs(allPaymentUzs)
                    break
                default:
                    setPaymentCashUzs('')
                    setPaymentCardUzs('')
                    setPaymentTransferUzs('')
                    setPaidUzs(0)
                    break
            }
        }
    }
    // useEffects
    useEffect(() => {
        if (errorPackmans) {
            universalToast(errorPackmans, 'error')
            dispatch(clearErrorPackmans())
        }
        if (successAddPackman) {
            successAddPackmanMessage()
            dispatch(clearSuccessAddPackmans())
            clearForm()
        }
        if (successUpdatePackman) {
            successUpdatePackmanMessage()
            dispatch(clearSuccessUpdatePackmans())
            setCurrentPackman('')
            setStickyForm(false)
            clearForm()
        }
        if (successDeletePackman) {
            successDeletePackmanMessage()
            dispatch(clearSuccessDeletePackmans())
            clearForm()
        }
    }, [
        dispatch,
        errorPackmans,
        successAddPackman,
        successUpdatePackman,
        successDeletePackman,
    ])

    useEffect(() => {
        const body = {
            currentPage,
            countPage: showByTotal,
            search: {
                name: searchByName.replace(/\s+/g, ' ').trim(),
            },
        }
        dispatch(getPackmans(body))
        //    eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, showByTotal, currentPage])

    useEffect(() => {
        setData(packmans)
    }, [packmans])

    useEffect(() => {
        setFilteredDataTotal(total)
    }, [total])

    useEffect(() => {
        setSearchedData(searchedPackmans)
    }, [searchedPackmans])
    const calcTotalSum = () =>
        clickedPackman?.clients
            ?.map((client) =>
                reduceEl(
                    client.saleconnector.products,
                    'totalprice',
                    'totalpriceuzs'
                )
            )
            .reduce((prev, item) => prev + item, 0)||0
    const calcTotalCommission = () =>
        (clickedPackman?.clients
            ?.map((client) =>
                reduceEl(
                    client.saleconnector.products,
                    'totalprice',
                    'totalpriceuzs'
                )
            )
            .reduce((prev, item) => prev + item, 0) *
            clickedPackman?.commission) /
            100 || 0
    const totalPayed = () =>
        clickedPackman?.payments?.reduce(
            (prev, item) => prev + item.paymentuzs,
            0
        ) || 0
    const totalNotPayed = () =>
        clickedPackman?.commissionProfit -
            clickedPackman?.payments?.reduce(
                (prev, item) => prev + item.paymentuzs,
                0
            ) || 0
    return (
        <motion.section
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
                open: {opacity: 1, height: 'auto'},
                collapsed: {opacity: 0, height: 0},
            }}
            transition={{duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98]}}
        >
            <UniversalModal
                headerText={`${deletedPackman && deletedPackman.name} ${t(
                    "ismli agentni o'chirishni tasdiqlaysizmi?"
                )}`}
                title={t("O'chirilgan agentni tiklashning imkoni mavjud emas!")}
                toggleModal={toggleModal}
                body={'approve'}
                approveFunction={handleClickApproveToDelete}
                closeModal={handleClickCancelToDelete}
                isOpen={modalVisible}
            />
            <form
                className={`sale-deliver-form ps-[20px] mt-[40px] flex lg:flex-nowrap flex-wrap ${
                    stickyForm && 'stickyForm'
                }`}
            >
                <FieldContainer
                    onChange={handleChangePackmanName}
                    value={packmanName}
                    label={t('Agentning ismi')}
                    placeholder={t('misol: Anvar')}
                    maxWidth={'w-[30.75rem]'}
                    type={'string'}
                />
                <FieldContainer
                    onChange={handleChangeAgentCommission}
                    value={packmanCommission}
                    label={t('Agentning komissiyasi')}
                    placeholder={t('misol: 5%')}
                    maxWidth={'w-[10.75rem]'}
                    type={'number'}
                />
                <div className={'flex gap-[1.25rem] grow items-end'}>
                    <Button
                        add={!stickyForm}
                        edit={stickyForm}
                        text={
                            stickyForm
                                ? t(`Saqlash`)
                                : t('Yangi agent qo`shish')
                        }
                        onClick={stickyForm ? handleEdit : addNewPackman}
                    />
                    <Button text={t('Tozalash')} onClick={clearForm} />
                </div>
            </form>

            <div className='flex ps-[10px] items-center '>
                <SelectForm key={'total_1'} onSelect={filterByTotal} />
                <SearchForm
                    filterBy={['total', 'name']}
                    filterByTotal={filterByTotal}
                    filterByName={filterByName}
                    searchByName={searchByName}
                    filterByCodeAndNameAndCategoryWhenPressEnter={
                        filterByNameWhenPressEnter
                    }
                />
            </div>

            <div className='lg:tableContainerPadding'>
                {loading ? (
                    <Spinner />
                ) : data.length === 0 ? (
                    <NotFind text={'Agentlar mavjud emas'} />
                ) : !isMobile ? (
                    <Table
                        page='packman'
                        currentPage={currentPage}
                        countPage={showByTotal}
                        data={searchedData.length > 0 ? searchedData : data}
                        headers={headers}
                        Delete={handleDeletePackman}
                        showClients={showClients}
                        Edit={handleEditPackman}
                    />
                ) : (
                    <TableMobile
                        page='packman'
                        currentPage={currentPage}
                        countPage={showByTotal}
                        showClients={showClients}
                        data={searchedData.length > 0 ? searchedData : data}
                        headers={headers}
                        Delete={handleDeletePackman}
                        Edit={handleEditPackman}
                    />
                )}
            </div>
            <div className='flex justify-center mt-[30px] mb-[30px]'>
                {(filteredDataTotal !== 0 || totalSearched !== 0) && (
                    <Pagination
                        countPage={Number(showByTotal)}
                        totalDatas={totalSearched || filteredDataTotal}
                        setCurrentPage={setCurrentPage}
                        currentPage={currentPage}
                    />
                )}
            </div>
            <CustomerPayment
                returned={false}
                hiddenDebt={true}
                type={paymentType}
                active={paymentModalVisible}
                togglePaymentModal={togglePaymentModal}
                changePaymentType={handleChangePaymentType}
                onChange={handleChangePaymentInput}
                disableInputsCashCard={true}
                client={null}
                allPayment={allPaymentUzs}
                card={paymentCardUzs}
                cash={paymentCashUzs}
                debt={''}
                hasDiscountBtn={false}
                clickdelay={clickdelay}
                discount={''}
                transfer={
                    currencyType === 'USD'
                        ? paymentTransfer
                        : paymentTransferUzs
                }
                paid={paidUzs}
                handleClickPay={handleClickPay}
            />
            <UniversalModal
                headerText={"To'lovni amalga oshirishni tasdiqlaysizmi?"}
                title={
                    "To'lovni amalga oshirgach bu ma`lumotlarni o'zgaritirib bo'lmaydi!"
                }
                isOpen={approveModalVisible}
                body={'complete'}
                toggleModal={clearForm}
                approveFunction={handleApprovePay}
            />
            <UniversalModal
                body={'packmanProfitClients'}
                isOpen={agentClientsModalVisible}
                closeModal={() => {
                    setAgentClientsModalVisible(false)
                    clearForm()
                    setSelectedSale([])
                }}
                disablePayButton={selectedSale.length === 0}
                payDebt={handleClickPayment}
            >
                {' '}
                <Table
                    page={'packmanProfitClients'}
                    hiddenPayButton={true}
                    changeCheckbox={changeCheckbox}
                    selectedSale={selectedSale}
                    hiddenInfoButton={true}
                    headers={agentClientsTableHeaders}
                    data={clickedPackman}
                    currentPage={currentPage}
                    countPage={10}
                    currency={'UZS'}
                    type={''}
                    Pay={handleClickPayment}
                    reports={true}
                    Print={() => {}}
                    Sort={null}
                    sortItem={null}
                    Edit={() => {}}
                    totalDebt={0}
                />
                <ul className='p-2 space-y-1 '>
                    <li className='flex items-center gap-x-2'>
                        <span className='font-semibold '>Umumiy savdo:</span>
                        <span className='font-semibold '>
                            {calcTotalSum().toLocaleString('ru-Ru')} UZS
                        </span>
                    </li>
                    <li className='flex items-center gap-x-2'>
                        <span className='font-semibold '>Komissiya:</span>
                        <span className='font-semibold '>
                            {calcTotalCommission().toLocaleString('ru-Ru')} UZS
                        </span>
                    </li>
                    <li className='flex items-center gap-x-2'>
                        <span className='font-semibold '>To'langan:</span>
                        <span className='font-semibold '>
                            {totalPayed().toLocaleString('ru-Ru')} UZS
                        </span>
                    </li>
                    <li className='flex items-center gap-x-2'>
                        <span className='font-semibold '>To'lanmagan:</span>
                        <span className='font-semibold '>
                            {totalNotPayed()?.toLocaleString('ru-Ru')} UZS
                        </span>
                    </li>
                </ul>
            </UniversalModal>
        </motion.section>
    )
}

export default Packman
