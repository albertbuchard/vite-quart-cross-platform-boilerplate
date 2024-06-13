import {useState} from 'react';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('');

    const fetchMessage = async () => {
        try {
            const response = await axios.get('/api/data'); // Call the API
            setMessage(response.data.message); // Set the message from the API response
        } catch (error) {
            console.error('Error fetching message:', error);
            setMessage('Failed to fetch message'); // Handle errors
        }
    };

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React + Quart</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <button onClick={fetchMessage}>
                    Fetch Message
                </button>
                <p>
                    {message}
                </p>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;