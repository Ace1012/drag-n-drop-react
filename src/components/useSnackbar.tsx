import * as React from "react";

interface IUseSnackbarProps {
  message: string;
  customStyle?: Pick<React.CSSProperties, "color">;
}
const defaultStyles: React.CSSProperties = {
  position: "fixed",
  color: "black",
  backgroundColor: "white",
  padding: "1em",
  borderRadius: "8px",
  width: "fit-content",
  transition: "all ease-in-out 150ms",
};

const UseSnackbar = ({ message, customStyle }: IUseSnackbarProps) => {
  const [bottom, setBottom] = React.useState("-10em");
  React.useEffect(() => {
    const popUp = () => {
      setTimeout(() => {
        setBottom("10em");
      }, 1000);
      setTimeout(() => {
        setBottom("-10em");
      }, 3000);
    };
    popUp();
  }, []);
  return (
    <div
      className="snackbar"
      style={{ ...defaultStyles, ...customStyle, bottom }}
    >
      {message}
    </div>
  );
};

export default UseSnackbar;
