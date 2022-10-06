import React from 'react';
import Form from '../components/form.jsx';
import { useAuthState } from '../authentication/authcontext.jsx';
import { candidateFields } from '../consts/candidates.const.js';
import { CANDIDATES_ADD_RECORD_PATH } from '../consts/api.const.js';

export default function AddCandidatePage(props) {
    const [AuthState, setAuthState] = useAuthState();
    return (
        <div className='bounceInAnimation d-flex justify-content-center'>
            <Form fieldsArray={candidateFields} API={CANDIDATES_ADD_RECORD_PATH} defaultValues={{user: AuthState.username}} redirectAfterSubmit={true} />
        </div>
    );
}
