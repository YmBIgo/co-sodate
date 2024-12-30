import { useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import { UserType, userConverter } from "../../converter/user";
import { User } from "firebase/auth";
import { useUser } from "../../hooks/useUser";
import { collection, getDocs, limit, orderBy, query, startAfter} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { Box, CircularProgress } from "@mui/material";
import { getDownloadURL, ref } from "firebase/storage";
import { Link } from "react-router";

const findUserMain = {
  margin: "30px",
};
const findUserBox = {
  margin: "20px auto",
  width: "800px",
  backgroundColor: "white",
  borderRadius: "10px",
  padding: "20px 30px",
};
const findUserBoxProfile = {
  display: "flex",
  gap: "2%",
};
const findUserBoxCard = {
  width: "49%",
};

const dashboardMyImage = {
  backgroundFit: "cover",
  backgroundPosition: "50% 50%",
  width: "350px",
  height: "500px",
  display: "flex",
  flexFlow: "column",
  alignItem: "center",
  justifyContent: "flex-end",
  marginBottom: "10px",
};
const dashboardMyImageTitle = {
  textAlign: "center",
  backgroundColor: "#111111cc",
  color: "white",
  width: "250px",
  margin: "0 auto 10px",
  borderRadius: "10px",
};
const dashboardMyImageText = {
  marginTop: "0px",
  marginBottom: "0px",
};
const dashboardTitle = {
  marginTop: "0px",
  marginBottom: "10px"
}

type FindUserProps = {
  currentUser: User | null | false;
};

const LOADING_LIMIT = 1

const FindUser: React.FC<FindUserProps> = ({ currentUser }) => {
  const { userDoc } = useUser({ currentUser });
  const [users, setUsers] = useState<UserType[]>([]);
  const [userImages, setUserImages] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastId, setLastId] = useState<Date | null>(null)
  const [isAdditionalLoading, setIsAdditionalLoading] = useState(false)
  const [isNoAdditionalData, setIsNoAdditionalData] = useState(true)
  const onLoadAdditionalData = async () => {
    setIsAdditionalLoading(true)
    let userSnapshot: UserType[] = [];
    try {
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        startAfter(lastId),
        limit(LOADING_LIMIT)
      )
      const querySnapshot = await getDocs(q)
      let userImageMap: { [key: string]: string } = {};
      const userImagePromise: Promise<void>[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const user = userConverter({ ...data, id: doc.id });
        userSnapshot = [...userSnapshot, user];
        userImagePromise.push(
          new Promise((resolve) => {
            getDownloadURL(ref(storage, data.profileImageUrl)).then((url) => {
              userImageMap = { ...userImageMap, [doc.id]: url };
              resolve(undefined)
            });
          })
        );
      });
      setUsers((prev) => [...prev, ...userSnapshot]);
      if (userSnapshot.length < LOADING_LIMIT) setIsNoAdditionalData(true)
      Promise.all(userImagePromise).then(() => {
        setUserImages((prev) => ({...prev, ...userImageMap}));
      });
    } catch(e) {
      console.log(e + "\n")
    } finally {
      setIsAdditionalLoading(false)
    }
  }
  useEffect(() => {
    async function getInitialUser() {
      let userSnapshot: UserType[] = [];
      try {
        setIsLoading(true);
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(LOADING_LIMIT)
        );
        const querySnapshot = await getDocs(q);
        let userImageMap: { [key: string]: string } = {};
        const userImagePromise: Promise<void>[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const user = userConverter({ ...data, id: doc.id });
          userSnapshot = [...userSnapshot, user];
          userImagePromise.push(
            new Promise((resolve) => {
              getDownloadURL(ref(storage, data.profileImageUrl)).then((url) => {
                userImageMap = { ...userImageMap, [doc.id]: url };
                resolve(undefined)
              });
            })
          );
        });
        setUsers(userSnapshot);
        if (userSnapshot.length < LOADING_LIMIT) setIsNoAdditionalData(true)
        else setIsNoAdditionalData(false)
        Promise.all(userImagePromise).then(() => {
          setUserImages((prev) => ({...prev, ...userImageMap}));
        });
      } catch (e) {
        console.log(e + "\n");
      } finally {
        setIsLoading(false);
        setLastId(userSnapshot[userSnapshot.length - 1].createdAt)
      }
    }
    getInitialUser();
  }, [userDoc]);
  return (
    <Box sx={findUserMain}>
      <Box sx={findUserBox}>
        <h1 style={dashboardTitle}>ユーザー一覧</h1>
        <hr/>
        <p>一緒に育児を協力してくれるママさんたちです！連絡をとってみましょう！</p>
        <Box sx={findUserBoxProfile}>
          { isLoading
          ?
          <CircularProgress/>
          :
          <>
            {users.map((user) => {
              return (
                <Box sx={findUserBoxCard} key={user.id + user.uid}>
                  <Box
                    sx={{
                      ...dashboardMyImage,
                      backgroundImage: `url("${userImages[user.id]}")`,
                    }}
                  >
                    <Box sx={dashboardMyImageTitle}>
                      { userDoc
                      ?
                        <h1 style={dashboardMyImageText}>
                          <Link to={`/detailUser/${user.id}`} style={{color: "white"}}>
                            {user.name}さん
                          </Link>
                        </h1>
                      :
                      <h1 style={dashboardMyImageText}>
                        {user.name}さん
                      </h1>
                      }
                      <p style={dashboardMyImageText}>
                        {user.prefecture}
                        {"　"}
                        {user.city}
                      </p>
                    </Box>
                  </Box>
                </Box>
              );
            })}
            <InView
              onChange={(inView) => {
                if (!inView || isNoAdditionalData) return
                onLoadAdditionalData()
              }}
            />
            { isAdditionalLoading && <CircularProgress/>}
          </>
        }
        </Box>
      </Box>
    </Box>
  );
};

export default FindUser;
