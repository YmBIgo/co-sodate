export type UserType = {
    id: string
    createdAt: Date
    updatedAt: Date
    name: string
    uid: string
    profile: string
    profileImageUrl: string
    prefecture: string
    city: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function userConverter(data: any): UserType {
    return {
        id: String(data.id),
        name: String(data.name),
        uid: String(data.uid),
        profile: String(data.profile),
        profileImageUrl: String(data.profileImageUrl),
        prefecture: String(data.prefecture),
        city: String(data.city),
        createdAt: "toDate" in data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: "toDate" in data.updatedAt ? data.updatedAt.toDate() : new Date()
    }
}