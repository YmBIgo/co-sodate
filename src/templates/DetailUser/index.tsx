import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { UserType, userConverter } from "../../converter/user";
import { db, storage } from "../../firebase";
import { useUser } from "../../hooks/useUser";
import { BabyType, babyConverter } from "../../converter/baby";
import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
import { getDownloadURL, ref } from "firebase/storage";
import { fixedBabyName, getBabyAge } from "../../helper/baby";
import dayjs from "dayjs";

type DetailUserProps = {
  currentUser: User | null | false;
};

const detailUserMain = {
  margin: "30px",
};
const detailUserBox = {
  margin: "20px auto",
  width: "800px",
  backgroundColor: "white",
  borderRadius: "10px",
  padding: "20px 30px",
};
const detailUserTitle = {
  marginTop: "0px",
  marginBottom: "10px",
};
const detailUserMainContent = {
  display: "flex",
  gap: "2%",
};
const detailUserLeftContent = {
  flexBasis: "49%",
};
const detailUserRightContent = {
  flexBasis: "49%",
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

const DetailUser: React.FC<DetailUserProps> = ({ currentUser }) => {
  const { userDoc } = useUser({ currentUser });
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [userImageUrl, setUserImageUrl] = useState<string>("");
  const [babies, setBabies] = useState<BabyType[]>([]);
  const [currentBaby, setCurrentBaby] = useState<BabyType | null>(null);
  const [babyImageUrl, setBabyImageUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBabyLoading, setIsBabyLoading] = useState<boolean>(true);
  useEffect(() => {
    async function getUser() {
      if (!userId || user) return;
      try {
        setIsLoading(true);
        const q = doc(db, "users", userId);
        const userSnapshot = await getDoc(q);
        const userData: UserType = userConverter({...userSnapshot.data(), id: userSnapshot.id});
        setUser(userData);
      } catch (e) {
        console.error(e + "\n");
      } finally {
        setIsLoading(false);
      }
    }
    getUser();
  }, [userId]);
  useEffect(() => {
    if (!user) return;
    async function getUserImage() {
      if (!user) return;
      const userDownloadImageUrl = await getDownloadURL(
        ref(storage, user.profileImageUrl)
      ).catch((e) => {
        console.error(e);
      });
      if (userDownloadImageUrl) setUserImageUrl(userDownloadImageUrl);
    }
    getUserImage();
  }, [user]);
  useEffect(() => {
    async function getBabies() {
      if (!user || !userId) return;
      try {
        setIsBabyLoading(true);
        const q = query(
          collection(db, "users", user.id, "babies"),
          where("uid", "==", user.id),
          orderBy("birthday", "desc")
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size === 0) {
          setBabies([]);
          return;
        }
        let babySnapshot: BabyType[] = [];
        querySnapshot.forEach((baby) => {
          babySnapshot = [
            ...babySnapshot,
            babyConverter({ ...baby.data(), id: baby.id }),
          ];
        });
        setCurrentBaby(babySnapshot[0]);
        setBabies(babySnapshot);
      } catch (e) {
        console.error(e + "\n");
      } finally {
        setIsBabyLoading(false);
      }
    }
    getBabies();
  }, [user, userId]);
  useEffect(() => {
    if (!currentBaby) return
    async function getBabyImage() {
        const babyDownloadImageUrl = await getDownloadURL(ref(storage, currentBaby?.profileImageUrl))
        .catch((e) => {
            console.error(e)
        })
        if (babyDownloadImageUrl) setBabyImageUrl(babyDownloadImageUrl)
    }
    getBabyImage()
  }, [currentBaby])
  return (
    <Box sx={detailUserMain}>
      <Box sx={detailUserBox}>
        {user && !isLoading ? (
          <>
            <h1 style={detailUserTitle}>{user.name}さんの情報</h1>
            <hr />
            <Box sx={detailUserMainContent}>
              <Box sx={detailUserLeftContent}>
                <h3>{user.name}さん</h3>
                { userDoc && userDoc.id !== user.id
                ?
                    <Button
                        variant="contained"
                        color="info"
                        disabled={!userDoc}
                    >
                        {!userDoc
                        ? <>ログインすれば連絡が取れます</>
                        : <>チャットを始めてみる </>
                        }
                    </Button>
                :
                <Button
                    color="success"
                    variant="contained"
                >
                    <Link to="/editUser" style={{color: "white"}}>
                        編集する
                    </Link>
                </Button>
                }
                <br/><br/>
                <Box
                  sx={{
                    ...dashboardMyImage,
                    backgroundImage: `url("${userImageUrl}")`,
                    marginTop: "5px"
                  }}
                >
                  <Box sx={dashboardMyImageTitle}>
                    <h1 style={dashboardMyImageText}>{user.name}さん</h1>
                    <p style={dashboardMyImageText}>
                      {user.prefecture}
                      {"　"}
                      {user.city}
                    </p>
                  </Box>
                </Box>
                <p>{user.name}さんのプロフィール</p>
                {user.profile}
              </Box>
              <Box sx={detailUserRightContent}>
                {babies.length && currentBaby ? (
                  <>
                    <p>{user.name}さんの赤ちゃん</p>
                    {isBabyLoading ? (
                      <CircularProgress />
                    ) : (
                      <>
                        <Tabs value={currentBaby.id}>
                          {babies.map((baby) => {
                            return (
                              <Tab
                                label={fixedBabyName(
                                  baby.name,
                                  Number(baby.gender) as 0 | 1
                                )}
                                value={baby.id}
                                onClick={() => setCurrentBaby(baby)}
                                key={baby.id}
                              />
                            );
                          })}
                        </Tabs>
                        <br />
                        <Box
                          sx={{
                            ...dashboardMyImage,
                            backgroundImage: `url("${babyImageUrl}")`,
                          }}
                        >
                          <Box sx={dashboardMyImageTitle}>
                            <h1 style={dashboardMyImageText}>
                              {fixedBabyName(
                                currentBaby.name,
                                Number(currentBaby.gender) as 0 | 1
                              )}
                            </h1>
                            <p style={dashboardMyImageText}>
                              {getBabyAge(dayjs(currentBaby.birthday)).year}歳{" "}
                              {getBabyAge(dayjs(currentBaby.birthday)).month}
                              ヶ月
                            </p>
                          </Box>
                        </Box>
                        <p>{fixedBabyName(currentBaby.name, Number(currentBaby.gender) as 0 | 1)}のプロフィール</p>
                        {currentBaby.profile}
                      </>
                    )}
                  </>
                ) : (
                  <p>
                    {isBabyLoading ? (
                      <CircularProgress />
                    ) : (
                      <>赤ちゃんは登録されていません</>
                    )}
                  </p>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Box>
  );
};

export default DetailUser;
