import assets from "../utlities/assets";

interface IToggleFullscreenButtonProps {
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ToggleFullscreenButton = ({
  isFullscreen,
  setIsFullscreen,
}: IToggleFullscreenButtonProps) => {
  return (
    <button
      className="fullscreen-icon"
      onClick={() => setIsFullscreen((prev) => !prev)}
    >
      <img
        src={
          isFullscreen
            ? assets.images.closeFullScreen
            : assets.images.openFullScreen
        }
        height="40px"
        width="40px"
        alt="Fullscreen icon"
      />
    </button>
  );
};

export default ToggleFullscreenButton;
