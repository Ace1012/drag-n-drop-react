import { FormEvent, useRef, useState } from "react";
import Container from "./components/container";
import { Tier } from "./interfaces/interfaces";

function App() {
  const [tiers, setTiers] = useState<Tier[]>([
    {
      title: "Default",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  function removeTier(title: string) {
    setTiers((prev) => prev.filter((tier) => tier.title !== title));
    console.log("Removed tier");
  }

  function handleSubmit() {
    const tierTitle = inputRef.current?.value;
    if (tierTitle === "") {
      alert("Cannot add empty tier");
    } else if (tiers.some((tier) => tier.title === tierTitle)) {
      alert("Tier already exists");
    } else {
      setTiers((prev) => [...prev, { title: tierTitle } as Tier]);
      inputRef.current!.value = ""
    }
  }

  return (
    <div className="app">
      <header>
        <label>
          <span
            style={{
              color: "lightgrey",
              fontSize: "1.5rem",
            }}
          >
            Tier title:{" "}
          </span>
          <input type="text" ref={inputRef} />
        </label>
        <button onClick={() => handleSubmit()}>Click to add new tier</button>
      </header>
      <div className="app-content">
        {tiers.length > 0 ? (
          tiers.map((tier, index) => (
            <Container key={index} tier={tier} removeTier={removeTier} />
          ))
        ) : (
          <div style={{
            margin:"auto",
            fontSize:"2rem"
          }}>No tiers</div>
        )}
      </div>
    </div>
  );
}

export default App;
