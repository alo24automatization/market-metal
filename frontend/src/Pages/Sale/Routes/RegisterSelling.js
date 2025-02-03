import React, {useEffect, useRef, useState} from 'react'
import Checkbox from '../../../Components/Checkbox/Checkbox.js'
import FieldContainer from '../../../Components/FieldContainer/FieldContainer.js'
import Table from '../../../Components/Table/Table.js'
import {useDispatch, useSelector} from 'react-redux'
import {IoAttach} from 'react-icons/io5'
import CategoryCard from '../../../Components/CategoryCard/CategoryCard.js'
import NotFind from '../../../Components/NotFind/NotFind.js'
import Spinner from '../../../Components/Spinner/SmallLoader.js'
import Modal from 'react-modal'
import SmallLoader from '../../../Components/Spinner/SmallLoader.js'
import {RegisteredSaleModal} from '../../../Components/Modal/RegisteredSaleModal.js'
import {v4 as uuidv4} from 'uuid'
import {
    addPayment,
    getClients,
    getFilials,
    makePayment,
    returnSaleProducts,
    savePayment,
    setAllProductsBySocket,
} from '../Slices/registerSellingSlice.js'
import {deleteSavedPayment} from '../Slices/savedSellingsSlice.js'
import {getAllPackmans} from '../../Clients/clientsSlice.js'
import SearchInput from '../../../Components/Inputs/SearchInput.js'
import UniversalModal from '../../../Components/Modal/UniversalModal.js'
import {UsdToUzs, UzsToUsd} from '../../../App/globalFunctions.js'
import {
    universalToast,
    warningCountSellPayment,
    warningCurrencyRate,
    warningDebtClient,
    warningDebtClientPayEndDate,
    warningLessSellPayment,
    warningMoreDiscount,
    warningMorePayment,
    warningProductPiecesEmpty,
    warningReturnProductsEmpty,
    warningSaleProductsEmpty,
} from '../../../Components/ToastMessages/ToastMessages.js'
import CustomerPayment from '../../../Components/Payment/CustomerPayment.js'
import {useLocation, useNavigate} from 'react-router-dom'
import BarcodeReader from 'react-barcode-reader'
import {useTranslation} from 'react-i18next'
import {filter, map, update} from 'lodash'
import socket from '../../../Config/socket.js'
import {setAllCategories} from '../../Category/categorySlice.js'
import Api from '../../../Config/Api.js'
import TableMobile from '../../../Components/Table/TableMobile.js'
import {
    FaFilter,
    FaPlus,
    FaPlusCircle,
    FaRegUser,
    FaTrash,
} from 'react-icons/fa'
import {MdCategory} from 'react-icons/md'
import {VscChromeClose} from 'react-icons/vsc'
import {SmallCheck2} from '../../../Components/Modal/ModalBodys/SmallCheck2.js'
import {useReactToPrint} from 'react-to-print'

const RegisterSelling = () => {
    const [productAddModal, setProductAddModal] = useState(false)
    const {t} = useTranslation(['common'])
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const {user, market} = useSelector((state) => state.login)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalProduct, setModalProduct] = useState({
        visible: false,
        mode: '1',
    })
    const [anableHight, setAnableHight] = useState(false)
    const [categoryModal, setCategoryModal] = useState(false)
    const {currencyType, currency} = useSelector((state) => state.currency)
    const {allcategories, loading} = useSelector((state) => state.category)
    const {filials} = useSelector((state) => state.registerSelling)
    const {allProducts, clients, loadingMakePayment, lastPayments} =
        useSelector((state) => state.registerSelling)
    const {packmans} = useSelector((state) => state.clients)
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState('')
    const [checked, setChecked] = useState(false)
    const [tableProducts, setTableProducts] = useState([])
    const [filteredCategories, setFilteredCategories] = useState(allcategories)
    const [activeCategory, setActiveCategory] = useState(null)
    const [searchCategory, setSearchCategory] = useState('')
    const [optionPackman, setOptionPackman] = useState([])
    const [packmanValue, setPackmanValue] = useState('')
    const [userId, setUserId] = useState('')
    const [optionClient, setOptionClient] = useState([])
    const [clientValue, setClientValue] = useState('')
    const [userValue, setUserValue] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [currentProduct, setCurrentProduct] = useState(null)
    const [paymentModalVisible, setPaymentModalVisible] = useState(false)
    const [paymentType, setPaymentType] = useState('cash')
    const [paymentCash, setPaymentCash] = useState('')
    const [paymentCashUzs, setPaymentCashUzs] = useState('')
    const [paymentCard, setPaymentCard] = useState('')
    const [paymentCardUzs, setPaymentCardUzs] = useState('')
    const [paymentTransfer, setPaymentTransfer] = useState('')
    const [paymentTransferUzs, setPaymentTransferUzs] = useState('')
    const [paymentDiscount, setPaymentDiscount] = useState('')
    const [paymentDiscountUzs, setPaymentDiscountUzs] = useState('')
    const [paymentDiscountPercent, setPaymentDiscountPercent] = useState('')
    const [hasDiscount, setHasDiscount] = useState(false)
    const [discountSelectOption, setDiscountSelectOption] = useState({
        label: '%',
        value: '%',
    })
    const [productId, setProductId] = useState(null)
    const [paymentDebt, setPaymentDebt] = useState(0)
    const [paymentDebtUzs, setPaymentDebtUzs] = useState(0)
    const [allPayment, setAllPayment] = useState(0)
    const [totalOfBackAndDebt, setTotalOfBackAndDebt] = useState(0)
    const [allPaymentUzs, setAllPaymentUzs] = useState(0)
    const [paid, setPaid] = useState(0)
    const [paidUzs, setPaidUzs] = useState(0)
    const [modalBody, setModalBody] = useState('')
    const [modalData, setModalData] = useState(null)
    const [temporary, setTemporary] = useState(null)
    const [saleConnectorId, setSaleConnectorId] = useState(null)
    const [returnProducts, setReturnProducts] = useState([])
    const [discounts, setDiscounts] = useState([])
    const [returnDiscounts, setReturnDiscounts] = useState([])
    const [totalPaymentsUsd, setTotalPaymentsUsd] = useState(0)
    const [totalPaymentsUzs, setTotalPaymentsUzs] = useState(0)
    const [totalPaysUsd, setTotalPaysUsd] = useState(0)
    const [totalPaysUzs, setTotalPaysUzs] = useState(0)
    const [exchangerate, setExchangerate] = useState(currency)
    const [saleComment, setSaleComment] = useState('')
    const [lowUnitpriceProducts, setLowUnitpriceProducts] = useState([])
    const [wholesale, setWholesale] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [payEndDate, setPayEndDate] = useState('')
    const [showPayEndDate, setShowPayEndDate] = useState(false)
    const [selectedFilial, setSelectedFilial] = useState({
        label: market?.name,
        value: market?._id,
    })
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])
    let delay = null

    const saleSmallCheckRef = useRef(null)

    const handlePrint = useReactToPrint({
        content: () => saleSmallCheckRef.current,
    })

    // const reactToPrintContent2 = React.useCallback(() => {
    //     return saleSmallCheckRef.current
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [saleSmallCheckRef.current])

    // const print2 = () => useReactToPrint({
    //     content: reactToPrintContent2,
    //     documentTitle: 'All Checks',
    //     // onBeforeGetContent: handleOnBeforeGetContent,
    //     removeAfterPrint: true,
    // })

    const headers = [
        {title: '№'},
        {title: t('Filial')},
        {title: t('Qoldiq')},
        {title: t('Nomi')},
        {title: t('Soni')},
        {title: t('Ombordan')},
        {title: t('Narxi')},
        {title: t('Jami'), styles: 'w-[8rem]'},
        {title: ''},
        {title: ''},
    ]
    const headers2 = [
        {title: '№'},
        // {title: t('Filial')},
        {title: t('Qoldiq')},
        {title: t('Nomi')},
        {title: t('Soni')},
        // {title: 'Ombordan'},
        {title: t('Narxi')},
        {title: t('Jami'), styles: 'w-[8rem]'},
        {title: ''},
        {title: ''},
    ]

    const headerReturn = [
        {title: '№'},
        {title: t('Kodi')},
        {title: t('Nomi')},
        {title: t('Soni')},
        {title: t('Jami')},
        {title: t('Soni')},
        {title: t('Jami')},
    ]

    // payment
    const togglePaymentModal = (bool) => {
        bool
            ? setPaymentModalVisible(!paymentModalVisible)
            : setPaymentModalVisible(bool)
        setPaymentType('cash')
        setHasDiscount(false)
        setPaymentDiscount('')
        setPaymentDiscountUzs('')
        setPaymentDiscountPercent('')
        setPaymentDebt(0)
        setShowPayEndDate(false)
        setPaymentDebtUzs(0)
        setDiscountSelectOption({label: '%', value: '%'})
    }

    const toggleCheckModal = () => {
        setModalVisible(!modalVisible)
        setModalBody('')
        setModalData(null)
    }

    const convertToUsd = (value) => Math.round(value * 1000) / 1000

    const convertToUzs = (value) => Math.round(value)

    const currentEchangerate = (uzs, usd) => {
        setExchangerate(convertToUzs(uzs / usd))
    }

    // if (product.total === 0) return warningCountSellPayment()
    const handleClickPayment = () => {
        if (tableProducts.length) {
            if (
                tableProducts.some(
                    (prod) => prod.total === 0 && prod.fromFilial === 0
                )
            )
                return warningCountSellPayment()
            const filteredData = tableProducts
                .filter((item) => item.unitprice <= item.incomingprice)
                .map((item) => item.product._id)
            // if (filteredData.length > 0) {
            //     setLowUnitpriceProducts(filteredData)
            //     warningLessSellPayment()
            // } else {
            //     setLowUnitpriceProducts(filteredData)
            //     const all = tableProducts.reduce(
            //         (acc, cur) => convertToUsd(acc + cur.totalprice),
            //         0
            //     )
            //     const allUzs = tableProducts.reduce(
            //         (acc, cur) => convertToUzs(acc + cur.totalpriceuzs),
            //         0
            //     )
            //     setAllPayment(all)
            //     setAllPaymentUzs(allUzs)
            //     setPaymentCash(all)
            //     setPaymentCashUzs(allUzs)
            //     setPaid(all)
            //     setPaidUzs(allUzs)
            //     setPaymentModalVisible(true)
            //     currentEchangerate(allUzs, all)
            // }
            setLowUnitpriceProducts(filteredData)
            const all = tableProducts.reduce(
                (acc, cur) => convertToUsd(acc + cur.totalprice),
                0
            )
            const allUzs = tableProducts.reduce(
                (acc, cur) => convertToUzs(acc + cur.totalpriceuzs),
                0
            )
            setAllPayment(all)
            setAllPaymentUzs(allUzs)
            setPaymentCash(all)
            setPaymentCashUzs(allUzs)
            setPaid(all)
            setPaidUzs(allUzs)
            setPaymentModalVisible(true)
            currentEchangerate(allUzs, all)
        } else {
            !currency ? warningCurrencyRate() : warningSaleProductsEmpty()
        }
    }

    const handleChangePaymentType = (type) => {
        const all = allPayment - Number(paymentDiscount)
        const allUzs = allPaymentUzs - Number(paymentDiscountUzs)
        const all2 = returnProducts.reduce(
            (summ, product) => convertToUsd(summ + product.totalprice),
            0
        )
        const all2Uzs = returnProducts.reduce(
            (summ, product) => convertToUzs(summ + product.totalpriceuzs),
            0
        )
        const payment = convertToUsd(totalPaymentsUsd - totalPaysUsd - all2)
        const paymentUzs = convertToUzs(
            totalPaymentsUzs - totalPaysUzs - all2Uzs
        )
        if (paymentType !== type) {
            setPaymentType(type)
            switch (type) {
                case 'cash':
                    if (returnProducts.length > 0) {
                        if (payment <= 0) {
                            setAllPayment(payment)
                            setAllPaymentUzs(paymentUzs)
                            setPaymentCash(Math.abs(payment))
                            setPaymentCashUzs(Math.abs(paymentUzs))
                            setPaid(Math.abs(payment))
                            setPaidUzs(Math.abs(paymentUzs))
                        } else {
                            setPaymentCash(0)
                            setPaymentCashUzs(UsdToUzs(0, exchangerate))
                            setPaymentDebt(convertToUsd(payment))
                            setPaymentDebtUzs(convertToUzs(paymentUzs))
                            setAllPayment(all2)
                            setAllPaymentUzs(all2Uzs)
                            setPaid(all2)
                            setPaidUzs(all2Uzs)
                        }
                    } else {
                        setPaymentCash(all)
                        setPaymentCashUzs(allUzs)
                        setPaymentCard('')
                        setPaymentCardUzs('')
                        setPaymentTransfer('')
                        setPaymentTransferUzs('')
                        setPaid(all)
                        setPaidUzs(allUzs)
                        setPaymentDebt(0)
                        setPaymentDebtUzs(0)
                    }
                    break
                case 'card':
                    if (returnProducts.length > 0) {
                        if (payment <= 0) {
                            setAllPayment(payment)
                            setAllPaymentUzs(paymentUzs)
                            setPaymentCard(Math.abs(payment))
                            setPaymentCardUzs(Math.abs(paymentUzs))
                            setPaid(Math.abs(payment))
                            setPaidUzs(Math.abs(paymentUzs))
                        } else {
                            setPaymentCard(0)
                            setPaymentCardUzs(UsdToUzs(0, exchangerate))
                            setPaymentDebt(convertToUsd(payment))
                            setPaymentDebtUzs(convertToUzs(paymentUzs))
                            setAllPayment(all2)
                            setAllPaymentUzs(all2Uzs)
                            setPaid(all2)
                            setPaidUzs(all2Uzs)
                        }
                    } else {
                        setPaymentCard(all)
                        setPaymentCardUzs(allUzs)
                        setPaymentCash('')
                        setPaymentCashUzs('')
                        setPaymentTransfer('')
                        setPaymentTransferUzs('')
                        setPaid(all)
                        setPaidUzs(allUzs)
                        setPaymentDebt(0)
                        setPaymentDebtUzs(0)
                    }
                    setPaymentCash('')
                    setPaymentCashUzs('')
                    setPaymentTransfer('')
                    setPaymentTransferUzs('')
                    break
                case 'transfer':
                    if (returnProducts.length > 0) {
                        if (payment <= 0) {
                            setAllPayment(payment)
                            setAllPaymentUzs(paymentUzs)
                            setPaymentTransfer(Math.abs(payment))
                            setPaymentTransferUzs(Math.abs(paymentUzs))
                            setPaid(Math.abs(payment))
                            setPaidUzs(Math.abs(paymentUzs))
                        } else {
                            setPaymentTransfer(0)
                            setPaymentTransferUzs(UsdToUzs(0, exchangerate))
                            setPaymentDebt(convertToUsd(payment))
                            setPaymentDebtUzs(convertToUzs(paymentUzs))
                            setAllPayment(all2)
                            setAllPaymentUzs(all2Uzs)
                            setPaid(all2)
                            setPaidUzs(all2Uzs)
                        }
                    } else {
                        setPaymentTransfer(all)
                        setPaymentTransferUzs(allUzs)
                        setPaymentCash('')
                        setPaymentCashUzs('')
                        setPaymentCard('')
                        setPaymentCardUzs('')
                        setPaid(all)
                        setPaidUzs(allUzs)
                        setPaymentDebt(0)
                        setPaymentDebtUzs(0)
                    }
                    setPaymentCash('')
                    setPaymentCashUzs('')
                    setPaymentCard('')
                    setPaymentCardUzs('')
                    break
                default:
                    setPaymentCash('')
                    setPaymentCashUzs('')
                    setPaymentCard('')
                    setPaymentCardUzs('')
                    setPaymentTransfer('')
                    setPaymentTransferUzs('')
                    setPaid(0)
                    setPaidUzs(0)
                    setPaymentDebt(allPayment - Number(paymentDiscount))
                    setPaymentDebtUzs(
                        allPaymentUzs - Number(paymentDiscountUzs)
                    )
                    break
            }
        }
    }

    const writePayment = (value, type) => {
        const maxSum = Math.abs(allPayment) - Number(paymentDiscount)
        const maxSumUzs = Math.abs(allPaymentUzs) - Number(paymentDiscountUzs)
        if (currencyType === 'USD') {
            if (type === 'cash') {
                const all =
                    Number(value) +
                    Number(paymentCard) +
                    Number(paymentTransfer)
                const allUzs =
                    Number(UsdToUzs(value, exchangerate)) +
                    Number(paymentCardUzs) +
                    Number(paymentTransferUzs)
                if (all <= maxSum) {
                    setPaymentCash(value)
                    setPaymentCashUzs(UsdToUzs(value, exchangerate))
                    setShowPayEndDate(
                        convertToUsd(maxSum - all) > 0 ||
                            convertToUzs(maxSum - allUzs) > 0
                    )
                    setPaymentDebt(convertToUsd(maxSum - all))
                    setPaymentDebtUzs(convertToUzs(maxSumUzs - allUzs))
                    setPaid(all)
                    setPaidUzs(allUzs)
                } else {
                    warningMorePayment()
                }
            } else if (type === 'card') {
                const all =
                    Number(value) +
                    Number(paymentCash) +
                    Number(paymentTransfer)
                const allUzs =
                    Number(paymentCashUzs) +
                    Number(UsdToUzs(value, exchangerate)) +
                    Number(paymentTransferUzs)
                if (all <= maxSum) {
                    setPaymentCard(value)
                    setPaymentCardUzs(UsdToUzs(value, exchangerate))
                    setShowPayEndDate(
                        convertToUsd(maxSum - all) > 0 ||
                            convertToUzs(maxSumUzs - allUzs) > 0
                    )
                    setPaymentDebt(convertToUsd(maxSum - all))
                    setPaymentDebtUzs(convertToUzs(maxSumUzs - allUzs))
                    setPaid(all)
                    setPaidUzs(allUzs)
                } else {
                    warningMorePayment()
                }
            } else {
                const all =
                    Number(value) + Number(paymentCash) + Number(paymentCard)
                const allUzs =
                    Number(paymentCashUzs) +
                    Number(paymentCardUzs) +
                    Number(UsdToUzs(value, exchangerate))
                if (all <= maxSum) {
                    setPaymentTransfer(value)
                    setPaymentTransferUzs(UsdToUzs(value, exchangerate))
                    setShowPayEndDate(
                        convertToUsd(maxSum - all) > 0 ||
                            convertToUzs(maxSumUzs - allUzs) > 0
                    )

                    setPaymentDebt(convertToUsd(maxSum - all))
                    setPaymentDebtUzs(convertToUzs(maxSumUzs - allUzs))
                    setPaid(all)
                    setPaidUzs(allUzs)
                } else {
                    warningMorePayment()
                }
            }
        } else {
            if (type === 'cash') {
                const all =
                    Number(value) +
                    Number(paymentCardUzs) +
                    Number(paymentTransferUzs)
                const allUsd =
                    Number(UzsToUsd(value, exchangerate)) +
                    Number(paymentCard) +
                    Number(paymentTransfer)
                if (all <= maxSumUzs) {
                    setPaymentCashUzs(value)
                    setPaymentCash(UzsToUsd(value, exchangerate))
                    setShowPayEndDate(
                        convertToUsd(maxSum - allUsd) > 0 ||
                            convertToUzs(maxSumUzs - all) > 0
                    )
                    setPaymentDebt(convertToUsd(maxSum - allUsd))
                    setPaymentDebtUzs(convertToUzs(maxSumUzs - all))
                    setPaid(allUsd)
                    setPaidUzs(all)
                } else {
                    warningMorePayment()
                }
            } else if (type === 'card') {
                const all =
                    Number(value) +
                    Number(paymentCashUzs) +
                    Number(paymentTransferUzs)
                const allUsd =
                    Number(paymentCash) +
                    Number(UzsToUsd(value, exchangerate)) +
                    Number(paymentTransfer)
                if (all <= maxSumUzs) {
                    setPaymentCard(UzsToUsd(value, exchangerate))
                    setPaymentCardUzs(value)
                    setShowPayEndDate(
                        convertToUsd(maxSum - allUsd) > 0 ||
                            convertToUzs(maxSumUzs - all) > 0
                    )
                    setPaymentDebt(convertToUsd(maxSum - allUsd))
                    setPaymentDebtUzs(convertToUzs(maxSumUzs - all))
                    setPaid(UzsToUsd(all, exchangerate))
                    setPaidUzs(all)
                } else {
                    warningMorePayment()
                }
            } else {
                const all =
                    Number(value) +
                    Number(paymentCashUzs) +
                    Number(paymentCardUzs)
                const allUsd =
                    Number(paymentCash) +
                    Number(paymentCard) +
                    Number(UzsToUsd(value, exchangerate))
                if (all <= maxSumUzs) {
                    setPaymentTransfer(UzsToUsd(value, exchangerate))
                    setPaymentTransferUzs(value)
                    setPaymentDebt(convertToUsd(maxSum - allUsd))
                    setPaymentDebtUzs(convertToUzs(maxSumUzs - all))
                    setShowPayEndDate(
                        convertToUsd(maxSum - allUsd) > 0 ||
                            convertToUzs(maxSumUzs - all) > 0
                    )
                    setPaid(allUsd)
                    setPaidUzs(all)
                } else {
                    warningMorePayment()
                }
            }
        }
    }
    const handleChangeDiscount = (value) => {
        const allPaymentAfterDiscount =
            Math.round(((allPayment * 30) / 100) * 1000) / 1000
        const allPaymentUzsAfterDiscount =
            Math.round(((allPaymentUzs * 30) / 100) * 1) / 1
        if (discountSelectOption.value === 'USD') {
            if (value > allPaymentAfterDiscount) {
                warningMoreDiscount(`${allPaymentAfterDiscount} USD`)
            } else {
                setPaymentDiscount(value)
                setPaymentDiscountUzs(UsdToUzs(value, exchangerate))
                setPaymentDiscountPercent(0)
                setPaymentDebt(allPayment - value)
                setPaymentDebtUzs(UsdToUzs(allPayment - value, exchangerate))
            }
        } else if (discountSelectOption.value === 'UZS') {
            if (value > allPaymentUzsAfterDiscount) {
                warningMoreDiscount(`${allPaymentUzsAfterDiscount} UZS`)
            } else {
                setPaymentDiscountUzs(value)
                setPaymentDiscount(UzsToUsd(value, exchangerate))
                setPaymentDiscountPercent(0)
                setPaymentDebt(UzsToUsd(allPaymentUzs - value, exchangerate))
                setPaymentDebtUzs(allPaymentUzs - value)
            }
        } else {
            if (value > 30) {
                warningMoreDiscount('30%')
            } else {
                const discountUsd =
                    Math.round(((allPayment * value) / 100) * 1000) / 1000
                const discountUzs =
                    Math.round(((allPaymentUzs * value) / 100) * 1) / 1
                setPaymentDiscountPercent(value)
                setPaymentDiscount(discountUsd)
                setPaymentDiscountUzs(discountUzs)
                setPaymentDebt(convertToUsd(allPayment - discountUsd))
                setPaymentDebtUzs(convertToUzs(allPaymentUzs - discountUzs))
                setPaid(allPayment - discountUsd)
                setPaidUzs(allPaymentUzs - discountUzs)
            }
        }
        setPaymentCash('')
        setPaymentCashUzs('')
        setPaymentCard('')
        setPaymentCardUzs('')
        setPaymentTransfer('')
        setPaymentTransferUzs('')
        setPaid(0)
        setPaidUzs(0)
    }

    const handleChangePaymentInput = (value, key) => {
        writePayment(value, key)
    }

    const handleClickDiscountBtn = () => {
        setHasDiscount(!hasDiscount)
        if (paymentType === 'cash') {
            setPaymentCash(allPayment)
            setPaymentCashUzs(allPaymentUzs)
            setPaid(allPayment)
            setPaidUzs(allPaymentUzs)
        } else if (paymentType === 'card') {
            setPaymentCard(allPayment)
            setPaymentCardUzs(allPaymentUzs)
            setPaid(allPayment)
            setPaidUzs(allPaymentUzs)
        } else if (paymentType === 'transfer') {
            setPaymentTransfer(allPayment)
            setPaymentTransferUzs(allPaymentUzs)
            setPaid(allPayment)
            setPaidUzs(allPaymentUzs)
        } else {
            setPaymentCash('')
            setPaymentCashUzs('')
            setPaymentCard('')
            setPaymentCardUzs('')
            setPaymentTransfer('')
            setPaymentTransferUzs('')
            setPaid(0)
            setPaidUzs(0)
            setPaymentDebt(allPayment)
            setPaymentDebtUzs(allPaymentUzs)
        }
        setPaymentDiscount('')
        setPaymentDiscountUzs('')
        setPaymentDiscountPercent('')
    }

    const handleChangeDiscountSelectOption = (option) => {
        if (discountSelectOption.value !== option.value) {
            setDiscountSelectOption(option)
            setPaymentDiscount('')
            setPaymentDiscountUzs('')
            setPaymentDiscountPercent('')
            setPaymentCash('')
            setPaymentCashUzs('')
            setPaymentCard('')
            setPaymentCardUzs('')
            setPaymentTransfer('')
            setPaymentTransferUzs('')
            setPaymentDebt(allPayment)
            setPaymentDebtUzs(allPaymentUzs)
            setPaid(0)
            setPaidUzs(0)
        }
    }

    const clearAll = (bool) => {
        setPaymentCash('')
        setPaymentCashUzs('')
        setPaymentCard('')
        setPhoneNumber('')
        setPaymentCardUzs('')
        setPaymentTransfer('')
        setPaymentTransferUzs('')
        setPaymentDebt(0)
        setPaymentDebtUzs(0)
        setPaid(0)
        setPaidUzs(0)
        setTableProducts([])
        setClientValue('')
        setPackmanValue('')
        setOptionPackman([
            ...map([...packmans], (pack) => ({
                value: pack._id,
                label: pack.name,
            })),
        ])
        setOptionClient([
            {
                label: t('Barchasi'),
                value: '',
            },
            ...map([...clients], (client) => ({
                value: client._id,
                label: client.name,
                saleconnectorid: client?.saleconnectorid || null,
            })),
        ])
        setUserValue('')
        setChecked(false)
        setActiveCategory(null)
        setCurrentProduct(null)
        setSearchCategory('')
        setSaleConnectorId(null)
        setReturnDiscounts([])
        setDiscounts([])
        setReturnProducts([])
        setTotalPaysUsd(0)
        setTotalPaysUzs(0)
        setTotalPaymentsUzs(0)
        setTotalPaymentsUsd(0)
        togglePaymentModal(bool)
        setSelectedFilial({
            label: market?.name,
            value: market?._id,
        })
    }

    const handleClickPay = () => {
        if (returnProducts.length) {
            handleApproveReturn()
        } else {
            handleApprovePay()
        }
    }

    const handleDoubleClick = () => {
        window.clearTimeout(delay)
        delay = null
        returnProducts.length > 0 ? handleApproveReturn() : handleApprovePay()
    }

    const handleClosePay = () => {
        setModalVisible(false)
        setTimeout(() => {
            setModalBody('')
        }, 500)
    }

    const [clickdelay, setClickDelay] = useState(false)
    const handleApprovePay = () => {
        handleClosePay()
        const body = {
            saleproducts: map(tableProducts, (product) => {
                if (wholesale) {
                    const prev = {
                        ...product,
                        pieces:
                            Number(product.pieces) + Number(product.fromFilial),
                        unitprice: product.tradeprice || product.unitprice,
                        unitpriceuzs:
                            product.tradepriceuzs || product.unitpriceuzs,
                    }
                    prev?.tradeprice && delete prev?.tradeprice
                    prev?.tradepriceuzs && delete prev?.tradepriceuzs
                    return prev
                } else {
                    const prev = {
                        ...product,
                        pieces:
                            Number(product.pieces) + Number(product.fromFilial),
                    }
                    prev?.tradeprice && delete prev?.tradeprice
                    prev?.tradepriceuzs && delete prev?.tradepriceuzs
                    return prev
                }
            }),
            client: {
                _id: clientValue ? clientValue.value : null,
                name: clientValue ? clientValue.label : userValue,
                packman: clientValue?.packman,
                phoneNumber,
            },
            packman: packmanValue
                ? {
                      _id: packmanValue.value,
                      name: packmanValue.label,
                  }
                : null,
            discount: {
                discount: Number(paymentDiscount),
                discountuzs: Number(paymentDiscountUzs),
                procient: Number(paymentDiscountPercent),
                isProcient: !!paymentDiscountPercent,
            },
            payment: {
                totalprice: Number(allPayment),
                totalpriceuzs: Number(allPaymentUzs),
                type: paymentType,
                cash: Number(paymentCash),
                cashuzs: Number(paymentCashUzs),
                card: Number(paymentCard),
                carduzs: Number(paymentCardUzs),
                transfer: Number(paymentTransfer),
                transferuzs: Number(paymentTransferUzs),
                discount: Number(paymentDiscount),
                discountuzs: Number(paymentDiscountUzs),
            },
            debt: {
                debt: Number(paymentDebt),
                debtuzs: Number(paymentDebtUzs),
                comment: '',
                pay_end_date: payEndDate,
            },
            user: userId ? userId : user._id,
            saleconnectorid: saleConnectorId,
            comment: saleComment,
        }
        if (body.debt?.debtuzs > 0 && !body?.client?.name) {
            return warningDebtClient()
        }
        if (body.debt?.debtuzs > 0 && payEndDate === '') {
            return warningDebtClientPayEndDate()
        }
        if (
            body.saleproducts.some(
                (item) => item.pieces === 0 || item.pieces === ''
            )
        ) {
            return warningProductPiecesEmpty()
        }
        dispatch(saleConnectorId ? addPayment(body) : makePayment(body)).then(
            ({payload, error}) => {
                setClickDelay(true)
                if (!error) {
                    setModalData(payload)
                    setWholesale(false)
                    setPayEndDate('')
                    setSaleConnectorId(null)
                    setTimeout(() => {
                        if (!isMobile) {
                            // setModalBody('checkSell')
                            // setModalVisible(true)
                            handlePrint()
                        }
                        clearAll()
                    }, 500)
                    if (temporary) {
                        dispatch(deleteSavedPayment({_id: temporary._id}))
                        setTemporary(null)
                    }
                    setTimeout(() => {
                        setClickDelay(false)
                    }, 10000)
                    setUserId('')
                }
            }
        )
    }

    const handleApproveReturn = () => {
        setClickDelay(true)
        handleClosePay()
        const body = {
            totalOfBackAndDebt,
            saleproducts: filter(
                returnProducts,
                (product) => Number(product.pieces) > 0
            ),
            discounts: returnDiscounts,
            payment: {
                totalprice: Number(allPayment),
                totalpriceuzs: Number(allPaymentUzs),
                type: paymentType,
                cash: Number(allPayment < 0 ? -1 * paymentCash : paymentCash),
                cashuzs: Number(
                    allPaymentUzs < 0 ? -1 * paymentCashUzs : paymentCashUzs
                ),
                card: Number(allPayment < 0 ? -1 * paymentCard : paymentCard),
                carduzs: Number(
                    allPayment < 0 ? -1 * paymentCardUzs : paymentCardUzs
                ),
                transfer: Number(
                    allPayment < 0 ? -1 * paymentTransfer : paymentTransfer
                ),
                transferuzs: Number(
                    allPayment < 0 ? -1 * paymentTransferUzs : paymentTransfer
                ),
            },
            debt: {
                debt: Number(allPayment < 0 ? -1 * paymentDebt : paymentDebt),
                debtuzs: Number(
                    allPayment < 0 ? -1 * paymentDebtUzs : paymentDebtUzs
                ),
                comment: '',
                pay_end_date: payEndDate,
            },
            user: user._id,
            saleconnectorid: saleConnectorId,
            comment: saleComment,
        }

        dispatch(returnSaleProducts(body)).then(({payload, error}) => {
            if (!error) {
                setModalData(payload)
                setTimeout(() => {
                    if (!isMobile) {
                        setModalBody('checkSellReturn')
                        setModalVisible(true)
                    }
                    clearAll()
                }, 500)
                setTimeout(() => {
                    setClickDelay(false)
                }, 10000)
            }
        })
    }
    const handleClickSave = () => {
        if (tableProducts.length > 0) {
            const all = tableProducts.reduce(
                (acc, cur) => convertToUsd(acc + cur.totalprice),
                0
            )
            const allUzs = tableProducts.reduce(
                (acc, cur) => convertToUzs(acc + cur.totalpriceuzs),
                0
            )
            const body = {
                temporary: {
                    saleconnectorid: null,
                    clientValue,
                    packmanValue,
                    userValue,
                    tableProducts,
                    totalPrice: all,
                    totalPriceUzs: allUzs,
                },
                user: user._id,
            }
            dispatch(savePayment(body)).then(({error}) => {
                if (!error) {
                    clearAll(false)
                    navigate('/saqlanganlar')
                }
            })
            if (temporary) {
                dispatch(deleteSavedPayment({_id: temporary._id}))
                setTemporary(null)
            }
        }
    }

    // bu yerda boshqa funksiyalar
    const handleChange = (id, value, key) => {
        switch (key) {
            case 'unitprice':
                handleChangeProductUnitPriceTable(id, value)
                break
            case 'pieces':
                handleChangeProductNumberTable(id, value)
                break
            case 'fromFilial':
                handleChangeFromFilial(id, value)
                break
            case 'select':
                handleSelectFilial(id, value)
                break
            default:
                break
        }
    }

    const handleDelete = (index) => {
        if (tableProducts.length === 1) {
            setUserId('')
        }
        tableProducts.splice(index, 1)
        setTableProducts([...tableProducts])
    }
    const handleDeleteJSON = JSON.stringify(handleChange)

    const handleChangeChecked = () => {
        if (checked) {
            setUserValue('')
            setPackmanValue('')
            setClientValue('')
        }
        setChecked(!checked)
    }

    const handleClickCategory = (id) => {
        if (activeCategory === id) {
            setActiveCategory(null)
        } else {
            setActiveCategory(id)
            setSearchCategory('')
            setFilteredCategories(allcategories)
        }
    }

    const handleSearchCategory = (e) => {
        const str = e.target.value
        setSearchCategory(str)
        const searchedStr = str.replace(/\s+/g, ' ').trim()
        const filterData = filter(allcategories, (obj) =>
            obj.name
                ? obj.name.toLowerCase().includes(searchedStr) ||
                  obj.code.includes(searchedStr)
                : obj.code.includes(searchedStr)
        )
        setFilteredCategories(str !== '' ? filterData : allcategories)
    }

    const handleChangeSelectedProduct = (option) => {
        const hasProduct = option.barcode
            ? filter(
                  tableProducts,
                  (obj) => obj.product.barcode === option.barcode
              ).length > 0
            : filter(tableProducts, (obj) => obj.product._id === option.value)
                  .length > 0
        // if (!hasProduct) {
        !option.barcode && setSelectedProduct(option)
        const product = option.barcode
            ? allProducts.find(
                  (obj) => obj.productdata.barcode === option.barcode
              )
            : allProducts.find((obj) => obj._id === option.value)
        const newID = uuidv4()
        let currentProduct = {
            total: product.total,
            product: {
                _id: product._id,
                code: product.productdata.code,
                name: product.productdata.name,
                barcode: product.productdata.barcode,
            },
            newID,
            minimumcount: product.minimumcount,
            totalprice: product.price.sellingprice,
            totalpriceuzs: product.price.sellingpriceuzs,
            tradeprice: product.price.tradeprice || 0,
            tradepriceuzs: product.price.tradepriceuzs || 0,
            pieces: 1,
            incomingprice: product.price.incomingprice,
            incomingpriceuzs: product.price.incomingpriceuzs,
            unitprice: product.price.sellingprice,
            unitpriceuzs: product.price.sellingpriceuzs,
            categorycode: product.category.code,
            filialProductsTotal: product.total,
            fromFilial: 0,
            filial: market._id,
            width: product?.width,
            height: product?.height,
            size: product?.size,
            length: product?.length,
            piece: product?.piece,
            common: product?.common,
            columns: product?.columns,
        }
        // if (
        //     (currencyType === 'USD' &&
        //         currentProduct.incomingprice <= currentProduct.unitprice) ||
        //     (currencyType === 'UZS' &&
        //         currentProduct.incomingpriceuzs <=
        //         currentProduct.unitpriceuzs)
        // ) {
        //     setTableProducts([...tableProducts, currentProduct])
        //     setSelectedProduct('')
        // } else {
        //     warningLessSellPayment()
        // }
        // } else {
        //     universalToast(t("Maxsulot ro'yxatda mavjud !"), 'error')
        // }
        if (hasProduct) {
            const newID = uuidv4()
            currentProduct = {...currentProduct, newID}
        }
        setTableProducts([...tableProducts, currentProduct])
        setSelectedProduct('')
    }
    const handleChangePackmanValue = (option) => {
        setPackmanValue(option)
        const pack = filter(packmans, (pack) => pack._id === option.value)[0]
        if (pack && pack.hasOwnProperty('clients')) {
            setOptionClient(
                map(pack.clients, (client) => ({
                    label: client.name,
                    value: client._id,
                    packman: pack,
                    saleconnectorid: client?.saleconnectorid || null,
                }))
            )
        } else {
            setOptionClient([
                {
                    label: t('Tanlang'),
                    value: '',
                },
                ...map([...clients], (client) => ({
                    label: client.name,
                    value: client._id,
                    packman: client?.packman,
                    saleconnectorid: client?.saleconnectorid || null,
                })),
            ])
        }
        setClientValue('')
        setUserValue('')
    }

    const handleClickPrint = () => {}

    const handleChangeClientValue = (option) => {
        setClientValue(option)
        // setSaleConnectorId(option?.saleconnectorid || null)

        const client = filter(
            clients,
            (client) => client._id === option.value
        )[0]
        if (client && client.hasOwnProperty('packman')) {
            setPackmanValue({
                label: client?.packman?.name,
                value: client?.packman?._id,
            })
        }
        setPhoneNumber(client?.phoneNumber)
        option.value ? setUserValue(option.label) : setUserValue('')
    }

    const handleChangeUserValue = (e) => {
        setUserValue(e.target.value)
    }
    const handleChangePhoneNumberValue = ({target}) =>
        setPhoneNumber(target.value)

    const handleChangeProductUnitPrice = (value) => {
        setCurrentProduct({
            ...currentProduct,
            unitprice:
                currencyType === 'USD' ? value : UzsToUsd(value, exchangerate),
            unitpriceuzs:
                currencyType === 'UZS' ? value : UsdToUzs(value, exchangerate),
            totalprice:
                currencyType === 'USD'
                    ? value * currentProduct.pieces
                    : UzsToUsd(value * currentProduct.pieces, exchangerate),
            totalpriceuzs:
                currencyType === 'UZS'
                    ? value * currentProduct.pieces
                    : UsdToUzs(value * currentProduct.pieces, exchangerate),
        })
    }

    const handleChangeProductNumber = (value) => {
        setCurrentProduct({
            ...currentProduct,
            pieces: value,
            totalprice: value * currentProduct.unitprice,
            totalpriceuzs: value * currentProduct.unitpriceuzs,
        })
    }

    const handleChangeProductUnitPriceTable = (id, value) => {
        const newRelease = !wholesale
            ? map(tableProducts, (prevProduct) =>
                  prevProduct.product._id === id
                      ? {
                            ...prevProduct,
                            unitprice:
                                currencyType === 'USD'
                                    ? value
                                    : UzsToUsd(value, exchangerate),
                            unitpriceuzs:
                                currencyType === 'UZS'
                                    ? value
                                    : UsdToUzs(value, exchangerate),
                            totalprice:
                                currencyType === 'USD'
                                    ? value *
                                      (Number(prevProduct.pieces) +
                                          Number(prevProduct.fromFilial))
                                    : UzsToUsd(
                                          value *
                                              (Number(prevProduct.pieces) +
                                                  Number(
                                                      prevProduct.fromFilial
                                                  )),
                                          exchangerate
                                      ),
                            totalpriceuzs:
                                currencyType === 'UZS'
                                    ? value *
                                      (Number(prevProduct.pieces) +
                                          Number(prevProduct.fromFilial))
                                    : UsdToUzs(
                                          value *
                                              (Number(prevProduct.pieces) +
                                                  Number(
                                                      prevProduct.fromFilial
                                                  )),
                                          exchangerate
                                      ),
                        }
                      : prevProduct
              )
            : map(tableProducts, (prevProduct) =>
                  prevProduct.product._id === id
                      ? {
                            ...prevProduct,
                            tradeprice:
                                currencyType === 'USD'
                                    ? value
                                    : UzsToUsd(value, exchangerate),
                            tradepriceuzs:
                                currencyType === 'UZS'
                                    ? value
                                    : UsdToUzs(value, exchangerate),
                            totalprice:
                                currencyType === 'USD'
                                    ? value * prevProduct.pieces
                                    : UzsToUsd(
                                          value * prevProduct.pieces,
                                          exchangerate
                                      ),
                            totalpriceuzs:
                                currencyType === 'UZS'
                                    ? value * prevProduct.pieces
                                    : UsdToUzs(
                                          value * prevProduct.pieces,
                                          exchangerate
                                      ),
                        }
                      : prevProduct
              )
        setTableProducts(newRelease)
    }

    const handleChangeProductNumberTable = (id, value) => {
        const validNumberRegex = /^[0-9]+(\.[0-9]*)?$/
        if (validNumberRegex.test(value) || value === '') {
            const newRelease = map(tableProducts, (prevProduct) =>
                prevProduct.product._id === id
                    ? {
                          ...prevProduct,
                          pieces: value,
                          totalprice: convertToUsd(
                              (Number(value) + Number(prevProduct.fromFilial)) *
                                  (wholesale
                                      ? prevProduct.tradeprice ||
                                        prevProduct.unitprice
                                      : prevProduct.unitprice)
                          ),
                          totalpriceuzs: convertToUzs(
                              (Number(value) + Number(prevProduct.fromFilial)) *
                                  (wholesale
                                      ? prevProduct.tradepriceuzs ||
                                        prevProduct.unitpriceuzs
                                      : prevProduct.unitpriceuzs)
                          ),
                      }
                    : prevProduct
            )
            setTableProducts(newRelease)
        }
    }
    const handlePayEndDateChange = (value) => {
        setPayEndDate(value)
    }

    const handleChangeFromFilial = (id, value) => {
        const newRelease = map(tableProducts, (prevProduct) =>
            prevProduct.product._id === id
                ? {
                      ...prevProduct,
                      fromFilial: Number(value),
                      totalprice: convertToUsd(
                          (Number(value) + Number(prevProduct.pieces)) *
                              (wholesale
                                  ? prevProduct.tradeprice ||
                                    prevProduct.unitprice
                                  : prevProduct.unitprice)
                      ),
                      totalpriceuzs: convertToUzs(
                          (Number(value) + Number(prevProduct.pieces)) *
                              (wholesale
                                  ? prevProduct.tradepriceuzs ||
                                    prevProduct.unitpriceuzs
                                  : prevProduct.unitpriceuzs)
                      ),
                  }
                : prevProduct
        )
        setTableProducts(newRelease)
    }

    const handleChangeProduct = (value, key) => {
        switch (key) {
            case 'unitprice':
                handleChangeProductUnitPrice(value)
                break
            case 'pieces':
                handleChangeProductNumber(value)
                break
            default:
                return null
        }
    }

    const increment = (id) => {
        const newRelease = map(tableProducts, (prevProduct) =>
            prevProduct.product._id === id
                ? {
                      ...prevProduct,
                      pieces: Number(prevProduct.pieces) + 1,
                      totalprice: convertToUsd(
                          (Number(prevProduct.pieces) +
                              Number(prevProduct.fromFilial) +
                              1) *
                              (wholesale
                                  ? prevProduct.tradeprice ||
                                    prevProduct.unitprice
                                  : prevProduct.unitprice)
                      ),
                      totalpriceuzs: convertToUzs(
                          (Number(prevProduct.pieces) +
                              Number(prevProduct.fromFilial) +
                              1) *
                              (wholesale
                                  ? prevProduct.tradepriceuzs ||
                                    prevProduct.unitpriceuzs
                                  : prevProduct.unitpriceuzs)
                      ),
                  }
                : prevProduct
        )
        setTableProducts(newRelease)
    }
    const decrement = (id) => {
        const newRelease = map(tableProducts, (prevProduct) =>
            prevProduct.product._id === id
                ? {
                      ...prevProduct,
                      pieces:
                          Number(prevProduct.pieces) > 1
                              ? Number(prevProduct.pieces) - 1
                              : 1,
                      totalprice: convertToUsd(
                          (Number(prevProduct.pieces) > 1
                              ? Number(prevProduct.pieces) -
                                1 +
                                Number(prevProduct.fromFilial)
                              : 1) *
                              (wholesale
                                  ? prevProduct.tradeprice ||
                                    prevProduct.unitprice
                                  : prevProduct.unitprice)
                      ),
                      totalpriceuzs: convertToUzs(
                          (Number(prevProduct.pieces) > 1
                              ? Number(prevProduct.pieces) -
                                1 +
                                Number(prevProduct.fromFilial)
                              : 1) *
                              (wholesale
                                  ? prevProduct.tradepriceuzs ||
                                    prevProduct.unitpriceuzs
                                  : prevProduct.unitpriceuzs)
                      ),
                  }
                : prevProduct
        )
        setTableProducts(newRelease)
    }

    const changeComment = (e) => {
        setSaleComment(e)
    }

    const handleError = () => {
        universalToast(t("Mahsulot kodi o'qilmadi!"), 'warning')
    }

    const handleScan = (data) => {
        handleChangeSelectedProduct({barcode: data})
    }

    const handleChangeReturnProduct = (value, id, index) => {
        if (value > Number(returnProducts[index].product.pieces))
            return universalToast(
                t(
                    "Diqqat! Qaytariladigan mahsulot soni sotilgan mahsulot sonidan ortiq bo'lolmaydi"
                ),
                'warning'
            )
        const newRelease = map(returnProducts, (prevProduct) =>
            prevProduct._id === id
                ? {
                      ...prevProduct,
                      pieces: value,
                      totalprice: convertToUsd(value * prevProduct.unitprice),
                      totalpriceuzs: convertToUzs(
                          value * prevProduct.unitpriceuzs
                      ),
                  }
                : prevProduct
        )
        setReturnProducts(newRelease)
    }

    const handleClickReturnPayment = () => {
        if (returnProducts.length) {
            const all = returnProducts.reduce(
                (summ, product) => convertToUsd(summ + product.totalprice),
                0
            )
            const allUzs = returnProducts.reduce(
                (summ, product) => convertToUzs(summ + product.totalpriceuzs),
                0
            )
            const newRelease = discounts.map((discount) => {
                let newDiscount = {...discount}
                map(returnProducts, (product) => {
                    if (discount._id === product.product?.discount) {
                        newDiscount = {
                            ...discount,
                            discount: discount.procient
                                ? convertToUsd(
                                      newDiscount.discount -
                                          (product.totalprice *
                                              discount.procient) /
                                              100
                                  )
                                : 0,
                            discountuzs: discount.procient
                                ? convertToUzs(
                                      newDiscount.discountuzs -
                                          (product.totalpriceuzs *
                                              discount.procient) /
                                              100
                                  )
                                : 0,
                            totalprice: convertToUsd(
                                newDiscount.totalprice - product.totalprice
                            ),
                            totalpriceuzs: convertToUzs(
                                newDiscount.totalpriceuzs -
                                    product.totalpriceuzs
                            ),
                        }
                    }
                    return ''
                })
                return {...newDiscount}
            })
            const totalDiscountsUsd = newRelease.reduce(
                (summ, discount) => summ + discount.discount,
                0
            )
            const totalDiscountsUzs = newRelease.reduce(
                (summ, discount) => summ + discount.discountuzs,
                0
            )
            const payment = convertToUsd(
                totalPaymentsUsd - totalPaysUsd - totalDiscountsUsd - all
            )

            const paymentUzs = convertToUzs(
                totalPaymentsUzs - totalPaysUzs - totalDiscountsUzs - allUzs
            )
            setReturnDiscounts(newRelease)
            if (payment <= 0) {
                setAllPayment(payment)
                setAllPaymentUzs(paymentUzs)
                setPaymentCash(Math.abs(payment))
                setPaymentCashUzs(Math.abs(paymentUzs))
                setPaid(Math.abs(payment))
                setPaidUzs(Math.abs(paymentUzs))
                // QARZ CHIQSIN
                setTotalOfBackAndDebt(
                    allUzs - Math.abs(paymentUzs) <= 0
                        ? 0
                        : allUzs - Math.abs(paymentUzs)
                )
            } else {
                setPaymentCash(0)
                setPaymentCashUzs(UsdToUzs(0, exchangerate))
                setPaymentDebt(convertToUsd(payment))
                setPaymentDebtUzs(convertToUzs(paymentUzs))
                setAllPayment(all)
                setAllPaymentUzs(allUzs)
                setPaid(all)
                setPaidUzs(allUzs)
                // QAYTGAN SUMMA CHIQSIN
                setTotalOfBackAndDebt(allUzs)
            }
            // paidUzs qaytarilyotgan summa
            setPaymentModalVisible(true)
            currentEchangerate(allUzs, all)
        } else {
            warningReturnProductsEmpty()
        }
    }

    const toggleSalePrice = (e) => {
        let checked = e.target.checked
        if (tableProducts.length > 0) {
            setWholesale(!wholesale)
            if (checked) {
                setTableProducts((prevState) =>
                    prevState.map((product) => ({
                        ...product,
                        totalprice: product.tradeprice
                            ? convertToUsd(
                                  Number(product.pieces + product.fromFilial) *
                                      product.tradeprice
                              )
                            : product.totalprice,
                        totalpriceuzs: product.tradepriceuzs
                            ? convertToUzs(
                                  Number(product.pieces + product.fromFilial) *
                                      product.tradepriceuzs
                              )
                            : product.totalpriceuzs,
                    }))
                )
            } else {
                setTableProducts((prevState) =>
                    prevState.map((product) => ({
                        ...product,
                        totalprice: product.unitprice
                            ? convertToUsd(
                                  Number(product.pieces + product.fromFilial) *
                                      product.unitprice
                              )
                            : product.totalprice,
                        totalpriceuzs: product.unitpriceuzs
                            ? convertToUzs(
                                  Number(product.pieces + product.fromFilial) *
                                      product.unitpriceuzs
                              )
                            : product.totalpriceuzs,
                    }))
                )
            }
        } else {
            warningSaleProductsEmpty()
        }
    }

    const handleClickProduct = (product) => {
        setModalProduct({visible: true, mode: '1'})
        setIsClickedProduct({
            ...product,
            columns: product?.columns || [],
            size: product?.size || '',
            piece: product?.piece || '',
            length: product?.length || '',
            forWhat: product.forWhat || '',
            sizePrice: product.sizePrice || '',
            lengthAmout: product.lengthAmout || '',
            priceFromLengthAmout: product.priceFromLengthAmout || '',
        })
    }
    const handleSelectFilial = (id, value) => {
        getFilialProducts(value)
            .then((data) => {
                setTableProducts(
                    [...tableProducts].map((prod) => {
                        if (prod.product._id === id) {
                            prod.filialProductsTotal = data.total
                            prod.filial = value.filial
                            if (value.filial === market._id) {
                                prod.fromFilial = 0
                                prod.totalprice = convertToUsd(
                                    Number(prod.pieces) *
                                        (wholesale
                                            ? prod.tradeprice || prod.unitprice
                                            : prod.unitprice)
                                )
                                prod.totalpriceuzs = convertToUzs(
                                    Number(prod.pieces) *
                                        (wholesale
                                            ? prod.tradepriceuzs ||
                                              prod.unitpriceuzs
                                            : prod.unitpriceuzs)
                                )
                            }
                        }
                        return prod
                    })
                )
            })
            .catch((data) => universalToast(data, 'error'))
    }

    const getFilialProducts = async (value) => {
        const {data} = await Api.post('/filials/products/get', value)
        return data
    }

    useEffect(() => {
        let allProductsReducer = []
        let productsForSearch = []
        market &&
            socket.emit('getProductsOfCount', {
                market: market._id,
            })
        market &&
            socket.on('categories', ({id, categories}) => {
                id === market._id && dispatch(setAllCategories(categories))
            })
        market &&
            socket.on('getProductsOfCount', ({id, products}) => {
                if (id === market._id) {
                    productsForSearch = [
                        ...productsForSearch,
                        ...map(products, (product) => ({
                            value: product._id,
                            label: `(${product.total}) ${
                                product.category.code
                            }${product.productdata.code} - ${
                                product.productdata.name
                            } -------- (${
                                currencyType === 'USD'
                                    ? (product?.price?.sellingprice).toLocaleString(
                                          'ru-RU'
                                      )
                                    : (product?.price?.sellingpriceuzs).toLocaleString(
                                          'ru-RU'
                                      )
                            } ${currencyType})`,
                        })),
                    ]
                    setFilteredProducts(productsForSearch)
                    allProductsReducer.push(...products)
                    dispatch(setAllProductsBySocket(allProductsReducer))
                }
            })
        market &&
            socket.on('error', ({id, message}) => {
                id === market._id && universalToast(message, 'error')
            })
        //    eslint-disable-next-line react-hooks/exhaustive-deps
    }, [market, dispatch, lastPayments])

    useEffect(() => {
        if (activeCategory) {
            const filteredData = filter(
                allProducts,
                (product) => product.category._id === activeCategory
            )
            setFilteredProducts(
                map(filteredData, (product) => ({
                    value: product._id,
                    label: `(${product.total}) ${product.category.code}${product.productdata.code} - ${product.productdata.name}`,
                }))
            )
        } else {
            setFilteredProducts(
                map(allProducts, (product) => ({
                    value: product._id,
                    label: `(${product.total}) ${product.category.code}${product.productdata.code} - ${product.productdata.name}`,
                }))
            )
        }
    }, [activeCategory])

    useEffect(() => {
        dispatch(getAllPackmans())
        dispatch(getClients())
        dispatch(getFilials({marketData: market}))
    }, [dispatch, market])

    useEffect(() => {
        setFilteredCategories(allcategories)
    }, [allcategories])

    useEffect(() => {
        setOptionPackman([
            {
                label: t('Tanlang'),
                value: '',
            },
            ...map([...packmans], (packman) => ({
                value: packman._id,
                label: packman.name,
            })),
        ])
    }, [packmans, t])

    useEffect(() => {
        setOptionClient([
            {
                label: t('Barchasi'),
                value: '',
            },
            ...map([...clients], (client) => ({
                value: client._id,
                label: client.name,
                saleconnectorid: client?.saleconnectorid || null,
            })),
        ])
    }, [clients, t])

    useEffect(() => {
        const data = location.state
        const setClientData = () => {
            data.saleconnector.client &&
                setClientValue({
                    label: data.saleconnector.client.name,
                    value: data.saleconnector.client._id,
                })
            data.saleconnector.packman &&
                setPackmanValue({
                    label: data.saleconnector.packman.name,
                    value: data.saleconnector.packman._id,
                })
            setSaleConnectorId(data.saleconnector._id)
        }
        if (data && data.temporary) {
            setUserId(data.temporary.user._id)
            setTemporary(data.temporary)

            setTableProducts(data.temporary.tableProducts)
            setClientValue(data.temporary.clientValue)
            setPackmanValue(data.temporary.packmanValue)
            setUserValue(data.temporary.user?.userValue)
        }
        if (data && data.saleconnector && !data.returnProducts) {
            setClientData()
        }
        if (data && data.saleconnector && data.returnProducts) {
            setClientData()
            let returned = []
            map(data.saleconnector.products, (saleProduct) => {
                const sale = {
                    _id: saleProduct.product._id,
                    discount: saleProduct.discount && saleProduct.discount,
                    pieces: saleProduct.pieces,
                    totalprice: saleProduct.totalprice,
                    totalpriceuzs: saleProduct.totalpriceuzs,
                }
                map(saleProduct.saleproducts, (product) => {
                    sale.pieces += product.pieces
                    sale.totalprice += product.totalprice
                    sale.totalpriceuzs += product.totalpriceuzs
                    return ''
                })
                saleProduct.pieces > 0 &&
                    returned.push({
                        pieces: '',
                        totalpriceuzs: 0,
                        totalprice: 0,
                        unitprice: saleProduct.unitprice,
                        unitpriceuzs: saleProduct.unitpriceuzs,
                        product: {...sale},
                        productdata: {...saleProduct.product.productdata},
                        _id: saleProduct._id,
                    })
                return ''
            })
            
            setReturnProducts(
                filter(returned, (product) => product.product.pieces > 0)
            )
            setDiscounts([...data.saleconnector.discounts])
            const totalSumm = (datas, property, type) => {
                return type === 'uzs'
                    ? convertToUzs(
                          datas.reduce((summ, data) => summ + data[property], 0)
                      )
                    : convertToUsd(
                          datas.reduce((summ, data) => summ + data[property], 0)
                      )
            }
            setTotalPaymentsUsd(
                totalSumm(data.saleconnector.products, 'totalprice', 'usd')
            )
            setTotalPaymentsUzs(
                totalSumm(data.saleconnector.products, 'totalpriceuzs', 'uzs')
            )
            setTotalPaysUsd(
                totalSumm(data.saleconnector.payments, 'payment', 'usd')
            )
            setTotalPaysUzs(
                totalSumm(data.saleconnector.payments, 'paymentuzs', 'uzs')
            )
        }
        window.history.replaceState({}, document.title)
    }, [location.state])
    const [isClickedProduct, setIsClickedProduct] = useState(null)
    const [totalFromPieceProduct, setTotalFromPieceProduct] = useState('')
    const handleParameters1InputChange = (value, index, key) => {
        const updatedColumns = isClickedProduct.columns.map(
            (column, colIndex) =>
                colIndex === index ? {...column, [key]: value} : column
        )

        if (key === 'col1' || key === 'col2') {
            updatedColumns[index].result = parseFloat(
                updatedColumns[index].col1 * updatedColumns[index].col2
            )
        }

        const updatedProduct = {...isClickedProduct, columns: updatedColumns}
        setIsClickedProduct(updatedProduct)
        setTableProducts((prev) =>
            prev.map((item) =>
                item.newID === updatedProduct.newID ? updatedProduct : item
            )
        )
    }
    const handlePieceInputsChange = (value, key) => {
        const validNumberRegex = /^[0-9]+(\.[0-9]*)?$/
        if (anableHight) {
            if (validNumberRegex.test(value) || value === '') {
                const updatedProduct = {...isClickedProduct, [key]: value}
                if (key === 'size') {
                    const sizeValue = value
                    updatedProduct.size = sizeValue
                    if (value !== '') {
                        updatedProduct.piece = parseFloat(
                            (updatedProduct.width / sizeValue).toFixed(2)
                        )
                        updatedProduct.length = (
                            updatedProduct.piece * updatedProduct?.height || 0
                        ).toFixed(2)
                        updatedProduct.lengthAmout = updatedProduct.length
                    } else {
                        updatedProduct.length = 0
                        updatedProduct.piece = 0
                    }
                } else if (key === 'piece') {
                    const pieceValue = value
                    updatedProduct.piece = pieceValue
                    if (value !== '') {
                        updatedProduct.size = parseFloat(
                            (updatedProduct.width / pieceValue).toFixed(2)
                        )
                        updatedProduct.length = (
                            updatedProduct.piece * updatedProduct?.height || 0
                        ).toFixed(2)
                        updatedProduct.lengthAmout = updatedProduct.length
                    } else {
                        updatedProduct.length = 0
                        updatedProduct.size = 0
                    }
                } else if (key === 'length') {
                    const lengthValue = value
                    updatedProduct.length = lengthValue
                    if (value !== '') {
                        let pieces = lengthValue / updatedProduct.piece
                        updatedProduct.pieces = parseFloat(pieces.toFixed(2))
                    }
                } else if (key === 'product_piece') {
                    if (value === '') {
                        updatedProduct.pieces = Number(value)
                    } else {
                        let old =
                            updatedProduct.piece * updatedProduct?.height || 0
                        updatedProduct.length = (old * value).toFixed(2)
                        updatedProduct.lengthAmout = updatedProduct.length
                        updatedProduct.pieces = Number(value)
                        const totalpriceuzs = convertToUzs(
                            updatedProduct.sizePrice *
                                Number(updatedProduct.length)
                        )
                        updatedProduct.totalpriceuzs = totalpriceuzs
                    }
                } else if (key === 'sizePrice') {
                    const totalPieces =
                        Number(totalFromPieceProduct) ||
                        Number(updatedProduct.fromFilial) ||
                        0
                    updatedProduct.priceFromLengthAmout = Number(value)
                    // const totalprice = convertToUsd(totalPieces * value)
                    const totalpriceuzs = convertToUzs(
                        updatedProduct.sizePrice * Number(updatedProduct.length)
                    )
                    const sumUzs =
                        updatedProduct.pieces * updatedProduct.incomingpriceuzs
                    const sumUsd =
                        updatedProduct.pieces * updatedProduct.incomingprice
                    // updatedProduct.totalprice = totalprice
                    updatedProduct.totalpriceuzs = totalpriceuzs
                }

                // if (key === 'length' || key === 'piece' || key === 'size') {
                //     const totalPieces =
                //         updatedProduct.pieces + Number(updatedProduct.fromFilial) || 0
                //     const unitPrice = wholesale
                //         ? updatedProduct.tradeprice || updatedProduct.unitprice
                //         : updatedProduct.unitprice
                //     const unitPriceUzs = wholesale
                //         ? updatedProduct.tradepriceuzs || updatedProduct.unitpriceuzs
                //         : updatedProduct.unitpriceuzs
                //     const totalprice = convertToUsd(totalPieces * unitPrice)
                //     const totalpriceuzs = convertToUzs(totalPieces * unitPriceUzs)
                //     updatedProduct.totalprice = totalprice
                //     updatedProduct.totalpriceuzs = totalpriceuzs
                // }
                setIsClickedProduct(updatedProduct)
                setTableProducts((prev) =>
                    prev.map((item) =>
                        item.newID === updatedProduct.newID
                            ? {...updatedProduct}
                            : item
                    )
                )

                if (updatedProduct.pieces !== -1) {
                    setTotalFromPieceProduct(
                        isNaN(parseFloat(updatedProduct.pieces))
                            ? ''
                            : parseFloat(updatedProduct.pieces)
                    )
                }
            } else if (key === 'forWhat') {
                const updatedProduct = {...isClickedProduct, [key]: value}
                setIsClickedProduct(updatedProduct)
                setTableProducts((prev) =>
                    prev.map((item) =>
                        item.newID === updatedProduct.newID
                            ? {...updatedProduct}
                            : item
                    )
                )
            }
        } else {
            if (validNumberRegex.test(value) || value === '') {
                const updatedProduct = {...isClickedProduct, [key]: value}
                if (key === 'size') {
                    const sizeValue = value
                    updatedProduct.size = sizeValue
                    if (value !== '') {
                        updatedProduct.piece = parseFloat(
                            (updatedProduct.width / sizeValue).toFixed(2)
                        )
                    }
                } else if (key === 'piece') {
                    const pieceValue = value
                    updatedProduct.piece = pieceValue
                    if (value !== '') {
                        updatedProduct.size = parseFloat(
                            (updatedProduct.width / pieceValue).toFixed(2)
                        )
                    }
                } else if (key === 'length') {
                    const lengthValue = value
                    updatedProduct.lengthAmout = lengthValue
                    updatedProduct.length = lengthValue
                    if (value !== '') {
                        let pieces = lengthValue / updatedProduct.piece
                        updatedProduct.pieces = parseFloat(pieces.toFixed(2))
                    }
                } else if (key === 'sizePrice') {
                    const totalPieces =
                        Number(updatedProduct.lengthAmout) ||
                        Number(updatedProduct.fromFilial) ||
                        0
                    updatedProduct.priceFromLengthAmout = value
                    // const totalprice = convertToUsd(totalPieces * value)
                    const totalpriceuzs = convertToUzs(totalPieces * value)
                    const sumUzs =
                        updatedProduct.pieces * updatedProduct.incomingpriceuzs
                    const sumUsd =
                        updatedProduct.pieces * updatedProduct.incomingprice
                    // updatedProduct.totalprice = totalprice
                    updatedProduct.totalpriceuzs = totalpriceuzs
                }

                // if (key === 'length' || key === 'piece' || key === 'size') {
                //     const totalPieces =
                //         updatedProduct.pieces + Number(updatedProduct.fromFilial) || 0
                //     const unitPrice = wholesale
                //         ? updatedProduct.tradeprice || updatedProduct.unitprice
                //         : updatedProduct.unitprice
                //     const unitPriceUzs = wholesale
                //         ? updatedProduct.tradepriceuzs || updatedProduct.unitpriceuzs
                //         : updatedProduct.unitpriceuzs
                //     const totalprice = convertToUsd(totalPieces * unitPrice)
                //     const totalpriceuzs = convertToUzs(totalPieces * unitPriceUzs)
                //     updatedProduct.totalprice = totalprice
                //     updatedProduct.totalpriceuzs = totalpriceuzs
                // }
                setIsClickedProduct(updatedProduct)
                setTableProducts((prev) =>
                    prev.map((item) =>
                        item.newID === updatedProduct.newID
                            ? {...updatedProduct}
                            : item
                    )
                )

                if (updatedProduct.pieces !== -1) {
                    setTotalFromPieceProduct(parseFloat(updatedProduct.pieces))
                }
            } else if (key === 'forWhat') {
                const updatedProduct = {...isClickedProduct, [key]: value}
                setIsClickedProduct(updatedProduct)
                setTableProducts((prev) =>
                    prev.map((item) =>
                        item.newID === updatedProduct.newID
                            ? {...updatedProduct}
                            : item
                    )
                )
            }
        }
    }

    const handleParameters1InputsAdd = () => {
        const updatedProduct = {
            ...isClickedProduct,
            columns: [
                ...isClickedProduct.columns,
                {col1: 0, col2: 0, result: 0},
            ],
        }
        setIsClickedProduct(updatedProduct)
        setTableProducts((prev) =>
            prev.map((item) =>
                item.newID === updatedProduct.newID ? updatedProduct : item
            )
        )
    }

    const handleParameters1InputsRemove = (index) => {
        const updatedColumns = isClickedProduct.columns.filter(
            (_, colIndex) => colIndex !== index
        )

        const updatedProduct = {...isClickedProduct, columns: updatedColumns}
        setIsClickedProduct(updatedProduct)
        setTableProducts((prev) =>
            prev.map((item) =>
                item.newID === updatedProduct.newID ? updatedProduct : item
            )
        )
    }

    const handleParamtersModalClose = (modalMode) => {
        setModalProduct({visible: false, mode: modalMode})
    }
    const handleClickReset = (modalMode) => {
        setModalProduct({visible: false, mode: modalMode})
        tableProducts.forEach((item) => {
            if (item?.newID === isClickedProduct?.newID) {
                delete item.columns
                delete item.size
                delete item.piece
                delete item.length
                delete item.forWhat
                delete item.sizePrice
                delete item.priceFromLengthAmout
                delete item.lengthAmout
                delete item.sizePrice
                item.pieces = 1
            }
        })
        setIsClickedProduct(null)
        setTotalFromPieceProduct('')
        setTableProducts([...tableProducts])
    }

    const handleParametersInputSubmit = (e) => {
        e.preventDefault()
        if (modalProduct.mode === '1') {
            const updatedTableProducts = tableProducts.map((p) => {
                if (p.newID === isClickedProduct.newID) {
                    const totalPieces = isClickedProduct.columns.reduce(
                        (sum, column) => sum + column.result,
                        0
                    )
                    const totalprice = convertToUsd(
                        (totalPieces + Number(p.fromFilial)) *
                            (wholesale
                                ? p.tradeprice || p.unitprice
                                : p.unitprice)
                    )
                    const totalpriceuzs = convertToUzs(
                        (totalPieces + Number(p.fromFilial)) *
                            (wholesale
                                ? p.tradepriceuzs || p.unitpriceuzs
                                : p.unitpriceuzs)
                    )
                    return {
                        ...p,
                        pieces: parseFloat(totalPieces),
                        totalprice,
                        totalpriceuzs,
                    }
                }
                return p
            })
            setTableProducts(updatedTableProducts)
            handleParamtersModalClose('1')
        } else {
            handleParamtersModalClose('2')
        }
    }
    const changeHeightVisible = (e) => {
        setAnableHight(e.target.checked)
        const newObj = {
            ...isClickedProduct,
            columns: [],
            size: '',
            piece: '',
            length: '',
            forWhat: '',
            sizePrice: '',
            priceFromLengthAmout: '',
            lengthAmout: '',
            sizePrice: '',
            piece: '',
            pieces: 1,
        }
        setTotalFromPieceProduct('');
        setIsClickedProduct(newObj)
    }
    return (
        <div className={'flex grow relative overflow-auto'}>
            {loadingMakePayment && (
                <div className='fixed backdrop-blur-[2px] z-[100] left-0 top-0 right-0 bottom-0 bg-white-700 flex flex-col items-center justify-center w-full h-full'>
                    <SmallLoader />
                </div>
            )}
            <Modal
                style={{content: {width: '700px'}}}
                isOpen={modalProduct.visible}
                onRequestClose={() => handleParamtersModalClose('1')}
            >
                <form onSubmit={handleParametersInputSubmit}>
                    <span className='absolute top-3 font-medium text-lg left-[45%] transform -translate-x-1/2     w-full text-center'>
                        {isClickedProduct?.product.name}
                    </span>
                    <div className='flex gap-x-2 items-center pb-4'>
                        <span>{t("Sotish turini o'zgaritirish")}</span>{' '}
                        <input
                            type='checkbox'
                            label={`Bo'lib sotish turi - ${modalProduct.mode}`}
                            onChange={(e) =>
                                setModalProduct((prev) => ({
                                    ...prev,
                                    mode: e.target.checked ? '1' : '2',
                                }))
                            }
                        />
                    </div>
                    <div
                        style={{
                            display:
                                modalProduct.mode === '1' ? 'none' : 'block',
                        }}
                        className='flex gap-x-2 items-center pb-4'
                    >
                        <span>{t('Uzunligi')}</span>{' '}
                        <input
                            type='checkbox'
                            label={`Bo'lib sotish turi - ${modalProduct.mode}`}
                            checked={anableHight}
                            onChange={changeHeightVisible}
                        />
                    </div>
                    <button
                        type='button'
                        onClick={() => handleClickReset('1')}
                        className='absolute border border-error-500 w-7 h-7 flex justify-center items-center  rounded-full top-2 right-2 text-lg '
                    >
                        x
                    </button>
                    {modalProduct.mode === '1' ? (
                        <div className='max-h-80 overflow-y-auto px-2'>
                            {isClickedProduct?.columns?.map((value, index) => (
                                <div className='flex items-center justify-between gap-x-3 mt-2'>
                                    <div className='grid grid-cols-3 gap-3 '>
                                        <FieldContainer
                                            type={'text'}
                                            step={'0.11'}
                                            label={index === 0 && "O'lcham"}
                                            value={value.col1}
                                            placeholder={"O'lcham"}
                                            onChange={({target}) =>
                                                handleParameters1InputChange(
                                                    target.value,
                                                    index,
                                                    'col1'
                                                )
                                            }
                                        />
                                        <FieldContainer
                                            type={'text'}
                                            label={index === 0 && 'Soni'}
                                            value={value.col2}
                                            placeholder={'Soni'}
                                            step={'0.11'}
                                            onChange={({target}) =>
                                                handleParameters1InputChange(
                                                    target.value,
                                                    index,
                                                    'col2'
                                                )
                                            }
                                        />
                                        <FieldContainer
                                            step={'0.11'}
                                            type={'text'}
                                            value={value.result}
                                            placeholder={'Umumiy'}
                                            label={index === 0 && 'Umumiy'}
                                            onChange={({target}) =>
                                                handleParameters1InputChange(
                                                    target.value,
                                                    index,
                                                    'result'
                                                )
                                            }
                                        />
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleParameters1InputsRemove(index)
                                        }
                                        type='button'
                                        className={`${
                                            index == 0 ? 'mt-6' : ''
                                        }  text-error-500 border w-9 h-9 rounded-full flex justify-center items-center`}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : anableHight ? (
                        <div className='space-y-2'>
                            <div className={`grid grid-cols-2 gap-x-2`}>
                                <FieldContainer
                                    type={'text'}
                                    placeholder={"Bo'yi"}
                                    label={"Bo'yi"}
                                    heigth
                                    value={isClickedProduct?.height}
                                />
                                <FieldContainer
                                    type={'text'}
                                    placeholder={'Eni'}
                                    label={'Eni'}
                                    value={isClickedProduct?.width}
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-x-2'>
                                <FieldContainer
                                    placeholder={"O'lchami"}
                                    type={'text'}
                                    label={"O'lchami"}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'size'
                                        )
                                    }
                                    value={isClickedProduct?.size}
                                />
                                <FieldContainer
                                    placeholder={t('Uzunligi')}
                                    type={'text'}
                                    label={t('Uzunligi')}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'length'
                                        )
                                    }
                                    value={isClickedProduct?.length}
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-x-2'>
                                <FieldContainer
                                    placeholder={t('Bo`lak')}
                                    type={'text'}
                                    label={t('Bo`lak')}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'piece'
                                        )
                                    }
                                    value={isClickedProduct?.piece}
                                />
                                <FieldContainer
                                    placeholder={t('Maxsulot miqdori')}
                                    label={t('Maxsulot miqdori')}
                                    type={'text'}
                                    value={totalFromPieceProduct}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'product_piece'
                                        )
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-x-2'>
                                <FieldContainer
                                    placeholder={t('Maxsulot')}
                                    label={t('Maxsulot')}
                                    type={'text'}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'forWhat'
                                        )
                                    }
                                    value={isClickedProduct?.forWhat}
                                />
                                <FieldContainer
                                    placeholder={t('Narxi')}
                                    label={t('Narxi')}
                                    type={'text'}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'sizePrice'
                                        )
                                    }
                                    value={isClickedProduct?.sizePrice}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-2'>
                            <div className={`grid grid-cols-2 gap-x-2`}>
                                <FieldContainer
                                    type={'text'}
                                    placeholder={'Eni'}
                                    label={'Eni'}
                                    value={isClickedProduct?.width}
                                />
                                <FieldContainer
                                    placeholder={"O'lchami"}
                                    type={'text'}
                                    label={"O'lchami"}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'size'
                                        )
                                    }
                                    value={isClickedProduct?.size}
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-x-2'>
                                <FieldContainer
                                    placeholder={t('Uzunligi')}
                                    type={'text'}
                                    label={t('Uzunligi')}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'length'
                                        )
                                    }
                                    value={isClickedProduct?.length}
                                />
                                <FieldContainer
                                    placeholder={t('Bo`lak')}
                                    type={'text'}
                                    label={t('Bo`lak')}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'piece'
                                        )
                                    }
                                    value={isClickedProduct?.piece}
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-x-2'>
                                <FieldContainer
                                    placeholder={t('Maxsulot miqdori')}
                                    label={t('Maxsulot miqdori')}
                                    type={'text'}
                                    value={totalFromPieceProduct}
                                />
                                <FieldContainer
                                    placeholder={t('Maxsulot')}
                                    label={t('Maxsulot')}
                                    type={'text'}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'forWhat'
                                        )
                                    }
                                    value={isClickedProduct?.forWhat}
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-x-2'>
                                <FieldContainer
                                    placeholder={t('Narxi')}
                                    label={t('Narxi')}
                                    type={'text'}
                                    onChange={({target}) =>
                                        handlePieceInputsChange(
                                            target.value,
                                            'sizePrice'
                                        )
                                    }
                                    value={isClickedProduct?.sizePrice}
                                />
                            </div>
                        </div>
                    )}

                    {modalProduct.mode === '1' && (
                        <button
                            onClick={handleParameters1InputsAdd}
                            type='button'
                            className='text-success-500 mt-2 border w-9 h-9 rounded-full flex justify-center items-center'
                        >
                            <FaPlus className='text-white' />
                        </button>
                    )}
                    <div className='flex justify-between items-center absolute bottom-2 w-[86%]'>
                        {modalProduct.mode === '1' ? (
                            <h5 className='text-lg font-medium'>
                                {' '}
                                Umumiy:
                                {isClickedProduct?.columns.reduce(
                                    (el, next) => el + next.result,
                                    0
                                )}
                            </h5>
                        ) : (
                            <span></span>
                        )}
                        <button
                            type='submit'
                            className='px-4 py-2 text-center text-white-900 text-base bg-success-500 rounded-sm'
                        >
                            Saqlash
                        </button>
                    </div>
                </form>
            </Modal>
            <CustomerPayment
                hasDiscountBtn={true}
                clickdelay={clickdelay}
                returned={!!returnProducts.length}
                type={paymentType}
                showPayEndDate={showPayEndDate}
                hasCalendar={true}
                active={paymentModalVisible}
                payEndDate={payEndDate}
                handlePayEndDateChange={handlePayEndDateChange}
                togglePaymentModal={togglePaymentModal}
                changePaymentType={handleChangePaymentType}
                onChange={handleChangePaymentInput}
                client={userValue || clientValue.label || packmanValue.label}
                allPayment={currencyType === 'USD' ? allPayment : allPaymentUzs}
                card={currencyType === 'USD' ? paymentCard : paymentCardUzs}
                cash={currencyType === 'USD' ? paymentCash : paymentCashUzs}
                debt={currencyType === 'USD' ? paymentDebt : paymentDebtUzs}
                discount={
                    currencyType === 'USD'
                        ? discountSelectOption.value === 'USD'
                            ? paymentDiscount
                            : paymentDiscountPercent
                        : discountSelectOption.value === 'UZS'
                        ? paymentDiscountUzs
                        : paymentDiscountPercent
                }
                handleChangeDiscount={handleChangeDiscount}
                hasDiscount={hasDiscount}
                transfer={
                    currencyType === 'USD'
                        ? paymentTransfer
                        : paymentTransferUzs
                }
                handleClickDiscountBtn={handleClickDiscountBtn}
                discountSelectOption={discountSelectOption}
                handleChangeDiscountSelectOption={
                    handleChangeDiscountSelectOption
                }
                paid={currencyType === 'USD' ? paid : paidUzs}
                handleClickPay={handleClickPay}
                changeComment={changeComment}
                saleComment={saleComment}
                onDoubleClick={handleDoubleClick}
            />

            <UniversalModal
                body={modalBody}
                toggleModal={
                    modalBody === 'complete' ? handleClosePay : toggleCheckModal
                }
                approveFunction={
                    modalBody === 'complete'
                        ? returnProducts.length
                            ? handleApproveReturn
                            : handleApprovePay
                        : handleClickPrint
                }
                isOpen={modalVisible}
                product={modalData}
                headers={headers}
                headerText={
                    modalBody === 'complete' &&
                    t("To'lovni amalga oshirishni tasdiqlaysizmi ?")
                }
                title={
                    modalBody === 'complete' &&
                    t(
                        "To'lovni amalga oshirgach bu ma`lumotlarni o`zgaritirb bo`lmaydi !"
                    )
                }
                changeProduct={handleChangeProduct}
            />

            {!isMobile ? (
                <div className='flex flex-col grow gap-[1.25rem] overflow-auto'>
                    <div className={'mainPadding flex flex-col gap-[1.25rem]'}>
                        <div>
                            <Checkbox
                                id={'register-selling'}
                                onChange={handleChangeChecked}
                                value={checked}
                                label={t('Mijoz')}
                            />
                            <div className={'flex gap-[1.25rem] mt-[1rem]'}>
                                <FieldContainer
                                    placeholder={t('Agentlar')}
                                    maxWidth={'w-[14.676875rem]'}
                                    disabled={!checked}
                                    border={true}
                                    select={true}
                                    value={packmanValue}
                                    options={optionPackman}
                                    onChange={handleChangePackmanValue}
                                />
                                <FieldContainer
                                    placeholder={t('Xaridor')}
                                    maxWidth={'w-[14.676875rem]'}
                                    disabled={!checked}
                                    border={true}
                                    select={true}
                                    value={clientValue}
                                    options={optionClient}
                                    onChange={handleChangeClientValue}
                                />

                                <FieldContainer
                                    placeholder={t('Amaldagi xaridor')}
                                    disabled={!checked}
                                    value={userValue}
                                    onChange={handleChangeUserValue}
                                />
                                <FieldContainer
                                    placeholder={t('Telefon')}
                                    disabled={!checked}
                                    value={phoneNumber}
                                    onChange={handleChangePhoneNumberValue}
                                />
                            </div>
                        </div>
                        {!returnProducts.length && (
                            <div className={'flex flex-col gap-[1.25rem]'}>
                                <FieldContainer
                                    select={true}
                                    placeholder={t('misol: kompyuter')}
                                    value={selectedProduct}
                                    label={t('Maxsulotlar')}
                                    onChange={handleChangeSelectedProduct}
                                    options={filteredProducts}
                                />
                                <div className={'flex justify-end items-start'}>
                                    <div className='checkbox-card sale-toggle-container'>
                                        <p className={'toggleText'}>
                                            {t('Optom narxida hisoblash')} :
                                        </p>
                                        <input
                                            type='checkbox'
                                            checked={wholesale}
                                            onChange={toggleSalePrice}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={'tableContainerPadding mt-[-20px]'}>
                        {returnProducts.length ? (
                            <Table
                                page={'backproduct'}
                                data={returnProducts}
                                headers={headerReturn}
                                currency={currencyType}
                                changeHandler={handleChangeReturnProduct}
                            />
                        ) : !tableProducts.length ? (
                            <NotFind
                                text={t("Sotuvda mahsulotlar qo'shilmagan!")}
                            />
                        ) : (
                            <Table
                                page={'registersale'}
                                data={tableProducts}
                                headers={
                                    filials.length > 1 ? headers : headers2
                                }
                                handleClickProduct={handleClickProduct}
                                currency={currencyType}
                                Delete={handleDelete}
                                changeHandler={handleChange}
                                footer={'registersale'}
                                increment={increment}
                                decrement={decrement}
                                lowUnitpriceProducts={lowUnitpriceProducts}
                                wholeSale={wholesale}
                                selectedFilial={selectedFilial}
                            />
                        )}
                    </div>
                </div>
            ) : null}
            {isMobile && productAddModal ? (
                <div className='fixed w-[100%] h-[100vh] bg-[white] top-0 right-0 z-[60] '>
                    <RegisteredSaleModal
                        data={tableProducts}
                        headers={filials.length > 1 ? headers : headers2}
                        currency={currencyType}
                        productId={productId}
                        Delete={handleDelete}
                        productModal={setProductAddModal}
                        changeHandler={handleChange}
                        footer={'registersale'}
                        increment={increment}
                        decrement={decrement}
                        lowUnitpriceProducts={lowUnitpriceProducts}
                        wholeSale={wholesale}
                        selectedFilial={selectedFilial}
                    />
                </div>
            ) : null}
            {isMobile ? (
                <div className='flex mt-[-20px] flex-col grow gap-[1.25rem] overflow-auto'>
                    <div className='flex gap-2 p-4 lg:justify-start mt-4 justify-evenly'>
                        {isMobile ? (
                            <button
                                onClick={() => setModalOpen(true)}
                                className=' hover:bg-blue-200  bg-blue-400 focus-visible:outline-none w-[150px] lg:h-[33px] h=[40px] createElement '
                            >
                                <FaRegUser />
                                {t('Mijoz')}
                            </button>
                        ) : null}

                        {isMobile ? (
                            <button
                                onClick={() => setCategoryModal(true)}
                                className=' hover:bg-green-200  bg-green-400 focus-visible:outline-none w-[150px] lg:h-[33px] h=[40px] createElement '
                            >
                                <MdCategory /> {t('Kategoriya')}
                            </button>
                        ) : null}
                    </div>
                    <div className=' flex justify-center'>
                        {!returnProducts.length && (
                            <div
                                className={
                                    'flex flex-col w-[90vw] gap-[1.25rem]'
                                }
                            >
                                <FieldContainer
                                    select={true}
                                    placeholder={t('misol: kompyuter')}
                                    value={selectedProduct}
                                    onChange={(event) => {
                                        handleChangeSelectedProduct(event)
                                        setProductAddModal(true)
                                        setProductId(event.value)
                                    }}
                                    options={filteredProducts}
                                />
                            </div>
                        )}
                    </div>
                    <div className='ml-[20px] mb-[-20px] flex justify-between mr-[20px]'>
                        <div className={'flex justify-end items-start'}>
                            <div className='checkbox-card  sale-toggle-container'>
                                <p className={'toggleText '}>
                                    {t('Optom narxida hisoblash')} :
                                </p>
                                <input
                                    className='z-0'
                                    type='checkbox'
                                    checked={wholesale}
                                    onChange={toggleSalePrice}
                                />
                            </div>
                        </div>
                    </div>

                    {modalOpen ? (
                        <div className='fixed w-[100%] h-[100vh] bg-[white] top-0 right-0 z-50 '>
                            <VscChromeClose
                                onClick={() => setModalOpen(false)}
                                className=' absolute right-[20px]  top-[20px]  text-4xl cursor-pointer'
                            />
                            <div
                                className={
                                    'mainPadding ps-[20px] mt-[50px] flex flex-col gap-[1.25rem]'
                                }
                            >
                                <div>
                                    <div
                                        className={
                                            'flex flex-wrap gap-[1.25rem] mt-[1rem]'
                                        }
                                    >
                                        <Checkbox
                                            id={'register-selling'}
                                            onChange={handleChangeChecked}
                                            value={checked}
                                            label={t('Mijoz')}
                                        />
                                        <FieldContainer
                                            placeholder={t('Agentlar')}
                                            maxWidth={
                                                'lg:w-[14.676875rem] w-[90vw]'
                                            }
                                            disabled={!checked}
                                            border={true}
                                            select={true}
                                            value={packmanValue}
                                            options={optionPackman}
                                            onChange={handleChangePackmanValue}
                                        />
                                        <FieldContainer
                                            placeholder={t('Xaridor')}
                                            maxWidth={
                                                'lg:w-[14.676875rem] w-[90vw]'
                                            }
                                            disabled={!checked}
                                            border={true}
                                            select={true}
                                            value={clientValue}
                                            options={optionClient}
                                            onChange={handleChangeClientValue}
                                        />
                                        <FieldContainer
                                            placeholder={t('Amaldagi xaridor')}
                                            disabled={!checked}
                                            value={userValue}
                                            onChange={handleChangeUserValue}
                                        />
                                    </div>
                                </div>

                                <div className='flex mt-[30px] justify-center '>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className=' hover:bg-blue-200  bg-blue-400 focus-visible:outline-none w-[150px] lg:h-[33px] h=[40px] createElement '
                                    >
                                        <FaFilter /> {t('izlash')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <div className={'mb-[100px] mt-[20px]'}>
                        {returnProducts.length ? (
                            !isMobile ? (
                                <Table
                                    page={'backproduct'}
                                    data={returnProducts}
                                    headers={headerReturn}
                                    currency={currencyType}
                                    changeHandler={handleChangeReturnProduct}
                                />
                            ) : (
                                <TableMobile
                                    page={'backproduct'}
                                    data={returnProducts}
                                    headers={headerReturn}
                                    currency={currencyType}
                                    changeHandler={handleChangeReturnProduct}
                                />
                            )
                        ) : !tableProducts.length ? (
                            <NotFind
                                text={t("Sotuvda mahsulotlar qo'shilmagan!")}
                            />
                        ) : !isMobile ? (
                            <Table
                                page={'registersale'}
                                data={tableProducts}
                                headers={
                                    filials.length > 1 ? headers : headers2
                                }
                                currency={currencyType}
                                Delete={handleDelete}
                                changeHandler={handleChange}
                                footer={'registersale'}
                                increment={increment}
                                decrement={decrement}
                                lowUnitpriceProducts={lowUnitpriceProducts}
                                wholeSale={wholesale}
                                selectedFilial={selectedFilial}
                            />
                        ) : (
                            <TableMobile
                                page={'registersale'}
                                productModal={setProductAddModal}
                                productId={setProductId}
                                data={tableProducts}
                                headers={
                                    filials.length > 1 ? headers : headers2
                                }
                                currency={currencyType}
                                Delete={handleDelete}
                                changeHandler={handleChange}
                                footer={'registersale'}
                                increment={increment}
                                decrement={decrement}
                                lowUnitpriceProducts={lowUnitpriceProducts}
                                wholeSale={wholesale}
                                selectedFilial={selectedFilial}
                            />
                        )}
                    </div>
                    {isMobile ? (
                        <div className='flex justify-center p-[5vw] gap-1 fixed bottom-0 left-0'>
                            <button
                                type={'button'}
                                className={
                                    'lg:w-[200px] lg:ms-4 w-[70vw] register-selling-right-accept-btn'
                                }
                                onClick={
                                    returnProducts.length
                                        ? handleClickReturnPayment
                                        : handleClickPayment
                                }
                            >
                                {t("To'lov")}
                            </button>
                            {!returnProducts.length && (
                                <button
                                    type={'button'}
                                    onClick={handleClickSave}
                                    className={
                                        'lg:w-[50px] flex justify-center w-[20vw] register-selling-right-deny-btn'
                                    }
                                >
                                    <IoAttach size={'1.5rem'} />
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            ) : null}
            {categoryModal ? (
                <div className='fixed w-[100%] h-[100vh] bg-[white] top-0 right-0 z-50 register-selling-right min-w-[20.25rem] bg-white-400 backdrop-blur-[3.125rem] rounded-[0.25rem] flex flex-col gap-[1.25rem]'>
                    <VscChromeClose
                        onClick={() => setCategoryModal(false)}
                        className=' absolute right-[20px]  top-[20px]  text-4xl cursor-pointer'
                    />
                    <div className='flex mt-[50px] flex-col grow gap-[1.25rem]'>
                        <SearchInput
                            placeholder={t('kategoriyani qidirish...')}
                            value={searchCategory}
                            onChange={handleSearchCategory}
                            onKeyUp={() => {}}
                        />
                        <div className='grow relative overflow-auto'>
                            <div className='cards-container absolute left-0 right-[0.125rem] top-0 bottom-0'>
                                {loading ? (
                                    <div className='tableContainerPadding'>
                                        <Spinner />
                                    </div>
                                ) : filteredCategories.length > 0 ? (
                                    map(filteredCategories, (category) => (
                                        <CategoryCard
                                            key={category._id}
                                            id={category._id}
                                            activeCategory={
                                                category._id === activeCategory
                                            }
                                            title={category.name}
                                            code={category.code}
                                            products={category.products.length}
                                            onClick={handleClickCategory}
                                        />
                                    ))
                                ) : (
                                    <NotFind
                                        text={t('Kategoriya mavjud emas')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={'flex gap-[0.625rem]'}>
                        <button
                            type={'button'}
                            className={'register-selling-right-accept-btn'}
                            onClick={() => setCategoryModal(false)}
                        >
                            {t('Saqlash')}
                        </button>
                    </div>
                </div>
            ) : null}

            {!isMobile ? (
                <div className='register-selling-right min-w-[20.25rem] bg-white-400 backdrop-blur-[3.125rem] rounded-[0.25rem] flex flex-col gap-[1.25rem]'>
                    <div className='flex flex-col grow gap-[1.25rem]'>
                        <SearchInput
                            placeholder={t('kategoriyani qidirish...')}
                            value={searchCategory}
                            onChange={handleSearchCategory}
                            onKeyUp={() => {}}
                        />
                        <div className='grow relative overflow-auto'>
                            <div className='cards-container absolute left-0 right-[0.125rem] top-0 bottom-0'>
                                {loading ? (
                                    <div className='tableContainerPadding'>
                                        <Spinner />
                                    </div>
                                ) : filteredCategories.length > 0 ? (
                                    map(filteredCategories, (category) => (
                                        <CategoryCard
                                            key={category._id}
                                            id={category._id}
                                            activeCategory={
                                                category._id === activeCategory
                                            }
                                            title={category.name}
                                            code={category.code}
                                            products={category.products.length}
                                            onClick={handleClickCategory}
                                        />
                                    ))
                                ) : (
                                    <NotFind
                                        text={t('Kategoriya mavjud emas')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={'flex gap-[0.625rem]'}>
                        <button
                            type={'button'}
                            className={'register-selling-right-accept-btn'}
                            onClick={
                                returnProducts.length
                                    ? handleClickReturnPayment
                                    : handleClickPayment
                            }
                        >
                            {t("To'lov")}
                        </button>
                        {!returnProducts.length && (
                            <button
                                type={'button'}
                                onClick={handleClickSave}
                                className={'register-selling-right-deny-btn'}
                            >
                                <IoAttach size={'1.5rem'} />
                            </button>
                        )}
                    </div>
                </div>
            ) : null}
            <BarcodeReader onError={handleError} onScan={handleScan} />
            <div className='hidden'>
                <SmallCheck2 ref={saleSmallCheckRef} product={modalData} />
            </div>
        </div>
    )
}

export default RegisterSelling
