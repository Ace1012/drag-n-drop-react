import { FunctionComponent, useEffect, useRef } from "react";
import { Tier } from "../interfaces/interfaces";
import { FaBeer, FaTrash } from "react-icons/fa";

interface ContainerProps {
  tier: Tier;
  removeTier: (title:string) => void
}

const Container: FunctionComponent<ContainerProps> = ({ tier, removeTier }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  function dragOver(e: DragEvent) {
    console.log("Dragging");
  }
  function drop(e: DragEvent) {
    console.log("Dropped");
  }



  useEffect(() => {
    containerRef.current?.addEventListener("dragover", dragOver);
    containerRef.current?.addEventListener("drop", drop);
  }, []);

  return (
    <div ref={containerRef} className="tier-container">
      <header style={{
        textTransform:"capitalize"
      }}>{tier.title}</header>
      <div className="content">Content Area</div>
      <footer>
        <FaBeer
          className="footer-icon"
          onClick={e => removeTier(tier.title)}
          size={30}
          color="rgb(130, 130, 130)"
        />
        <FaTrash
          className="footer-icon"
          onClick={e => removeTier(tier.title)}
          size={30}
          color="rgb(130, 130, 130)"
        />
      </footer>
    </div>
  );
};

export default Container;
