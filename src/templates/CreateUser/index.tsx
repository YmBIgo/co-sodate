import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  TextareaAutosize,
} from "@mui/material";

import { db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { generateUUID } from "../../helper/uuid";
import { useUser } from "../../hooks/useUser";
import { userConverter } from "../../converter/user";

const createUserMain = {
  margin: "30px",
};
const createUserBox = {
  margin: "20px auto",
  width: "800px",
  backgroundColor: "white",
  borderRadius: "10px",
  padding: "10px",
};
const createUserBoxProfile = {
  display: "flex",
};
const createUserTitle = {
  marginTop: "0px",
  marginBottom: "0px",
  paddingBottom: "0px",
};
const createUserForm = {
  width: "90%",
};
const createUserTextarea = {
  width: "80%",
  fontSize: "20px",
  lineHeight: "45px",
  borderRadius: "5px",
  borderColor: "#aaa",
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

type CreateUserProps = {
  token: string | undefined;
  currentUser: User | null | false;
};

const acceptExtension = ["png", "jpg", "jpeg"];

const CreateUser: React.FC<CreateUserProps> = ({ currentUser }) => {
  const navigation = useNavigate();
  const { setUserDoc } = useUser({
    currentUser,
    disableGetUser: true,
  });
  const uid = currentUser === false ? "" : currentUser?.uid;
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [prefecture, setPrefecture] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [profile, setProfile] = useState<string>("");
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const uploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    const splitFileName = fileName.split(".");
    const fileExtension = splitFileName[splitFileName.length - 1];
    if (!acceptExtension.includes(fileExtension)) return;
    const uuid = generateUUID();
    const currentDate = new Date().toISOString().slice(0, 10);
    const newFilePath = `users/${currentDate}_${uuid}`;
    const storageRef = ref(storage, newFilePath);
    setIsLoading(true);
    const snapshot = await uploadBytes(storageRef, file).finally(() =>
      setIsLoading(false)
    );
    setProfileImageUrl(snapshot.metadata.fullPath);
  };
  const onClickSend = async () => {
    if (
      !name ||
      !profile ||
      !prefecture ||
      !city ||
      !profileImageUrl ||
      !currentUser
    ) {
      setError("いずれかの入力欄が入力されていません");
      return;
    }
    if (!currentUser?.uid) {
      navigation("/signup");
      return;
    }
    setIsLoading(true);
    const userRef = doc(db, "users", currentUser.uid);
    let error = "";
    await setDoc(userRef, {
      uid: currentUser.uid,
      name,
      profile,
      prefecture,
      profileImageUrl,
      city,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
      .catch((e) => {
        error = "エラーが発生しました再度送信してください";
        console.error(e);
      })
      .finally(() => {
        setTimeout(() => setIsLoading(false), 300);
        setUserDoc(
          userConverter({
            id: currentUser.uid,
            uid: currentUser.uid,
            name,
            profile,
            prefecture,
            profileImageUrl,
            city,
            createdAt: {},
            updatedAt: {},
          })
        );
      });
    setError(error);
    if (error) return;
    navigation("/dashboard");
  };
  useEffect(() => {
    async function getUser() {
      if (!uid) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, "users"),
          where("uid", "==", uid),
          orderBy("createdAt", "asc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size !== 0) {
          navigation("/dashboard");
          return;
        }
      } catch (e) {
        console.log(e + "\n");
        navigation("/signup");
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [currentUser]);
  useEffect(() => {
    if (!currentUser || !profileImageUrl) return;
    async function getMyImage() {
      if (!profileImageUrl) return;
      setIsLoading(true);
      const myDownloadImageUrl = await getDownloadURL(
        ref(storage, profileImageUrl)
      )
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
      console.log(myDownloadImageUrl);
      if (myDownloadImageUrl) setProfileUrl(myDownloadImageUrl);
    }
    getMyImage();
  }, [profileImageUrl, currentUser]);
  if (currentUser === null) {
    navigation("/signup");
  }
  return (
    <Box sx={createUserMain}>
      <Box sx={createUserBox}>
        <h1 style={createUserTitle}>ユーザーを新規登録する</h1>
        <p>まずは、ユーザー情報を登録してください</p>
        <hr />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Box sx={createUserBoxProfile}>
              <Box sx={{ flexBasis: "40%" }}>
                <p>お名前</p>
                <TextField
                  sx={createUserForm}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p>プロフィール画像</p>
                <TextField
                  sx={createUserForm}
                  type="file"
                  onChange={uploadImageFile}
                />
                <p>都道府県名</p>
                <TextField
                  sx={createUserForm}
                  placeholder="東京都など"
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                />
                <p>区町村名</p>
                <TextField
                  sx={createUserForm}
                  placeholder="文京区など"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Box>
              <Box>
                {profileUrl ? (
                  <>
                    <p>あなたのプロフィール</p>
                    <Box
                      sx={{
                        ...dashboardMyImage,
                        backgroundImage: `url("${profileUrl}")`,
                      }}
                    >
                      <Box sx={dashboardMyImageTitle}>
                        <h1 style={dashboardMyImageText}>{name}さん</h1>
                        <p style={dashboardMyImageText}>
                          {prefecture}
                          {"　"}
                          {city}
                        </p>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>
                    <h3>プロフィールプレビュー</h3>
                    プロフィールが設定されていません
                  </>
                )}
              </Box>
            </Box>
            <p>自己紹介</p>
            <TextareaAutosize
              style={createUserTextarea}
              minRows={3}
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
            <br />
            <Button
              variant="contained"
              sx={{ marginTop: "10px" }}
              onClick={onClickSend}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress /> : <>登録する</>}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CreateUser;
