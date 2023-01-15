import { useRef } from "react";

interface DropAreaProps {
  setDragFile: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropArea = ({ setDragFile }: DropAreaProps) => {
  const dropAreaRef = useRef<HTMLDivElement>(null);

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // e.dataTransfer.dropEffect = "copy"
    dropAreaRef.current!.style.border = "3px dotted green";
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dropAreaRef.current!.style.border = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if(file.name.includes(".dnd")){
        console.log(file);
    }else{
        alert("Wrong file type. Choose a .dnd file");
    }
    setDragFile(false);
  }
  return (
    <div
      className="drop-area"
      ref={dropAreaRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <span>Drop your file here to load presets</span>
    </div>
  );
};

export default DropArea;
