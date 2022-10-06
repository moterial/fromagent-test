// These constants serve as the displaying fields in record page

export const displayMeetingFields = [
    {
        key: "date",
        label: "日期",
        type: "date",
    },{
        key: "item",
        label: "項目",
        type: "string"
    },
    {
        key: "categories",
        label: "類別",
        type: "optionSelect",
        options: [
            {
                key: "IR",
                label: "IR"
            },
            {
                key: "NIR",
                label: "NIR"
            },
            {
                key: "BGA",
                label: "BGA"
            },
        ]
    },
    {
        key: "nextDate",
        label: "下次聯絡（幾天後）",
        type: "optionSelect",
    },{
        key: "note",
        label: "備註",
        type: "textarea",
    },
    {
        key: "mark",
        label: "分數"  
    },
]
