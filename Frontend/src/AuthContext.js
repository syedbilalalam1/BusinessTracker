import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  signin: () => {},
  signout: () => {}
});

export default AuthContext;
