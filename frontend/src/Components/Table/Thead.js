import {FaSortDown, FaSortUp} from 'react-icons/fa'
import {map, uniqueId} from 'lodash'

function Thead({headers, Sort, sortItem}) {
    const sort = (filter, pos) => {
        let sortNum = sortItem && sortItem.filter === filter && sortItem.sort
        return (pos === sortNum && 'rgba(255, 255, 255, 0.4)') || 'white'
    }

    const roundedStyle = (index) => {
        return index === headers.length - 1
            ? 'rounded-tr-lg'
            : index === 0
                ? 'rounded-tl-lg border-r-2 border-blue-600'
                : 'border-r-2 border-blue-600'
    }

    return (
        <tr className='bg-blue-500 rounded-t-lg'>
            {map(headers,(header, index) => {
                return (
                    <th
                        key={uniqueId('header')}
                        scope='col'
                        className={`th 
          ${roundedStyle(index)}
          ${header.styles || ''}
          `}
                    >
                        <div className='inline-flex items-center ml-1'>
                            <span>{header.title}</span>{' '}
                            {header.filter && (
                                <button onClick={() => Sort(header.filter)}>
                                    <FaSortUp
                                        size={14}
                                        color={sort(header.filter, '1')}
                                        style={{
                                            transform: 'translateY(50%)'
                                        }}
                                    />
                                    <FaSortDown
                                        size={14}
                                        color={sort(header.filter, '-1')}
                                        style={{
                                            transform: 'translateY(-50%)'
                                        }}
                                    />
                                </button>
                            )}
                        </div>
                    </th>
                )
            })}
        </tr>
    )
}

export default Thead
