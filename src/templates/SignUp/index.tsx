import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth"
import { User } from "firebase/auth"
import { Box, Button } from "@mui/material"

import googleSignInImage from "../../assets/google_sign_in.png"

const signUpMain = {
    margin: "30px"
}
const signUpBox = {
    margin: "20px auto",
    width: "400px",
    border: "1px solid black",
    borderRadius: "10px",
    padding: "10px",
    backgroundColor: "white"
}
const signUpTitle = {
    marginBottom: "0px",
    paddingBottom: "0px"
}
const signUpImage = {
    width: "150px",
    margin: "10px auto"
}

type SignUpProps = {
    currentUser: User | null | false;
    setCurrentUser: Dispatch<SetStateAction<User | null | false>>;
    setToken: Dispatch<SetStateAction<string | undefined>>;
}

const SignUp: React.FC<SignUpProps> = ({
    currentUser,
    setCurrentUser,
    setToken
}) => {
    const auth = getAuth()
    const [provider] = useState(new GoogleAuthProvider())
    const navigate = useNavigate()
    const onClickLogin = () => {
        signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result)
            const token = credential?.accessToken
            const user = result.user
            setToken(token)
            setCurrentUser(user)
        })
        .catch((error) => {
            console.log(error)
        })
    }
    useEffect(() => {
        auth.useDeviceLanguage()
    }, [auth])
    useEffect(() => {
        provider.addScope("https://www.googleapis.com/auth/contacts.readonly")
        const currentUserEmail = localStorage.getItem("currentUserEmail")
        if (currentUserEmail) {
            provider.setCustomParameters({
                "login_hint": currentUserEmail
            })
        }
    }, [provider])
    if (currentUser) {
        navigate("/dashboard")
    }
    return (
        <Box sx={signUpMain}>
            <Box sx={signUpBox}>
                <h1 style={signUpTitle}>ログインする</h1>
                <p>Googleでのログインが可能です</p>
                <hr/>
                <Button onClick={onClickLogin}>
                    <img src={googleSignInImage} style={signUpImage}/>
                </Button>
            </Box>
        </Box>
    )
}

export default SignUp