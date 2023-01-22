export interface UserNote {
    _id: string,
    username: string,
    email: string,
    createdAt: string,
    status: string,
    isChecked?:boolean,
}