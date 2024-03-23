// App.js

import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('File uploaded:', data);
      // Handle success or update UI
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      // Handle error or display error message
    });
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default App;
