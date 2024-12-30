import { User } from "firebase/auth";
import { useState, useEffect } from "react";
import {
  query,
  collection,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

import { UserType, userConverter } from "../converter/user";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

type UserHooksProps = {
  currentUser: User | null | false;
  disableGetUser?: boolean
};

export const useUser = (props: UserHooksProps) => {
  const { currentUser, disableGetUser } = props;
  const [userDoc, setUserDoc] = useState<UserType | null | false>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function getUser() {
      if (!currentUser || disableGetUser) {
        setIsLoading(false)
        return
      }
      const uid = currentUser?.uid;
      if (!uid) return;
      try {
        setIsLoading(true);
        const q = query(
          collection(db, `users`),
          where("uid", "==", uid),
          orderBy("createdAt", "asc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size === 0) {
          navigate("/createUser");
          return;
        }
        // limit(1)しているので、forEachでも問題ない
        querySnapshot.forEach((doc) => {
          const user = userConverter({...doc.data(), id: doc.id});
          setUserDoc(user);
        });
      } catch (e) {
        console.error(e + "\n");
      } finally {
        setIsLoading(false);
      }
    }
    getUser();
  }, [currentUser, disableGetUser]);
  return {userDoc, setUserDoc, isLoading}
};
