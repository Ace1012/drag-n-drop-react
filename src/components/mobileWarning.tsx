interface IMobileWarningProps {
  setIsMobile: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileWarning = ({ setIsMobile }: IMobileWarningProps) => {
  return (
    <div className="mobile-warning-overlay" onClick={() => setIsMobile(false)}>
      <div className="mobile-warning" onClick={(e) => e.stopPropagation()}>
        <span>
          Currently working on mobile functionality. Please use a computer for
          now.
        </span>
        {/* <button className="warning-closebtn">&times;</button> */}
        <button className="warning-closebtn" onClick={() => setIsMobile(false)}>
          x
        </button>
      </div>
    </div>
  );
};

export default MobileWarning;
