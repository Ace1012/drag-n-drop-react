import { useEffect } from "react";

interface IMobileWarningProps {
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileWarning = ({ setIsMobile }: IMobileWarningProps) => {
  useEffect(() => {
    const initialWarning = Boolean(localStorage.getItem("mobile-warning"));
    if (!initialWarning) {
      sessionStorage.setItem("mobile-warning", "true");
    }
  }, []);
  return (
    <div className="mobile-warning-overlay" onClick={() => setIsMobile(false)}>
      <div className="mobile-warning" onClick={(e) => e.stopPropagation()}>
        <span style={{
          textAlign: "start",
        }}>
          Currently working on mobile functionality.
          If you encounter any bugs feel free to let me know.
        </span>
        {/* <button className="warning-closebtn">&times;</button> */}
        {/* <button className="warning-closebtn" onClick={() => setIsMobile(false)}>
          x
        </button> */}
      </div>
    </div>
  );
};

export default MobileWarning;
