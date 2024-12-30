import dayjs, { Dayjs } from "dayjs";
import { User } from "firebase/auth";
import {
  Box,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextareaAutosize,
  Button,
} from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useUser } from "../../hooks/useUser";
import { generateUUID } from "../../helper/uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../firebase";
import { Timestamp, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { fixedBabyName, getBabyAge } from "../../helper/baby";
import { useMyBaby } from "../../hooks/useMyBaby";

type EditBabyProps = {
  currentUser: User | false | null;
};

const editBabyMain = {
  margin: "30px",
};
const editBabyBox = {
  margin: "20px auto",
  width: "800px",
  backgroundColor: "white",
  borderRadius: "10px",
  padding: "10px",
};
const editBabyBoxProfile = {
  display: "flex",
};
const editBabyTitle = {
  marginTop: "0px",
  marginBottom: "0px",
  paddingBottom: "0px",
};
const editBabyForm = {
  width: "90%",
};
const editBabyTextarea = {
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

const acceptExtension = ["png", "jpg", "jpeg"];

const EditBaby: React.FC<EditBabyProps> = ({ currentUser }) => {
  const { babyId } = useParams<{[babyId: string]: string}>()
  const { userDoc, isLoading: isUserLoading } = useUser({ currentUser });
  const { myBabiesDoc, isLoading: isMyBabyLoading } = useMyBaby({currentUser})
  const [name, setName] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [profile, setProfile] = useState<string>("");
  const [gender, setGender] = useState<1 | 0>(1);
  const [birthDate, setBirthDate] = useState<Dayjs | null>(dayjs());
  const [uid, setUid] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const age = useMemo(() => {
    return getBabyAge(birthDate);
  }, [birthDate]);
  const fixedName = fixedBabyName(name, gender)
  const navigation = useNavigate();
  const uploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    const splitFileName = fileName.split(".");
    const fileExtension = splitFileName[splitFileName.length - 1];
    if (!acceptExtension.includes(fileExtension)) return;
    const uuid = generateUUID();
    const currentDate = new Date().toISOString().slice(0, 10);
    const newFilePath = `babies/${currentDate}_${uuid}`;
    const storageRef = ref(storage, newFilePath);
    setIsLoading(true);
    const snapshot = await uploadBytes(storageRef, file).finally(() =>
      setIsLoading(false)
    );
    setProfileImageUrl(snapshot.metadata.fullPath);
  };
  const onGenderChanged = (e: SelectChangeEvent) => {
    const selectedGender = Number(e.target.value);
    if (![0, 1].includes(selectedGender)) {
      setGender(1);
      return;
    }
    setGender(selectedGender as 0 | 1);
  };
  const onClickSend = async() => {
    if (!name || !profile || !birthDate || !profileImageUrl || !currentUser || !babyId) {
        setError("いずれかの入力欄が入力されていません")
        return
    }
    if (!uid){
        navigation("/signup")
        return
    }
    setIsLoading(true)
    console.log(name, profile, profileImageUrl, birthDate.toDate(), uid)
    const babyRef = doc(db, "users", uid, "babies", babyId)
    let error = ""
    await setDoc(babyRef, {
        uid,
        name,
        profile,
        birthday: Timestamp.fromDate(birthDate.toDate()),
        profileImageUrl,
        gender: !!gender,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    })
    .catch((e) => {
        error = "エラーが発生しました再度送信してください"
        console.error(e)
    })
    .finally(() => {
        setTimeout(() => setIsLoading(false), 300)
    })
    setError(error)
    if (error) return
    navigation("/dashboard")
  }
  useEffect(() => {
    if (!myBabiesDoc.length) return
    const myBaby = myBabiesDoc.find((baby) => baby.id === babyId)
    if (!myBaby) {
        navigation("/dashboard")
        return
    }
    setName(myBaby.name)
    setGender(Number(myBaby.gender) as 0 | 1)
    setProfileImageUrl(myBaby.profileImageUrl)
    setProfile(myBaby.profile)
    setBirthDate(dayjs(myBaby.birthday))
  }, [myBabiesDoc, babyId])
  useEffect(() => {
    if (!userDoc) return;
    setUid(userDoc.uid);
  }, [userDoc]);
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
    <Box sx={editBabyMain}>
      <Box sx={editBabyBox}>
        <h1 style={editBabyTitle}>赤ちゃんを登録する</h1>
        <p>赤ちゃんの情報を登録してください</p>
        <hr />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {isUserLoading || isMyBabyLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Box sx={editBabyBoxProfile}>
              <Box sx={{ flexBasis: "40%" }}>
                <p>お名前</p>
                <TextField
                  sx={editBabyForm}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p>プロフィール画像</p>
                <TextField
                  sx={editBabyForm}
                  type="file"
                  onChange={uploadImageFile}
                />
                <p>性別</p>
                <Select
                  value={String(gender)}
                  onChange={onGenderChanged}
                  sx={editBabyForm}
                >
                  <MenuItem value={1}>男の子</MenuItem>
                  <MenuItem value={0}>女の子</MenuItem>
                </Select>
                <p>誕生日</p>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      label="日時を選択"
                      value={birthDate}
                      onChange={(newValue) => {
                        if (dayjs().isAfter(newValue)) setBirthDate(newValue)
                        else setBirthDate(dayjs())
                      }}
                      sx={editBabyForm}
                    />
                  </DemoContainer>
                </LocalizationProvider>
                <p>
                  {age.year}歳 {age.month}ヶ月
                </p>
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
                        <h1 style={dashboardMyImageText}>{fixedName}</h1>
                        <p style={dashboardMyImageText}>
                          {age.year}歳 {age.month}ヶ月
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
              style={editBabyTextarea}
              minRows={3}
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
            <br/>
            <Button
              variant="contained"
              sx={{ marginTop: "10px" }}
              disabled={isLoading || isUserLoading}
              onClick={onClickSend}
            >
              {isLoading || isUserLoading ? <CircularProgress /> : <>登録する</>}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default EditBaby;
