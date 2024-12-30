export type BabyType = {
    id: string;
    name: string;
    uid: string;
    profileImageUrl: string;
    birthday: Date;
    gender: boolean;
    profile: string;
    createdAt: Date;
    updatedAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function babyConverter(data: any): BabyType {
    return {
        id: String(data.id),
        name: String(data.name),
        uid: String(data.uid),
        profile: String(data.profile),
        profileImageUrl: String(data.profileImageUrl),
        birthday: "toDate" in data.birthday ? data.birthday.toDate() : new Date(),
        gender: !!data.gender,
        createdAt: "toDate" in data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: "toDate" in data.updatedAt ? data.updatedAt.toDate() : new Date()
    }
}