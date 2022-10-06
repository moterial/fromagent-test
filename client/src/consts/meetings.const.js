// These items are just for the form submission, not the database model

import { CLIENTS_LIST } from "./api.const"

export const meetingFields = [
    {
        key: "clientName",
        label: "客戶",
        type: "popupSelect",
        required: true,
        API: CLIENTS_LIST,
        Options: false
    },
    {
        key: "date",
        label: "日期",
        type: "date",
        required: true,
    },
    {
        key: "item",
        label: "項目",
        type: "dropdownSelect",
        required: true,
        multiSelect: true,
        Options: [
            {
                key: "item1",
                label: "首次見面",
                value: "首次見面"
            },
            {
                key: "item2",
                label: "Fact Finding",
                value: "Fact Finding",
            },
            {
                key: "item3",
                label: "睇 Proposal",
                value: "睇 Proposal",
            },
            {
                key: "item4",
                label: "Try Closing",
                value: "Try Closing",
            },
            {
                key: "item5",
                label: "Networking",
                value: "Networking",
            },
            {
                key: "doneDeal",
                label: "Done Deal",
                value: "Done Deal",
            },
        ]
    },
    {
        key: "businessCategories",
        label: "生意類別",
        type: "optionSelect",
        required: true,
        multiSelect: true,
        Options: [
            {
                key: "MPF",
                label: "MPF",
            },
            {
                key: "insurance",
                label: "保險",
            },
            {
                key: "investment",
                label: "投資",
            }
        ]
    },
    {
        key: "note",
        label: "備註",
        type: "textarea",
        required: false,
    },
    {
        key: "profit",
        label: "生意額",
        type: "number",
        special: true
    },
    {
        key: "nextDate",
        label: "下次聯絡（幾天後）",
        type: "optionSelect",
        required: true,
        multiSelect: false,
        Options: [
            {
                key: 3,
                label: 3,
            },
            {
                key: 7,
                label: 7,
            },
            {
                key: 14,
                label: 14,
            },
            {
                key: 31,
                label: 31,
            },]
    },
]
