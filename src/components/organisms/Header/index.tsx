import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

type HeaderProps = {
    isLogin: boolean
}

const Header: React.FC<HeaderProps> = ({isLogin}) => {
  const navigate = useNavigate()
  return (
    <AppBar component="nav">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
        >
          <Link to="/" style={{ color: "#fff" }}>Co-Sodate</Link>
        </Typography>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          { isLogin
          ?
          <>
            <Button>
                <Link to="/dashboard" style={{ color: "#fff" }}>管理画面</Link>
            </Button>
            <Button>
                <Link to="/chats" style={{ color: "#fff" }}>育児仲間チャット</Link>
            </Button>
            <Button>
                <Link to="/findUser" style={{ color: "#fff" }}>育児仲間を見つける</Link>
            </Button>
            <Button>
                <Link to="/usage" style={{ color: "#fff" }}>使い方</Link>
            </Button>
            <Button
                onClick={() => {
                    try {
                        const auth = getAuth()
                        signOut(auth)
                        navigate("/signup")
                    } catch(e) {
                        console.log(e)
                    }
                }}
                color="inherit"
            >
                サインアウトする
            </Button>
          </>
          :
          <>
            <Button sx={{ color: "#fff" }}>
                <Link to="/signup" style={{ color: "#fff" }}>登録・ログイン</Link>
            </Button>
            <Button sx={{ color: "#fff" }}>
                <Link to="/usage" style={{ color: "#fff" }}>使い方</Link>
            </Button>
          </>
          }
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
