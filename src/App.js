import React, { useState } from "react";

function App() {
  const [parsedText, setParsedText] = useState([]);
  const [inputText, setInputText] = useState("");

const parseText = () => {
  
  const nonEssentialWords = new Set(["i", "iam", "the", "is", "am", "are"]);

const segments = inputText.split(/\.|\n|\t|(#([^ \n\t]+))/g)
  .filter(Boolean)
  .map(segment => segment.trim())
  .filter((segment, index, arr) => {
    return segment.startsWith('#') || !arr[index - 1]?.startsWith('#');
  });

  //console.log(segments)
  const parsedSegments = segments.map((segment) => {

    const words = segment.split(/\s+/);

    // Remove non-essential words at the beginning or as the second word
    if (words.length > 0 && nonEssentialWords.has(words[0].toLowerCase())) {
      words.shift();
    }

    if (words.length > 1 && nonEssentialWords.has(words[1].toLowerCase())) {
      words.splice(1, 1);
    }

    segment = words.join(" ");

    // Recursively parse and format the segment
    const formattedSegment = parseSegment(segment);

    // Convert the formatted string to React elements
    const segmentElements = formatSegmentToReact(formattedSegment).filter(Boolean).flat();

    console.log(formattedSegment)
    console.log(segmentElements)

    return (
      <>
        {segmentElements.map((element, index) => (
          <React.Fragment key={index}>{element}</React.Fragment>
        ))}
      </>
    );

  });

  setParsedText(parsedSegments);
};

const parseSegment = (segment, depth = 0) => {
  if (depth > 10) { // Limit recursion depth to 10
    return segment;
  }

  if (typeof segment !== 'string') {
    return segment;
  }

  segment = segment.trim();
  if (!segment) {
    return segment;
  }

  // Formatting logic:
  let formattedSegment;

  // Bold (*)
  if (segment.startsWith('*') && segment.endsWith('*')) {
    formattedSegment = `<strong>${parseSegment(segment.slice(1, -1), depth + 1)}</strong>`;
  } 

  // Bold (#)
  if (segment.includes("#")) {
    //console.log(segment)
    const parts = segment.split("#");
    formattedSegment = (  
      parseSegment(parts[0], depth + 1) +
      "#" + parseSegment(parts[1], depth + 1) + "#" +
      parseSegment(parts[2], depth + 1)
    );
    // Apply formatting (e.g., <h3>) during React conversion
  } 

  // Italic (''')
  else if (segment.includes("'''")) {
    const parts = segment.split("'''");
    formattedSegment = (
      parseSegment(parts[0], depth + 1) +
      "'" + parseSegment(parts[1], depth + 1) + "'" +
      parseSegment(parts[2], depth + 1)
    );
    // Apply formatting (e.g., <em>) during React conversion
  }

  // Object Hierarchy (.)
  else if (segment.includes(".")) {
    const levels = segment.split(".");
    formattedSegment = levels.map((level, index) => (
      parseSegment(level, depth + 1) + (index < levels.length - 1 ? "." : "")
    )).join("");
  }

  // Encapsulation (())
  else if (segment.includes("(") || segment.includes(")")) {
    formattedSegment = segment.replace("(", "(").replace(")", ")"); // No need for span wrapping
  }

  // Subordinate (--):
  else if (segment.includes("--")) {
    formattedSegment = segment.replace("--", "\n- ");
  }

  // No formatting found
  else {
    formattedSegment = segment;
  }

  return formattedSegment;
};

const formatSegmentToReact = (segment) => {
  if (typeof segment !== "string") {
    return segment;
  }

  const lines = segment.split('\n');
  return lines.map((line, index) => {
    const elements = [];
    let currentChunk = "";
    let inStrong = false;
    let inEm = false;
    let inHead = false;
    let inList = false;
    let currentList = null;
    let listItems = [];

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === "#" && !inEm && !inStrong) {
        if (currentChunk) {
          elements.push(React.createElement('h3', { key: currentChunk }, currentChunk));
          currentChunk = "";
        }
        inHead = !inHead;
      } else if (char === "*" && !inEm && !inHead) {
        if (currentChunk) {
          elements.push(React.createElement('strong', { key: currentChunk }, currentChunk));
          currentChunk = "";
        }
        inStrong = !inStrong;
      } else if (char === "'" && !inStrong && !inHead) {
        if (currentChunk) {
          elements.push(React.createElement('em', { key: currentChunk }, currentChunk));
          currentChunk = "";
        }
        inEm = !inEm;
      } else if (char === "-" && !inStrong && !inEm && !inHead) {
        if (currentChunk) {
          listItems.push(React.createElement('li', { key: currentChunk }, currentChunk));
          currentChunk = "";
        }
        if (!inList) {
          inList = true;
        }
      } else {
        currentChunk += char;
      }
    }

    // Handle the last chunk and closing the list if necessary
    if (currentChunk) {
      if (inList) {
        listItems.push(React.createElement('li', { key: currentChunk }, currentChunk));
      } else {
        elements.push(currentChunk);
      }
    }

    if (inList) {
      elements.push(React.createElement('ul', { key: `list-${index}` }, listItems));
    }

    inStrong = false;
    inEm = false;
    inHead = false;
    inList = false;
    listItems = [];

    return elements;
  });
};

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  return (
    <div className="meaningful-compression">
      <h1>Meaningful Compression</h1>
      <div>
        <textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter text here..."
        />
        <button onClick={parseText}>Format</button>
      </div>
      <div className="output">
      {parsedText.map((segment, index) => (
        <React.Fragment key={index}>
          {segment}
          {index < parsedText.length - 1 && 
            !(typeof segment === 'string' && segment.includes('.')) && (
              <span className="separator">...</span>
            )
          }
        </React.Fragment>
      ))}
      </div>
      <div className="examples">
        <h2>Examples:</h2>
        <div>
          <h3>Simple Emphasis:</h3>
          <p>This is *important* information...</p>
          <p>Output: This is <strong>important</strong> information...</p>
        </div>
        {/* Add more examples for other features */}
      </div>
    </div>
  );
}

export default App;
