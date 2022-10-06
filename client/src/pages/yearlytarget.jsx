import React from "react";
import { useAuthState } from "../authentication/authcontext.jsx";
import Form from "../components/form.jsx";
import { GET_YEARLY_TARGET_PATH, SET_YEARLY_TARGET_PATH } from "../consts/api.const.js";

const fields = [
    {
        key: "profitTarget",
        label: "營業額",
        type: "number"
    }, {
        key: "recruitmentTarget",
        label: "招募數量目標",
        type: "number"
    }
];

export default function YearlyTargetPage() {
    const [AuthState, setAuthState] = useAuthState();
    const fetchTargets = async () => {
        const response = await fetch(GET_YEARLY_TARGET_PATH, {
            method: "POST",
            credentials: "include",
            headers:{ 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...AuthState })
        }).then((res) => {
            if (res.ok) {
                return (res.json())
            }
        }
        ).catch(
            (error) => {
                alert("Error " + error)
                return (error);
            }
        )
        return response.targets;
    }
    const afterSubmit = async () => {
        const targets = await fetchTargets();
        setAuthState(
            {
                type: "UPDATE",
                targets: {
                    profitTarget: targets.profitTarget,
                    recruitmentTarget: targets.recruitmentTarget
                }
            }
        );
    }
    return (
        <div className="d-flex flex-column w-100 align-items-center">
            <div className="row w-90 p-10">請輸入你的年度目標</div>
            <div className="row w-100">
                <Form
                    fieldsArray={fields}
                    API={SET_YEARLY_TARGET_PATH}
                    defaultValues={{ user: AuthState.username }}
                    afterSubmit={afterSubmit}
                    redirectAfterSubmit={true}
                />
            </div>
        </div>
    );
}
