import Map from "./Map";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflowX: "hidden",
        overflowY: "hidden",
        position: "relative",
      }}
    >
      <Map />
    </div>
  );
}

export default App;
