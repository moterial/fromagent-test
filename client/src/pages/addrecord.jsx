import React from 'react';
import Form from '../components/form.jsx';
import { useAuthState } from '../authentication/authcontext.jsx';
import { meetingFields } from '../consts/meetings.const';
import { ADD_RECORD_PATH } from '../consts/api.const.js';

export default function AddRecordPage(props) {
    const [authState, setAuthState] = useAuthState();
    return (
        <div className='bounceInAnimation d-flex justify-content-center'>
            <Form fieldsArray={meetingFields} API={ADD_RECORD_PATH} defaultValues={{user: authState.username}} redirectAfterSubmit={true} />
        </div>
    );
}
