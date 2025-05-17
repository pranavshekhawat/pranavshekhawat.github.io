<<<<<<< HEAD
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

 function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
=======
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

 function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
>>>>>>> b4b4bc20d0426045ab9c3733a0f91ede447c11c5
export default ScrollToTop;