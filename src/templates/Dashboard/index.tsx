import { User } from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage"
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, Tab, Tabs } from "@mui/material";
import { useUser } from "../../hooks/useUser";
import { useEffect, useState } from "react";
import { storage } from "../../firebase";
import { useMyBaby } from "../../hooks/useMyBaby";
import { BabyType } from "../../converter/baby";
import { fixedBabyName, getBabyAge } from "../../helper/baby";
import dayjs from "dayjs";

const dashboardMain = {
  margin: "30px",
};
const dashboardBox = {
  margin: "20px auto",
  width: "800px",
//   border: "1px solid black",
  backgroundColor: "white",
  borderRadius: "10px",
  padding: "10px 20px",
};
const dashboardTitle = {
  marginTop: "0px",
  marginBottom: "0px",
  paddingBottom: "0px",
};
const dashboardMainContent = {
    display: "flex",
    gap: "2%"
}
const dashboardLeftContent = {
    flexBasis: "49%"
};
const dashboardLeftContentTitle = {
    marginTop: "0px",
    marginBottom: "0px"
}
const dashboardRightContent = {
    flexBasis: "49%"
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
}
const dashboardMyImageTitle = {
  textAlign: "center",
  backgroundColor: "#111111cc",
  color: "white",
  width: "250px",
  margin: "0 auto 10px",
  borderRadius: "10px"
}
const dashboardMyImageText = {
    marginTop: "0px",
    marginBottom: "0px"
}
const dashboardUsage = {
    padding: "10px",
    position: "relative",
    border: "1px solid #33333360",
    borderRadius: "2px",
    marginBottom: "20px",
    textAlign: "center"
}
const dashboardUsageNumber = {
    position: "absolute",
    display: "block",
    top: "-15px",
    left: "-15px",
    width: "30px",
    height: "30px",
    lineHeight: "30px",
    textAlign: "center",
    verticalAlign: "middle",
    backgroundColor: "orange",
    borderRadius: "50%",
    color: "white",
}
const dashboardUsageTitle = {
    color: "#03a9f4",
    padding: "10px",
    margin: "0px",
}
const dashboardUsageText = {
    color: "#888",
    margin: "5px auto 10px",
    padding: "0px"
}

type DashboardProps = {
  token: string | undefined;
  currentUser: User | null | false;
};

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const { userDoc, isLoading } = useUser({ currentUser });
  const { myBabiesDoc, isLoading: isMyBabiesLoading } = useMyBaby({currentUser})
  const [myImageUrl, setMyImageUrl] = useState<string>("")
  const [myBabyImageUrl, setMyBabyImageUrl] = useState<string>("")
  const [currentMyBaby, setCurrentBaby] = useState<BabyType | null>(null)
  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser || !userDoc) return
    async function getMyImage() {
        if (!userDoc) return
        const myDownloadImageUrl = await getDownloadURL(ref(storage, userDoc.profileImageUrl))
        .catch((error) => {
            console.log(error)
        })
        if (myDownloadImageUrl) setMyImageUrl(myDownloadImageUrl)
    }
    getMyImage()
  }, [currentUser, userDoc])
  useEffect(() => {
    if (!myBabiesDoc.length) return
    setCurrentBaby(myBabiesDoc[0])
  }, [myBabiesDoc])
  useEffect(() => {
    if (!currentMyBaby) return
    async function getMyBabyImage() {
        const myBabyDownloadImageUrl = await getDownloadURL(ref(storage, currentMyBaby?.profileImageUrl))
        .catch((error) => {
            console.log(error)
        })
        if (myBabyDownloadImageUrl) setMyBabyImageUrl(myBabyDownloadImageUrl)
    }
    getMyBabyImage()
  }, [currentMyBaby])
  if (userDoc === null) {
    navigation("/createUser");
    return;
  }
  if (currentUser === null) {
    navigation("/signup")
    return
  }
  return (
    <Box sx={dashboardMain}>
      <Box sx={dashboardBox}>
        <h1 style={dashboardTitle}>マイページ</h1>
        <hr style={{marginBottom: "0px"}}/>
        <h3>交換育児とは？</h3>
        <p>
            一番忙しい0歳児〜1歳児の子育てで、一人親のママさんが<strong style={{color: "red"}}>1日3時間以上の自由時間を得る育児方法</strong>です。
            <br/><br/>
            例えば 2人1組の助け合う一人親のママ友達で、
            <br/>
            9時〜14時は一方のママさんが２人の赤ちゃんの世話をして、
            <br/>
            14時〜19時はもう一方のママさんが２人の赤ちゃんの世話をする役割分担をすることで、
            <br/>
            両方のママさんが<strong style={{color: "red"}}>１日4〜5時間の自由時間</strong>を得られます。
        </p>
        <hr/>
        {isLoading && <CircularProgress />}
        <Box sx={dashboardMainContent}>
            <Box sx={dashboardLeftContent}>
            {userDoc && myImageUrl && (
                <>
                    <p>
                        あなたのプロフィール{"　"}
                        <Button variant="contained" color="success" size="small">
                            <Link to="/editUser" style={{color: "white"}}>
                                編集する
                            </Link>
                        </Button>
                    </p>
                    <Box sx={{...dashboardMyImage, backgroundImage: `url("${myImageUrl}")`}}>
                        <Box sx={dashboardMyImageTitle}>
                            <h1 style={dashboardMyImageText}>
                                {userDoc.name}さん
                            </h1>
                            <p style={dashboardMyImageText}>
                                {userDoc.prefecture}{"　"}{userDoc.city}
                            </p>
                        </Box>
                    </Box>
                    <br/>
                    <p style={dashboardLeftContentTitle}>
                        あなたの赤ちゃん
                    </p>
                    { isMyBabiesLoading
                      ? <CircularProgress/>
                      :
                        myBabiesDoc.length && currentMyBaby
                        ?
                        <>
                            <Tabs value={currentMyBaby.id}>
                                {myBabiesDoc.map((baby) => {
                                    return (
                                        <Tab
                                            label={fixedBabyName(baby.name, Number(baby.gender) as 0 | 1)}
                                            value={baby.id}
                                            onClick={() => setCurrentBaby(baby)}
                                        />
                                    )
                                })}
                            </Tabs>
                            <br/>
                            <Box sx={{...dashboardMyImage, backgroundImage: `url("${myBabyImageUrl}")`}}>
                                <Box sx={dashboardMyImageTitle}>
                                    <h1 style={dashboardMyImageText}>
                                        {fixedBabyName(currentMyBaby.name, Number(currentMyBaby.gender) as 0 | 1)}
                                    </h1>
                                    <p style={dashboardMyImageText}>
                                        { getBabyAge(dayjs(currentMyBaby.birthday)).year }歳 { getBabyAge(dayjs(currentMyBaby.birthday)).month }ヶ月
                                    </p>
                                </Box>
                            </Box>
                            <Button color="success" variant="contained">
                                <Link to={`/editBaby/${currentMyBaby.id}`} style={{color: "white"}}>
                                    {fixedBabyName(currentMyBaby.name, Number(currentMyBaby.gender) as 0 | 1)}を編集する
                                </Link>
                            </Button>
                        </>
                        :
                        <p>
                            赤ちゃんが登録されていません。
                            <br/>
                            登録しましょう！
                            <br/>
                            <Button>
                                <Link to="/registerBaby" style={{color: "white"}}>
                                    赤ちゃんを登録する
                                </Link>
                            </Button>
                        </p>
                    }
                </>
            )}
            </Box>
            <Box sx={dashboardRightContent}>
                <p style={{lineHeight: "30px"}}>使い方</p>
                <Box sx={dashboardUsage}>
                    <Box sx={dashboardUsageNumber}>0</Box>
                    <h3 style={dashboardUsageTitle}>赤ちゃんを登録する</h3>
                    <p style={dashboardUsageText}>
                        赤ちゃんの情報を登録しましょう
                    </p>
                    <Button variant="contained">
                        <Link to="/registerBaby" style={{color: "white"}}>
                        赤ちゃんを登録する
                        </Link>
                    </Button>
                </Box>
                <Box sx={dashboardUsage}>
                    <Box sx={dashboardUsageNumber}>1</Box>
                    <h3 style={dashboardUsageTitle}>育児仲間を見つける</h3>
                    <p style={dashboardUsageText}>
                        他のママの住んでいる場所が書いてあるので、
                        <br/>
                        一緒に育児を支え合えるママ仲間を見つけましょう
                    </p>
                    <Button variant="contained">
                        <Link to="/find" style={{color: "white"}}>
                        育児仲間を見つける
                        </Link>
                    </Button>
                </Box>
                <Box sx={dashboardUsage}>
                    <Box sx={dashboardUsageNumber}>2</Box>
                    <h3 style={dashboardUsageTitle}>話をしてみる</h3>
                    <p style={dashboardUsageText}>
                        ママを見つけたら、チャットで連絡を取ってみよう
                        <br/>
                        本当に一緒に育児を支えられるか判断するために、
                        <br/>
                        実際にお互いの家に行ったり、実際に話すことを、
                        <br/>
                        おすすめしています。
                    </p>
                    <Button variant="contained">
                        <Link to="/chats" style={{color: "white"}}>
                        チャットしている育児仲間
                        </Link>
                    </Button>
                </Box>
                <Box sx={dashboardUsage}>
                    <Box sx={dashboardUsageNumber}>3</Box>
                    <h3 style={dashboardUsageTitle}>交換育児をする</h3>
                    <p style={dashboardUsageText}>
                        お話していいなと思ったママと交換育児しましょう
                        <br/><br/>
                        交換育児とは、２人１組の交代制で育児をすることで、
                        ママさんたちが自由時間を作る育児方法です。
                    </p>
                </Box>
            </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
