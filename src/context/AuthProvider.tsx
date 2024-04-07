import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session, User } from "../types/types";
import { useAxios } from "use-axios-http-requests-ts";
import { SESSION_URI } from "../constants/urls";

type AuthContextType = {
  setSession: React.Dispatch<React.SetStateAction<Session>>;
} & Session;

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const DEFAULT_SESSION: Session = {
    isAuthenticated: false,
    user: null,
    isLoading: true,
  };

  const [session, setSession] = useState<Session>(DEFAULT_SESSION);

  type AxiosResponse = {
    session: User;
  };

  const { data, loading } = useAxios<AxiosResponse>(SESSION_URI, [], {
    withCredentials: true,
  });

  useEffect(() => {
    if (data) {
      setSession({
        isAuthenticated: true,
        user: data.session,
        isLoading: false,
      });
    } else if (!data && !loading) {
      setSession({ ...session, isLoading: false });
    }
  }, [data, loading]);

  const { isAuthenticated, isLoading, user } = session;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
