import { User } from "firebase/auth"
import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"

import { BabyType, babyConverter } from "../converter/baby"
import { db } from "../firebase"

type BabyHooksProps = {
    currentUser: User | null | false
}

export const useMyBaby = (props: BabyHooksProps) => {
    const {currentUser} = props
    const [myBabiesDoc, setMyBabiesDoc] = useState<BabyType[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        async function getMyBaby() {
            if (!currentUser) {
                setIsLoading(false)
                return
            }
            const uid = currentUser.uid
            if (!uid) {
                setIsLoading(false)
                return
            }
            try {
                setIsLoading(true)
                const q = query(
                    collection(db, "users", uid, "babies"),
                    where("uid", "==", uid),
                    orderBy("birthday", "desc")
                )
                const querySnapshot = await getDocs(q)
                if (querySnapshot.size === 0) {
                    setMyBabiesDoc([])
                    return
                }
                let babySnapstot: BabyType[] = []
                querySnapshot.forEach((doc) => {
                    const baby = babyConverter({...doc.data(), id: doc.id})
                    babySnapstot = [...babySnapstot, baby]
                })
                setMyBabiesDoc(babySnapstot)
            } catch(e) {
                console.log(e + "\n")
            } finally {
                setIsLoading(false)
            }
        }
        getMyBaby()
    }, [currentUser])
    return {myBabiesDoc, isLoading, setMyBabiesDoc}
}