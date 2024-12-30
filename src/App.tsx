import { Box } from "@mui/material";
import Header from "./components/organisms/Header";
import { Route, Routes } from "react-router-dom";
import SignUp from "./templates/SignUp";
import Top from "./templates/Top";
import { useEffect, useState } from "react";
import { User, getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth/cordova";
import Dashboard from "./templates/Dashboard";
import CreateUser from "./templates/CreateUser";
import EditUser from "./templates/EditUser";
import RegisterBaby from "./templates/RegisterBaby";
import EditBaby from "./templates/EditBaby";

const mainSection = {
  paddingTop: "70px",
  paddingBottom: "10px",
  background: "#eee"
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null | false | false>(false);
  const [token, setToken] = useState<string | undefined>(undefined)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      try {
        setCurrentUser(user);
      } catch(e) {
        console.log(e)
        setCurrentUser(null)
      }
      if (!user) return
      const newToken = await user?.getIdToken(true)
      setToken(newToken)
    });
    return unsubscribe;
  }, []);
  return (
    <>
      <Header isLogin={!!currentUser} />
      <Box sx={mainSection}>
        <Routes>
          <Route path="/" element={<Top />} />
          <Route path="/signup" element={
            <SignUp
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              setToken={setToken}
            />
          } />
          <Route path="/dashboard" element={
            <Dashboard
              token={token}
              currentUser={currentUser}
            />
          }/>
          <Route path="/createUser" element={
            <CreateUser
              currentUser={currentUser}
              token={token}
            />
          }
          />
          <Route path="/editUser" element={
            <EditUser
              currentUser={currentUser}
              token={token}
            />
          }
          />
          <Route
            path="/registerBaby"
            element={
              <RegisterBaby
                currentUser={currentUser}
              />
            }
          />
          <Route
            path="/editBaby/:babyId"
            element={
              <EditBaby
                currentUser={currentUser}
              />
            }
          />
        </Routes>
      </Box>
    </>
  );
}

export default App;
