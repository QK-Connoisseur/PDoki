import { useState } from "react";
import CreatePostModal from "./CreatePostModal";

/** The shared prototype post editor for routes without a page-owned draft. */
export default function PostComposer({ onClose }) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState("normal");
  const [fontColor, setFontColor] = useState("#4a3340");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [locked, setLocked] = useState(false);
  const [vesoPrice, setVesoPrice] = useState("");

  return (
    <CreatePostModal
      open
      onClose={onClose}
      text={text}
      setText={setText}
      fontSize={fontSize}
      setFontSize={setFontSize}
      bold={bold}
      setBold={setBold}
      italic={italic}
      setItalic={setItalic}
      fontColor={fontColor}
      setFontColor={setFontColor}
      locked={locked}
      setLocked={setLocked}
      vesoPrice={vesoPrice}
      setVesoPrice={setVesoPrice}
    />
  );
}
