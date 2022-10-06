import React from 'react';
import Form from './form';

const fields = [
    {
        key: "profitTarget",
        label: "營業額",
        type: "number"
    }, {
        key: "recruitmentTarget",
        label: "招募者",
        type: "number"
    }
];

export default function YearlyTargetModal(props) {
    return (
        <div className='modal fade' tabIndex="-1" id="yearlyTargets" aria-labelledby='modalTitle' aria-hidden="true">
            <div className="modal-dialog">
                <div className='modal-content'>
                    <div className='modal-header'>
                        <div className='modal-title text-dark' id="modalTitle">請輸入你的年度目標</div>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className='modal-body text-dark popup_box'>
                        <Form fieldsArray={fields} />
                    </div>
                    <div className='modal-footer'>
                        <button type="button" className="btn btn-dark">確定</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
