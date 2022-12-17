import * as React from "react";

interface IUseSnackbarProps {
  message: string;
  customStyle?: Pick<React.CSSProperties, "color">;
  setIsSnackbarOpen: (x:boolean) => void;
}
const defaultStyles: React.CSSProperties = {
  position: "fixed",
  color: "black",
  backgroundColor: "white",
  padding: "1em",
  borderRadius: "8px",
  width: "fit-content",
  zIndex:"1000",
  transition: "all ease-in-out 150ms",
};

const UseSnackbar = ({ message, customStyle, setIsSnackbarOpen }: IUseSnackbarProps) => {
  const [top, setTop] = React.useState("-10em");
  React.useEffect(() => {
    const popUp = () => {
      setTimeout(() => {
        setTop("10em");
      },500)
      setTimeout(() => {
        setTop("-10em");
      }, 2000);
      setTimeout(() => {
        setIsSnackbarOpen(false)
      }, 4000);
    };
    popUp();
  }, []);
  return (
    <div
      className="snackbar"
      style={{ ...defaultStyles, ...customStyle, top }}
    >
      {message}
    </div>
  );
};

export default UseSnackbar;
