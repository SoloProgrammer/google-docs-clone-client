import styles from "./Navbar.module.css";
import { LuMenu } from "react-icons/lu";
import { useAuth } from "../../context/AuthProvider";
import { LOGIN_URI } from "../../constants/urls";

const Navbar = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <span className={styles.IconBtn}>
          <LuMenu />
        </span>
        <div className={styles.logo}>
          <img
            width={35}
            src="https://cdn.iconscout.com/icon/free/png-256/free-google-docs-7662284-6297220.png"
            alt="logo"
          />
          <span>Docs</span>
        </div>
      </div>
      <div className={styles.search}>
        <input type="text" placeholder="Search" />
      </div>
      <div className={styles.profile}>
        {!isLoading ? (
          !isAuthenticated ? (
            <>
              <a
                href={LOGIN_URI}
                className="shadow-md px-6 py-2 rounded-sm hover:border-transparent text-gray-700 hover:bg-gray-100  flex items-center gap-2"
              >
                <span>Login</span>
                <img
                  width={18}
                  src="https://cdn.iconscout.com/icon/free/png-256/free-google-1772223-1507807.png"
                  alt=""
                />
              </a>
            </>
          ) : (
            <>
              <img src={user?.avatar} alt="profile" />
            </>
          )
        ) : (
          <></>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
