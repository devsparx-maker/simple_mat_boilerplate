export interface User {
    id:number;
    username:string;
    knownAs?:string;
    token:string;
    photoUrl?:string;
    roles?: string[];
}