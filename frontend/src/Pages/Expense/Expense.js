import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import FieldContainer from '../../Components/FieldContainer/FieldContainer'
import Button from '../../Components/Buttons/BtnAddRemove'
import {
    clearSuccessRegister,
    createExpenseTypes,
    deleteExpense,
    getExpense,
    getExpenseByType,
    getExpenseTypes,
    registerExpense
} from './expenseSlice'
import SearchForm from '../../Components/SearchForm/SearchForm'
import Pagination from '../../Components/Pagination/Pagination'
import Table from '../../Components/Table/Table'
import TableMobile from '../../Components/Table/TableMobile'
import {universalToast} from '../../Components/ToastMessages/ToastMessages'
import {useTranslation} from 'react-i18next'
import {universalSort} from './../../App/globalFunctions'
import {VscChromeClose} from 'react-icons/vsc'
import CreatableSelect from 'react-select/creatable'
import Select from 'react-select'
import CustomStyle, {DropdownIcon} from '../../Components/SelectInput/CustomStyle'

const Expense = () => {
    const {t} = useTranslation(['common'])
    const dispatch = useDispatch()
    const selectRef = useRef(null);
    const {
        market: {_id},
        user
    } = useSelector((state) => state.login)
    const {currencyType, currency} = useSelector((state) => state.currency)
    const {expenses, count, successRegister} = useSelector(
        (state) => state.expense
    )
    const [data, setData] = useState(expenses)
    const [storeData, setStoreData] = useState(expenses)
    const [currentPage, setCurrentPage] = useState(0)
    const [countPage, setCountPage] = useState(10)
    const [modalOpen, setModalOpen] = useState(false)
    const [startDate, setStartDate] = useState(
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    )
    const [endDate, setEndDate] = useState(
        new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
    )

    const [sorItem, setSorItem] = useState({
        filter: '',
        sort: '',
        count: 0
    })
    const [expense, setExpense] = useState({
        sum: '',
        sumuzs: '',
        type: '',
        comment: '',
        market: _id
    })
    const [expenseType, setExpenseType] = useState({
        label: t('Turi'),
        value: ''
    })

    const types = [
        {
            label: t('Naqd'),
            value: 'cash'
        },
        {
            label: t('Plastik'),
            value: 'card'
        },
        {
            label: t('O\'tkazma'),
            value: 'transfer'
        }
    ]
    const handleChangeInput = (e, key) => {
        let target = e.target.value;
        if (key === 'comment') {
            setExpense({
                ...expense,
                comment: target
            })
            target = ""
        }
        if (key === 'sum') {
            setExpense({
                ...expense,
                sum:
                    currencyType === 'USD'
                        ? Number(target)
                        : Math.round((target / currency) * 1000) / 1000,
                sumuzs:
                    currencyType === 'UZS'
                        ? Number(target)
                        : Math.round(target * currency * 1000) / 1000
            })
        }
        if (key === 'sum' && e.target.value === '') {
            setExpense({
                ...expense,
                sum: '',
                sumuzs: ''
            })
        }
    }

    const handleChangeSelect = (e) => {
        setExpenseType({
            label: e.label,
            value: e.value
        })
        setExpense({
            ...expense,
            type: e.value
        })
    }

    const checkExpense = () => {
        if (expense.sum < 0.01) {
            return universalToast('Xarajat narxini kiritin', 'warning')
        }
        if (!expense.comment) {
            return universalToast('Xarajat turini tanlang', 'warning')
        }
        if (!expense.type) {
            return universalToast("To‘lov turini kiriting', 'warning")
        }
        return false
    }

    const createExpense = () => {
        let body = {
            currentPage,
            countPage,
            expense,
            user: user._id
        }
        if (!checkExpense(expense)) {
            dispatch(registerExpense(body)).then(({error}) => {
                if (!error) {
                    let body = {
                        currentPage,
                        countPage,
                        startDate,
                        endDate
                    }
                    dispatch(getExpense(body))
                }
            })
        }
    }

    const removeExpense = (expense) => {
        let body = {
            currentPage,
            countPage,
            _id: expense._id
        }
        dispatch(deleteExpense(body))
    }

    const clearForm = useCallback(() => {
        setExpense({
            sum: '',
            sumuzs: '',
            type: '',
            comment: '',
            market: _id
        })
        setExpenseType({
            label: t('Turi'),
            value: ''
        });


    }, [_id, t])

    const onKeyCreate = (e) => {
        if (e.key === 'Enter') {
            createExpense()
        }
    }
    const [expenseTypes, setExpenseTypes] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                const expenseTypesResponse = await dispatch(getExpenseTypes({market: _id}));
                setExpenseTypes(expenseTypesResponse.payload);
                let body = {
                    currentPage,
                    countPage,
                    startDate,
                    endDate
                };
                dispatch(getExpense(body));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [dispatch, currentPage, countPage, startDate, endDate, expenseTypes.length])


    useEffect(() => {
        if (successRegister) {
            clearForm()
            dispatch(clearSuccessRegister())
        }
    }, [dispatch, successRegister, clearForm])

    const filterData = (filterKey) => {
        if (filterKey === sorItem.filter) {
            switch (sorItem.count) {
                case 1:
                    setSorItem({
                        filter: filterKey,
                        sort: '1',
                        count: 2
                    })
                    universalSort(data, setData, filterKey, 1, storeData)
                    break
                case 2:
                    setSorItem({
                        filter: filterKey,
                        sort: '',
                        count: 0
                    })
                    universalSort(data, setData, filterKey, '', storeData)
                    break
                default:
                    setSorItem({
                        filter: filterKey,
                        sort: '-1',
                        count: 1
                    })
                    universalSort(data, setData, filterKey, -1, storeData)
            }
        } else {
            setSorItem({
                filter: filterKey,
                sort: '-1',
                count: 1
            })
            universalSort(data, setData, filterKey, -1, storeData)
        }
    }
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
    useEffect(() => {
        setData(expenses)
        setStoreData(expenses)
    }, [expenses])

    const headers = [
        {
            title: '№',
            styles: 'w-[7%]'
        },
        {
            title: t('Sana'),
            styles: 'w-[10%]',
            filter: 'createdAt'
        },
        {
            title: t('Sotuvchi'),
        },
        {
            title: t('Summa'),
            styles: 'w-[20%]'
        },
        {
            title: t('Xarajat turi')
        },
        {
            title: t('To`lov turi')
        },
        {
            title: '',
            styles: 'w-[5%]'
        }
    ]

    const createExpenseType = (value) => {
        dispatch(createExpenseTypes({market: _id, comment: value})).then(({payload}) => {
            setExpenseTypes(prev => [...prev, payload])
        })
    }
    const [filteredExpenses, setFilteredExpenses] = useState({data: [], stated: false});

    const filterExpenses = ({value}) => {
        if (value === "all") {
            setFilteredExpenses({data: [], stated: false})
        } else {
            let body = {
                currentPage,
                countPage,
                startDate,
                endDate,
                comment: value
            };
            dispatch(getExpenseByType(body)).then(({error, payload}) => {
                if (!error) {
                    setFilteredExpenses({data: payload.expenses, stated: true})
                }
            })
        }
    }
    return (
        <div className='pt-[1rem]'>
            {
                !isMobile ?
                    <div>
                        <div className='flex items-center gap-[1.25rem] mainPadding'>
                            <FieldContainer
                                value={
                                    currencyType === 'USD' ? expense.sum : expense.sumuzs
                                }
                                onChange={(e) => handleChangeInput(e, 'sum')}
                                label={t('Narxi')}
                                placeholder={`${t('misol')}: 100`}
                                maxWidth={'w-[21.75rem]'}
                                type={'number'}
                                border={true}
                                onKeyUp={onKeyCreate}
                            />
                            <div className='w-[21.57rem] '>
                                <label
                                    className={
                                        'w-[90%] text-blue-700 block leading-[1.125rem] mb-[.625rem]'
                                    }
                                >Xarajat turi</label>
                                <CreatableSelect
                                    onChange={(value) => handleChangeInput({target: value}, "comment")}
                                    components={{
                                        IndicatorSeparator: () => null,
                                        DropdownIndicator: DropdownIcon,
                                    }}
                                    placeholder="Xarajat turi"
                                    value={({
                                        value: expenseTypes.find((item) => item._id == expense.comment)?._id || "",
                                        label: expenseTypes.find((item) => item._id == expense.comment)?.comment || "Xarajat turi"
                                    })}
                                    options={expenseTypes?.map((item => ({value: item._id, label: item?.comment})))}
                                    formatCreateLabel={(value) => `Yaratish "${value}"`}
                                    styles={CustomStyle}
                                    onCreateOption={createExpenseType}
                                />
                            </div>
                            {/* <FieldContainer
                                value={expense.comment}
                                onChange={(e) => handleChangeInput(e, 'comment')}
                                label={t('Izoh')}
                                placeholder={t('misol: soliq uchun')}
                                maxWidth={'w-[21.75rem]'}
                                type={'text'}
                                border={true}
                                onKeyUp={onKeyCreate}
                            /> */}
                            <FieldContainer
                                value={expenseType}
                                onChange={handleChangeSelect}
                                label={t('To`lov turi')}
                                placeholder={t('misol: Dilso`z')}
                                select={true}
                                options={types}
                                maxWidth={'w-[21rem]'}
                                onKeyUp={onKeyCreate}
                            />
                        </div>
                        <div className='mainPadding flex justify-end'>
                            <div className={'flex gap-[1.25rem] w-[19.5rem]'}>
                                <Button
                                    onClick={createExpense}
                                    add={createExpense}
                                    text={t('Yangi xarajat yaratish')}
                                />
                                <Button onClick={clearForm} text={t('Tozalash')}/>
                            </div>
                        </div>
                    </div> : null
            }

            {
                isMobile ? <div className='flex justify-center mt-[40px]'>
                    <button onClick={() => setModalOpen(true)} className='createElement w-[90vw]'>
                        {t('Yangi xarajat yaratish')}
                    </button>
                </div> : null
            }
            {
                isMobile && modalOpen ?
                    <div className='absolute h-[100vh]  w-[100%] bg-[white] z-50 top-0 left-0'>
                        <VscChromeClose onClick={() => setModalOpen(false)}
                                        className='absolute cursor-pointer text-3xl end-5 top-5'/>
                        <div className='flex items-center ps-[20px] gap-[1.25rem] flex-wrap mt-[50px]'>
                            <FieldContainer
                                value={
                                    currencyType === 'USD' ? expense.sum : expense.sumuzs
                                }
                                onChange={(e) => handleChangeInput(e, 'sum')}
                                label={t('Narxi')}
                                placeholder={'misol: 100'}
                                maxWidth={'w-[90vw]'}
                                type={'number'}
                                border={true}
                                onKeyUp={onKeyCreate}
                            />
                            <div className='w-[90vw] '>
                                <label
                                    className={
                                        'w-[90%] text-blue-700 block leading-[1.125rem] mb-[.625rem]'
                                    }
                                >Xarajat turi</label>
                                <CreatableSelect

                                    onChange={(value) => handleChangeInput({target: value}, "comment")}
                                    components={{
                                        IndicatorSeparator: () => null,
                                        DropdownIndicator: DropdownIcon,
                                    }}
                                    value={({
                                        value: expenseTypes.find((item) => item._id == expense.comment)?._id || "",
                                        label: expenseTypes.find((item) => item._id == expense.comment)?.comment || "Xarajat turi"
                                    })}
                                    placeholder="Xarajat turi"
                                    options={expenseTypes?.map((item => ({value: item._id, label: item?.comment})))}
                                    formatCreateLabel={(value) => `Yaratish "${value}"`}
                                    styles={CustomStyle}
                                    onCreateOption={createExpenseType}
                                />
                            </div>
                            <FieldContainer
                                value={expenseType}
                                onChange={handleChangeSelect}
                                label={t('Xarajat turi')}
                                placeholder={''}
                                select={true}
                                options={types}
                                maxWidth={'w-[90vw]'}
                                onKeyUp={onKeyCreate}
                            />
                        </div>
                        <div className='mt-5  flex justify-start ps-[20px]'>
                            <div className={'flex gap-[1.25rem] w-[19.5rem]'}>
                                <Button
                                    onClick={createExpense}
                                    add={createExpense}
                                    text={t('Yangi xarajat yaratish')}
                                />
                                <Button onClick={clearForm} text={t('Tozalash')}/>
                            </div>
                        </div>
                    </div> : null
            }
            <div className='pt-[0.625rem]'>
                <div className='flex-col items-center justify-center px-2 flex lg:flex-row '>
                    <div>
                        <SearchForm
                            filterBy={['total', 'startDate', 'endDate']}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                            filterByTotal={(e) => setCountPage(e.value)}
                            startDate={new Date(startDate)}
                            endDate={new Date(endDate)}
                        />
                    </div>
                    <div className='w-[21.57rem] lg:m-0 mx-auto'>
                        <label
                            className={
                                'w-[90%] text-blue-700 block leading-[1.125rem] mb-[.625rem]'
                            }
                        >Xarajat turi</label>
                        <Select onChange={(value) => filterExpenses(value)}
                                options={[
                                    {label: "Hammasi", value: "all"}, // Add this item first
                                    ...expenseTypes.map((item) => ({label: item.comment, value: item._id})),
                                ]}
                                placeholder="Xarajat turini tanlang"/>
                    </div>
                </div>
            </div>
            {expenses && (
                <div className='lg:tableContainerPadding'>
                    {
                        isMobile ?
                            <TableMobile
                                page={'expenses'}
                                headers={headers}
                                data={filteredExpenses.stated ? filteredExpenses.data : data}
                                reports={false}
                                Delete={removeExpense}
                                currentPage={currentPage}
                                countPage={countPage}
                                currency={currencyType}
                                Sort={filterData}
                                sortItem={sorItem}
                            /> :
                            <Table
                                page={'expenses'}
                                headers={headers}
                                data={filteredExpenses.stated ? filteredExpenses.data : data}
                                reports={false}
                                Delete={removeExpense}
                                currentPage={currentPage}
                                countPage={countPage}
                                currency={currencyType}
                                Sort={filterData}
                                sortItem={sorItem}
                            />
                    }
                </div>

            )}
            <div className='flex justify-center mt-[30px] mb-[30px]'>
                <Pagination
                    countPage={countPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalDatas={count}
                />
            </div>
        </div>
    )
}

export default Expense
