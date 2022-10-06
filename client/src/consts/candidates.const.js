import { CANDIDATES_LIST } from "./api.const"
export const candidateFields = [
    {
        key: "candidateName",
        label: "招募者",
        type: "popupSelect",
        API: CANDIDATES_LIST,
        required: true,
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
                key: "1",
                label: "首次見面",
                value: "首次見面",
            },
            {
                key: "2",
                label: "Networking",
                value: "Networking",
            },
            {
                key: "3",
                label: "已報名考試",
                value: "已報名考試",
            },
            {
                key: "4",
                label: "上掛牌堂",
                value: "上掛牌堂",
            },
            {
                key: "5",
                label: "已經有牌",
                value: "已經有牌",
            },
            {
                key: "6",
                label: "完成",
                value: "完成"
            }
        ]
    },
    {
        key: "categories",
        label: "類別",
        type: "optionSelect",
        required: true,
        multiSelect: true,
        Options: [
            {
                key: "IR",
                label: "IR"
            }, {
                key: "NIR",
                label: "NIR"
            }, {
                key: "BGA",
                label: "BGA"
            }
        ]
    },
    {
        key: "note",
        label: "備註",
        type: "textarea",
        required: false
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
